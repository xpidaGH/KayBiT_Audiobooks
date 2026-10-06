import React, { useState } from 'react';
import { X, Smartphone, Apple, Monitor, Download, Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

interface InstallationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallationModal: React.FC<InstallationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'windows' | 'macos' | 'pwa'>('android');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleDownloadDoc = () => {
    const markdownContent = `# KayBiT_Audiobooks: Native Cross-Platform Packaging Guide
Refer to INSTALLATION.md in root directory for full CLI commands for Android APK/AAB, iOS IPA, Windows EXE/MSI, and macOS DMG.`;
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'INSTALLATION.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Native App Installation & Packaging Hub</h2>
              <p className="text-xs text-slate-400">
                Step-by-step export instructions for Android (APK/AAB), iOS (PWA/IPA), Windows (.exe/.msi), and macOS (.dmg)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'android', label: 'Android (APK / AAB)', icon: Smartphone },
            { id: 'ios', label: 'iOS & iPadOS', icon: Apple },
            { id: 'windows', label: 'Windows (.exe / .msi)', icon: Monitor },
            { id: 'macos', label: 'macOS (.dmg)', icon: Apple },
            { id: 'pwa', label: 'Instant Web PWA', icon: ExternalLink },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'border-cyan-500 text-cyan-400 bg-slate-900/50'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed font-sans">
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Android Standalone Package (Capacitor / Gradle)</h3>
                  <p className="text-slate-400">Generates unsigned debug `.apk` for direct sideloading or signed `.aab` for Google Play Console.</p>
                </div>
                <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Target: Android 14+ (SDK 34)
                </span>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-slate-200 font-mono">1. Initialize Capacitor Android Container:</span>
                <div className="relative bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300">
                  <pre>{`npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "KayBiT Audiobooks" com.kaybit.audiobooks --web-dir dist
npm run build
npx cap add android
npx cap sync`}</pre>
                  <button
                    onClick={() => copyToClipboard(`npm install @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init "KayBiT Audiobooks" com.kaybit.audiobooks --web-dir dist\nnpm run build\nnpx cap add android\nnpx cap sync`, 'android-1')}
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                  >
                    {copiedSnippet === 'android-1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-slate-200 font-mono">2. Build APK (Direct Sideload):</span>
                <div className="relative bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300">
                  <pre>{`cd android
./gradlew assembleDebug
# Generated APK: android/app/build/outputs/apk/debug/app-debug.apk`}</pre>
                  <button
                    onClick={() => copyToClipboard(`cd android\n./gradlew assembleDebug`, 'android-2')}
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                  >
                    {copiedSnippet === 'android-2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-slate-200 font-mono">3. Build Google Play Release AAB:</span>
                <div className="relative bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-indigo-300">
                  <pre>{`./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab`}</pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">iOS & iPadOS Deployment (Safari Standalone PWA & Xcode)</h3>
                <p className="text-slate-400">Install directly via Safari or package with Capacitor iOS for App Store / TestFlight distribution.</p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-xs">Method A: Zero-Install Standalone PWA (Instant)</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                  <li>Open this web application URL in <strong>Safari</strong> on your iPhone or iPad.</li>
                  <li>Tap the <strong>Share button</strong> (square icon with upward arrow).</li>
                  <li>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.</li>
                  <li>Tap <strong>Add</strong>. The app launches in full native standalone mode with background audio privileges.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-slate-200 font-mono">Method B: Xcode Native Archive (.ipa):</span>
                <div className="relative bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300">
                  <pre>{`npm install @capacitor/ios
npx cap add ios
npx cap sync
npx cap open ios
# In Xcode: Select target device and choose Product > Archive`}</pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'windows' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Windows Desktop Package (.exe & .msi)</h3>
                <p className="text-slate-400">Build ultra-lightweight Windows binaries using Tauri 2.0 (Rust backend) or Electron Forge.</p>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-slate-200 font-mono">1. Package with Tauri 2.0 (Lightweight ~14MB installer):</span>
                <div className="relative bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300">
                  <pre>{`npm install -D @tauri-apps/cli
npx tauri init
npm run build
npm run tauri build -- --target x86_64-pc-windows-msvc
# Output: src-tauri/target/release/bundle/nsis/KayBiT_Audiobooks_Setup.exe
# Output: src-tauri/target/release/bundle/msi/KayBiT_Audiobooks.msi`}</pre>
                  <button
                    onClick={() => copyToClipboard(`npm install -D @tauri-apps/cli\nnpx tauri init\nnpm run build\nnpm run tauri build`, 'win-1')}
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                  >
                    {copiedSnippet === 'win-1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'macos' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">macOS Universal Binary (.dmg & .app)</h3>
                <p className="text-slate-400">Compiles universal Apple Silicon (M1/M2/M3/M4) and Intel x86_64 drag-and-drop installer disk images.</p>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-slate-200 font-mono">1. Build Universal macOS .dmg:</span>
                <div className="relative bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300">
                  <pre>{`npm run build
npm run tauri build -- --target universal-apple-darwin
# Output: src-tauri/target/universal-apple-darwin/release/bundle/dmg/KayBiT_Audiobooks.dmg`}</pre>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-slate-200 font-mono">2. Gatekeeper Notarization Ticket:</span>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400">
                  <pre>{`xcrun notarytool submit KayBiT_Audiobooks.dmg --keychain-profile "AC_PASSWORD" --wait
xcrun stapler staple KayBiT_Audiobooks.dmg`}</pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Instant Progressive Web App (PWA)</h3>
                <p className="text-slate-400">Install in 1-click directly in Google Chrome, Microsoft Edge, or Samsung Internet without downloading an installer.</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold text-xs block mb-1">Desktop Browser Installation:</span>
                  <span className="text-slate-400">Look for the install icon (computer with down arrow) on the right side of the address bar.</span>
                </div>
                <span className="px-3 py-1 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded font-mono text-xs">
                  PWA Ready
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs">
          <button
            onClick={handleDownloadDoc}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download INSTALLATION.md
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
