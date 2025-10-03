"use client";

import { Progress } from "@/shared/ui/progress";

type ExerciseType =
  | "intro"
  | "matching"
  | "multiple-choice"
  | "typing"
  | "speech";

interface ProgressHeaderProps {
  groupName?: string;
  exerciseType: ExerciseType;
  currentWordIndex: number;
  totalWords: number;
  progressPercentage: number;
}

const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  intro: "Introduction",
  matching: "Matching",
  "multiple-choice": "Multiple Choice",
  typing: "Typing",
  speech: "Speech",
};

export function ProgressHeader({
  groupName,
  exerciseType,
  currentWordIndex,
  totalWords,
  progressPercentage,
}: ProgressHeaderProps) {
  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {groupName || "Exercises"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {EXERCISE_TYPE_LABELS[exerciseType]}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Word {currentWordIndex + 1} of {totalWords}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Session Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
      </div>
    </>
  );
}
