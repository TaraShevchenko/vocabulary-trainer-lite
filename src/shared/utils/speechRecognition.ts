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
  private currentSessionId: string | null = null;

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

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

      // Останавливаем предыдущее распознавание если оно есть
      this.forceStop();

      // Создаем новую сессию
      const sessionId = this.generateSessionId();
      this.currentSessionId = sessionId;

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
      let hasResolved = false;

      this.recognition.onresult = (event) => {
        // Проверяем что это результат текущей сессии
        if (this.currentSessionId !== sessionId || hasResolved) {
          console.log("Ignoring stale speech recognition result");
          return;
        }

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
        if (onResult && this.currentSessionId === sessionId) {
          onResult(result);
        }

        // Резолвим промис только для финальных результатов
        if (isFinal || !options.continuous) {
          if (!hasResolved && this.currentSessionId === sessionId) {
            hasResolved = true;
            resolve(result);
          }
        }
      };

      this.recognition.onerror = (event) => {
        if (this.currentSessionId === sessionId && !hasResolved) {
          hasResolved = true;
          reject(new Error(`Speech recognition error: ${event.error}`));
        }
      };

      this.recognition.onend = () => {
        // Если это конец нашей сессии и мы еще не резолвили промис
        if (this.currentSessionId === sessionId) {
          if (lastResult && !lastResult.isFinal && !hasResolved) {
            hasResolved = true;
            resolve(lastResult);
          }

          // Очищаем ссылки только если это наша сессия
          if (this.currentSessionId === sessionId) {
            this.recognition = null;
            this.currentSessionId = null;
          }
        }
      };

      try {
        this.recognition.start();
      } catch (error) {
        if (!hasResolved) {
          hasResolved = true;
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }
    });
  }

  stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.warn("Error stopping speech recognition:", error);
      }
    }
  }

  // Принудительная остановка с очисткой состояния
  forceStop(): void {
    if (this.recognition) {
      try {
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.stop();
      } catch (error) {
        console.warn("Error force stopping speech recognition:", error);
      } finally {
        this.recognition = null;
        this.currentSessionId = null;
      }
    }
  }

  isListening(): boolean {
    return this.recognition !== null && this.currentSessionId !== null;
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

export const forceStopListening = (): void => {
  speechRecognitionService.forceStop();
};

export const isSpeechRecognitionSupported = (): boolean => {
  return speechRecognitionService.supported;
};
