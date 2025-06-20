"use client";

import { useState, useRef, useEffect } from "react";
import { EyeOff, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Progress } from "@/shared/ui/progress";
import { cn } from "@/shared/utils/cn";

interface TypingExerciseProps {
  word: {
    id: string;
    english: string;
    russian: string;
    description: string;
    progress: number;
  };
  onAnswer: (wordId: string, userAnswer: string, isCorrect: boolean) => void;
  onNext: () => void;
  isLoading?: boolean;
}

export function TypingExercise({
  word,
  onAnswer,
  onNext,
  isLoading = false,
}: TypingExerciseProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showRussian, setShowRussian] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!userAnswer.trim() || hasAnswered) return;

    const correct =
      userAnswer.toLowerCase().trim() === word.english.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);
    setHasAnswered(true);

    if (correct) {
      toast.success("Correct!");
    } else {
      toast.error(`Correct answer: ${word.english}`);
    }

    onAnswer(word.id, userAnswer, correct);

    handleNextWord();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 1000);
  };

  const handleNextWord = () => {
    setUserAnswer("");
    setShowResult(false);
    setHasAnswered(false);
    setIsCorrect(false);
    setShowRussian(false);
    onNext();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !hasAnswered) {
      handleSubmit();
    } else if (e.key === "Enter" && hasAnswered) {
      handleNextWord();
    }
  };

  // Автофокус на поле ввода при загрузке компонента
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Card className="max-w-128 w-full mx-auto">
      <CardHeader className="text-center">
        <div className="mb-4 relative w-fit mx-auto">
          {!showRussian && (
            <div className="text-center mb-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-1">
              <EyeOff className="h-6 w-auto color-white" />
            </div>
          )}
          <div
            onClick={() => setShowRussian(true)}
            className={cn(
              "inline-block px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 text-3xl font-bold relative",
              showRussian
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                : "bg-gray-200 dark:bg-gray-700 text-transparent select-none",
              !showRussian && "blur-sm hover:blur-none",
            )}
            style={{
              filter: showRussian ? "none" : "blur(4px)",
            }}
          >
            {word.russian}
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {word.description}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Поле ввода */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Enter the English word:
          </label>
          <Input
            ref={inputRef}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Your answer..."
            disabled={hasAnswered || isLoading}
            className={cn(
              "text-center text-lg",
              showResult &&
                (isCorrect
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-red-500 bg-red-50 dark:bg-red-900/20"),
            )}
          />
        </div>

        {/* Кнопки */}
        <div className="flex gap-3">
          {!hasAnswered ? (
            <Button
              onClick={handleSubmit}
              disabled={!userAnswer.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? "Checking..." : "Check"}
            </Button>
          ) : (
            <Button
              onClick={handleNextWord}
              className="flex-1"
              variant="outline"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Next Word
            </Button>
          )}
        </div>

        {/* Подсказка */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Press Enter to submit your answer
        </div>
      </CardContent>
    </Card>
  );
}
