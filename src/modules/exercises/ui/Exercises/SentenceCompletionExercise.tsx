"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/utils/cn";

interface SentenceWord {
  id: string;
  english: string;
  russian: string;
  exampleSentence: string | null;
}

interface SentenceCompletionExerciseProps {
  words: SentenceWord[];
  onAnswer: (wordId: string, userAnswer: string, isCorrect: boolean) => void;
  onNext: () => void;
  isLoading?: boolean;
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sentenceWithBlank = (sentence: string, word: string) => {
  const pattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, "i");
  return pattern.test(sentence)
    ? sentence.replace(pattern, "________")
    : sentence.replace(/_{2,}|\.{3,}/, "________");
};

export function SentenceCompletionExercise({
  words,
  onAnswer,
  onNext,
  isLoading = false,
}: SentenceCompletionExerciseProps) {
  const exerciseWords = useMemo(
    () => words.filter((word) => word.exampleSentence?.trim()),
    [words],
  );
  const shuffledWords = useMemo(
    () => [...exerciseWords].sort(() => Math.random() - 0.5),
    [exerciseWords],
  );
  const shuffledSentences = useMemo(
    () => [...exerciseWords].sort(() => Math.random() - 0.5),
    [exerciseWords],
  );
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [incorrectId, setIncorrectId] = useState<string | null>(null);
  const isComplete =
    exerciseWords.length > 0 && matchedIds.size === exerciseWords.length;

  useEffect(() => {
    if (!isComplete || isLoading) return;
    const timeout = window.setTimeout(onNext, 600);
    return () => window.clearTimeout(timeout);
  }, [isComplete, isLoading, onNext]);

  const chooseSentence = (sentenceWord: SentenceWord) => {
    if (!selectedWordId || matchedIds.has(sentenceWord.id)) return;
    const isCorrect = selectedWordId === sentenceWord.id;
    const selectedWord = exerciseWords.find(
      (word) => word.id === selectedWordId,
    );
    if (!selectedWord) return;

    onAnswer(
      selectedWord.id,
      `${selectedWord.english} → ${sentenceWord.exampleSentence}`,
      isCorrect,
    );

    if (isCorrect) {
      setMatchedIds((current) => new Set(current).add(sentenceWord.id));
      setSelectedWordId(null);
      return;
    }

    setIncorrectId(sentenceWord.id);
    toast.error("That word does not fit this sentence");
    window.setTimeout(() => setIncorrectId(null), 700);
  };

  if (exerciseWords.length === 0) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>No sentence exercises in this group</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Sentence completion is optional, so this group can be learned
            without it.
          </p>
          <Button onClick={onNext}>Continue</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-[2fr_3fr]">
      <section className="space-y-3">
        <h2 className="text-xl font-bold">Words</h2>
        {shuffledWords.map((word) => (
          <Button
            key={word.id}
            type="button"
            variant="outline"
            className={cn(
              "h-auto min-h-14 w-full justify-between px-4 py-3 text-left",
              selectedWordId === word.id &&
                "border-primary ring-2 ring-primary",
              matchedIds.has(word.id) &&
                "border-green-500 bg-green-50 text-green-800 opacity-70 dark:bg-green-950",
            )}
            disabled={matchedIds.has(word.id)}
            onClick={() => setSelectedWordId(word.id)}
          >
            <span className="font-semibold">{word.english}</span>
            <span className="text-xs text-muted-foreground">
              {word.russian}
            </span>
          </Button>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Sentences</h2>
        <p className="text-sm text-muted-foreground">
          Choose a word, then choose the sentence where it belongs.
        </p>
        {shuffledSentences.map((word) => (
          <Card
            key={word.id}
            role="button"
            tabIndex={matchedIds.has(word.id) ? -1 : 0}
            className={cn(
              "cursor-pointer transition-colors hover:border-primary",
              matchedIds.has(word.id) &&
                "pointer-events-none border-green-500 bg-green-50 opacity-70 dark:bg-green-950",
              incorrectId === word.id &&
                "border-red-500 bg-red-50 dark:bg-red-950",
            )}
            onClick={() => chooseSentence(word)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ")
                chooseSentence(word);
            }}
          >
            <CardContent className="p-5 text-base leading-7">
              {sentenceWithBlank(word.exampleSentence!, word.english)}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
