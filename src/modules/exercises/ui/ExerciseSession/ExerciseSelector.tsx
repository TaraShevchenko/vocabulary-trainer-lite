"use client";

import {
  ExploreExercise,
  MatchingExercise,
  MultipleChoiceExercise,
  SpeechExercise,
  TypingExercise,
} from "../Exercises";

type ExerciseType =
  | "intro"
  | "matching"
  | "multiple-choice"
  | "typing"
  | "speech";

interface Word {
  id: string;
  english: string;
  russian: string;
  description: string;
  progress: number;
  lastStudied: Date;
}

interface ExerciseSelectorProps {
  exerciseType: ExerciseType;
  currentWord?: Word;
  words: Word[];
  hasCompletedIntro: boolean;
  hasCompletedMatching: boolean;
  onAnswer: (
    wordId: string,
    userAnswer: string,
    isCorrect: boolean,
  ) => Promise<void>;
  onNext: () => void;
  onSkipIntro: () => void;
  isLoading: boolean;
  exerciseOrder?: ExerciseType[];
}

export function ExerciseSelector({
  exerciseType,
  currentWord,
  words,
  hasCompletedIntro,
  hasCompletedMatching,
  onAnswer,
  onNext,
  onSkipIntro,
  isLoading,
  exerciseOrder,
}: ExerciseSelectorProps) {
  const exerciseProps = {
    onAnswer,
    onNext,
    isLoading,
  };

  if (!exerciseOrder?.includes(exerciseType)) {
    return null;
  }

  switch (exerciseType) {
    case "intro":
      if (!hasCompletedIntro) {
        return (
          <ExploreExercise
            words={words}
            onNext={onNext}
            onSkipAll={onSkipIntro}
            isLoading={isLoading}
          />
        );
      }
      return null;

    case "matching":
      if (!hasCompletedMatching) {
        return <MatchingExercise words={words} {...exerciseProps} />;
      }
      return null;

    case "multiple-choice":
      if (currentWord) {
        return (
          <MultipleChoiceExercise
            word={currentWord}
            words={words}
            {...exerciseProps}
          />
        );
      }
      return null;

    case "typing":
      if (currentWord) {
        return <TypingExercise word={currentWord} {...exerciseProps} />;
      }
      return null;

    case "speech":
      if (currentWord) {
        return <SpeechExercise word={currentWord} {...exerciseProps} />;
      }
      return null;

    default:
      return null;
  }
}
