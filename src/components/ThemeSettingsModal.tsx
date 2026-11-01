import React from 'react';
import { X, Check, Palette, Sparkles, Feather, Terminal, Heart, Moon, Zap } from 'lucide-react';
import { ThemeId, THEME_OPTIONS, applyTheme } from '../types/theme';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  currentTheme: ThemeId;
  onClose: () => void;
  onThemeSelect: (themeId: ThemeId) => void;
}

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  currentTheme,
  onClose,
  onThemeSelect,
}) => {
  if (!isOpen) return null;

  const getThemeIcon = (id: ThemeId) => {
    switch (id) {
      case 'editorial':
        return Feather;
      case 'technical':
        return Terminal;
      case 'warm':
        return Heart;
      case 'elegant_dark':
        return Moon;
      case 'vibrant':
        return Zap;
    }
  };

  const handleSelect = (themeId: ThemeId) => {
    applyTheme(themeId);
    onThemeSelect(themeId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="theme-modal-title" className="text-lg font-bold text-white">
                  Theme Settings & Aesthetics
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  5 Variations
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Select your preferred interface styling. Changes apply instantly and persist across sessions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            aria-label="Close Theme Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Cards Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {THEME_OPTIONS.map(theme => {
              const Icon = getThemeIcon(theme.id);
              const isSelected = currentTheme === theme.id;

              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelect(theme.id)}
                  className={`group relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-slate-800/80 ring-2 ring-amber-500/40 shadow-lg'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{
                            backgroundColor: theme.previewColors.bg,
                            color: theme.previewColors.accent,
                            border: `1px solid ${theme.previewColors.border}`,
                          }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                            {theme.name}
                          </h3>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            {theme.category}
                          </span>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 group-hover:border-slate-700">
                          Select
                        </span>
                      )}
                    </div>

                    {/* Tagline */}
                    <p className="text-xs text-amber-300/90 font-medium mb-1.5 leading-snug">
                      {theme.tagline}
                    </p>

                    {/* Description */}
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      {theme.description}
                    </p>

                    {/* Attribute badges */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {theme.attributes.map(attr => (
                        <span
                          key={attr}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-slate-400"
                        >
                          {attr}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Swatch & Font preview bar */}
                  <div
                    className="p-2.5 rounded-xl border flex items-center justify-between text-xs"
                    style={{
                      backgroundColor: theme.previewColors.bg,
                      borderColor: theme.previewColors.border,
                      color: theme.previewColors.text,
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: theme.previewColors.accent }}
                        title="Accent Color"
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: theme.previewColors.surface, border: `1px solid ${theme.previewColors.border}` }}
                        title="Surface Color"
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: theme.previewColors.border }}
                        title="Border Color"
                      />
                    </div>
                    <span className="text-[10px] font-bold tracking-tight opacity-90">
                      {theme.fontBadge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Active theme persists in browser localStorage</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
