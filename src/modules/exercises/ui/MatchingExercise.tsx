"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { cn } from "@/shared/utils/cn";
import { speakText } from "@/shared/utils/textToSpeech";

interface MatchingExerciseProps {
  words: Array<{
    id: string;
    english: string;
    russian: string;
    description: string;
    progress: number;
  }>;
  onAnswer: (wordId: string, userAnswer: string, isCorrect: boolean) => void;
  onNext: () => void;
  isLoading?: boolean;
}

export function MatchingExercise({
  words,
  onAnswer,
  onNext,
  isLoading = false,
}: MatchingExerciseProps) {
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<string | null>(
    null,
  );
  const [matchedPairs, setMatchedPairs] = useState<Map<string, string>>(
    new Map(),
  );
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(
    new Set(),
  );
  const [feedbackPairs, setFeedbackPairs] = useState<
    Map<string, "correct" | "incorrect">
  >(new Map());
  const [revealedRussian, setRevealedRussian] = useState<Set<string>>(
    new Set(),
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { englishWords, descriptionWords } = useMemo(() => {
    const englishWords = [...words].sort(() => Math.random() - 0.5);
    const descriptionWords = [...words].sort(() => Math.random() - 0.5);

    return { englishWords, descriptionWords };
  }, [words]);

  const isAllMatched = matchedPairs.size === words.length;

  useEffect(() => {
    if (isAllMatched && !isLoading) {
      const nextExercisePromise = new Promise((resolve) => {
        setTimeout(() => {
          onNext();
          resolve("Переход выполнен!");
        }, 500);
      });

      void toast.promise(nextExercisePromise, {
        loading: "Переход к следующему упражнению...",
        success: "Переход выполнен!",
        error: "Ошибка при переходе",
      });
    }
  }, [isAllMatched, isLoading, onNext]);

  const handleEnglishSelect = (englishWord: string) => {
    if (Array.from(matchedPairs.keys()).includes(englishWord)) return;

    setSelectedEnglish(englishWord);
    void speakEnglishWord(englishWord);

    if (selectedDescription) {
      checkMatch(englishWord, selectedDescription);
    }
  };

  const handleDescriptionSelect = (description: string) => {
    if (Array.from(matchedPairs.values()).includes(description)) return;

    setSelectedDescription(description);

    if (selectedEnglish) {
      checkMatch(selectedEnglish, description);
    }
  };

  const handleRussianReveal = (wordId: string) => {
    setRevealedRussian((prev) => new Set(prev).add(wordId));
  };

  const speakEnglishWord = async (word: string) => {
    if ("speechSynthesis" in window) {
      try {
        setIsSpeaking(true);
        await speakText(word, { lang: "en-US", rate: 0.8 });
      } catch (error) {
        console.warn("Text-to-speech failed:", error);
      } finally {
        setIsSpeaking(false);
      }
    }
  };

  const checkMatch = (englishWord: string, description: string) => {
    const englishWordObj = words.find((w) => w.english === englishWord);
    const correct = Boolean(
      englishWordObj && englishWordObj.description === description,
    );

    const pairKey = `${englishWord}-${description}`;

    if (correct) {
      setMatchedPairs((prev) => new Map(prev).set(englishWord, description));

      setFeedbackPairs((prev) => new Map(prev).set(pairKey, "correct"));

      if (englishWordObj) {
        onAnswer(englishWordObj.id, `${englishWord} - ${description}`, true);
      }
    } else {
      setIncorrectAttempts((prev) => new Set(prev).add(pairKey));

      setFeedbackPairs((prev) => new Map(prev).set(pairKey, "incorrect"));

      setTimeout(() => {
        setFeedbackPairs((prev) => {
          const newMap = new Map(prev);
          newMap.delete(pairKey);
          return newMap;
        });
      }, 1000);

      if (englishWordObj) {
        onAnswer(englishWordObj.id, `${englishWord} - ${description}`, false);
      }
    }

    setSelectedEnglish(null);
    setSelectedDescription(null);
  };

  const handleNext = () => {
    setSelectedEnglish(null);
    setSelectedDescription(null);
    setMatchedPairs(new Map());
    setIncorrectAttempts(new Set());
    setFeedbackPairs(new Map());
    setRevealedRussian(new Set());
    setIsSpeaking(false);
    onNext();
  };

  const getCardClasses = (cardId: string, cardType: "word" | "description") => {
    let classes = "w-full transition-all duration-200 cursor-pointer ";

    if (
      Array.from(matchedPairs.keys()).includes(cardId) ||
      Array.from(matchedPairs.values()).includes(cardId)
    ) {
      classes +=
        "border-green-500 bg-green-50 dark:bg-green-950 pointer-events-none opacity-70";
    } else {
      const feedbackEntry = Array.from(feedbackPairs.entries()).find(([key]) =>
        cardType === "word"
          ? key.startsWith(cardId + "-")
          : key.endsWith("-" + cardId),
      );
      const feedback = feedbackEntry ? feedbackEntry[1] : null;

      if (feedback === "incorrect") {
        classes += "border-red-500 bg-red-50 dark:bg-red-950 animate-shake";
      } else if (
        (cardType === "word" && selectedEnglish === cardId) ||
        (cardType === "description" && selectedDescription === cardId)
      ) {
        classes += "border-blue-500 ring-2 ring-blue-500";
      } else {
        classes += "border hover:border-blue-500";
      }
    }

    return classes;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">English Words</h2>
          {englishWords.map((w) => (
            <Card
              key={w.id}
              className={cn(getCardClasses(w.english, "word"))}
              onClick={
                Array.from(matchedPairs.keys()).includes(w.english)
                  ? undefined
                  : () => handleEnglishSelect(w.english)
              }
            >
              <CardContent className="p-4 flex items-center justify-center h-24">
                <CardTitle className="text-xl font-semibold">
                  {w.english}
                </CardTitle>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Descriptions</h2>
          {descriptionWords.map((w) => {
            const isRevealed = revealedRussian.has(w.id);

            return (
              <Card
                key={w.id}
                className={cn(getCardClasses(w.description, "description"))}
                onClick={
                  Array.from(matchedPairs.values()).includes(w.description)
                    ? undefined
                    : () => handleDescriptionSelect(w.description)
                }
              >
                <CardHeader className="pb-2">
                  <CardDescription>{w.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full text-base font-medium transition-all duration-300",
                      isRevealed ? "blur-none" : "blur-sm text-transparent",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRussianReveal(w.id);
                    }}
                  >
                    {w.russian}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
