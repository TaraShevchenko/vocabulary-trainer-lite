"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { EyeOff, Mic, MicOff, RotateCcw, Volume2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/utils/cn";
import {
  startListening,
  stopListening,
  forceStopListening,
  isSpeechRecognitionSupported,
  type SpeechRecognitionResult,
} from "@/shared/utils/speechRecognition";
import {
  compareTexts,
  calculateSimilarity,
} from "@/shared/utils/textNormalization";
import { speakText, ttsService } from "@/shared/utils/textToSpeech";

interface SpeechExerciseProps {
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

export function SpeechExercise({
  word,
  onAnswer,
  onNext,
  isLoading = false,
}: SpeechExerciseProps) {
  const [showRussian, setShowRussian] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [canStartListening, setCanStartListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [similarity, setSimilarity] = useState(0);
  const [hasInterimResults, setHasInterimResults] = useState(false);

  // Ref для отслеживания текущего слова и предотвращения race conditions
  const currentWordIdRef = useRef(word.id);
  const isActiveRef = useRef(true);

  const targetWord = word.english;

  // Функция для безопасной очистки состояния
  const resetState = useCallback(() => {
    // Принудительно останавливаем распознавание
    forceStopListening();

    setShowRussian(false);
    setHasAnswered(false);
    setIsCorrect(false);
    setUserTranscript("");
    setSimilarity(0);
    setHasInterimResults(false);
    setCanStartListening(false);
    setIsListening(false);
    setIsSpeaking(false);
  }, []);

  // Обновляем ref при смене слова
  useEffect(() => {
    currentWordIdRef.current = word.id;
    isActiveRef.current = true;

    return () => {
      isActiveRef.current = false;
    };
  }, [word.id]);

  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
    resetState();

    const autoSpeakDescription = async () => {
      if (!word.description || isSpeaking) return;

      try {
        setIsSpeaking(true);
        await speakText(word.description, { lang: "en-US" });

        // Проверяем что мы все еще на том же слове
        if (currentWordIdRef.current === word.id && isActiveRef.current) {
          setCanStartListening(true);
        }
      } catch (error) {
        console.warn("Auto text-to-speech failed:", error);
        if (currentWordIdRef.current === word.id && isActiveRef.current) {
          setCanStartListening(true);
        }
      } finally {
        if (currentWordIdRef.current === word.id && isActiveRef.current) {
          setIsSpeaking(false);
        }
      }
    };

    void autoSpeakDescription();

    if (process.env.NODE_ENV === "development") {
      setTimeout(() => ttsService.logAvailableVoices(), 1000);
    }
  }, [word.id, word.description, resetState]);

  const handleSpeakDescription = async () => {
    if (isSpeaking || isListening) return;

    try {
      setIsSpeaking(true);
      await speakText(word.description, { lang: "en-US" });
    } catch (error) {
      console.warn("Text-to-speech failed:", error);
    } finally {
      if (currentWordIdRef.current === word.id && isActiveRef.current) {
        setIsSpeaking(false);
      }
    }
  };

  const processAnswer = useCallback(
    (transcript: string) => {
      // Проверяем что мы все еще на том же слове
      if (
        currentWordIdRef.current !== word.id ||
        !isActiveRef.current ||
        hasAnswered
      ) {
        console.log("Ignoring stale result for word:", transcript);
        return;
      }

      const textSimilarity = calculateSimilarity(transcript, targetWord);
      const isAnswerCorrect = compareTexts(transcript, targetWord, 0.85);

      setSimilarity(textSimilarity);
      setIsCorrect(isAnswerCorrect);
      setIsListening(false);
      setHasInterimResults(false);

      onAnswer(word.id, transcript, isAnswerCorrect);

      if (isAnswerCorrect) {
        setHasAnswered(true);
        toast.success("Correct!");
        setTimeout(() => {
          const speakAndContinue = async () => {
            try {
              if (currentWordIdRef.current === word.id && isActiveRef.current) {
                setIsSpeaking(true);
                await speakText(word.english, { lang: "en-US" });
                handleNextWord();
              }
            } catch (error) {
              console.warn("Text-to-speech failed:", error);
              if (currentWordIdRef.current === word.id && isActiveRef.current) {
                handleNextWord();
              }
            } finally {
              if (currentWordIdRef.current === word.id && isActiveRef.current) {
                setIsSpeaking(false);
              }
            }
          };
          void speakAndContinue();
        }, 500);
      } else {
        toast.error(`Incorrect! The correct word is "${word.english}"`);
        setTimeout(() => {
          const speakCorrectWord = async () => {
            try {
              if (currentWordIdRef.current === word.id && isActiveRef.current) {
                setIsSpeaking(true);
                await speakText(word.english, { lang: "en-US" });
              }
            } catch (error) {
              console.warn("Text-to-speech failed:", error);
            } finally {
              if (currentWordIdRef.current === word.id && isActiveRef.current) {
                setIsSpeaking(false);
              }
            }
          };
          void speakCorrectWord();
        }, 500);
      }
    },
    [word.id, word.english, targetWord, hasAnswered, onAnswer],
  );

  const handleStartListening = async () => {
    if (!speechSupported) {
      toast.error("Speech recognition not supported in your browser");
      return;
    }

    if (!canStartListening || isListening || isSpeaking || hasAnswered) return;

    try {
      setIsListening(true);
      setUserTranscript("");
      setHasInterimResults(false);

      await startListening(
        {
          lang: "en-US",
          continuous: true,
          interimResults: true,
          maxAlternatives: 1,
        },
        (result: SpeechRecognitionResult) => {
          // Проверяем что мы все еще на том же слове перед обработкой результата
          if (currentWordIdRef.current !== word.id || !isActiveRef.current) {
            console.log("Ignoring speech result for stale word");
            return;
          }

          setUserTranscript(result.transcript);
          if (result.transcript.trim().length > 0) {
            setHasInterimResults(true);
          }

          if (result.isFinal && result.transcript.trim().length > 0) {
            processAnswer(result.transcript);
          }
        },
      );
    } catch (error) {
      console.warn("Speech recognition failed:", error);
      toast.error("Failed to recognize speech. Try again.");
      if (currentWordIdRef.current === word.id && isActiveRef.current) {
        setIsListening(false);
        setHasInterimResults(false);
      }
    }
  };

  const handleStopListening = () => {
    if (isListening) {
      if (hasInterimResults) {
        return;
      }

      stopListening();
      setIsListening(false);
      setHasInterimResults(false);
    }
  };

  const handleNextWord = () => {
    // Принудительно очищаем состояние перед переходом
    resetState();
    onNext();
  };

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      forceStopListening();
    };
  }, []);

  if (!speechSupported) {
    return (
      <Card className="max-w-4xl w-full mx-auto">
        <CardContent className="text-center py-12">
          <MicOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">
            Speech recognition not supported
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your browser doesn't support Web Speech API. Try using Chrome, Edge
            or Safari.
          </p>
          <Button onClick={onNext} variant="outline">
            Skip exercise
          </Button>
        </CardContent>
      </Card>
    );
  }

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

        <div className="flex items-center justify-center gap-2 mb-2">
          <CardTitle
            className={cn(
              "text-2xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
              isSpeaking && "text-blue-600 dark:text-blue-400",
            )}
            onClick={handleSpeakDescription}
          >
            {word.description}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center">
            <Button
              onMouseDown={!isListening ? handleStartListening : undefined}
              onMouseUp={isListening ? handleStopListening : undefined}
              onTouchStart={!isListening ? handleStartListening : undefined}
              onTouchEnd={isListening ? handleStopListening : undefined}
              disabled={
                !canStartListening || isSpeaking || isLoading || hasAnswered
              }
              className={cn(
                "w-20 h-20 rounded-full text-white transition-all duration-200 select-none",
                isListening
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-blue-500 hover:bg-blue-600",
                (!canStartListening || isSpeaking) && "opacity-50",
              )}
              variant={isListening ? "destructive" : "default"}
            >
              {isListening ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {!canStartListening && isSpeaking && "Listen to the description..."}
            {canStartListening &&
              !isListening &&
              "Hold the microphone button and speak"}
            {isListening &&
              !hasInterimResults &&
              "Speak now... Release the button when finished"}
            {isListening &&
              hasInterimResults &&
              "Processing speech... Please wait"}
            {hasAnswered && "Moving to next word..."}
          </div>
        </div>

        <div className="flex justify-center items-center gap-4">
          <Button
            onClick={handleNextWord}
            className="px-8"
            variant="outline"
            disabled={isSpeaking}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Next Word
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
