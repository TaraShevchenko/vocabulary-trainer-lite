"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, EyeOff, XCircle, Volume2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/utils/cn";
import { speakText } from "@/shared/utils/textToSpeech";

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
  const [wrongAnswers, setWrongAnswers] = useState<Set<string>>(new Set());
  const [isAnswered, setIsAnswered] = useState(false);
  const [showRussian, setShowRussian] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [blinkingChoice, setBlinkingChoice] = useState<string | null>(null);
  const [speakingChoice, setSpeakingChoice] = useState<string | null>(null);
  const [speakingDescription, setSpeakingDescription] = useState(false);

  useEffect(() => {
    const autoSpeakDescription = async () => {
      if (!word.description || speakingChoice || speakingDescription) return;

      try {
        setSpeakingDescription(true);
        await speakText(word.description, { lang: "en-US", rate: 0.8 });
      } catch (error) {
        console.warn("Auto text-to-speech failed:", error);
      } finally {
        setSpeakingDescription(false);
      }
    };

    void autoSpeakDescription();
  }, [word.id]);

  const choices = useMemo(() => {
    const correctAnswer = word.english;
    const otherWords = words.filter(
      (w) => w.id !== word.id && w.english !== correctAnswer,
    );

    const wrongChoices = otherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.english);

    const allChoices = [correctAnswer, ...wrongChoices].sort(
      () => Math.random() - 0.5,
    );

    return allChoices;
  }, [word.id, word.english, words]);

  const handleChoiceSelect = async (choice: string) => {
    if (isAnswered || isSpeaking) return;

    const correct = choice === word.english;

    onAnswer(word.id, choice, correct);

    if (correct) {
      setIsAnswered(true);
      toast.success("Правильно!");

      try {
        setIsSpeaking(true);
        await speakText(word.english, { lang: "en-US", rate: 0.8 });
        handleNext();
      } catch (error) {
        console.warn("Text-to-speech failed:", error);
        handleNext();
      } finally {
        setIsSpeaking(false);
      }
    } else {
      setWrongAnswers((prev) => new Set([...prev, choice]));
      setBlinkingChoice(choice);
      toast.error("Неправильно! Попробуйте ещё раз");

      setTimeout(() => {
        setBlinkingChoice(null);
      }, 600);
    }
  };

  const handleSpeakChoice = async (choice: string) => {
    if (speakingChoice || speakingDescription) return;

    try {
      setSpeakingChoice(choice);
      await speakText(choice, { lang: "en-US", rate: 0.8 });
    } catch (error) {
      console.warn("Text-to-speech failed:", error);
    } finally {
      setSpeakingChoice(null);
    }
  };

  const handleSpeakDescription = async () => {
    if (speakingChoice || speakingDescription) return;

    try {
      setSpeakingDescription(true);
      await speakText(word.description, { lang: "en-US", rate: 0.8 });
    } catch (error) {
      console.warn("Text-to-speech failed:", error);
    } finally {
      setSpeakingDescription(false);
    }
  };

  const handleNext = () => {
    setWrongAnswers(new Set());
    setIsAnswered(false);
    setShowRussian(false);
    setIsSpeaking(false);
    setBlinkingChoice(null);
    setSpeakingChoice(null);
    setSpeakingDescription(false);
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
        <CardTitle
          className={cn(
            "text-2xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
            speakingDescription && "text-blue-600 dark:text-blue-400",
          )}
          onClick={handleSpeakDescription}
        >
          {word.description}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          {choices.map((choice, index) => {
            const isWrongAnswer = wrongAnswers.has(choice);
            const isCorrectChoice = choice === word.english;
            const isBlinking = blinkingChoice === choice;
            const showCorrect = isAnswered && isCorrectChoice;
            const isChoiceSpeaking = speakingChoice === choice;

            return (
              <div key={index} className="flex items-center gap-2">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleSpeakChoice(choice)}
                  disabled={!!speakingChoice || speakingDescription}
                  className={cn(
                    isChoiceSpeaking && "text-blue-600 dark:text-blue-400",
                  )}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleChoiceSelect(choice)}
                  disabled={
                    isWrongAnswer || isAnswered || isLoading || isSpeaking
                  }
                  className={cn(
                    "flex-1 p-4 text-left justify-start text-lg h-auto min-h-[60px] transition-all duration-150",
                    isWrongAnswer &&
                      "bg-red-100 dark:bg-red-900/30 border-red-300 text-red-500 dark:text-red-400 opacity-50 cursor-not-allowed",
                    showCorrect &&
                      "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300",
                    isBlinking &&
                      "animate-pulse bg-red-200 dark:bg-red-800/50 border-red-500",
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
                    {isWrongAnswer && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </Button>
              </div>
            );
          })}
        </div>

        {!isAnswered && !isSpeaking && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Choose the correct English translation
          </div>
        )}
      </CardContent>
    </Card>
  );
}
