"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, EyeOff, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { cn } from "@/shared/utils/cn";

interface MultipleChoiceExerciseProps {
  word: {
    id: string;
    english: string;
    russian: string;
    description: string;
    progress: number;
  };
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

export function MultipleChoiceExercise({
  word,
  words,
  onAnswer,
  onNext,
  isLoading = false,
}: MultipleChoiceExerciseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showRussian, setShowRussian] = useState(false);

  // Автоматический переход к следующему слову
  useEffect(() => {
    if (hasAnswered && !isLoading) {
      handleNext();
    }
  }, [hasAnswered, isLoading]);

  // Генерируем варианты ответов с мемоизацией
  const choices = useMemo(() => {
    const correctAnswer = word.english;
    const otherWords = words.filter(
      (w) => w.id !== word.id && w.english !== correctAnswer,
    );

    // Берем 3 случайных неправильных варианта
    const wrongChoices = otherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.english);

    // Объединяем правильный ответ с неправильными и перемешиваем
    const allChoices = [correctAnswer, ...wrongChoices].sort(
      () => Math.random() - 0.5,
    );

    return allChoices;
  }, [word.id, word.english, words]);

  const handleChoiceSelect = (choice: string) => {
    if (hasAnswered) return;

    setSelectedAnswer(choice);
    const correct = choice === word.english;
    setIsCorrect(correct);
    setShowResult(true);
    setHasAnswered(true);

    if (correct) {
      toast.success("Правильно!");
    } else {
      toast.error(`Правильный ответ: ${word.english}`);
    }

    onAnswer(word.id, choice, correct);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setHasAnswered(false);
    setIsCorrect(false);
    setShowRussian(false);
    onNext();
  };

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

      <CardContent className="space-y-6">
        {/* Варианты ответов */}
        <div className="space-y-3">
          {choices.map((choice, index) => {
            const isSelected = selectedAnswer === choice;
            const isCorrectChoice = choice === word.english;
            const showCorrect = showResult && isCorrectChoice;
            const showIncorrect = showResult && isSelected && !isCorrectChoice;

            return (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleChoiceSelect(choice)}
                disabled={hasAnswered || isLoading}
                className={cn(
                  "w-full p-4 text-left justify-start text-lg h-auto min-h-[60px]",
                  isSelected &&
                    !showResult &&
                    "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20",
                  showCorrect &&
                    "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300",
                  showIncorrect &&
                    "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{choice}</span>
                  {showCorrect && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {showIncorrect && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </Button>
            );
          })}
        </div>

        {showResult && !isCorrect && (
          <div
            className={cn(
              "p-4 rounded-lg border-2 text-center space-y-2 border-red-500 bg-red-50 dark:bg-red-900/20",
            )}
          >
            <div className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Правильный ответ:{" "}
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {word.english}
              </span>
            </div>
          </div>
        )}

        {/* Автоматический переход */}
        {hasAnswered && (
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Переход к следующему слову...
            </div>
          </div>
        )}

        {/* Подсказка */}
        {!hasAnswered && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Choose the correct English translation
          </div>
        )}
      </CardContent>
    </Card>
  );
}
