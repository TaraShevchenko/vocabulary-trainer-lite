export interface TTSOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export class TextToSpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private preferredVoiceName: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
      this.loadPreferredVoice();
    }
  }

  private loadVoices() {
    if (!this.synthesis) return;

    this.voices = this.synthesis.getVoices();

    if (this.voices.length === 0) {
      this.synthesis.addEventListener("voiceschanged", () => {
        if (this.synthesis) {
          this.voices = this.synthesis.getVoices();
          // Перезагружаем предпочтительный голос когда голоса становятся доступными
          this.loadPreferredVoice();
        }
      });
    }
  }

  private loadPreferredVoice() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vocabulary-trainer-selected-voice");
      if (saved) {
        this.preferredVoiceName = saved;
      }
    }
  }

  private findBestVoice(lang: string): SpeechSynthesisVoice | null {
    const langPrefix = lang.split("-")[0] ?? lang;

    // Сначала проверяем предпочтительный голос пользователя
    if (this.preferredVoiceName) {
      const preferredVoice = this.voices.find(
        (v) =>
          v.name === this.preferredVoiceName &&
          (v.lang === lang || v.lang?.startsWith(langPrefix)),
      );
      if (preferredVoice) return preferredVoice;
    }

    // Для iOS пытаемся найти более качественные голоса
    const isIOS =
      typeof window !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      // На iOS ищем специфичные голоса, которые звучат лучше
      const iosPreferredVoices = [
        "Samantha",
        "Alex",
        "Victoria",
        "Tom",
        "Karen",
        "Daniel",
        "Moira",
        "Tessa",
        "Aaron",
        "Nicky",
        "Fiona",
        "Serena",
      ];

      // Сначала ищем предпочтительные голоса для языка
      for (const preferredName of iosPreferredVoices) {
        const voice = this.voices.find(
          (v) =>
            v.name.includes(preferredName) &&
            (v.lang === lang || v.lang?.startsWith(langPrefix)),
        );
        if (voice) return voice;
      }

      // Затем ищем любые non-compact голоса (обычно лучше звучат)
      const nonCompactVoice = this.voices.find(
        (v) =>
          (v.lang === lang || v.lang?.startsWith(langPrefix)) &&
          !v.name.toLowerCase().includes("compact") &&
          !v.name.toLowerCase().includes("enhanced"),
      );
      if (nonCompactVoice) return nonCompactVoice;
    }

    return (
      this.voices.find((voice) => voice.lang === lang) ||
      this.voices.find((voice) => voice.lang?.startsWith(langPrefix)) ||
      this.voices.find((voice) => voice.default) ||
      this.voices[0] ||
      null
    );
  }

  speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("Speech synthesis not supported"));
        return;
      }

      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      const lang = options.lang || "en-US";
      const voice = this.findBestVoice(lang);

      if (voice) {
        utterance.voice = voice;
      }

      utterance.lang = lang;

      // Специальные настройки для iOS для более естественного звучания
      const isIOS =
        typeof window !== "undefined" &&
        /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        utterance.rate = options.rate || 0.7; // Медленнее на iOS
        utterance.pitch = options.pitch || 0.9; // Чуть ниже тон
        utterance.volume = options.volume || 0.9; // Чуть тише
      } else {
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) =>
        reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Функция для отладки - показывает доступные голоса
  logAvailableVoices() {
    console.log(
      "Available voices:",
      this.voices.map((v) => ({
        name: v.name,
        lang: v.lang,
        default: v.default,
        localService: v.localService,
      })),
    );
  }

  // Устанавливает предпочтительный голос
  setPreferredVoice(voiceName: string) {
    this.preferredVoiceName = voiceName;
  }

  // Получает текущий предпочтительный голос
  getPreferredVoice(): string | null {
    return this.preferredVoiceName;
  }
}

export const ttsService = new TextToSpeechService();

export const speakText = (
  text: string,
  options?: TTSOptions,
): Promise<void> => {
  return ttsService.speak(text, options);
};
