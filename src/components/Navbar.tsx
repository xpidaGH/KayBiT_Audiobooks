import React from 'react';
import { Headphones, BookOpen, Download, Globe, Layers, Cpu, Database, Zap, HardDrive } from 'lucide-react';
import { CapstoneId } from '../types';

interface NavbarProps {
  activeView: 'home' | 'player' | CapstoneId | 'matrix';
  onSelectView: (view: 'home' | 'player' | CapstoneId | 'matrix') => void;
  onOpenUserGuide: () => void;
  onOpenInstallation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onSelectView,
  onOpenUserGuide,
  onOpenInstallation,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          onClick={() => onSelectView('home')}
          className="flex items-center gap-2.5 text-left group transition cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Headphones className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
              KayBiT<span className="text-amber-400 font-mono">_Audiobooks</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono block -mt-1 hidden sm:block">
              PDF Reader & Capstone Lab
            </span>
          </div>
        </button>

        {/* Capstone Switcher Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60 text-xs font-medium">
          {/* Audio Player & PDF Reader Tab */}
          <button
            onClick={() => onSelectView('player')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeView === 'player'
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold shadow'
                : 'text-amber-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" /> PDF Audiobook Player
          </button>

          <button
            onClick={() => onSelectView('home')}
            className={`px-2.5 py-1.5 rounded-lg transition ${
              activeView === 'home'
                ? 'bg-slate-800 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onSelectView('capstone-1')}
            className={`px-2 py-1.5 rounded-lg flex items-center gap-1 transition ${
              activeView === 'capstone-1'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3 h-3" /> 1. Streaming
          </button>
          <button
            onClick={() => onSelectView('capstone-2')}
            className={`px-2 py-1.5 rounded-lg flex items-center gap-1 transition ${
              activeView === 'capstone-2'
                ? 'bg-indigo-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3 h-3" /> 2. Concurrency
          </button>
          <button
            onClick={() => onSelectView('capstone-3')}
            className={`px-2 py-1.5 rounded-lg flex items-center gap-1 transition ${
              activeView === 'capstone-3'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3" /> 3. Pricing
          </button>
          <button
            onClick={() => onSelectView('capstone-4')}
            className={`px-2 py-1.5 rounded-lg flex items-center gap-1 transition ${
              activeView === 'capstone-4'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3 h-3" /> 4. Embedded
          </button>
          <button
            onClick={() => onSelectView('matrix')}
            className={`px-2 py-1.5 rounded-lg flex items-center gap-1 transition ${
              activeView === 'matrix'
                ? 'bg-slate-800 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" /> 20+ Langs
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* User Guide Button (Requested in Prompt) */}
          <button
            onClick={onOpenUserGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
            title="Open comprehensive User Guide in 22 languages with Text-to-Speech"
          >
            <BookOpen className="w-3.5 h-3.5 fill-current" />
            <span>User Guide</span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/20 text-slate-950 font-mono font-bold">
              22 Langs
            </span>
          </button>

          {/* Installation Button */}
          <button
            onClick={onOpenInstallation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition"
            title="Native packaging guide: Android APK, iOS, Windows, macOS"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Install Native</span>
          </button>
        </div>
      </div>
    </header>
  );
};
