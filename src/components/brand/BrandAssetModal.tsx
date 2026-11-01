import React, { useState } from 'react';
import { X, Download, Copy, Check, Monitor, Smartphone, Globe, ExternalLink, Terminal, Shield } from 'lucide-react';
import { KBT_ASSETS } from './BrandLogo';

interface BrandAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandAssetModal: React.FC<BrandAssetModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'desktop' | 'mobile' | 'web'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  KBT Brand Identity & Multiplatform Icon Suite
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-lime-500/10 text-lime-400 border border-lime-500/30">
                  Vite • React • Tauri
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generated from KBT Brand Integration Guide: Desktop Title Bars, Mobile App Bars & Web Headers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 overflow-x-auto text-xs font-semibold gap-2 py-2.5">
          {[
            { id: 'all', label: 'All 3 Brand Use Cases' },
            { id: 'desktop', label: '1. Desktop Title Bar (Windows/macOS)' },
            { id: 'mobile', label: '2. Mobile App Bar (iOS/Android)' },
            { id: 'web', label: '3. Web Header Bar (Browsers/PWAs)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === tab.id
                  ? 'bg-lime-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Showcase */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Use Case 1: Desktop Title Bar */}
          {(activeTab === 'all' || activeTab === 'desktop') && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">
                    Desktop Window Title Bar App Icon (Windows / macOS / Linux)
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                  Target: 16x16, 24x24, 32x32, 256x256 (.ico / .icns)
                </span>
              </div>

              {/* Windows / macOS Title Bar Preview Frame */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
                {/* Simulated macOS / Windows Title Bar */}
                <div className="h-9 bg-slate-950 border-b border-slate-800/80 px-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Traffic lights */}
                    <div className="flex items-center gap-1.5 mr-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    </div>

                    {/* Resized Icon in Window Title Bar */}
                    <div className="w-5 h-5 rounded overflow-hidden border border-lime-400/30">
                      <img
                        src={KBT_ASSETS.desktopIcon}
                        alt="Desktop App Icon"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-300 font-medium">
                      KayBiT Audiobooks — [Production v2.5]
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                    <span>Tauri v2 Native</span>
                  </div>
                </div>

                <div className="p-4 flex items-center gap-4 bg-slate-900/60">
                  <div className="w-20 h-20 rounded-2xl bg-black border border-lime-400/30 p-1 flex items-center justify-center shadow-lg">
                    <img
                      src={KBT_ASSETS.desktopIcon}
                      alt="High Res Desktop Icon"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="space-y-1 text-xs text-slate-400 flex-1 font-mono">
                    <p className="text-slate-200 font-semibold font-sans">
                      Automated Tauri Bundle Generator:
                    </p>
                    <code className="text-lime-400 block bg-black/60 p-2 rounded border border-slate-800 text-[11px]">
                      npm run tauri icon ./public/assets/kbt-logo-transparent.png
                    </code>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Generates Windows <code className="text-slate-200">icon.ico</code> and macOS <code className="text-slate-200">icon.icns</code> automatically into <code className="text-slate-200">src-tauri/icons/</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Use Case 2: Mobile App Bar */}
          {(activeTab === 'all' || activeTab === 'mobile') && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-lime-400" />
                  <h3 className="text-sm font-bold text-white">
                    Brand Logo of Mobile App Bars (iOS & Android)
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lime-950 text-lime-400 border border-lime-800/40">
                  Tailwind .mask-squircle (Superellipse)
                </span>
              </div>

              {/* Mobile Device App Bar Preview Frame */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-inner max-w-md mx-auto">
                {/* Simulated Phone Notch / Dynamic Island */}
                <div className="h-7 bg-black flex items-center justify-between px-4 text-[10px] font-mono text-slate-400">
                  <span>9:41</span>
                  <div className="w-20 h-3 bg-slate-900 rounded-full" />
                  <span>5G 100%</span>
                </div>

                {/* Simulated Mobile App Header Bar */}
                <div className="h-12 bg-slate-950 border-b border-slate-800/80 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Mobile App Bar Logo with Squircle Mask */}
                    <div className="w-8 h-8 bg-black mask-squircle p-0.5 border border-lime-400/30 flex items-center justify-center">
                      <img
                        src={KBT_ASSETS.mobileLogo}
                        alt="Mobile App Bar Logo"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover filter drop-shadow-[0_0_6px_rgba(163,230,53,0.5)]"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block leading-tight">
                        KayBiT Player
                      </span>
                      <span className="text-[9px] text-lime-400 font-mono block">
                        Background Service Active
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    Capacitor
                  </span>
                </div>

                <div className="p-3 bg-slate-900/50 text-[11px] text-slate-400 font-mono">
                  Squircle CSS Class: <code className="text-lime-300 font-bold">.mask-squircle</code> (authentic iOS/Android continuous curvature)
                </div>
              </div>
            </div>
          )}

          {/* Use Case 3: Web Header Bar */}
          {(activeTab === 'all' || activeTab === 'web') && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    Brand Logo of Web Header Bars (Web Browsers / Web Apps)
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40">
                  Target: 36x36 / 40x40 Nav Item
                </span>
              </div>

              {/* Web Browser Nav Header Preview Frame */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
                {/* Browser Tab Header */}
                <div className="h-8 bg-slate-950 border-b border-slate-800/80 px-3 flex items-center gap-2 text-xs text-slate-400">
                  <div className="px-3 py-1 bg-slate-900 rounded-t-lg border-t border-l border-r border-slate-700 text-slate-200 flex items-center gap-1.5 text-[11px]">
                    <div className="w-3.5 h-3.5 rounded overflow-hidden">
                      <img src={KBT_ASSETS.webLogo} alt="Favicon" className="w-full h-full object-cover" />
                    </div>
                    <span>KayBiT_Audiobooks Web App</span>
                  </div>
                </div>

                {/* Web App Nav Header Preview */}
                <div className="h-14 bg-slate-950/80 px-4 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-lime-400/40 bg-black p-0.5 shadow-lg shadow-lime-500/20">
                      <img
                        src={KBT_ASSETS.webLogo}
                        alt="Web Header Bar Brand Logo"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="leading-tight">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                        <span>KayBiT</span>
                        <span className="text-lime-400 font-mono text-xs">Audiobooks</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Vite 8 • React 19 • Tailwind CSS
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                      Live Applet
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <span>Guide Reference: kbt-integration-guide.txt</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
