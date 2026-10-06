import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, Square, SkipBack, SkipForward, Volume2, Upload, FileText,
  Bookmark, CheckCircle2, Shield, HardDrive, Database, Zap, Sparkles,
  ChevronLeft, ChevronRight, Moon, Sun, Type, RefreshCw, AlertCircle, Eye
} from 'lucide-react';
import { AudiobookBook } from '../../types';
import { pdfService } from '../../services/pdfService';
import { ttsService } from '../../services/ttsService';

interface AudiobookReaderProps {
  currentBook: AudiobookBook;
  onUpdateBook: (updated: AudiobookBook) => void;
  onAddNewBook: (newBook: AudiobookBook) => void;
  onSelectBook: (bookId: string) => void;
  allBooks: AudiobookBook[];
}

export const AudiobookReader: React.FC<AudiobookReaderProps> = ({
  currentBook,
  onUpdateBook,
  onAddNewBook,
  onSelectBook,
  allBooks,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSentence, setActiveSentence] = useState('');
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);

  // Playback parameters
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Reader styling
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [readingTheme, setReadingTheme] = useState<'dark' | 'sepia' | 'black'>('dark');

  // Upload & Paste Modal / Drawer state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Buffer gauge & Streaming simulation
  const [bufferGauge, setBufferGauge] = useState(65);
  const [activeBitrate, setActiveBitrate] = useState<64 | 128 | 320>(currentBook.bitrateKbps || 128);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load available system voices
  useEffect(() => {
    const updateVoices = () => {
      const voices = ttsService.getVoices();
      setAvailableVoices(voices);
      if (!selectedVoiceURI && voices.length > 0) {
        const best = ttsService.getBestVoiceForLanguage('en-US');
        if (best) setSelectedVoiceURI(best.voiceURI);
      }
    };
    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoiceURI]);

  // Reset page index if book changes
  useEffect(() => {
    setCurrentPageIndex(0);
    handleStop();
    setActiveBitrate(currentBook.bitrateKbps || 128);
  }, [currentBook.id]);

  const currentPageText = currentBook.pages[currentPageIndex] || currentBook.pages[0] || 'No content found.';

  // Break current page into sentences for granular highlighting
  const sentences = React.useMemo(() => {
    return currentPageText
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim().length > 0);
  }, [currentPageText]);

  // Handle Playback
  const handlePlay = (fromSentenceIndex = 0) => {
    if (isPaused) {
      ttsService.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    const textToRead = sentences.slice(fromSentenceIndex).join(' ');
    if (!textToRead.trim()) return;

    setIsPlaying(true);
    setIsPaused(false);
    setActiveSentenceIndex(fromSentenceIndex);
    setActiveSentence(sentences[fromSentenceIndex] || '');

    ttsService.speak(textToRead, {
      bcp47: 'en-US',
      rate: speed,
      pitch: pitch,
      voiceURI: selectedVoiceURI,
      onSentenceChange: (idx, sentenceText) => {
        const actualIndex = fromSentenceIndex + idx;
        setActiveSentenceIndex(actualIndex);
        setActiveSentence(sentenceText);
      },
      onEnd: () => {
        // If there are more pages, auto-advance to next page!
        if (currentPageIndex < currentBook.pages.length - 1) {
          setCurrentPageIndex(p => p + 1);
          setTimeout(() => {
            handlePlay(0);
          }, 600);
        } else {
          handleStop();
        }
      },
      onError: () => {
        handleStop();
      }
    });
  };

  const handlePause = () => {
    ttsService.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    ttsService.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setActiveSentence('');
    setActiveSentenceIndex(null);
  };

  const handleNextPage = () => {
    if (currentPageIndex < currentBook.pages.length - 1) {
      handleStop();
      setCurrentPageIndex(p => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      handleStop();
      setCurrentPageIndex(p => p - 1);
    }
  };

  // Upload PDF Handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    setUploadError(null);

    try {
      const parsed = await pdfService.parseFile(file);
      if (parsed.pages.length === 0 || !parsed.pages[0].trim()) {
        throw new Error('Could not extract legible text from this file.');
      }

      const newAudiobook: AudiobookBook = {
        id: `uploaded-${Date.now()}`,
        title: parsed.title,
        author: file.name.endsWith('.pdf') ? 'Extracted from PDF' : 'Uploaded Text File',
        narrator: 'Native System Vocalizer',
        coverGradient: 'from-amber-600 to-rose-900',
        sourceType: 'uploaded-pdf',
        pages: parsed.pages,
        totalWords: parsed.totalWords,
        durationMinutes: parsed.estimatedDurationMinutes,
        genre: 'User Uploaded Document',
        totalLicenses: 1,
        availableCopies: 1,
        isBorrowedByMe: true,
        isDrmEncrypted: true,
        aesKeyFingerprint: `SHA256:usr${Math.floor(Math.random() * 99999)}...`,
        ivHex: `0x${Math.floor(Math.random() * 0xFFFFFFFFFF).toString(16).toUpperCase()}`,
        bitrateKbps: 128,
        price: 0.00,
        originalPrice: 0.00,
        discountPercentage: 0,
        isCachedOffline: true,
        crc32Checksum: `0x${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase()}`,
        lruSlotIndex: 3
      };

      onAddNewBook(newAudiobook);
      setIsUploadOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setUploadError(err.message || 'Failed to parse document.');
    } finally {
      setIsParsingFile(false);
    }
  };

  // Pasted Text Handler
  const handlePastingSubmit = () => {
    if (!pastedText.trim()) return;

    const parsed = pdfService.parseRawText(pastedText, pastedTitle || 'Pasted Audiobook Document');

    const newAudiobook: AudiobookBook = {
      id: `pasted-${Date.now()}`,
      title: parsed.title,
      author: 'Pasted Document',
      narrator: 'Native System Vocalizer',
      coverGradient: 'from-indigo-600 to-cyan-900',
      sourceType: 'pasted-text',
      pages: parsed.pages,
      totalWords: parsed.totalWords,
      durationMinutes: parsed.estimatedDurationMinutes,
      genre: 'Pasted Text / Lecture Notes',
      totalLicenses: 1,
      availableCopies: 1,
      isBorrowedByMe: true,
      isDrmEncrypted: false,
      aesKeyFingerprint: 'Unencrypted User Text',
      ivHex: '0x0000000000000000',
      bitrateKbps: 128,
      price: 0.00,
      originalPrice: 0.00,
      discountPercentage: 0,
      isCachedOffline: true,
      crc32Checksum: `0x${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase()}`,
      lruSlotIndex: 2
    };

    onAddNewBook(newAudiobook);
    setPastedText('');
    setPastedTitle('');
    setIsPasting(false);
    setIsUploadOpen(false);
  };

  // Toggle offline cache (Capstone 4 simulation)
  const toggleOfflineCache = () => {
    const updated = {
      ...currentBook,
      isCachedOffline: !currentBook.isCachedOffline,
      lruSlotIndex: !currentBook.isCachedOffline ? 4 : undefined
    };
    onUpdateBook(updated);
  };

  // Toggle library loan (Capstone 2 concurrency simulation)
  const toggleBorrowLoan = () => {
    if (currentBook.isBorrowedByMe) {
      // Return book
      const updated: AudiobookBook = {
        ...currentBook,
        isBorrowedByMe: false,
        availableCopies: currentBook.availableCopies + 1
      };
      onUpdateBook(updated);
    } else {
      // Borrow book
      if (currentBook.availableCopies > 0) {
        const updated: AudiobookBook = {
          ...currentBook,
          isBorrowedByMe: true,
          availableCopies: currentBook.availableCopies - 1
        };
        onUpdateBook(updated);
      }
    }
  };

  const themeStyles = {
    dark: 'bg-slate-900/90 text-slate-100 border-slate-800',
    sepia: 'bg-[#fbf0d9] text-[#433422] border-[#e7d7be]',
    black: 'bg-black text-slate-300 border-neutral-900'
  };

  const fontSizes = {
    sm: 'text-xs sm:text-sm',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
    xl: 'text-lg sm:text-xl'
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Book Switcher Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Book Selector Dropdown */}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-14 rounded-xl bg-gradient-to-br ${currentBook.coverGradient} p-0.5 shadow-md flex items-center justify-center shrink-0`}>
            <div className="w-full h-full bg-slate-950/40 rounded-[10px] flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={currentBook.id}
                onChange={e => onSelectBook(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white font-bold text-sm sm:text-base rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-500 max-w-xs sm:max-w-md truncate"
              >
                {allBooks.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.author})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentBook.author} • Narrated by {currentBook.narrator} • ~{currentBook.durationMinutes} min listen
            </p>
          </div>
        </div>

        {/* Action Buttons: Upload PDF / Paste Text */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02]"
            title="Upload a PDF or paste text to convert into an audio-guided reading"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF / Paste Text</span>
          </button>

          {/* Offline Cache Status (Capstone 4) */}
          <button
            onClick={toggleOfflineCache}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
              currentBook.isCachedOffline
                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle binary LRU cache (Capstone 4)"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>{currentBook.isCachedOffline ? 'Cached Offline' : 'Save Offline'}</span>
          </button>

          {/* Borrow / Return License (Capstone 2) */}
          <button
            onClick={toggleBorrowLoan}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
              currentBook.isBorrowedByMe
                ? 'bg-indigo-950/50 border-indigo-500/50 text-indigo-300'
                : currentBook.availableCopies > 0
                ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-slate-950 border-rose-900 text-rose-400'
            }`}
            title="Borrow digital copy with ACID concurrency lock (Capstone 2)"
          >
            <Database className="w-3.5 h-3.5" />
            <span>
              {currentBook.isBorrowedByMe
                ? 'Borrowed (Return)'
                : currentBook.availableCopies > 0
                ? `Borrow (${currentBook.availableCopies}/${currentBook.totalLicenses} left)`
                : 'Join Waitlist (0 left)'}
            </span>
          </button>
        </div>
      </div>

      {/* Reader Layout Grid: Main Text Window + Architectural Status Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Document & Synchronized Audio Reader (3 Columns) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Reader Appearance Toolbar */}
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 px-4 py-2.5 rounded-xl text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-300">
                Page {currentPageIndex + 1} of {currentBook.pages.length}
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono">{currentBook.totalWords} words total</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setReadingTheme('dark')}
                  className={`px-2 py-0.5 rounded text-[11px] transition ${readingTheme === 'dark' ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-white'}`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setReadingTheme('sepia')}
                  className={`px-2 py-0.5 rounded text-[11px] transition ${readingTheme === 'sepia' ? 'bg-[#e7d7be] text-[#433422] font-bold' : 'text-slate-500 hover:text-white'}`}
                >
                  Sepia
                </button>
                <button
                  onClick={() => setReadingTheme('black')}
                  className={`px-2 py-0.5 rounded text-[11px] transition ${readingTheme === 'black' ? 'bg-neutral-800 text-white font-bold' : 'text-slate-500 hover:text-white'}`}
                >
                  OLED
                </button>
              </div>

              {/* Font size */}
              <div className="flex items-center gap-1 font-mono">
                <span className="text-[11px]">Size:</span>
                {(['sm', 'base', 'lg'] as const).map(sz => (
                  <button
                    key={sz}
                    onClick={() => setFontSize(sz)}
                    className={`px-1.5 py-0.5 rounded text-[11px] uppercase ${fontSize === sz ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-500'}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Synchronized Reading Surface */}
          <div className={`p-6 sm:p-8 rounded-2xl border shadow-xl min-h-[380px] leading-relaxed transition-colors ${themeStyles[readingTheme]}`}>
            <div className={`${fontSizes[fontSize]} space-y-3 font-serif`}>
              {sentences.map((sentence, idx) => {
                const isCurrent = isPlaying && activeSentenceIndex === idx;
                return (
                  <span
                    key={idx}
                    onClick={() => handlePlay(idx)}
                    className={`cursor-pointer transition-all rounded px-1 py-0.5 inline-block mr-1 ${
                      isCurrent
                        ? 'bg-amber-500/30 text-amber-300 font-medium underline decoration-amber-400 underline-offset-4 ring-2 ring-amber-400/40'
                        : 'hover:bg-slate-800/40 hover:text-amber-200'
                    }`}
                    title="Click sentence to start listening from here"
                  >
                    {sentence}{' '}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Page Navigation Controls */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPageIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Page
            </button>

            <span>
              Page {currentPageIndex + 1} / {currentBook.pages.length}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPageIndex >= currentBook.pages.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next Page <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Audio Player Controller Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Play / Pause / Stop Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePlay(0)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-slate-950 transition-all shadow-lg hover:scale-105 ${
                    isPlaying
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300'
                  }`}
                  title={isPlaying ? 'Pause' : 'Play Narration'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  )}
                </button>

                {(isPlaying || isPaused) && (
                  <button
                    onClick={handleStop}
                    className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    title="Stop Playback"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {isPlaying ? 'Narration Active' : isPaused ? 'Narration Paused' : 'Ready to Stream'}
                    </span>
                    {isPlaying && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Speaking
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    {activeSentence ? `"${activeSentence.slice(0, 50)}..."` : 'Tap Play or click any sentence to listen'}
                  </p>
                </div>
              </div>

              {/* Speed & Voice modulation controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Speed buttons */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                  <span className="px-2 text-slate-500 text-[11px]">Speed:</span>
                  {[0.75, 1.0, 1.25, 1.5, 2.0].map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        setSpeed(s);
                        if (isPlaying) {
                          handleStop();
                          setTimeout(() => handlePlay(activeSentenceIndex || 0), 100);
                        }
                      }}
                      className={`px-2 py-1 rounded-lg transition ${
                        speed === s ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                {/* Voice selector */}
                {availableVoices.length > 0 && (
                  <select
                    value={selectedVoiceURI}
                    onChange={e => {
                      setSelectedVoiceURI(e.target.value);
                      if (isPlaying) {
                        handleStop();
                        setTimeout(() => handlePlay(activeSentenceIndex || 0), 100);
                      }
                    }}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-2.5 py-2 font-mono focus:outline-none focus:border-amber-500 max-w-[160px] truncate"
                  >
                    {availableVoices.map(v => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Unified Capstone Architecture Monitor (1 Column) */}
        <div className="space-y-4">
          {/* Capstone 1: Micro-Streaming & DRM Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Capstone 1: DRM & Stream
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/20">
                AES-256
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Bitrate Target:</span>
                <div className="flex gap-1">
                  {([64, 128, 320] as const).map(b => (
                    <button
                      key={b}
                      onClick={() => setActiveBitrate(b)}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        activeBitrate === b ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-500'
                      }`}
                    >
                      {b}k
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Memory Buffer:</span>
                <span className="text-emerald-400 font-bold">{isPlaying ? '64 KB (O(1))' : 'Idle'}</span>
              </div>

              <div className="flex justify-between text-slate-400 truncate">
                <span>IV:</span>
                <span className="text-slate-300 text-[10px] truncate">{currentBook.ivHex}</span>
              </div>
            </div>
          </div>

          {/* Capstone 2: Distributed Concurrency Ledger Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                Capstone 2: Concurrency
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-500/20">
                ACID Ledger
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Library Stock:</span>
                <span className="text-white font-bold">{currentBook.availableCopies} of {currentBook.totalLicenses} copies</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Patron Status:</span>
                <span className={currentBook.isBorrowedByMe ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {currentBook.isBorrowedByMe ? 'Active Loan (14d)' : 'Available'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Lock Mode:</span>
                <span className="text-cyan-400 text-[10px]">FOR UPDATE</span>
              </div>
            </div>
          </div>

          {/* Capstone 3: Dynamic Pricing & Catalog Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Capstone 3: Pricing & ETL
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/20">
                ONIX 3.0
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Promotional Price:</span>
                <span className="text-emerald-400 font-bold">${currentBook.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Original Price:</span>
                <span className="line-through text-slate-600">${currentBook.originalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Flash Discount:</span>
                <span className="text-amber-400 font-bold">{currentBook.discountPercentage}% OFF</span>
              </div>
            </div>
          </div>

          {/* Capstone 4: Embedded Binary LRU Cache */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                Capstone 4: Embedded LRU
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/20">
                POSIX C
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Offline Status:</span>
                <span className={currentBook.isCachedOffline ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {currentBook.isCachedOffline ? 'Cached in Slot' : 'Not Cached'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>CRC32 Checksum:</span>
                <span className="text-slate-300 text-[10px]">{currentBook.crc32Checksum}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload PDF / Paste Text Modal Dialog */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Import PDF or Paste Document Text</h3>
                  <p className="text-xs text-slate-400">Instantly convert any PDF file or text snippet into a narrated audiobook</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Upload Method Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
              <button
                onClick={() => setIsPasting(false)}
                className={`px-3 py-1.5 rounded-lg transition ${!isPasting ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Upload .PDF / .TXT File
              </button>
              <button
                onClick={() => setIsPasting(true)}
                className={`px-3 py-1.5 rounded-lg transition ${isPasting ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Paste Text / Clipboard
              </button>
            </div>

            {!isPasting ? (
              /* PDF File Upload Dropzone */
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-950/50 flex flex-col items-center justify-center gap-2"
                >
                  <FileText className="w-10 h-10 text-amber-400 animate-bounce" />
                  <span className="font-bold text-white text-sm">
                    {isParsingFile ? 'Parsing PDF Text Streams...' : 'Click or Drag PDF File Here'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Supports .pdf, .txt, .md. Client-side extraction ensures complete privacy.
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md,text/plain,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              /* Paste Text Box */
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 font-mono block mb-1">Book / Document Title (Optional):</label>
                  <input
                    type="text"
                    value={pastedTitle}
                    onChange={e => setPastedTitle(e.target.value)}
                    placeholder="e.g. Chapter 4: Distributed Consensus"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-mono block mb-1">Paste PDF Text / Document Body:</label>
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    placeholder="Paste text directly from your PDF reader, ebook, or lecture notes here..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-serif leading-relaxed"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePastingSubmit}
                    disabled={!pastedText.trim()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow transition"
                  >
                    Convert & Start Listening
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
