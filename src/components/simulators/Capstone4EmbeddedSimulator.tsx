import React, { useState } from 'react';
import { HardDrive, Smartphone, ShieldCheck, AlertTriangle, Play, RefreshCw, SmartphoneCharging, Cpu } from 'lucide-react';

interface CacheSlot {
  index: number;
  address: string;
  chunkId: number | null;
  lruRank: number;
  crc32: string;
  isCorrupted: boolean;
  isDirty: boolean;
}

export const Capstone4EmbeddedSimulator: React.FC = () => {
  // Fixed 8-block memory cache representation (64KB per slot)
  const [cacheSlots, setCacheSlots] = useState<CacheSlot[]>([
    { index: 0, address: '0x0040A000', chunkId: 101, lruRank: 1, crc32: '0x9E21A4B0', isCorrupted: false, isDirty: false },
    { index: 1, address: '0x0041A000', chunkId: 102, lruRank: 2, crc32: '0x3F88C11D', isCorrupted: false, isDirty: false },
    { index: 2, address: '0x0042A000', chunkId: 103, lruRank: 3, crc32: '0x712B00E4', isCorrupted: false, isDirty: false },
    { index: 3, address: '0x0043A000', chunkId: 104, lruRank: 4, crc32: '0xAA451299', isCorrupted: false, isDirty: false },
    { index: 4, address: '0x0044A000', chunkId: null, lruRank: 0, crc32: '0x00000000', isCorrupted: false, isDirty: false },
    { index: 5, address: '0x0045A000', chunkId: null, lruRank: 0, crc32: '0x00000000', isCorrupted: false, isDirty: false },
    { index: 6, address: '0x0046A000', chunkId: null, lruRank: 0, crc32: '0x00000000', isCorrupted: false, isDirty: false },
    { index: 7, address: '0x0047A000', chunkId: null, lruRank: 0, crc32: '0x00000000', isCorrupted: false, isDirty: false },
  ]);

  const [nextChunkId, setNextChunkId] = useState(105);
  const [cacheStatusLog, setCacheStatusLog] = useState<string>('C LRU cache initialized. 4/8 blocks occupied.');

  // OS Runtime State
  const [osState, setOsState] = useState<'FOREGROUND' | 'SCREEN_OFF' | 'LOW_MEMORY' | 'PROCESS_TERMINATED'>('FOREGROUND');

  // Insert chunk using LRU eviction
  const insertChunk = () => {
    setCacheSlots(prev => {
      const emptyIndex = prev.findIndex(s => s.chunkId === null);
      const newId = nextChunkId;
      setNextChunkId(n => n + 1);

      if (emptyIndex !== -1) {
        // Space available: put in empty slot
        const updated = [...prev];
        updated[emptyIndex] = {
          ...updated[emptyIndex],
          chunkId: newId,
          lruRank: 1,
          crc32: `0x${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0')}`,
          isCorrupted: false,
          isDirty: true
        };
        // Bump others' rank
        for (let i = 0; i < updated.length; i++) {
          if (i !== emptyIndex && updated[i].chunkId !== null) {
            updated[i].lruRank += 1;
          }
        }
        setCacheStatusLog(`[C LRU] Stored chunk #${newId} at address ${updated[emptyIndex].address}. (Count: ${updated.filter(s => s.chunkId !== null).length}/8)`);
        return updated;
      } else {
        // Cache full! Evict oldest (highest lruRank)
        let oldestIdx = 0;
        let maxRank = -1;
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].lruRank > maxRank) {
            maxRank = prev[i].lruRank;
            oldestIdx = i;
          }
        }

        const evictedId = prev[oldestIdx].chunkId;
        const updated = [...prev];
        updated[oldestIdx] = {
          ...updated[oldestIdx],
          chunkId: newId,
          lruRank: 1,
          crc32: `0x${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0')}`,
          isCorrupted: false,
          isDirty: true
        };
        for (let i = 0; i < updated.length; i++) {
          if (i !== oldestIdx && updated[i].chunkId !== null) {
            updated[i].lruRank += 1;
          }
        }
        setCacheStatusLog(`[C LRU EVICTION] Evicted chunk #${evictedId} from ${updated[oldestIdx].address}. Inserted new chunk #${newId}.`);
        return updated;
      }
    });
  };

  // Simulate Bit-Flip Corruption
  const triggerBitRot = () => {
    setCacheSlots(prev => {
      const occupied = prev.filter(s => s.chunkId !== null && !s.isCorrupted);
      if (!occupied.length) return prev;
      const target = occupied[Math.floor(Math.random() * occupied.length)];
      return prev.map(s => {
        if (s.index === target.index) {
          return { ...s, isCorrupted: true };
        }
        return s;
      });
    });
    setCacheStatusLog('[HARDWARE WARNING] Bit-rot simulated! Modified 1 bit in local flash memory.');
  };

  // Run Checksum Verification
  const verifyChecksums = () => {
    let corruptionFound = false;
    setCacheSlots(prev => {
      return prev.map(s => {
        if (s.isCorrupted) {
          corruptionFound = true;
          // Auto recover
          return { ...s, isCorrupted: false };
        }
        return s;
      });
    });

    if (corruptionFound) {
      setCacheStatusLog('[INTEGRITY CHECK] CRC32 mismatch detected! Zeroed corrupted block and re-fetched from network.');
    } else {
      setCacheStatusLog('[INTEGRITY CHECK] All 8 memory blocks verified. CRC32 checksums 100% valid.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <HardDrive className="w-3.5 h-3.5" /> Systems & Embedded Testbench
              </span>
              <span className="text-xs font-mono text-slate-400">Pure C LRU Byte Cache & Dart/Kotlin Audio Session</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">Memory-Optimized Local File Cache & OS Hardware Bridge</h3>
            <p className="text-sm text-slate-400">
              Inspects binary memory blocks, verifies CRC32 checksums against flash bit-rot, and tests foreground service audio survival.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: LRU Cache Grid + Mobile OS Runtime */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                POSIX LRU Byte Memory Cache
              </h4>
              <p className="text-xs text-slate-400">Fixed 512KB allocation (8 x 64KB slots) in C</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={insertChunk}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 transition"
                title="Append chunk"
              >
                <Play className="w-3 h-3 fill-current" />
                Store Chunk
              </button>
              <button
                onClick={triggerBitRot}
                className="px-2.5 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-xs rounded-lg flex items-center gap-1 transition"
                title="Simulate bit flip"
              >
                <AlertTriangle className="w-3 h-3" />
                Bit-Rot
              </button>
              <button
                onClick={verifyChecksums}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1 transition"
                title="Verify CRC32"
              >
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                Verify
              </button>
            </div>
          </div>

          {/* Memory Slots Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3 font-mono text-xs">
            {cacheSlots.map(slot => (
              <div
                key={slot.index}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  slot.isCorrupted
                    ? 'bg-rose-950/70 border-rose-500 text-rose-200 animate-pulse'
                    : slot.chunkId !== null
                    ? 'bg-slate-950 border-slate-800 text-slate-300'
                    : 'bg-slate-950/40 border-slate-900 text-slate-600'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                  <span>Slot #{slot.index}</span>
                  <span className="text-cyan-400">{slot.chunkId ? `Rank ${slot.lruRank}` : 'FREE'}</span>
                </div>
                <div className="font-bold text-white text-xs truncate">
                  {slot.chunkId ? `Chunk #${slot.chunkId}` : 'EMPTY'}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-1">
                  {slot.address}
                </div>
                <div className={`text-[10px] truncate ${slot.isCorrupted ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                  {slot.isCorrupted ? 'CRC FAIL' : slot.chunkId ? slot.crc32 : '—'}
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-400 truncate">
            {cacheStatusLog}
          </div>
        </div>

        {/* Mobile OS Runtime Hardware Bridge */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  Native OS Background Audio Bridge
                </h4>
                <p className="text-xs text-slate-400">Dart/Flutter & Kotlin MediaSessionService status</p>
              </div>
            </div>

            {/* OS Lifecycle State Buttons */}
            <div className="mb-4">
              <span className="text-xs font-mono text-slate-400 block mb-2">Simulate Mobile Device State:</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                {[
                  { id: 'FOREGROUND', label: '1. App Foreground Active' },
                  { id: 'SCREEN_OFF', label: '2. Screen Locked (Sleep)' },
                  { id: 'LOW_MEMORY', label: '3. Low Memory Warning' },
                  { id: 'PROCESS_TERMINATED', label: '4. App Process Killed' }
                ].map(state => (
                  <button
                    key={state.id}
                    onClick={() => setOsState(state.id as typeof osState)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      osState === state.id
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {state.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hardware Status Gauges */}
            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Audio Focus:</span>
                <span className={`font-bold ${osState !== 'PROCESS_TERMINATED' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {osState !== 'PROCESS_TERMINATED' ? 'AUDIOFOCUS_GAIN (Exclusive)' : 'LOST'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Foreground Notification:</span>
                <span className="text-cyan-400 font-bold">
                  {osState !== 'PROCESS_TERMINATED' ? 'STICKY_MEDIA_SESSION (Active)' : 'DISMISSED'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">WakeLock Status:</span>
                <span className={`font-bold ${osState === 'SCREEN_OFF' || osState === 'LOW_MEMORY' ? 'text-amber-400' : 'text-slate-400'}`}>
                  {osState !== 'PROCESS_TERMINATED' ? 'PARTIAL_WAKE_LOCK (Held)' : 'RELEASED'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Audio Stream Health:</span>
                <span className={`font-bold ${osState !== 'PROCESS_TERMINATED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {osState !== 'PROCESS_TERMINATED' ? 'UNINTERRUPTED STREAMING' : 'TERMINATED (CRITICAL)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
