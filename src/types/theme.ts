export type ThemeId = 'editorial' | 'technical' | 'warm' | 'elegant_dark' | 'vibrant';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  category: string;
  tagline: string;
  description: string;
  fontBadge: string;
  previewColors: {
    bg: string;
    surface: string;
    border: string;
    accent: string;
    text: string;
  };
  attributes: string[];
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'editorial',
    name: 'Editorial & Refined',
    category: 'Print & Publication',
    tagline: 'Serif fonts, generous whitespace, clean light background',
    description: 'Inspired by literary journals, prestige publishing, and clean morning paper typography. Pairs rich book ink with warm alabaster paper tones.',
    fontBadge: 'Lora (Serif)',
    previewColors: {
      bg: '#f7f4ed',
      surface: '#ffffff',
      border: '#ded7cb',
      accent: '#9a3412',
      text: '#1c1917',
    },
    attributes: ['Serif Typography', 'Light Paper Surface', 'Terracotta Accents', 'Generous Leading']
  },
  {
    id: 'technical',
    name: 'Technical & Systematic',
    category: 'Developer & Systems',
    tagline: 'Monospace fonts, high-density, visible grid borders',
    description: 'A developer terminal aesthetic engineered for systems engineers, low-latency tracers, and database administrators. Compact data density and matrix green accents.',
    fontBadge: 'JetBrains Mono (Monospace)',
    previewColors: {
      bg: '#0a0d14',
      surface: '#101622',
      border: '#1f2b3e',
      accent: '#22c55e',
      text: '#e2e8f0',
    },
    attributes: ['Strict Grid Borders', 'High Density UI', 'Matrix Green Glow', 'Full Monospace']
  },
  {
    id: 'warm',
    name: 'Warm & Approachable',
    category: 'Friendly & Welcoming',
    tagline: 'Pastel cards, rounded pill buttons, soft corners',
    description: 'Soft cream cards, rounded pill buttons, and friendly apricot tones designed for relaxed long-session listening and comfortable reading.',
    fontBadge: 'Plus Jakarta Sans',
    previewColors: {
      bg: '#fff7ed',
      surface: '#ffffff',
      border: '#fed7aa',
      accent: '#f97316',
      text: '#431407',
    },
    attributes: ['Pill Buttons', 'Soft Peach & Cream', 'Rounded 24px Cards', 'Comfortable Contrast']
  },
  {
    id: 'elegant_dark',
    name: 'Elegant Dark',
    category: 'Default Studio Theme',
    tagline: 'Sleek dark mode with tailored high-contrast accents',
    description: 'Deep obsidian backdrop with tailored amber and cyan highlights. Designed for late-night coding sessions and immersive audio-visual monitoring.',
    fontBadge: 'Plus Jakarta Sans & Mono',
    previewColors: {
      bg: '#020617',
      surface: '#0f172a',
      border: '#1e293b',
      accent: '#f59e0b',
      text: '#f8fafc',
    },
    attributes: ['Obsidian 950 Base', 'Amber Electric Accents', 'Crisp Border Highlights', 'Balanced Readability']
  },
  {
    id: 'vibrant',
    name: 'Vibrant Palette',
    category: 'Cyberpunk & Modernist',
    tagline: 'High-energy, bold color schemes',
    description: 'Electric violet base paired with radiant cyan and neon magenta accents. A punchy modern design language that commands attention.',
    fontBadge: 'Space Grotesk',
    previewColors: {
      bg: '#0f0728',
      surface: '#1e0f45',
      border: '#4c1d95',
      accent: '#06b6d4',
      text: '#faf5ff',
    },
    attributes: ['Deep Cyber Violet', 'Electric Cyan Accents', 'High Dynamic Contrast', 'Futuristic Grotesk']
  }
];

export const THEME_STORAGE_KEY = 'kaybit_theme_preference';

export function applyTheme(themeId: ThemeId) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', themeId);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch {
      // localStorage may fail in restricted environments
    }
  }
}

export function getStoredTheme(): ThemeId {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
      if (stored && THEME_OPTIONS.some(t => t.id === stored)) {
        return stored;
      }
    } catch {}
  }
  return 'elegant_dark';
}
