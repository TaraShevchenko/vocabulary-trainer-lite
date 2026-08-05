import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/shared/config/env";

const wordSchema = z.object({
  english: z.string().min(1).max(200),
  russian: z.string().min(1).max(200),
  description: z.string().max(500),
  exampleSentence: z.string().max(1000),
});

const groupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  words: z.array(wordSchema).min(1).max(100),
});

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(20_000),
      }),
    )
    .min(1)
    .max(20),
  currentDraft: groupSchema.optional(),
  imageDataUrl: z
    .string()
    .regex(/^data:image\/(png|jpeg|webp|gif);base64,/)
    .max(14_000_000)
    .optional(),
});

const responseSchema = z.object({
  reply: z.string().min(1),
  group: groupSchema,
});

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "group"],
  properties: {
    reply: {
      type: "string",
      description:
        "A concise message confirming what was extracted or changed.",
    },
    group: {
      type: "object",
      additionalProperties: false,
      required: ["name", "description", "words"],
      properties: {
        name: { type: "string" },
        description: {
          type: "string",
          description: "A short group description written in English.",
        },
        words: {
          type: "array",
          minItems: 1,
          maxItems: 100,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["english", "russian", "description", "exampleSentence"],
            properties: {
              english: { type: "string" },
              russian: { type: "string" },
              description: {
                type: "string",
                description: "A short word description written in English.",
              },
              exampleSentence: {
                type: "string",
                description:
                  "A complete English sentence containing the exact vocabulary word, or an empty string if none was supplied or visible.",
              },
            },
          },
        },
      },
    },
  },
} as const;

export async function POST(request: NextRequest) {
  if (!env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error: "Automatic mode is not configured. Add OPENAI_API_KEY to .env.",
      },
      { status: 503 },
    );
  }

  const parsedRequest = requestSchema.safeParse(await request.json());
  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: "Invalid chat request." },
      { status: 400 },
    );
  }

  const { messages, currentDraft, imageDataUrl } = parsedRequest.data;
  let lastUserMessageIndex = -1;
  messages.forEach((message, index) => {
    if (message.role === "user") lastUserMessageIndex = index;
  });
  const modelMessages = messages.map((message, index) => {
    const isLastUserMessage =
      imageDataUrl && message.role === "user" && index === lastUserMessageIndex;

    if (!isLastUserMessage) return message;

    return {
      role: message.role,
      content: [
        { type: "input_text", text: message.content },
        { type: "input_image", image_url: imageDataUrl },
      ],
    };
  });
  const input = [
    {
      role: "developer",
      content:
        "Turn the user's arbitrary vocabulary input or uploaded exercise screenshot into an English-to-Russian learning group. Extract the text from images. Input may be prose, pasted tables, CSV-like rows, word lists, or a photographed fill-in-the-blank exercise. Translate missing Russian values, preserve supplied translations, remove duplicates, and add only short useful descriptions. For each word, set exampleSentence to the complete English sentence that uses it; replace a printed blank with the correct word when the source makes that answer clear. Use an empty string when no sentence is supplied—do not invent one. Both group.description and every word.description must always be written in English. Infer a clear group name and description. If a current draft is supplied, apply the user's newest requested changes. Never invent extra vocabulary that the user did not request unless translation is needed.",
    },
    ...(currentDraft
      ? [
          {
            role: "developer",
            content: `Current draft JSON: ${JSON.stringify(currentDraft)}`,
          },
        ]
      : []),
    ...modelMessages,
  ];

  try {
    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        input,
        reasoning: { effort: "low" },
        text: {
          format: {
            type: "json_schema",
            name: "vocabulary_group",
            strict: true,
            schema: jsonSchema,
          },
        },
      }),
    });

    const payload = (await openAIResponse.json()) as {
      error?: { message?: string };
      output?: Array<{
        content?: Array<{ type?: string; text?: string }>;
      }>;
    };

    if (!openAIResponse.ok) {
      console.error("OpenAI group generation failed:", payload.error?.message);
      return NextResponse.json(
        {
          error:
            payload.error?.message || "The model could not generate a group.",
        },
        { status: openAIResponse.status },
      );
    }

    const outputText = payload.output
      ?.flatMap((item) => item.content || [])
      .find((item) => item.type === "output_text")?.text;
    if (!outputText)
      throw new Error("The model returned no structured output.");

    const generated = responseSchema.parse(JSON.parse(outputText));
    return NextResponse.json(generated);
  } catch (error) {
    console.error("Error generating vocabulary group:", error);
    return NextResponse.json(
      { error: "Could not generate the vocabulary group. Please try again." },
      { status: 500 },
    );
  }
}
