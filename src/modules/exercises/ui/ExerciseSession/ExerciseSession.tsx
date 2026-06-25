"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, Flag, Target } from "lucide-react";
import { api } from "@/shared/api/client";
import { VoiceSelector } from "@/shared/ui/VoiceSelector";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn } from "@/shared/utils/cn";
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

interface ExerciseStats {
  totalAnswers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  completed: boolean;
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

const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  intro: "Intro",
  matching: "Matching",
  "multiple-choice": "Choice",
  typing: "Typing",
  speech: "Speech",
};

const createEmptyExerciseStats = (): ExerciseStats => ({
  totalAnswers: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  completed: false,
});

const createExerciseStatsMap = (
  exerciseOrder: ExerciseType[],
): Record<ExerciseType, ExerciseStats> =>
  EXERCISE_ORDER.reduce(
    (acc, exerciseType) => {
      acc[exerciseType] = {
        ...createEmptyExerciseStats(),
        completed: !exerciseOrder.includes(exerciseType),
      };
      return acc;
    },
    {} as Record<ExerciseType, ExerciseStats>,
  );

const createWordIndexMap = (initialIndex = 0): Record<ExerciseType, number> =>
  EXERCISE_ORDER.reduce(
    (acc, exerciseType) => {
      acc[exerciseType] = initialIndex;
      return acc;
    },
    {} as Record<ExerciseType, number>,
  );

export function ExerciseSession({
  groupId,
  groupName,
  initialWordId,
  initialExerciseType,
  exerciseOrder = EXERCISE_ORDER,
}: ExerciseSessionProps) {
  const router = useRouter();
  const [wordIndexByExercise, setWordIndexByExercise] =
    useState<Record<ExerciseType, number>>(createWordIndexMap);
  const [currentExerciseType, setCurrentExerciseType] = useState<ExerciseType>(
    (initialExerciseType as ExerciseType) || exerciseOrder[0] || "intro",
  );
  const [exerciseStats, setExerciseStats] = useState<
    Record<ExerciseType, ExerciseStats>
  >(() => createExerciseStatsMap(exerciseOrder));
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
        setWordIndexByExercise(createWordIndexMap(wordIndex));
      }
    }
  }, [initialWordId, words]);

  const currentWordIndex = wordIndexByExercise[currentExerciseType] || 0;
  const currentWord = words?.[currentWordIndex];
  const currentExerciseStats = exerciseStats[currentExerciseType];
  const completedExercisesCount = exerciseOrder.filter(
    (exerciseType) => exerciseStats[exerciseType]?.completed,
  ).length;
  const areAllExercisesCompleted =
    completedExercisesCount === exerciseOrder.length;
  const progressPercentage = words
    ? currentExerciseType === "intro"
      ? currentExerciseStats?.completed
        ? 100
        : Math.round(((currentWordIndex + 1) / words.length) * 100)
      : currentExerciseType === "matching"
        ? currentExerciseStats?.completed
          ? 100
          : Math.round(
              ((currentExerciseStats?.correctAnswers || 0) / words.length) *
                100,
            )
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
    setExerciseStats((prev) => ({
      ...prev,
      [currentExerciseType]: {
        ...prev[currentExerciseType],
        totalAnswers: prev[currentExerciseType].totalAnswers + 1,
        correctAnswers:
          prev[currentExerciseType].correctAnswers + (isCorrect ? 1 : 0),
        incorrectAnswers:
          prev[currentExerciseType].incorrectAnswers + (isCorrect ? 0 : 1),
      },
    }));

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

  const getNextAvailableExercise = (exerciseType: ExerciseType) => {
    const currentExerciseIndex = exerciseOrder.indexOf(exerciseType);
    const nextInOrder = exerciseOrder
      .slice(currentExerciseIndex + 1)
      .find((nextExerciseType) => !exerciseStats[nextExerciseType]?.completed);

    return (
      nextInOrder ||
      exerciseOrder.find(
        (nextExerciseType) =>
          nextExerciseType !== exerciseType &&
          !exerciseStats[nextExerciseType]?.completed,
      )
    );
  };

  const markExerciseCompleted = (exerciseType: ExerciseType) => {
    setExerciseStats((prev) => ({
      ...prev,
      [exerciseType]: {
        ...prev[exerciseType],
        completed: true,
      },
    }));
  };

  const moveToNextExercise = (exerciseType: ExerciseType) => {
    const nextExerciseType = getNextAvailableExercise(exerciseType);
    if (nextExerciseType) {
      setCurrentExerciseType(nextExerciseType);
      return;
    }

    setIsSessionComplete(true);
  };

  const handleNext = () => {
    if (!words) return;

    if (initialWordId) {
      markExerciseCompleted(currentExerciseType);
      const nextExerciseType = getNextAvailableExercise(currentExerciseType);
      if (nextExerciseType) {
        setCurrentExerciseType(nextExerciseType);
      } else {
        router.push(`/groups/${groupId}`);
      }
      return;
    }

    if (currentExerciseType === "intro" || currentExerciseType === "matching") {
      markExerciseCompleted(currentExerciseType);
      moveToNextExercise(currentExerciseType);
      return;
    }

    if (currentWordIndex < words.length - 1) {
      setWordIndexByExercise((prev) => ({
        ...prev,
        [currentExerciseType]: currentWordIndex + 1,
      }));
    } else {
      markExerciseCompleted(currentExerciseType);
      moveToNextExercise(currentExerciseType);
    }
  };

  const handleExerciseTabChange = (exerciseType: string) => {
    if (exerciseOrder.includes(exerciseType as ExerciseType)) {
      setCurrentExerciseType(exerciseType as ExerciseType);
    }
  };

  const handleRestart = () => {
    setWordIndexByExercise(createWordIndexMap());
    setCurrentExerciseType(exerciseOrder[0] || "intro");
    setExerciseStats(createExerciseStatsMap(exerciseOrder));
    setSessionStats({
      totalAnswers: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      currentStreak: 0,
      bestStreak: 0,
    });
    setIsSessionComplete(false);
  };

  const handleFinishTest = () => {
    setIsSessionComplete(true);
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

      <Tabs
        value={currentExerciseType}
        onValueChange={handleExerciseTabChange}
        className="mb-5 items-center"
      >
        <TabsList className="flex h-auto w-full max-w-3xl flex-wrap justify-center gap-1 rounded-xl p-1">
          {exerciseOrder.map((exerciseType) => {
            const isCompleted = exerciseStats[exerciseType]?.completed;

            return (
              <TabsTrigger
                key={exerciseType}
                value={exerciseType}
                className={cn(
                  "min-h-10 flex-none px-3",
                  isCompleted &&
                    "border-green-200 bg-green-50 text-green-700 data-[state=active]:bg-green-100 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300 dark:data-[state=active]:bg-green-900/40",
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                {EXERCISE_TYPE_LABELS[exerciseType]}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {currentExerciseStats?.completed && (
        <div className="mx-auto mb-6 max-w-xl rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-900 shadow-sm dark:border-green-800 dark:bg-green-950/30 dark:text-green-100">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              {EXERCISE_TYPE_LABELS[currentExerciseType]} completed
            </span>
            <span>Correct: {currentExerciseStats.correctAnswers}</span>
            <span>Errors: {currentExerciseStats.incorrectAnswers}</span>
          </div>
        </div>
      )}

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
          onAnswer={handleAnswer}
          onNext={handleNext}
          isLoading={updateProgressMutation.isPending}
          exerciseOrder={exerciseOrder}
        />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 rounded-xl border bg-background p-4 shadow-sm sm:flex-row">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 sm:text-left">
          {completedExercisesCount} of {exerciseOrder.length} exercises
          completed
          {!areAllExercisesCompleted &&
            " - you can finish now or come back to any tab"}
        </div>
        <Button onClick={handleFinishTest} className="w-full sm:w-auto">
          <Flag className="h-4 w-4 mr-2" />
          Finish test
        </Button>
      </div>
    </div>
  );
}
