import React, { useState, useEffect, useMemo } from 'react';
import { X, Globe, Volume2, Pause, Play, Square, Download, Copy, Check, ChevronDown, Sparkles } from 'lucide-react';
import { USER_GUIDE_LANGUAGES } from '../data/userGuideTranslations';
import { SupportedLanguageCode, UserGuideLanguage } from '../types';
import { ttsService } from '../services/ttsService';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLang?: SupportedLanguageCode;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  defaultLang = 'en'
}) => {
  const [selectedLangCode, setSelectedLangCode] = useState<SupportedLanguageCode>(defaultLang);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // TTS State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeSentence, setActiveSentence] = useState<string>('');

  const currentLangObj: UserGuideLanguage = useMemo(() => {
    return USER_GUIDE_LANGUAGES.find(l => l.code === selectedLangCode) || USER_GUIDE_LANGUAGES[0];
  }, [selectedLangCode]);

  // Load voices for current language
  useEffect(() => {
    const updateVoices = () => {
      const allVoices = ttsService.getVoices();
      const matchingVoices = allVoices.filter(v =>
        v.lang.toLowerCase().startsWith(currentLangObj.code.toLowerCase()) ||
        v.lang.toLowerCase().replace('_', '-').startsWith(currentLangObj.bcp47.toLowerCase())
      );
      setAvailableVoices(matchingVoices.length ? matchingVoices : allVoices);
      const best = ttsService.getBestVoiceForLanguage(currentLangObj.bcp47);
      if (best) setSelectedVoiceURI(best.voiceURI);
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [currentLangObj]);

  // Cleanup speech on modal close or unmount
  useEffect(() => {
    if (!isOpen) {
      ttsService.stop();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build narration text
  const fullNarrationText = `${currentLangObj.content.title}. ${currentLangObj.content.subtitle}. ${currentLangObj.content.intro} ${currentLangObj.content.project1Title}. ${currentLangObj.content.project1Desc} ${currentLangObj.content.project2Title}. ${currentLangObj.content.project2Desc} ${currentLangObj.content.project3Title}. ${currentLangObj.content.project3Desc} ${currentLangObj.content.project4Title}. ${currentLangObj.content.project4Desc} ${currentLangObj.content.submissionTitle}. ${currentLangObj.content.submissionDesc}`;

  const handlePlayTTS = () => {
    if (isPaused) {
      ttsService.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);

    ttsService.speak(fullNarrationText, {
      bcp47: currentLangObj.bcp47,
      rate,
      voiceURI: selectedVoiceURI,
      onSentenceChange: (_idx, text) => {
        setActiveSentence(text);
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveSentence('');
      },
      onError: () => {
        setIsPlaying(false);
        setIsPaused(false);
      }
    });
  };

  const handlePauseTTS = () => {
    ttsService.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStopTTS = () => {
    ttsService.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setActiveSentence('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullNarrationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fullNarrationText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `USER_GUIDE_${currentLangObj.code.toUpperCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        dir={currentLangObj.rtl ? 'rtl' : 'ltr'}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">KayBiT User Guide & Curriculum</h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  22 Languages + Native TTS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official architectural specification for instructors & advanced engineering students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Dropdown */}
            <div className="relative">
              <select
                value={selectedLangCode}
                onChange={e => {
                  ttsService.stop();
                  setIsPlaying(false);
                  setIsPaused(false);
                  setSelectedLangCode(e.target.value as SupportedLanguageCode);
                }}
                className="appearance-none bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg pl-3 pr-8 py-2 font-medium focus:outline-none focus:border-amber-500 cursor-pointer shadow-inner"
              >
                {USER_GUIDE_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TTS Narration Controls Bar */}
        <div className="bg-slate-950 border-b border-slate-800/80 p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono flex items-center gap-1.5 font-semibold">
              <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              TTS Narration ({currentLangObj.bcp47}):
            </span>

            {/* Play / Pause / Stop buttons */}
            <div className="flex items-center gap-1">
              {!isPlaying ? (
                <button
                  onClick={handlePlayTTS}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md flex items-center gap-1.5 transition shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {isPaused ? 'Resume' : 'Listen in ' + currentLangObj.name}
                </button>
              ) : (
                <button
                  onClick={handlePauseTTS}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-md flex items-center gap-1.5 transition shadow"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" /> Pause
                </button>
              )}

              {(isPlaying || isPaused) && (
                <button
                  onClick={handleStopTTS}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition"
                  title="Stop Audio"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              )}
            </div>

            {/* Playback Speed */}
            <div className="flex items-center gap-1 ml-2 font-mono">
              <span className="text-slate-500 text-[11px]">Speed:</span>
              {[0.75, 1.0, 1.25, 1.5].map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setRate(s);
                    if (isPlaying) {
                      ttsService.stop();
                      setTimeout(() => handlePlayTTS(), 100);
                    }
                  }}
                  className={`px-1.5 py-0.5 rounded text-[11px] ${
                    rate === s ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions (Copy / Download) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1.5 transition"
            >
              {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
              Markdown
            </button>
          </div>
        </div>

        {/* Live Sentence Highlighting Banner */}
        {isPlaying && activeSentence && (
          <div className="px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
            <Sparkles className="w-3.5 h-3.5 shrink-0 animate-spin" />
            <span className="truncate">{activeSentence}</span>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm leading-relaxed">
          {/* Title Header */}
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-1.5">
              {currentLangObj.content.title}
            </h1>
            <p className="text-sm text-amber-400 font-medium">
              {currentLangObj.content.subtitle}
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <p className="text-slate-300 text-sm leading-relaxed">
              {currentLangObj.content.intro}
            </p>
          </div>

          {/* Project 1 */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs">1</span>
              <h3>{currentLangObj.content.project1Title}</h3>
            </div>
            <p className="text-slate-300 text-sm mb-3">
              {currentLangObj.content.project1Desc}
            </p>
            <div className="text-xs font-mono text-slate-400 bg-slate-900 p-2.5 rounded border border-slate-800">
              Primary Stack: Python (FastAPI), Go, Rust, C++, Bash, PowerShell
            </div>
          </div>

          {/* Project 2 */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-base mb-2">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs">2</span>
              <h3>{currentLangObj.content.project2Title}</h3>
            </div>
            <p className="text-slate-300 text-sm mb-3">
              {currentLangObj.content.project2Desc}
            </p>
            <div className="text-xs font-mono text-slate-400 bg-slate-900 p-2.5 rounded border border-slate-800">
              Primary Stack: Java (Spring Boot), C# (.NET Core), TypeScript / Node.js, Kotlin, SQL
            </div>
          </div>

          {/* Project 3 */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-base mb-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-xs">3</span>
              <h3>{currentLangObj.content.project3Title}</h3>
            </div>
            <p className="text-slate-300 text-sm mb-3">
              {currentLangObj.content.project3Desc}
            </p>
            <div className="text-xs font-mono text-slate-400 bg-slate-900 p-2.5 rounded border border-slate-800">
              Primary Stack: Python, Ruby, PHP, Go, Rust, Scala, R, MATLAB
            </div>
          </div>

          {/* Project 4 */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base mb-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs">4</span>
              <h3>{currentLangObj.content.project4Title}</h3>
            </div>
            <p className="text-slate-300 text-sm mb-3">
              {currentLangObj.content.project4Desc}
            </p>
            <div className="text-xs font-mono text-slate-400 bg-slate-900 p-2.5 rounded border border-slate-800">
              Primary Stack: C, C++, Dart (Flutter), Kotlin, Swift, Assembly / COBOL
            </div>
          </div>

          {/* Evaluation Rubric */}
          <div className="bg-gradient-to-r from-slate-950 to-indigo-950/30 p-5 rounded-xl border border-indigo-500/30">
            <h4 className="text-white font-bold text-sm mb-2">{currentLangObj.content.submissionTitle}</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {currentLangObj.content.submissionDesc}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Partition Resilience</span>
                <span className="text-emerald-400 font-bold">30% Weight</span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Memory Efficiency</span>
                <span className="text-cyan-400 font-bold">25% Weight</span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Architecture Quality</span>
                <span className="text-indigo-400 font-bold">25% Weight</span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Testing & Observability</span>
                <span className="text-amber-400 font-bold">20% Weight</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <span>KayBiT_Audiobooks Curriculum • 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
