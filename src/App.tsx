/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSplashScreen } from './components/HeroSplashScreen';
import { CapstoneDetail } from './components/CapstoneDetail';
import { TechnologyMatrix } from './components/TechnologyMatrix';
import { UserGuideModal } from './components/UserGuideModal';
import { InstallationModal } from './components/InstallationModal';
import { ThemeSettingsModal } from './components/ThemeSettingsModal';
import { BrandAssetModal } from './components/brand/BrandAssetModal';
import { AudiobookReader } from './components/player/AudiobookReader';
import { CAPSTONE_PROJECTS } from './data/capstonesData';
import { INITIAL_AUDIOBOOKS } from './data/sampleBooks';
import { AudiobookBook, CapstoneId, SupportedLanguageCode } from './types';
import { ThemeId, getStoredTheme, applyTheme } from './types/theme';
import { BookOpen, Download, ArrowLeft, Headphones, Palette, Shield } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'player' | CapstoneId | 'matrix'>('player');
  const [audiobooks, setAudiobooks] = useState<AudiobookBook[]>(INITIAL_AUDIOBOOKS);
  const [currentBookId, setCurrentBookId] = useState<string>(INITIAL_AUDIOBOOKS[0].id);

  // Modals & Navigation state
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [userGuideLang, setUserGuideLang] = useState<SupportedLanguageCode>('en');
  const [isInstallationOpen, setIsInstallationOpen] = useState(false);
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);
  const [isBrandAssetModalOpen, setIsBrandAssetModalOpen] = useState(false);

  // Theme state (5 distinct themes stored in localStorage)
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const currentBook = audiobooks.find(b => b.id === currentBookId) || audiobooks[0];
  const selectedCapstoneProject = CAPSTONE_PROJECTS.find(p => p.id === activeView);

  const handleOpenUserGuide = (lang: SupportedLanguageCode = 'en') => {
    setUserGuideLang(lang);
    setIsUserGuideOpen(true);
  };

  const handleUpdateBook = (updated: AudiobookBook) => {
    setAudiobooks(prev => prev.map(b => (b.id === updated.id ? updated : b)));
  };

  const handleAddNewBook = (newBook: AudiobookBook) => {
    setAudiobooks(prev => [newBook, ...prev]);
    setCurrentBookId(newBook.id);
    setActiveView('player');
  };

  const handleThemeChange = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 theme-root-container transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        activeView={activeView}
        onSelectView={view => setActiveView(view)}
        onOpenUserGuide={() => handleOpenUserGuide('en')}
        onOpenInstallation={() => setIsInstallationOpen(true)}
        onOpenThemeSettings={() => setIsThemeSettingsOpen(true)}
        onOpenBrandAssets={() => setIsBrandAssetModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Sub-header status & navigation breadcrumb */}
        {activeView !== 'home' && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('home')}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-amber-400 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
              <span className="text-slate-700">/</span>
              <span className="text-xs font-mono text-slate-200 font-semibold">
                {activeView === 'player'
                  ? 'PDF Audiobook Reader & Player'
                  : activeView === 'matrix'
                  ? '20+ Language Matrix'
                  : selectedCapstoneProject?.title || activeView}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {activeView !== 'player' && (
                <button
                  onClick={() => setActiveView('player')}
                  className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono flex items-center gap-1.5 transition"
                >
                  <Headphones className="w-3.5 h-3.5" /> Open Player
                </button>
              )}
              <button
                onClick={() => setIsThemeSettingsOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition"
                title="Theme Settings"
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" /> Theme
              </button>
              <button
                onClick={() => handleOpenUserGuide('en')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" /> User Guide
              </button>
              <button
                onClick={() => setIsInstallationOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" /> Native App
              </button>
            </div>
          </div>
        )}

        {/* View Routing */}
        {activeView === 'player' && (
          <AudiobookReader
            currentBook={currentBook}
            onUpdateBook={handleUpdateBook}
            onAddNewBook={handleAddNewBook}
            onSelectBook={id => setCurrentBookId(id)}
            allBooks={audiobooks}
          />
        )}

        {activeView === 'home' && (
          <HeroSplashScreen
            onLaunchPlayer={() => setActiveView('player')}
            onSelectCapstone={id => setActiveView(id)}
            onOpenUserGuide={lang => handleOpenUserGuide(lang)}
            onOpenInstallation={() => setIsInstallationOpen(true)}
            onExploreMatrix={() => setActiveView('matrix')}
            onOpenThemeSettings={() => setIsThemeSettingsOpen(true)}
            onOpenBrandAssets={() => setIsBrandAssetModalOpen(true)}
          />
        )}

        {selectedCapstoneProject && (
          <CapstoneDetail project={selectedCapstoneProject} />
        )}

        {activeView === 'matrix' && (
          <TechnologyMatrix />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-white font-semibold">KayBiT_Audiobooks</span>
            <span>•</span>
            <span>Unified PDF Audiobook Player & 4-Capstone Systems Engineering</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <button
              onClick={() => setIsThemeSettingsOpen(true)}
              className="hover:text-amber-400 transition"
            >
              Theme Settings ({currentTheme})
            </button>
            <span>•</span>
            <button
              onClick={() => setIsBrandAssetModalOpen(true)}
              className="hover:text-lime-400 transition"
            >
              Brand Icons Hub
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenUserGuide('en')}
              className="hover:text-amber-400 transition"
            >
              USER_GUIDE.md (22 Languages)
            </button>
            <span>•</span>
            <button
              onClick={() => setIsInstallationOpen(true)}
              className="hover:text-cyan-400 transition"
            >
              INSTALLATION.md
            </button>
            <span>•</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition"
            >
              GitHub_Actions.md
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ThemeSettingsModal
        isOpen={isThemeSettingsOpen}
        currentTheme={currentTheme}
        onClose={() => setIsThemeSettingsOpen(false)}
        onThemeSelect={handleThemeChange}
      />

      <BrandAssetModal
        isOpen={isBrandAssetModalOpen}
        onClose={() => setIsBrandAssetModalOpen(false)}
      />

      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        defaultLang={userGuideLang}
      />

      <InstallationModal
        isOpen={isInstallationOpen}
        onClose={() => setIsInstallationOpen(false)}
      />
    </div>
  );
}
