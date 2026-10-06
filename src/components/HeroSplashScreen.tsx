import React from 'react';
import { BookOpen, Download, Play, Globe, Shield, Database, Zap, HardDrive, Terminal, CheckCircle2, Headphones, Cpu } from 'lucide-react';
import { CapstoneId, SupportedLanguageCode } from '../types';
import { USER_GUIDE_LANGUAGES } from '../data/userGuideTranslations';

interface HeroSplashScreenProps {
  onLaunchPlayer: () => void;
  onSelectCapstone: (id: CapstoneId) => void;
  onOpenUserGuide: (initialLang?: SupportedLanguageCode) => void;
  onOpenInstallation: () => void;
  onExploreMatrix: () => void;
}

export const HeroSplashScreen: React.FC<HeroSplashScreenProps> = ({
  onLaunchPlayer,
  onSelectCapstone,
  onOpenUserGuide,
  onOpenInstallation,
  onExploreMatrix,
}) => {
  return (
    <div className="space-y-12">
      {/* Splash Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            KayBiT_Audiobooks Curriculum & PDF Reader Engine
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Production-Grade Audio Streaming, PDF Audiobook Player & Lab
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
            Read and listen to uploaded/pasted PDFs with synchronized voice narration, adaptive bitrates, and ACID concurrency licensing across <strong>20+ programming languages</strong>.
          </p>

          {/* Core Action Callouts (INCLUDING PLAYER & USER GUIDE ON SPLASH SCREEN) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Primary Launch PDF Player Button */}
            <button
              onClick={onLaunchPlayer}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Headphones className="w-4 h-4" />
              <span>Launch PDF Audiobook Player</span>
            </button>

            {/* Primary User Guide Button (Explicitly Requested) */}
            <button
              onClick={() => onOpenUserGuide('en')}
              className="flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm shadow transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4 fill-current" />
              <span>User Guide (22 Languages + TTS)</span>
            </button>

            {/* Installation Download Button */}
            <button
              onClick={onOpenInstallation}
              className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 font-semibold text-xs sm:text-sm shadow transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Install (APK/AAB/PWA/EXE/DMG)</span>
            </button>
          </div>

          {/* Quick Language Badges Row */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Direct User Guide in your language:
            </span>
            {[
              { code: 'en', name: 'English' },
              { code: 'fr', name: 'Français' },
              { code: 'es', name: 'Español' },
              { code: 'de', name: 'Deutsch' },
              { code: 'zh', name: '中文' },
              { code: 'ja', name: '日本語' },
              { code: 'ar', name: 'العربية' },
              { code: 'hi', name: 'हिन्दी' },
              { code: 'ru', name: 'Русский' },
              { code: 'pt', name: 'Português' },
              { code: 'sw', name: 'Kiswahili' },
            ].map(lang => (
              <button
                key={lang.code}
                onClick={() => onOpenUserGuide(lang.code as SupportedLanguageCode)}
                className="px-2 py-1 rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 text-[11px] font-mono transition"
              >
                {lang.name}
              </button>
            ))}
            <span className="text-slate-500 font-mono text-[11px]">+ 11 more</span>
          </div>
        </div>
      </div>

      {/* 4 Capstone Interactive Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Four Core Capstone Systems Architectures
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Select an architecture to inspect technical blueprints, acceptance rubrics, and run the live lab simulator.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Capstone 1 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all shadow-xl flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Project 1: Streaming & Crypto
                </span>
                <span className="text-xs font-mono text-slate-500">Spotify & Libro.fm</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Micro-Streaming Architecture & DRM Engine
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Adaptive bitrate audio delivery (HLS/DASH) and automated AES-256 envelope packaging for DRM-free assets without buffering entire media files in memory.
              </p>
              <div className="pt-1 flex flex-wrap gap-1.5 font-mono text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">Python (FastAPI)</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">Rust (FFmpeg)</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">Bash / PowerShell</span>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">Web Audio + AES-CTR Sim</span>
              <button
                onClick={() => onSelectCapstone('capstone-1')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Launch Lab 1
              </button>
            </div>
          </div>

          {/* Capstone 2 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all shadow-xl flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Project 2: Concurrency & Ledger
                </span>
                <span className="text-xs font-mono text-slate-500">Libby & Hoopla</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                Distributed Concurrency & Inventory Ledger
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                ACID transactional synchronization across digital library checkouts with finite copies (3 licenses). Prevent double-booking under 200 concurrent user spikes.
              </p>
              <div className="pt-1 flex flex-wrap gap-1.5 font-mono text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">Java (Spring Boot)</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">C# (.NET Core)</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">Redis & PostgreSQL</span>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">Race Condition Testbench</span>
              <button
                onClick={() => onSelectCapstone('capstone-2')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Launch Lab 2
              </button>
            </div>
          </div>

          {/* Capstone 3 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-all shadow-xl flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Project 3: Big Data ETL & Pricing
                </span>
                <span className="text-xs font-mono text-slate-500">Chirp & Everand</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                Dynamic Bidding & Promotional Ingestion System
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Event-driven big-data ETL parsing multi-gigabyte ONIX 3.0 XML feeds with Dead-Letter Queues, econometric elasticity modeling (R/MATLAB), and sub-50ms cache purging.
              </p>
              <div className="pt-1 flex flex-wrap gap-1.5 font-mono text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">Python / Ruby / PHP</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">Go / Rust (Edge Pub/Sub)</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">R / MATLAB (Elasticity)</span>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">Stream Parser & Elasticity Calc</span>
              <button
                onClick={() => onSelectCapstone('capstone-3')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Launch Lab 3
              </button>
            </div>
          </div>

          {/* Capstone 4 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/50 transition-all shadow-xl flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Project 4: Embedded & Offline Engine
                </span>
                <span className="text-xs font-mono text-slate-500">LibriVox</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                Ultra-Low Overhead Offline Audio Player & Embedded Engine
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Systems-level engineering: custom C/C++ zero-copy LRU byte cache with CRC32 integrity verification and OS background audio bridges surviving process termination.
              </p>
              <div className="pt-1 flex flex-wrap gap-1.5 font-mono text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">C / C++ (mmap LRU)</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">Dart (Flutter) / Kotlin</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">Assembly / COBOL mapping</span>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">Memory Grid & CRC32 Bit-Rot</span>
              <button
                onClick={() => onSelectCapstone('capstone-4')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Launch Lab 4
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Summary / Matrix Quick Launch */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white">
            Comprehensive Cross-Language Architecture Specification
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Each student assignment includes Dockerized templates, benchmark harnesses, Prometheus metrics, and automated grading test suites.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenUserGuide('en')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
          >
            Read User Guide
          </button>
          <button
            onClick={onExploreMatrix}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition"
          >
            View Language Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
