"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bot,
  LoaderCircle,
  ImagePlus,
  X,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { api } from "@/shared/api/client";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/utils/cn";

const createGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Group name is required")
    .max(100, "Group name is too long"),
  description: z.string().optional(),
  words: z
    .array(
      z.object({
        english: z.string().min(1, "English word is required"),
        russian: z.string().min(1, "Russian translation is required"),
        description: z.string().optional(),
        exampleSentence: z.string().max(1000).optional(),
      }),
    )
    .min(1, "Add at least one word"),
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

interface AddGroupModalProps {
  children: React.ReactNode;
}

const STORAGE_KEY = "add-group-form-draft";

const getDefaultValues = (): CreateGroupForm => ({
  name: "",
  description: "",
  words: [{ english: "", russian: "", description: "", exampleSentence: "" }],
});

const loadFormFromStorage = (): CreateGroupForm => {
  if (typeof window === "undefined") return getDefaultValues();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        parsed.name ||
        parsed.description ||
        parsed.words.some(
          (word: { english?: string; russian?: string }) =>
            word.english || word.russian,
        )
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Error loading form draft:", error);
  }

  return getDefaultValues();
};

const saveFormToStorage = (data: CreateGroupForm) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Error saving form draft:", error);
  }
};

const clearFormFromStorage = () => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Error clearing form draft:", error);
  }
};

export function AddGroupModal({ children }: AddGroupModalProps) {
  const [open, setOpen] = useState(false);
  const [isFormRestored, setIsFormRestored] = useState(false);
  const [mode, setMode] = useState<"manual" | "automatic">("manual");
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [generatedDraft, setGeneratedDraft] = useState<CreateGroupForm | null>(
    null,
  );
  const draftCardRef = useRef<HTMLDivElement>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Paste words in any format — a list, table, or plain text. I’ll turn them into an English–Russian group.",
    },
  ]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: getDefaultValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "words",
  });

  const formData = watch();

  useEffect(() => {
    if (!generatedDraft || isGenerating || mode !== "automatic") return;

    const animationFrame = requestAnimationFrame(() => {
      draftCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [generatedDraft, isGenerating, mode]);

  useEffect(() => {
    if (open && !isFormRestored) {
      const savedData = loadFormFromStorage();
      const hasData =
        savedData.name ||
        savedData.description ||
        savedData.words.some(
          (word) => word.english || word.russian || word.description,
        );

      if (hasData) {
        reset(savedData);
        toast.success("Form draft restored");
      }
      setIsFormRestored(true);
    }
  }, [open, isFormRestored, reset]);

  useEffect(() => {
    if (open && isFormRestored) {
      const timeoutId = setTimeout(() => {
        saveFormToStorage(formData);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [formData, open, isFormRestored]);

  const utils = api.useUtils();
  const createGroupMutation = api.groups.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Group "${data.group.name}" created successfully!`);
      void utils.groups.getPaginated.invalidate();
      void utils.statistics.getOverall.invalidate();
      void utils.statistics.getToday.invalidate();
      void utils.statistics.getStreak.invalidate();
      clearFormFromStorage();
      setOpen(false);
      reset(getDefaultValues());
      setIsFormRestored(false);
    },
    onError: (error) => {
      toast.error(error.message || "Error creating group");
    },
  });

  const onSubmit = (data: CreateGroupForm) => {
    createGroupMutation.mutate(data);
  };

  const addWord = () => {
    append({ english: "", russian: "", description: "", exampleSentence: "" });
  };

  const removeWord = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setIsFormRestored(false);
    }
  };

  const handleClearDraft = () => {
    clearFormFromStorage();
    reset(getDefaultValues());
    setGeneratedDraft(null);
    setImageDataUrl(null);
    setImageName("");
    setChatMessages([
      {
        role: "assistant",
        content:
          "Paste words in any format — a list, table, or plain text. I’ll turn them into an English–Russian group.",
      },
    ]);
    toast.success("Draft cleared");
  };

  const generateGroup = async () => {
    const prompt = chatInput.trim();
    if ((!prompt && !imageDataUrl) || isGenerating) return;

    const nextMessages: ChatMessage[] = [
      ...chatMessages,
      {
        role: "user",
        content:
          prompt ||
          `Extract the vocabulary exercise from ${imageName || "this image"}.`,
      },
    ];
    setChatMessages(nextMessages);
    setChatInput("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/groups/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.slice(1),
          currentDraft: generatedDraft || undefined,
          imageDataUrl: imageDataUrl || undefined,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        reply?: string;
        group?: CreateGroupForm;
      };
      if (!response.ok || !result.group || !result.reply) {
        throw new Error(result.error || "Could not generate the group.");
      }

      setGeneratedDraft(result.group);
      setImageDataUrl(null);
      setImageName("");
      reset(result.group);
      setChatMessages((messages) => [
        ...messages,
        { role: "assistant", content: result.reply! },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not generate the group.";
      toast.error(message);
      setChatMessages((messages) => [
        ...messages,
        { role: "assistant", content: `I couldn’t process that: ${message}` },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[92vw] lg:max-w-4xl xl:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="mb-2">Add New Group</DialogTitle>
          <div className="flex items-start justify-between gap-4">
            <DialogDescription className="text-left max-w-sm">
              Create a new word group for learning. Add a title, description and
              list of words.
            </DialogDescription>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearDraft}
              className="text-xs"
            >
              Clear Draft
            </Button>
          </div>
        </DialogHeader>

        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as "manual" | "automatic")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="automatic" className="gap-2">
              <Sparkles className="size-4" />
              Automatic
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {mode === "manual" ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 max-h-[60vh] overflow-y-auto px-2 -mx-2"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                placeholder="e.g., Basic Vocabulary"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the group..."
                {...register("description")}
                rows={2}
              />
            </div>

            <div className="space-y-4">
              <Label>Words</Label>

              {errors.words && (
                <p className="text-sm text-red-500">{errors.words.message}</p>
              )}

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-2 gap-3 p-3 border rounded-lg"
                  >
                    <div className="space-y-2">
                      <Label htmlFor={`words.${index}.english`}>
                        English Word
                      </Label>
                      <Input
                        id={`words.${index}.english`}
                        placeholder="hello"
                        {...register(`words.${index}.english`)}
                        className={
                          errors.words?.[index]?.english ? "border-red-500" : ""
                        }
                      />
                      {errors.words?.[index]?.english && (
                        <p className="text-sm text-red-500">
                          {errors.words[index]?.english?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`words.${index}.russian`}>
                        Russian Translation
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={`words.${index}.russian`}
                          placeholder="привет"
                          {...register(`words.${index}.russian`)}
                          className={
                            errors.words?.[index]?.russian
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeWord(index)}
                            className="px-2"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                      {errors.words?.[index]?.russian && (
                        <p className="text-sm text-red-500">
                          {errors.words[index]?.russian?.message}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor={`words.${index}.description`}>
                        Description (optional)
                      </Label>
                      <Input
                        id={`words.${index}.description`}
                        placeholder="Additional information about the word..."
                        {...register(`words.${index}.description`)}
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor={`words.${index}.exampleSentence`}>
                        Fill-in sentence (optional)
                      </Label>
                      <Textarea
                        id={`words.${index}.exampleSentence`}
                        placeholder={`Write a sentence containing “${formData.words[index]?.english || "the word"}”. It will become a blank in the exercise.`}
                        {...register(`words.${index}.exampleSentence`)}
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty when this word has no sentence exercise.
                      </p>
                    </div>
                  </div>
                ))}

                <div className="h-14 border-2 border-dashed bg-transparent dark:bg-input/30 border-input rounded-lg">
                  <Button
                    type="button"
                    variant="ghost"
                    size="full"
                    onClick={addWord}
                    className="flex items-center gap-2"
                  >
                    <Plus className="size-4" />
                    Add Word
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || createGroupMutation.isPending}
              >
                {isSubmitting || createGroupMutation.isPending
                  ? "Creating..."
                  : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="flex h-[60vh] min-h-[420px] flex-col overflow-hidden rounded-xl border bg-muted/20">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {chatMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="size-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border bg-background"
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="size-4" />
                    </div>
                  )}
                </div>
              ))}

              {isGenerating && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <LoaderCircle className="size-4 animate-spin" />
                  </div>
                  Organizing your vocabulary…
                </div>
              )}

              {generatedDraft && !isGenerating && (
                <div
                  ref={draftCardRef}
                  className="ml-11 flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{generatedDraft.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {generatedDraft.words.length} words ready to review
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setMode("manual")}
                  >
                    Review draft
                  </Button>
                </div>
              )}
            </div>

            <div className="border-t bg-background p-3">
              {imageDataUrl && (
                <div className="mb-3 flex items-center gap-3 rounded-lg border bg-muted/40 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageDataUrl}
                    alt="Exercise preview"
                    className="size-14 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{imageName}</p>
                    <p className="text-xs text-muted-foreground">
                      Ready for text extraction
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setImageDataUrl(null);
                      setImageName("");
                    }}
                    aria-label="Remove image"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <Label
                  className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md border bg-background hover:bg-muted"
                  aria-label="Upload exercise screenshot"
                >
                  <ImagePlus className="size-4" />
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      if (file.size > 10 * 1024 * 1024) {
                        toast.error("Image must be smaller than 10 MB");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result !== "string") return;
                        setImageDataUrl(reader.result);
                        setImageName(file.name);
                      };
                      reader.readAsDataURL(file);
                      event.target.value = "";
                    }}
                  />
                </Label>
                <Textarea
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void generateGroup();
                    }
                  }}
                  placeholder="Paste words, a table, or describe the group…"
                  rows={chatInput ? 8 : 1}
                  className={cn(
                    "field-sizing-fixed max-h-[40vh] overflow-y-auto transition-[height,min-height] duration-200",
                    chatInput
                      ? "h-52 min-h-32 resize-y"
                      : "h-10 min-h-10 resize-none",
                  )}
                  disabled={isGenerating}
                />
                <Button
                  type="button"
                  size="icon"
                  className="size-10 shrink-0"
                  onClick={() => void generateGroup()}
                  disabled={
                    (!chatInput.trim() && !imageDataUrl) || isGenerating
                  }
                  aria-label="Send message"
                >
                  {isGenerating ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Upload a screenshot or paste text · Enter to send · Shift+Enter
                for a new line
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
