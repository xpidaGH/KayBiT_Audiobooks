/**
 * Cross-browser native Text-to-Speech service using window.speechSynthesis
 * Handles voice matching across 22 languages, sentence chunking,
 * Chrome 15s freeze workarounds, and background audio keepalive.
 */

export interface TTSOptions {
  bcp47: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceURI?: string;
  onSentenceChange?: (index: number, text: string) => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private chunks: string[] = [];
  private currentChunkIndex = 0;
  private isSpeaking = false;
  private isPaused = false;
  private options: TTSOptions | null = null;
  private audioCtx: AudioContext | null = null;
  private keepAliveInterval: number | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.voices.length && this.synth) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  public getBestVoiceForLanguage(bcp47: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices.length) return null;

    const normalizedLang = bcp47.toLowerCase().replace('_', '-');
    const primaryCode = normalizedLang.split('-')[0];

    // 1. Exact match
    const exact = voices.find(v => v.lang.toLowerCase().replace('_', '-') === normalizedLang);
    if (exact) return exact;

    // 2. Primary code match
    const primary = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(primaryCode));
    if (primary) return primary;

    // 3. Fallback to default or first
    return voices.find(v => v.default) || voices[0] || null;
  }

  /**
   * Keep-alive for webviews and mobile browsers during speech synthesis
   */
  private startBackgroundAudioKeepAlive() {
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      // Periodic ping to prevent Chrome speechSynthesis silent stall
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
      }
      this.keepAliveInterval = window.setInterval(() => {
        if (this.synth && this.synth.speaking && !this.synth.paused) {
          this.synth.pause();
          this.synth.resume();
        }
      }, 10000);
    } catch {
      // AudioContext fallback ignored if blocked
    }
  }

  private stopBackgroundAudioKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  /**
   * Break long text into sentences < 160 characters to avoid browser speech timeout
   */
  private splitTextIntoChunks(text: string): string[] {
    const rawSentences = text
      .replace(/\r\n/g, '\n')
      .split(/([.!?。\n\r]+)/)
      .filter(s => s.trim().length > 0);

    const merged: string[] = [];
    let current = '';

    for (let i = 0; i < rawSentences.length; i++) {
      const part = rawSentences[i].trim();
      if (!part) continue;

      if ((current + ' ' + part).length > 140) {
        if (current) merged.push(current.trim());
        current = part;
      } else {
        current = current ? `${current} ${part}` : part;
      }
    }
    if (current.trim()) {
      merged.push(current.trim());
    }

    return merged.length ? merged : [text];
  }

  public speak(text: string, options: TTSOptions) {
    if (!this.synth) {
      if (options.onError) options.onError(new Error('SpeechSynthesis not supported on this browser'));
      return;
    }

    this.stop();
    this.options = options;
    this.chunks = this.splitTextIntoChunks(text);
    this.currentChunkIndex = 0;
    this.isSpeaking = true;
    this.isPaused = false;

    this.startBackgroundAudioKeepAlive();
    this.speakCurrentChunk();
  }

  private speakCurrentChunk() {
    if (!this.synth || !this.options || this.currentChunkIndex >= this.chunks.length) {
      this.finish();
      return;
    }

    const chunk = this.chunks[this.currentChunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunk);

    utterance.rate = this.options.rate ?? 1.0;
    utterance.pitch = this.options.pitch ?? 1.0;
    utterance.volume = this.options.volume ?? 1.0;

    let voice: SpeechSynthesisVoice | null = null;
    if (this.options.voiceURI) {
      voice = this.getVoices().find(v => v.voiceURI === this.options?.voiceURI) || null;
    }
    if (!voice) {
      voice = this.getBestVoiceForLanguage(this.options.bcp47);
    }
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = this.options.bcp47;
    }

    if (this.options.onSentenceChange) {
      this.options.onSentenceChange(this.currentChunkIndex, chunk);
    }

    utterance.onend = () => {
      if (!this.isSpeaking) return;
      this.currentChunkIndex++;
      if (this.currentChunkIndex < this.chunks.length) {
        this.speakCurrentChunk();
      } else {
        this.finish();
      }
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') {
        // intentional stop
        return;
      }
      if (this.options?.onError) {
        this.options.onError(e);
      }
      this.finish();
    };

    this.synth.speak(utterance);
  }

  public pause() {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentChunkIndex = 0;
    this.chunks = [];
    this.stopBackgroundAudioKeepAlive();
  }

  private finish() {
    this.isSpeaking = false;
    this.isPaused = false;
    this.stopBackgroundAudioKeepAlive();
    if (this.options?.onEnd) {
      this.options.onEnd();
    }
  }

  public getStatus() {
    return {
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
      currentChunkIndex: this.currentChunkIndex,
      totalChunks: this.chunks.length,
    };
  }
}

export const ttsService = new TTSService();
