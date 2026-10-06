export type CapstoneId = 'capstone-1' | 'capstone-2' | 'capstone-3' | 'capstone-4';

export interface CapstoneProject {
  id: CapstoneId;
  title: string;
  subtitle: string;
  inspiration: string;
  badge: string;
  coreChallenge: string;
  architectureDiagramAscii: string;
  primaryLanguages: string[];
  systemLayer: string;
  assignments: {
    title: string;
    languages: string;
    challenge: string;
    requirements: string[];
    starterCodeKey: string;
  }[];
  codeBlueprints: {
    [language: string]: {
      filename: string;
      code: string;
      explanation: string;
    };
  };
  keyTakeaways: string[];
}

export type SupportedLanguageCode =
  | 'en'
  | 'fr'
  | 'de'
  | 'it'
  | 'es'
  | 'pt'
  | 'id'
  | 'sw'
  | 'tr'
  | 'ru'
  | 'zh'
  | 'ja'
  | 'ar'
  | 'ur'
  | 'hi'
  | 'vi'
  | 'ko'
  | 'fa'
  | 'mr'
  | 'bn'
  | 'ta'
  | 'te';

export interface UserGuideLanguage {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  bcp47: string;
  flag: string;
  rtl?: boolean;
  content: {
    title: string;
    subtitle: string;
    intro: string;
    project1Title: string;
    project1Desc: string;
    project2Title: string;
    project2Desc: string;
    project3Title: string;
    project3Desc: string;
    project4Title: string;
    project4Desc: string;
    techMatrixTitle: string;
    techMatrixDesc: string;
    simulatorsTitle: string;
    simulatorsDesc: string;
    ttsTitle: string;
    ttsDesc: string;
    submissionTitle: string;
    submissionDesc: string;
  };
}

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  currentSentenceIndex: number;
  totalSentences: number;
  rate: number;
  pitch: number;
  selectedVoice: SpeechSynthesisVoice | null;
  availableVoices: SpeechSynthesisVoice[];
}

export interface AudiobookBook {
  id: string;
  title: string;
  author: string;
  narrator: string;
  coverGradient: string;
  sourceType: 'uploaded-pdf' | 'pasted-text' | 'public-domain' | 'catalog';
  pages: string[];
  totalWords: number;
  durationMinutes: number;
  genre: string;
  // Capstone 2 concurrency ledger attributes
  totalLicenses: number;
  availableCopies: number;
  isBorrowedByMe: boolean;
  waitlistPosition?: number;
  // Capstone 1 DRM attributes
  isDrmEncrypted: boolean;
  aesKeyFingerprint: string;
  ivHex: string;
  bitrateKbps: 64 | 128 | 320;
  // Capstone 3 Dynamic Pricing attributes
  price: number;
  originalPrice: number;
  discountPercentage: number;
  // Capstone 4 Embedded Offline Cache attributes
  isCachedOffline: boolean;
  crc32Checksum: string;
  lruSlotIndex?: number;
}

