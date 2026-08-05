"use client";

import {
  ExploreExercise,
  MatchingExercise,
  MultipleChoiceExercise,
  SentenceCompletionExercise,
  SpeechExercise,
  TypingExercise,
} from "../Exercises";

type ExerciseType =
  | "intro"
  | "matching"
  | "sentence-completion"
  | "multiple-choice"
  | "typing"
  | "speech";

interface Word {
  id: string;
  english: string;
  russian: string;
  description: string;
  exampleSentence: string | null;
  progress: number;
  lastStudied: Date;
}

interface ExerciseSelectorProps {
  exerciseType: ExerciseType;
  currentWord?: Word;
  words: Word[];
  onAnswer: (
    wordId: string,
    userAnswer: string,
    isCorrect: boolean,
  ) => Promise<void>;
  onNext: () => void;
  isLoading: boolean;
  exerciseOrder?: ExerciseType[];
}

export function ExerciseSelector({
  exerciseType,
  currentWord,
  words,
  onAnswer,
  onNext,
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
      return (
        <ExploreExercise words={words} onNext={onNext} isLoading={isLoading} />
      );

    case "matching":
      return <MatchingExercise words={words} {...exerciseProps} />;

    case "sentence-completion":
      return <SentenceCompletionExercise words={words} {...exerciseProps} />;

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
