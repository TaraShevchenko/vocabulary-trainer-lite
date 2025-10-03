"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Target } from "lucide-react";
import { api } from "@/shared/api/client";
import { VoiceSelector } from "@/shared/ui/VoiceSelector";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { ExerciseSelector } from "./ExerciseSelector";
import { ProgressHeader } from "./ProgressHeader";
import { SessionComplete } from "./SessionComplete";
import { SessionStats } from "./SessionStats";

interface ExerciseSessionProps {
  groupId: string;
  groupName?: string;
  initialWordId?: string;
  initialExerciseType?: string;
  exerciseOrder?: ExerciseType[];
}

interface SessionStats {
  totalAnswers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  currentStreak: number;
  bestStreak: number;
}

type ExerciseType =
  | "intro"
  | "matching"
  | "multiple-choice"
  | "typing"
  | "speech";

const EXERCISE_ORDER: ExerciseType[] = [
  "intro",
  "matching",
  "multiple-choice",
  "speech",
  "typing",
];

export function ExerciseSession({
  groupId,
  groupName,
  initialWordId,
  initialExerciseType,
  exerciseOrder = EXERCISE_ORDER,
}: ExerciseSessionProps) {
  const router = useRouter();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentExerciseType, setCurrentExerciseType] = useState<ExerciseType>(
    (initialExerciseType as ExerciseType) || exerciseOrder[0] || "intro",
  );
  const [hasCompletedIntro, setHasCompletedIntro] = useState(false);
  const [hasCompletedMatching, setHasCompletedMatching] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalAnswers: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
  });
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  const {
    data: words,
    isLoading: wordsLoading,
    error: wordsError,
  } = api.exercises.getWordsForExercise.useQuery({ groupId, limit: 50 });

  const updateProgressMutation = api.exercises.updateProgress.useMutation();

  // Инициализация индекса слова, если передан initialWordId
  useEffect(() => {
    if (initialWordId && words) {
      const wordIndex = words.findIndex((word) => word.id === initialWordId);
      if (wordIndex !== -1) {
        setCurrentWordIndex(wordIndex);
      }
    }
  }, [initialWordId, words]);

  const currentWord = words?.[currentWordIndex];
  const progressPercentage = words
    ? currentExerciseType === "intro"
      ? Math.round(((currentWordIndex + 1) / words.length) * 100)
      : currentExerciseType === "matching"
        ? Math.round((sessionStats.correctAnswers / words.length) * 100)
        : Math.round(((currentWordIndex + 1) / words.length) * 100)
    : 0;
  const accuracyPercentage =
    sessionStats.totalAnswers > 0
      ? Math.round(
          (sessionStats.correctAnswers / sessionStats.totalAnswers) * 100,
        )
      : 0;

  const getProgressIncrement = (exerciseType: ExerciseType): number => {
    switch (exerciseType) {
      case "intro":
        return 0;
      case "matching":
        return 4;
      case "multiple-choice":
        return 6;
      case "typing":
        return 15;
      case "speech":
        return 20;
      default:
        return 10;
    }
  };

  const handleAnswer = async (
    wordId: string,
    userAnswer: string,
    isCorrect: boolean,
  ) => {
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

    try {
      await updateProgressMutation.mutateAsync({
        wordId,
        isCorrect,
        progressIncrement: getProgressIncrement(currentExerciseType),
      });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleNext = () => {
    if (!words) return;

    // Если изучаем конкретное слово, переходим к следующему упражнению для того же слова
    if (initialWordId) {
      const currentExerciseIndex = exerciseOrder.indexOf(currentExerciseType);
      if (currentExerciseIndex < exerciseOrder.length - 1) {
        const nextExerciseType = exerciseOrder[currentExerciseIndex + 1];
        if (nextExerciseType) {
          setCurrentExerciseType(nextExerciseType);
          return;
        }
      } else {
        // Все упражнения для слова завершены, возвращаемся к группе
        router.push(`/groups/${groupId}`);
        return;
      }
    }

    if (currentExerciseType === "intro") {
      setHasCompletedIntro(true);
      const nextExerciseIndex = exerciseOrder.indexOf("intro") + 1;
      if (nextExerciseIndex < exerciseOrder.length) {
        setCurrentExerciseType(exerciseOrder[nextExerciseIndex]!);
        setCurrentWordIndex(0);
        return;
      }
    }

    if (currentExerciseType === "matching") {
      setHasCompletedMatching(true);
      const nextExerciseIndex = exerciseOrder.indexOf("matching") + 1;
      if (nextExerciseIndex < exerciseOrder.length) {
        setCurrentExerciseType(exerciseOrder[nextExerciseIndex]!);
        setCurrentWordIndex(0);
        return;
      }
    }

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
    } else {
      const currentExerciseIndex = exerciseOrder.indexOf(currentExerciseType);
      if (currentExerciseIndex < exerciseOrder.length - 1) {
        const nextExerciseType = exerciseOrder[currentExerciseIndex + 1];
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

  const handleSkipIntro = () => {
    setHasCompletedIntro(true);
    const nextExerciseIndex = exerciseOrder.indexOf("intro") + 1;
    if (nextExerciseIndex < exerciseOrder.length) {
      setCurrentExerciseType(exerciseOrder[nextExerciseIndex]!);
    }
    setCurrentWordIndex(0);
  };

  const handleRestart = () => {
    setCurrentWordIndex(0);
    setCurrentExerciseType(exerciseOrder[0] || "intro");
    setHasCompletedIntro(false);
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
    if (initialWordId) {
      router.push(`/groups/${groupId}`);
    } else {
      router.push("/");
    }
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
            <h3 className="text-lg font-semibold mb-2">No words to study</h3>
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
      <SessionComplete
        correctAnswers={sessionStats.correctAnswers}
        incorrectAnswers={sessionStats.incorrectAnswers}
        accuracyPercentage={accuracyPercentage}
        bestStreak={sessionStats.bestStreak}
        onRestart={handleRestart}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="absolute left-2 -top-16 flex items-center gap-2 md:left-0">
        <Button
          variant="outline"
          onClick={handleBackToDashboard}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <VoiceSelector
          testText={currentWord?.description || "Hello, this is a test."}
        />
      </div>

      <ProgressHeader
        groupName={groupName}
        exerciseType={currentExerciseType}
        currentWordIndex={currentWordIndex}
        totalWords={words.length}
        progressPercentage={progressPercentage}
      />

      <SessionStats
        correctAnswers={sessionStats.correctAnswers}
        incorrectAnswers={sessionStats.incorrectAnswers}
        currentStreak={sessionStats.currentStreak}
      />

      <div className="mb-8">
        <ExerciseSelector
          exerciseType={currentExerciseType}
          currentWord={currentWord}
          words={words}
          hasCompletedIntro={hasCompletedIntro}
          hasCompletedMatching={hasCompletedMatching}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onSkipIntro={handleSkipIntro}
          isLoading={updateProgressMutation.isPending}
          exerciseOrder={exerciseOrder}
        />
      </div>
    </div>
  );
}
