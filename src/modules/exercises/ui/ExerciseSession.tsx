"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy, Target, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/shared/api/client";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { MatchingExercise } from "./MatchingExercise";
import { MultipleChoiceExercise } from "./MultipleChoiceExercise";
import { TypingExercise } from "./TypingExercise";

interface ExerciseSessionProps {
  groupId: string;
  groupName?: string;
}

interface SessionStats {
  totalAnswers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  currentStreak: number;
  bestStreak: number;
}

type ExerciseType = "matching" | "multiple-choice" | "typing";

const EXERCISE_ORDER: ExerciseType[] = ["multiple-choice", "typing"];

export function ExerciseSession({ groupId, groupName }: ExerciseSessionProps) {
  const router = useRouter();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentExerciseType, setCurrentExerciseType] =
    useState<ExerciseType>("matching");
  const [hasCompletedMatching, setHasCompletedMatching] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalAnswers: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
  });
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Получаем слова для упражнений
  const {
    data: words,
    isLoading: wordsLoading,
    error: wordsError,
  } = api.exercises.getWordsForExercise.useQuery({
    groupId,
    limit: 10,
  });

  // Мутация для обновления прогресса
  const updateProgressMutation = api.exercises.updateProgress.useMutation();

  const currentWord = words?.[currentWordIndex];
  const progressPercentage = words
    ? currentExerciseType === "matching"
      ? Math.round((sessionStats.correctAnswers / words.length) * 100)
      : Math.round(((currentWordIndex + 1) / words.length) * 100) - 10
    : 0;
  const accuracyPercentage =
    sessionStats.totalAnswers > 0
      ? Math.round(
          (sessionStats.correctAnswers / sessionStats.totalAnswers) * 100,
        )
      : 0;

  const getProgressIncrement = (exerciseType: ExerciseType): number => {
    switch (exerciseType) {
      case "matching":
        return 4;
      case "multiple-choice":
        return 6;
      case "typing":
        return 15;
      default:
        return 10;
    }
  };

  const handleAnswer = async (
    wordId: string,
    userAnswer: string,
    isCorrect: boolean,
  ) => {
    // Обновляем статистику сессии
    setSessionStats((prev) => {
      const newStats = {
        totalAnswers: prev.totalAnswers + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        incorrectAnswers: prev.incorrectAnswers + (isCorrect ? 0 : 1),
        currentStreak: isCorrect ? prev.currentStreak + 1 : 0,
        bestStreak: isCorrect
          ? Math.max(prev.bestStreak, prev.currentStreak + 1)
          : prev.bestStreak,
      };
      return newStats;
    });

    // Обновляем прогресс в базе данных
    try {
      await updateProgressMutation.mutateAsync({
        wordId,
        isCorrect,
        progressIncrement: getProgressIncrement(currentExerciseType),
      });
    } catch (error) {
      console.error("Ошибка при обновлении прогресса:", error);
    }
  };

  const handleNext = () => {
    if (!words) return;

    // Если это упражнение matching, переходим к multiple-choice
    if (currentExerciseType === "matching") {
      setHasCompletedMatching(true);
      setCurrentExerciseType("multiple-choice");
      setCurrentWordIndex(0);
      return;
    }

    // Для остальных упражнений - обычная логика
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
    } else {
      // Переходим к следующему типу упражнения
      const currentExerciseIndex = EXERCISE_ORDER.indexOf(currentExerciseType);
      if (currentExerciseIndex < EXERCISE_ORDER.length - 1) {
        const nextExerciseType = EXERCISE_ORDER[currentExerciseIndex + 1];
        if (nextExerciseType) {
          setCurrentExerciseType(nextExerciseType);
          setCurrentWordIndex(0);
        } else {
          setIsSessionComplete(true);
        }
      } else {
        setIsSessionComplete(true);
      }
    }
  };

  const handleRestart = () => {
    setCurrentWordIndex(0);
    setCurrentExerciseType("matching");
    setHasCompletedMatching(false);
    setSessionStats({
      totalAnswers: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      currentStreak: 0,
      bestStreak: 0,
    });
    setIsSessionComplete(false);
  };

  const handleBackToDashboard = () => {
    router.push("/");
  };

  if (wordsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading exercises...
          </p>
        </div>
      </div>
    );
  }

  if (wordsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading exercises: {wordsError.message}
          </AlertDescription>
        </Alert>
        <Button onClick={handleBackToDashboard} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!words || words.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No words to study
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              There are no words for exercises in this group yet.
            </p>
            <Button onClick={handleBackToDashboard}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSessionComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Session Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Статистика */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {sessionStats.correctAnswers}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Correct Answers
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {sessionStats.incorrectAnswers}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">
                  Incorrect Answers
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">
                {accuracyPercentage}%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Accuracy
              </div>
            </div>

            {sessionStats.bestStreak > 0 && (
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-xl font-bold text-purple-600">
                  {sessionStats.bestStreak} in a row
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  Best streak
                </div>
              </div>
            )}

            {/* Кнопки */}
            <div className="flex gap-3">
              <Button
                onClick={handleRestart}
                variant="outline"
                className="flex-1"
              >
                Restart
              </Button>
              <Button onClick={handleBackToDashboard} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />To Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Заголовок и навигация */}
      <Button
        variant="outline"
        onClick={handleBackToDashboard}
        className="flex items-center gap-2 absolute left-0 -top-16"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {groupName || "Exercises"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {currentExerciseType === "matching" && "Matching"}
          {currentExerciseType === "multiple-choice" && "Multiple Choice"}
          {currentExerciseType === "typing" && "Typing"}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Word {currentWordIndex + 1} of {words.length}
        </p>
      </div>

      <div className="w-20"> {/* Spacer */}</div>

      {/* Прогресс сессии */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Session Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
      </div>

      {/* Статистика сессии */}
      <div className="flex justify-center gap-4 mb-8">
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-600" />
          {sessionStats.correctAnswers}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <XCircle className="h-3 w-3 text-red-600" />
          {sessionStats.incorrectAnswers}
        </Badge>
        {sessionStats.currentStreak > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Trophy className="h-3 w-3 text-yellow-600" />
            {sessionStats.currentStreak} streak
          </Badge>
        )}
      </div>

      {/* Карточка упражнения */}
      {(currentExerciseType === "matching" || currentWord) && (
        <div className="mb-8">
          {currentExerciseType === "matching" && !hasCompletedMatching && (
            <MatchingExercise
              words={words}
              onAnswer={handleAnswer}
              onNext={handleNext}
              isLoading={updateProgressMutation.isPending}
            />
          )}
          {currentExerciseType === "multiple-choice" && currentWord && (
            <MultipleChoiceExercise
              word={currentWord}
              words={words}
              onAnswer={handleAnswer}
              onNext={handleNext}
              isLoading={updateProgressMutation.isPending}
            />
          )}
          {currentExerciseType === "typing" && currentWord && (
            <TypingExercise
              word={currentWord}
              onAnswer={handleAnswer}
              onNext={handleNext}
              isLoading={updateProgressMutation.isPending}
            />
          )}
        </div>
      )}
    </div>
  );
}
