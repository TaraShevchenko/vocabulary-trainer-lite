"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Volume2, ChevronRight, SkipForward } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/utils/cn";
import { speakText } from "@/shared/utils/textToSpeech";

interface IntroExerciseProps {
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

export function IntroExercise({
    words,
    onNext,
    onSkipAll,
    isLoading = false,
}: IntroExerciseProps) {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [showRussian, setShowRussian] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speakingDescription, setSpeakingDescription] = useState(false);

    const currentWord = words[currentWordIndex];
    const isLastWord = currentWordIndex === words.length - 1;

    useEffect(() => {
        setShowRussian(false);
        setIsSpeaking(false);
        setSpeakingDescription(false);

        const autoSpeakDescription = async () => {
            if (!currentWord?.description || speakingDescription || isSpeaking) return;

            try {
                setSpeakingDescription(true);
                await speakText(currentWord.description, { lang: "en-US", rate: 0.8 });
            } catch (error) {
                console.warn("Auto text-to-speech failed:", error);
            } finally {
                setSpeakingDescription(false);
            }
        };

        void autoSpeakDescription();
    }, [currentWordIndex, currentWord?.id]);

    const handleSpeakDescription = async () => {
        if (speakingDescription || isSpeaking || !currentWord) return;

        try {
            setSpeakingDescription(true);
            await speakText(currentWord.description, { lang: "en-US", rate: 0.8 });
        } catch (error) {
            console.warn("Text-to-speech failed:", error);
        } finally {
            setSpeakingDescription(false);
        }
    };

    const handleSpeakEnglish = async () => {
        if (isSpeaking || speakingDescription || !currentWord) return;

        try {
            setIsSpeaking(true);
            await speakText(currentWord.english, { lang: "en-US", rate: 0.8 });
        } catch (error) {
            console.warn("Text-to-speech failed:", error);
        } finally {
            setIsSpeaking(false);
        }
    };

    const handleNext = () => {
        if (isLastWord) {
            onNext();
        } else {
            setCurrentWordIndex((prev) => prev + 1);
        }
    };

    const handleSkipAll = () => {
        onSkipAll();
    };

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
                        speakingDescription && "text-blue-600 dark:text-blue-400",
                    )}
                    onClick={handleSpeakDescription}
                >
                    {currentWord.description}
                </CardTitle>

                <div className="flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSpeakDescription}
                        disabled={speakingDescription || isSpeaking}
                        className={cn(
                            "flex items-center gap-2",
                            speakingDescription && "text-blue-600 dark:text-blue-400",
                        )}
                    >
                        <Volume2 className="h-4 w-4" />
                        Description
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSpeakEnglish}
                        disabled={speakingDescription || isSpeaking}
                        className={cn(
                            "flex items-center gap-2",
                            isSpeaking && "text-blue-600 dark:text-blue-400",
                        )}
                    >
                        <Volume2 className="h-4 w-4" />
                        Word
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {currentWord.english}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        English word
                    </div>
                </div>

                <div className="flex gap-3 justify-center">
                    <Button
                        onClick={handleNext}
                        disabled={isLoading || isSpeaking || speakingDescription}
                        className="px-8 flex items-center gap-2"
                    >
                        {isLastWord ? (
                            <>
                                <ChevronRight className="h-4 w-4" />
                                Start Exercises
                            </>
                        ) : (
                            <>
                                <ChevronRight className="h-4 w-4" />
                                Next
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={handleSkipAll}
                        variant="outline"
                        disabled={isLoading || isSpeaking || speakingDescription}
                        className="px-6 flex items-center gap-2"
                    >
                        <SkipForward className="h-4 w-4" />
                        Skip All
                    </Button>
                </div>

                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    {!showRussian
                        ? "Click on the translation to reveal it"
                        : "Study the word and click 'Next' to continue"}
                </div>
            </CardContent>
        </Card>
    );
}
