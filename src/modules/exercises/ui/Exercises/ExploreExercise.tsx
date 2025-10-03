"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { EyeOff, Mic, MicOff, SkipForward } from "lucide-react";
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
import { speakText } from "@/shared/utils/textToSpeech";

interface ExploreExerciseProps {
  words: Array<{
    id: string;
    english: string;
    russian: string;
    description: string;
    progress: number;
  }>;
  onNext: () => void;
  onSkipAll: () => void;
  isLoading?: boolean;
}

export function ExploreExercise({
  words,
  onNext,
  onSkipAll,
  isLoading = false,
}: ExploreExerciseProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showRussian, setShowRussian] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [canStartListening, setCanStartListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [similarity, setSimilarity] = useState(0);
  const [hasInterimResults, setHasInterimResults] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentWord = words[currentWordIndex];
  const isLastWord = currentWordIndex === words.length - 1;

  const currentWordIdRef = useRef(currentWord?.id);
  const isActiveRef = useRef(true);
  const targetWord = currentWord?.english;
  const recognitionPromiseRef = useRef<Promise<void> | null>(null);
  const hasProcessedCurrentSessionRef = useRef(false);

  const resetState = useCallback(() => {
    forceStopListening();
    setShowRussian(false);
    setHasAnswered(false);
    setIsCorrect(false);
    setUserTranscript("");
    setSimilarity(0);
    setHasInterimResults(false);
    setIsProcessing(false);
    setCanStartListening(false);
    setIsListening(false);
    setIsSpeaking(false);
    recognitionPromiseRef.current = null;
    hasProcessedCurrentSessionRef.current = false;
  }, []);

  useEffect(() => {
    currentWordIdRef.current = currentWord?.id;
    isActiveRef.current = true;

    return () => {
      isActiveRef.current = false;
    };
  }, [currentWord?.id]);

  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
    resetState();

    const autoSpeakWord = async () => {
      if (!currentWord?.english || isSpeaking) return;

      try {
        setIsSpeaking(true);
        await speakText(currentWord.english, { lang: "en-US", rate: 0.8 });

        if (
          currentWordIdRef.current === currentWord.id &&
          isActiveRef.current
        ) {
          setCanStartListening(true);
        }
      } catch (error) {
        console.warn("Auto text-to-speech failed:", error);
        if (
          currentWordIdRef.current === currentWord.id &&
          isActiveRef.current
        ) {
          setCanStartListening(true);
        }
      } finally {
        if (
          currentWordIdRef.current === currentWord.id &&
          isActiveRef.current
        ) {
          setIsSpeaking(false);
        }
      }
    };

    void autoSpeakWord();
  }, [currentWordIndex, currentWord?.id, currentWord?.english, resetState]);

  const handleSpeakWord = async () => {
    if (isSpeaking || isListening || !currentWord) return;

    try {
      setIsSpeaking(true);
      await speakText(currentWord.english, { lang: "en-US", rate: 0.8 });
    } catch (error) {
      console.warn("Text-to-speech failed:", error);
    } finally {
      if (currentWordIdRef.current === currentWord.id && isActiveRef.current) {
        setIsSpeaking(false);
      }
    }
  };

  const processAnswer = useCallback(
    (transcript: string) => {
      if (hasProcessedCurrentSessionRef.current) {
        return;
      }
      if (
        currentWordIdRef.current !== currentWord?.id ||
        !isActiveRef.current ||
        hasAnswered
      ) {
        console.log("Ignoring stale result for word:", transcript);
        return;
      }

      const textSimilarity = calculateSimilarity(transcript, targetWord || "");
      const isAnswerCorrect = compareTexts(transcript, targetWord || "", 0.85);

      setSimilarity(textSimilarity);
      setIsCorrect(isAnswerCorrect);
      setIsListening(false);
      setHasInterimResults(false);
      setIsProcessing(false);
      hasProcessedCurrentSessionRef.current = true;

      if (isAnswerCorrect) {
        setHasAnswered(true);
        toast.success("Correct!");
        setTimeout(() => {
          handleNextWord();
        }, 500);
      } else {
        toast.error(`Incorrect! The correct word is "${currentWord?.english}"`);
        setTimeout(() => {
          const speakCorrectWord = async () => {
            try {
              if (
                currentWordIdRef.current === currentWord?.id &&
                isActiveRef.current
              ) {
                setIsSpeaking(true);
                await speakText(currentWord?.english || "", {
                  lang: "en-US",
                  rate: 0.8,
                });
              }
            } catch (error) {
              console.warn("Text-to-speech failed:", error);
            } finally {
              if (
                currentWordIdRef.current === currentWord?.id &&
                isActiveRef.current
              ) {
                setIsSpeaking(false);
              }
            }
          };
          void speakCorrectWord();
        }, 500);
      }
    },
    [currentWord?.id, currentWord?.english, targetWord, hasAnswered],
  );

  const handleToggleListening = async () => {
    if (!speechSupported) {
      toast.error("Speech recognition not supported in your browser");
      return;
    }

    if (!canStartListening || isSpeaking || hasAnswered) return;

    if (!isListening) {
      try {
        setIsListening(true);
        setUserTranscript("");
        setHasInterimResults(false);
        setIsProcessing(false);
        hasProcessedCurrentSessionRef.current = false;

        recognitionPromiseRef.current = startListening(
          {
            lang: "en-US",
            continuous: true,
            interimResults: true,
            maxAlternatives: 1,
          },
          (result: SpeechRecognitionResult) => {
            if (
              currentWordIdRef.current !== currentWord?.id ||
              !isActiveRef.current
            ) {
              console.log("Ignoring speech result for stale word");
              return;
            }

            setUserTranscript(result.transcript);
            if (result.transcript.trim().length > 0) {
              setHasInterimResults(true);
            }

            if (
              result.isFinal &&
              result.transcript.trim().length > 0 &&
              !hasProcessedCurrentSessionRef.current
            ) {
              processAnswer(result.transcript);
            }
          },
        )
          .then((result) => {
            if (
              currentWordIdRef.current !== currentWord?.id ||
              !isActiveRef.current ||
              hasProcessedCurrentSessionRef.current
            ) {
              return;
            }

            if (result.transcript.trim().length > 0) {
              processAnswer(result.transcript);
            } else {
              setIsListening(false);
              setHasInterimResults(false);
              setIsProcessing(false);
            }
          })
          .catch((error) => {
            console.warn("Speech recognition failed:", error);
            toast.error("Failed to recognize speech. Try again.");
            if (
              currentWordIdRef.current === currentWord?.id &&
              isActiveRef.current
            ) {
              setIsListening(false);
              setHasInterimResults(false);
              setIsProcessing(false);
            }
          });
      } catch (error) {
        console.warn("Speech recognition failed:", error);
        toast.error("Failed to recognize speech. Try again.");
        if (
          currentWordIdRef.current === currentWord?.id &&
          isActiveRef.current
        ) {
          setIsListening(false);
          setHasInterimResults(false);
          setIsProcessing(false);
        }
      }
    } else {
      setIsProcessing(true);
      stopListening();
      setIsListening(false);
    }
  };

  const handleNextWord = () => {
    resetState();
    if (isLastWord) {
      onNext();
    } else {
      setCurrentWordIndex((prev) => prev + 1);
    }
  };

  const handleSkipAll = () => {
    onSkipAll();
  };

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

  if (!currentWord) {
    return null;
  }

  return (
    <Card className="max-w-2xl w-full mx-auto">
      <CardHeader className="text-center">
        <div className="mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Introduction to new words
          </div>
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {currentWordIndex + 1} of {words.length}
          </div>
        </div>

        <div className="mb-6 relative">
          <div
            onClick={() => setShowRussian(!showRussian)}
            className={cn(
              "inline-block px-6 py-4 rounded-xl cursor-pointer transition-all duration-300 text-4xl font-bold relative group",
              showRussian
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800"
                : "bg-gray-200 dark:bg-gray-700 text-transparent select-none border-2 border-gray-300 dark:border-gray-600",
              !showRussian && "hover:bg-gray-300 dark:hover:bg-gray-600",
            )}
            style={{
              filter: showRussian ? "none" : "blur(6px)",
            }}
          >
            {currentWord.russian}
            {!showRussian && (
              <div className="absolute inset-0 flex items-center justify-center">
                <EyeOff className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              </div>
            )}
          </div>
          {!showRussian && (
            <div className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">
              Click to reveal translation
            </div>
          )}
        </div>

        <CardTitle
          className={cn(
            "text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
            isSpeaking && "text-blue-600 dark:text-blue-400",
          )}
          onClick={handleSpeakWord}
        >
          {currentWord.english}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center">
            <Button
              onClick={handleToggleListening}
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
            {!canStartListening && isSpeaking && "Listen to the word..."}
            {canStartListening &&
              !isListening &&
              !isProcessing &&
              "Tap the microphone and repeat the word"}
            {isListening && "Listening... Tap again to stop"}
            {!isListening && isProcessing && "Processing speech... Please wait"}
            {hasAnswered && "Moving to next word..."}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            onClick={handleNextWord}
            disabled={isSpeaking}
            className="px-8 flex items-center gap-2"
            variant="outline"
          >
            {isLastWord ? "Start Exercises" : "Next"}
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          {!showRussian
            ? "Click on the translation to reveal it"
            : "Listen to the word and repeat it to continue"}
        </div>
      </CardContent>
    </Card>
  );
}
