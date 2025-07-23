export interface SpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isSupported = false;

  constructor() {
    this.checkSupport();
  }

  private checkSupport() {
    this.isSupported =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
  }

  get supported(): boolean {
    return this.isSupported;
  }

  private createRecognition(): SpeechRecognition | null {
    if (!this.isSupported) return null;

    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    return new SpeechRecognitionConstructor();
  }

  startListening(
    options: SpeechRecognitionOptions = {},
    onResult?: (result: SpeechRecognitionResult) => void,
  ): Promise<SpeechRecognitionResult> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error("Speech recognition not supported"));
        return;
      }

      this.recognition = this.createRecognition();
      if (!this.recognition) {
        reject(new Error("Failed to create speech recognition instance"));
        return;
      }

      this.recognition.lang = options.lang || "en-US";
      this.recognition.continuous = options.continuous || false;
      this.recognition.interimResults = options.interimResults || false;
      this.recognition.maxAlternatives = options.maxAlternatives || 1;

      let lastResult: SpeechRecognitionResult | null = null;

      this.recognition.onresult = (event) => {
        const lastEventResult = event.results[event.results.length - 1];
        if (!lastEventResult?.[0]) return;

        const transcript = lastEventResult[0].transcript.trim();
        const confidence = lastEventResult[0].confidence || 0;
        const isFinal = lastEventResult.isFinal;

        const result: SpeechRecognitionResult = {
          transcript,
          confidence,
          isFinal,
        };

        lastResult = result;

        // Вызываем callback для промежуточных результатов
        if (onResult) {
          onResult(result);
        }

        // Резолвим промис только для финальных результатов
        if (isFinal || !options.continuous) {
          resolve(result);
        }
      };

      this.recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        // Если есть последний результат и мы еще не резолвили промис
        if (lastResult && !lastResult.isFinal) {
          resolve(lastResult);
        }
        this.recognition = null;
      };

      try {
        this.recognition.start();
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }

  isListening(): boolean {
    return this.recognition !== null;
  }
}

export const speechRecognitionService = new SpeechRecognitionService();

export const startListening = (
  options?: SpeechRecognitionOptions,
  onResult?: (result: SpeechRecognitionResult) => void,
): Promise<SpeechRecognitionResult> => {
  return speechRecognitionService.startListening(options, onResult);
};

export const stopListening = (): void => {
  speechRecognitionService.stopListening();
};

export const isSpeechRecognitionSupported = (): boolean => {
  return speechRecognitionService.supported;
};
