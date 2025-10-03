"use client";

import { useEffect, useState } from "react";
import { EyeOff, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/utils/cn";
import { speakText } from "@/shared/utils/textToSpeech";

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

interface LetterButton {
  id: string;
  letter: string;
  originalIndex: number;
  used: boolean;
}

export function TypingExercise({
  word,
  onAnswer,
  onNext,
  isLoading = false,
}: TypingExerciseProps) {
  const [showRussian, setShowRussian] = useState(false);
  const [availableLetters, setAvailableLetters] = useState<LetterButton[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<LetterButton[]>([]);
  const [errorLetters, setErrorLetters] = useState<Set<number>>(new Set());
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingDescription, setSpeakingDescription] = useState(false);

  const targetWord = word.english.toLowerCase();
  const targetLetters = targetWord.split("");

  useEffect(() => {
    const letters = targetWord.split("").map((letter, index) => ({
      id: `${letter}-${index}`,
      letter: letter === " " ? "␣" : letter,
      originalIndex: index,
      used: false,
    }));

    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setAvailableLetters(shuffled);
    setSelectedLetters([]);
    setErrorLetters(new Set());
    setHasAnswered(false);
    setIsCorrect(false);
    setShowRussian(false);
    setIsSpeaking(false);
    setSpeakingDescription(false);

    const autoSpeakDescription = async () => {
      if (!word.description || speakingDescription || isSpeaking) return;

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
  }, [word.id, word.english, targetWord]);

  const handleLetterClick = async (slotIndex: number) => {
    if (hasAnswered || isSpeaking) return;
    const clickedLetter = availableLetters[slotIndex];
    if (!clickedLetter || clickedLetter.used) return;

    const nextExpectedIndex = selectedLetters.length;
    const expectedLetter = targetLetters[nextExpectedIndex];

    if (
      (clickedLetter.letter === "␣" ? " " : clickedLetter.letter) ===
      expectedLetter
    ) {
      setSelectedLetters((prev) => [...prev, clickedLetter]);
      setAvailableLetters((prev) => {
        const next = [...prev];
        if (slotIndex < 0 || slotIndex >= next.length) return prev;
        const letterAtSlot = next[slotIndex];
        if (!letterAtSlot || letterAtSlot.used) return prev;
        const updatedLetter: LetterButton = {
          id: letterAtSlot.id,
          letter: letterAtSlot.letter,
          originalIndex: letterAtSlot.originalIndex,
          used: true,
        };
        next[slotIndex] = updatedLetter;
        return next;
      });

      if (selectedLetters.length + 1 === targetLetters.length) {
        const userAnswer = [...selectedLetters, clickedLetter]
          .map((l) => (l.letter === "␣" ? " " : l.letter))
          .join("");

        setIsCorrect(true);
        setHasAnswered(true);
        toast.success("Correct!");
        onAnswer(word.id, userAnswer, true);

        try {
          setIsSpeaking(true);
          await speakText(word.english, { lang: "en-US", rate: 0.8 });
          handleNextWord();
        } catch (error) {
          console.warn("Text-to-speech failed:", error);
          handleNextWord();
        } finally {
          setIsSpeaking(false);
        }
      }
    } else {
      setErrorLetters((prev) => new Set(prev).add(slotIndex));
      toast.error("Wrong letter!");

      setTimeout(() => {
        setErrorLetters((prev) => {
          const newSet = new Set(prev);
          newSet.delete(slotIndex);
          return newSet;
        });
      }, 1000);

      if (selectedLetters.length === 0) {
        const userAnswer =
          clickedLetter.letter === "␣" ? " " : clickedLetter.letter;
        onAnswer(word.id, userAnswer, false);
      }
    }
  };

  const handleSpeakDescription = async () => {
    if (speakingDescription || isSpeaking) return;

    try {
      setSpeakingDescription(true);
      await speakText(word.description, { lang: "en-US", rate: 0.8 });
    } catch (error) {
      console.warn("Text-to-speech failed:", error);
    } finally {
      setSpeakingDescription(false);
    }
  };

  const handleNextWord = () => {
    setShowRussian(false);
    setHasAnswered(false);
    setIsCorrect(false);
    setIsSpeaking(false);
    setSpeakingDescription(false);
    onNext();
  };

  const handleRestart = () => {
    const letters = targetWord.split("").map((letter, index) => ({
      id: `${letter}-${index}`,
      letter: letter === " " ? "␣" : letter,
      originalIndex: index,
      used: false,
    }));

    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setAvailableLetters(shuffled);
    setSelectedLetters([]);
    setErrorLetters(new Set());
    setHasAnswered(false);
    setIsCorrect(false);
  };

  return (
    <Card className="max-w-4xl w-full mx-auto">
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
            "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
            speakingDescription && "text-blue-600 dark:text-blue-400",
          )}
          onClick={handleSpeakDescription}
        >
          {word.description}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Your Answer:</h3>
          <div className="flex flex-wrap justify-center gap-2 min-h-[60px] p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {targetLetters.map((_, index) => {
              const selectedLetter = selectedLetters[index];
              return (
                <div
                  key={index}
                  className={cn(
                    "w-12 h-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-200",
                    selectedLetter &&
                      "border-solid border-green-500 bg-green-50 dark:bg-green-900/20",
                  )}
                >
                  {selectedLetter && (
                    <span className="text-green-700 dark:text-green-300">
                      {selectedLetter.letter === "␣"
                        ? "␣"
                        : selectedLetter.letter.toUpperCase()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">
            Available Letters:
          </h3>
          <div className="flex flex-wrap justify-center gap-3 min-h-[80px] p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {availableLetters.map((letter, index) => (
              <div key={`slot-${index}`}>
                {letter.used ? (
                  <div className="w-12 h-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg" />
                ) : (
                  <Button
                    onClick={() => handleLetterClick(index)}
                    disabled={hasAnswered || isLoading || isSpeaking}
                    className={cn(
                      "w-12 h-12 text-lg font-bold transition-all duration-200",
                      errorLetters.has(index) &&
                        "bg-red-500 hover:bg-red-500 animate-pulse",
                      letter.letter === "␣" &&
                        "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
                    )}
                    variant={
                      errorLetters.has(index) ? "destructive" : "outline"
                    }
                  >
                    {letter.letter === "␣" ? "␣" : letter.letter.toUpperCase()}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          {hasAnswered ? (
            <Button
              onClick={handleNextWord}
              className="px-8"
              variant="outline"
              disabled={isSpeaking}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Next Word
            </Button>
          ) : (
            <Button
              onClick={handleRestart}
              variant="outline"
              className="px-8"
              disabled={isLoading || isSpeaking}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart
            </Button>
          )}
        </div>

        {!hasAnswered && !isSpeaking && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Click letters in the correct order to spell the word
          </div>
        )}
      </CardContent>
    </Card>
  );
}
