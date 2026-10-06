import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RefreshCw, Shield, Cpu, Terminal, Radio, Volume2, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export const Capstone1StreamSimulator: React.FC = () => {
  // Web Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [bitrate, setBitrate] = useState<'64k' | '128k' | '320k'>('128k');
  const [bufferLevel, setBufferLevel] = useState(0);
  const [streamChunks, setStreamChunks] = useState<Array<{ id: number; size: string; status: string; iv: string; hash: string }>>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);
  
  // Transcoder worker state
  const [isTranscoding, setIsTranscoding] = useState(false);
  const [transcodeProgress, setTranscodeProgress] = useState(0);
  const [transcodeLogs, setTranscodeLogs] = useState<string[]>([]);

  // Cryptography terminal runner state
  const [isScriptRunning, setIsScriptRunning] = useState(false);
  const [scriptLogs, setScriptLogs] = useState<string[]>([]);

  // Web Audio Context reference
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscNodeRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const bufferIntervalRef = useRef<number | null>(null);

  // Initialize simulated stream chunks
  useEffect(() => {
    const initialChunks = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      size: '64 KB',
      status: i < 3 ? 'Cached & Decrypted' : 'Encrypted in S3',
      iv: `0x${(1000 + i * 27).toString(16)}...${(9999 - i * 14).toString(16)}`,
      hash: `sha256:d8a${i}e3...`
    }));
    setStreamChunks(initialChunks);
  }, []);

  const toggleWebAudio = () => {
    if (isPlayingAudio) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const startAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Create synthetic audiobook narrator frequency (harmonic warm drone + modulation)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Frequency adjusts subtly based on selected bitrate to simulate bandwidth nuance
      const baseFreq = bitrate === '64k' ? 190 : bitrate === '128k' ? 220 : 260;
      osc.type = bitrate === '64k' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscNodeRef.current = osc;
      gainNodeRef.current = gain;
      setIsPlayingAudio(true);
      setIsDecrypting(true);

      // Simulate streaming buffer gauge
      setBufferLevel(25);
      if (bufferIntervalRef.current) clearInterval(bufferIntervalRef.current);
      bufferIntervalRef.current = window.setInterval(() => {
        setBufferLevel(prev => {
          if (prev >= 95) return 92;
          return prev + 6;
        });
      }, 800);
    } catch (e) {
      console.error('AudioContext error:', e);
    }
  };

  const stopAudio = () => {
    if (oscNodeRef.current) {
      try {
        oscNodeRef.current.stop();
        oscNodeRef.current.disconnect();
      } catch {}
      oscNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (bufferIntervalRef.current) {
      clearInterval(bufferIntervalRef.current);
      bufferIntervalRef.current = null;
    }
    setIsPlayingAudio(false);
    setIsDecrypting(false);
    setBufferLevel(0);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Simulate High-Throughput Media Transcoder
  const runTranscoderPipeline = () => {
    if (isTranscoding) return;
    setIsTranscoding(true);
    setTranscodeProgress(10);
    setTranscodeLogs([
      '[Daemon: worker-rust-01] Polling bucket `s3://audio-masters/incoming`',
      '[Worker-01] New audio asset detected: `the_odyssey_master_96khz.wav` (384 MB)',
      '[Worker-01] Spawning multi-threaded FFmpeg pipeline with 8 parallel worker threads...'
    ]);

    setTimeout(() => {
      setTranscodeProgress(40);
      setTranscodeLogs(prev => [
        ...prev,
        '[FFmpeg] Slicing into 6-second HLS segments for bitrates: 64k, 128k, 320k',
        '[FFmpeg] Injected ID3v2 tags: Title="The Odyssey", Narrator="Ian McKellen", Rights="Libro.fm DRM-Free"',
      ]);
    }, 1200);

    setTimeout(() => {
      setTranscodeProgress(75);
      setTranscodeLogs(prev => [
        ...prev,
        '[Worker-01] Segmented 314 chunks for 64kbps stream (speech optimized)',
        '[Worker-01] Segmented 314 chunks for 128kbps stream (standard)',
        '[Worker-01] Segmented 314 chunks for 320kbps stream (lossless audiophile)',
        '[Worker-01] Generated master manifest: `the_odyssey_master.m3u8`'
      ]);
    }, 2400);

    setTimeout(() => {
      setTranscodeProgress(100);
      setIsTranscoding(false);
      setTranscodeLogs(prev => [
        ...prev,
        '[SUCCESS] Transcoding complete in 3.42s. Artifacts uploaded to encrypted MinIO vault bucket.'
      ]);
    }, 3600);
  };

  // Simulate Storage Cryptography Script
  const runCryptScript = () => {
    if (isScriptRunning) return;
    setIsScriptRunning(true);
    setScriptLogs([
      '$ ./scripts/encrypt_master_pipeline.sh --vault /var/audiobooks/vault',
      '[ENCRYPT] Loading master envelope key from KMS vault...',
      '[ENCRYPT] Initializing OpenSSL AES-256-CBC engine with PBKDF2 iterations (100,000 passes)...'
    ]);

    setTimeout(() => {
      setScriptLogs(prev => [
        ...prev,
        '[SHA-256] Pre-encryption checksum computed: 8f4a13c9e6... [VERIFIED]',
        '[CIPHER] Encrypting `the_odyssey_master.wav` -> `the_odyssey.enc`...',
        '[SALT] Injected 16-byte random cryptographic salt and initialization vector (IV)...'
      ]);
    }, 1100);

    setTimeout(() => {
      setScriptLogs(prev => [
        ...prev,
        '[SUCCESS] Cryptographic separation established. Encrypted output matches AES-256 spec.',
        '[CLEANUP] Executed secure zero-fill shred on raw unencrypted ingress files.'
      ]);
      setIsScriptRunning(false);
    }, 2200);
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Radio className="w-3 h-3 animate-pulse" /> Live Streaming Engine
              </span>
              <span className="text-xs font-mono text-slate-400">FastAPI & Web Audio API Core</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">Chunked Audio Streamer & On-the-Fly AES Decryptor</h3>
            <p className="text-sm text-slate-400">
              Streams synthesized audio chunks with HTTP 206 Partial Content range requests and constant 64KB RAM window.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Bitrate Selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <span className="px-2 text-slate-500 font-mono">Bitrate:</span>
              {(['64k', '128k', '320k'] as const).map(rate => (
                <button
                  key={rate}
                  onClick={() => {
                    setBitrate(rate);
                    if (isPlayingAudio) {
                      stopAudio();
                    }
                  }}
                  className={`px-3 py-1 rounded font-mono font-medium transition-colors ${
                    bitrate === rate
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rate}bps
                </button>
              ))}
            </div>

            {/* Audio Stream Player Button */}
            <button
              onClick={toggleWebAudio}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md ${
                isPlayingAudio
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-4 h-4 fill-current" /> Stop Micro-Stream
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Test Synthesized Stream
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/60">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Client Buffer Gauge
              </span>
              <span className="font-mono text-amber-400">{isPlayingAudio ? `${bufferLevel}%` : '0%'}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2 transition-all duration-300 rounded-full"
                style={{ width: `${isPlayingAudio ? bufferLevel : 0}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Max client memory constraint: 64 KB</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/60">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-indigo-400" /> Decryption Cipher Status
              </span>
              <span className={`font-mono text-xs ${isDecrypting ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isDecrypting ? 'ACTIVE (AES-CTR)' : 'STANDBY'}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 truncate">
              {isDecrypting ? 'Key: [SHA256: 32-Byte Envelope] | IV: Auto-derived' : 'Awaiting streaming socket connection'}
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/60">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Delivery Protocol
              </span>
              <span className="font-mono text-cyan-400">HTTP 206 Partial</span>
            </div>
            <p className="text-xs font-mono text-slate-400 truncate">
              Range: bytes=0-65535/419430400 (400MB Master)
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Section: Chunk Visualizer + Transcoder Daemon */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* S3 Chunk Streaming Pipeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Live Chunk Segment Pipeline
              </h4>
              <p className="text-xs text-slate-400">Inspecting 64KB on-the-fly decrypted chunk segments</p>
            </div>
            <button
              onClick={() => {
                const refreshed = streamChunks.map(c => ({
                  ...c,
                  iv: `0x${Math.floor(Math.random() * 9000 + 1000).toString(16)}...`
                }));
                setStreamChunks(refreshed);
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              title="Refresh chunks"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {streamChunks.map(chunk => (
              <div
                key={chunk.id}
                className={`p-3 rounded-lg border text-xs font-mono transition-all ${
                  isPlayingAudio && chunk.id <= 3
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-slate-950 border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>Segment #{chunk.id.toString().padStart(3, '0')}.ts ({chunk.size})</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">
                    {chunk.status}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-4 text-[11px] text-slate-400">
                  <span>IV: <code className="text-amber-400">{chunk.iv}</code></span>
                  <span>Checksum: <code className="text-cyan-400">{chunk.hash}</code></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transcoder & Cryptography Interactive Daemons */}
        <div className="space-y-6">
          {/* FFmpeg / Rust Transcoder */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  FFmpeg / Rust Transcoder Daemon
                </h4>
                <p className="text-xs text-slate-400">Multi-threaded HLS fragmentation & ID3 tag stitching</p>
              </div>
              <button
                onClick={runTranscoderPipeline}
                disabled={isTranscoding}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {isTranscoding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Run Transcoder
              </button>
            </div>

            {/* Progress Bar */}
            {isTranscoding && (
              <div className="mb-3">
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${transcodeProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Terminal Window */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto space-y-1">
              {transcodeLogs.length === 0 ? (
                <span className="text-slate-600">Click &quot;Run Transcoder&quot; to simulate worker daemon monitoring S3 queue...</span>
              ) : (
                transcodeLogs.map((log, i) => (
                  <div key={i} className="leading-tight">{log}</div>
                ))
              )}
            </div>
          </div>

          {/* Bash / PowerShell Cryptography Layer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  Storage Cryptography Script
                </h4>
                <p className="text-xs text-slate-400">OpenSSL AES-256 envelope packaging with PBKDF2</p>
              </div>
              <button
                onClick={runCryptScript}
                disabled={isScriptRunning}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
              >
                {isScriptRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
                Run Script
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto space-y-1">
              {scriptLogs.length === 0 ? (
                <span className="text-slate-600">Click &quot;Run Script&quot; to execute Bash/PowerShell AES-256 pipeline simulation...</span>
              ) : (
                scriptLogs.map((log, i) => (
                  <div key={i} className="leading-tight">{log}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
