export interface TTSOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();

    if (this.voices.length === 0) {
      this.synthesis.addEventListener("voiceschanged", () => {
        this.voices = this.synthesis.getVoices();
      });
    }
  }

  private findBestVoice(lang: string): SpeechSynthesisVoice | null {
    const langPrefix = lang.split("-")[0] ?? lang;
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
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

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
}

export const ttsService = new TextToSpeechService();

export const speakText = (
  text: string,
  options?: TTSOptions,
): Promise<void> => {
  return ttsService.speak(text, options);
};
