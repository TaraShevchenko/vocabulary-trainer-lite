"use client";

import { useState, useEffect } from "react";
import { Volume2, Play, Check, Settings } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { cn } from "@/shared/utils/cn";
import { ttsService } from "@/shared/utils/textToSpeech";

interface VoiceSelectorProps {
  testText?: string;
}

interface VoiceInfo {
  name: string;
  lang: string;
  default: boolean;
  localService: boolean;
  voice: SpeechSynthesisVoice;
}

const VOICE_STORAGE_KEY = "vocabulary-trainer-selected-voice";

export function VoiceSelector({
  testText = "Hello, this is a test.",
}: VoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [testingVoice, setTestingVoice] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    loadVoices();
    loadSelectedVoice();
  }, []);

  const loadVoices = () => {
    if (typeof window === "undefined") return;

    const availableVoices = speechSynthesis.getVoices();
    const englishVoicesRaw = availableVoices.filter((voice) =>
      voice.lang.startsWith("en"),
    );

    // Логирование для отладки в development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `VoiceSelector: Found ${englishVoicesRaw.length} English voices before deduplication`,
      );
    }

    // Создаем Map для дедупликации по комбинации name + lang
    const voiceMap = new Map<string, VoiceInfo>();

    englishVoicesRaw.forEach((voice) => {
      const key = `${voice.name}-${voice.lang}`;

      // Если голос с таким ключом уже есть, оставляем только локальный (если доступен)
      if (voiceMap.has(key)) {
        const existing = voiceMap.get(key)!;
        // Приоритет локальным голосам
        if (voice.localService && !existing.localService) {
          voiceMap.set(key, {
            name: voice.name,
            lang: voice.lang,
            default: voice.default,
            localService: voice.localService,
            voice: voice,
          });
        }
      } else {
        voiceMap.set(key, {
          name: voice.name,
          lang: voice.lang,
          default: voice.default,
          localService: voice.localService,
          voice: voice,
        });
      }
    });

    // Преобразуем Map обратно в массив и сортируем
    const englishVoices = Array.from(voiceMap.values()).sort((a, b) => {
      // Сортируем: сначала локальные, потом по имени
      if (a.localService !== b.localService) {
        return a.localService ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    // Логирование для отладки в development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `VoiceSelector: After deduplication: ${englishVoices.length} unique voices`,
      );
      console.log(
        "Deduplicated voices:",
        englishVoices.map((v) => ({
          name: v.name,
          lang: v.lang,
          localService: v.localService,
        })),
      );
    }

    setVoices(englishVoices);
  };

  const loadSelectedVoice = () => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem(VOICE_STORAGE_KEY);
    if (saved) {
      setSelectedVoice(saved);
    }
  };

  const handleVoiceSelect = (voiceName: string) => {
    setSelectedVoice(voiceName);
    if (typeof window !== "undefined") {
      localStorage.setItem(VOICE_STORAGE_KEY, voiceName);
    }
    // Уведомляем TTS сервис о новом выборе
    ttsService.setPreferredVoice(voiceName);
  };

  const testVoice = async (voice: VoiceInfo) => {
    if (isSpeaking || typeof window === "undefined") return;

    setTestingVoice(voice.name);
    setIsSpeaking(true);

    try {
      const utterance = new SpeechSynthesisUtterance(testText);
      utterance.voice = voice.voice;
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        setTestingVoice(null);
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setTestingVoice(null);
        setIsSpeaking(false);
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn("Voice test failed:", error);
      setTestingVoice(null);
      setIsSpeaking(false);
    }
  };

  const getVoiceQuality = (voice: VoiceInfo): string => {
    if (voice.localService) return "High Quality";
    return "Standard";
  };

  const getVoiceTypeColor = (voice: VoiceInfo): string => {
    if (voice.localService) return "bg-green-100 text-green-800";
    return "bg-blue-100 text-blue-800";
  };

  // Обновляем голоса когда они загружаются
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVoicesChanged = () => {
      loadVoices();
    };

    speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    return () => {
      speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Voice Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Choose Your Voice
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Select and test different voices to find the one you prefer. Your
            choice will be saved automatically.
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {voices.map((voice) => (
                <Card
                  key={`${voice.name}-${voice.lang}`}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedVoice === voice.name && "ring-2 ring-blue-500",
                  )}
                >
                  <CardContent>
                    <div className="flex flex-col justify-between">
                      <div className="mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{voice.name}</h3>
                          <Badge
                            variant="secondary"
                            className={cn("text-xs", getVoiceTypeColor(voice))}
                          >
                            {getVoiceQuality(voice)}
                          </Badge>
                          {voice.default && (
                            <Badge variant="outline" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Language: {voice.lang}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testVoice(voice)}
                          disabled={isSpeaking}
                          className="gap-2"
                        >
                          {testingVoice === voice.name ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                          Test
                        </Button>

                        <Button
                          variant={
                            selectedVoice === voice.name ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handleVoiceSelect(voice.name)}
                          className="gap-2"
                        >
                          {selectedVoice === voice.name && (
                            <Check className="h-4 w-4" />
                          )}
                          {selectedVoice === voice.name ? "Selected" : "Select"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {voices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Volume2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Loading voices...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
