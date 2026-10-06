import React, { useState } from 'react';
import { Users, Lock, Unlock, Database, Play, AlertCircle, CheckCircle2, RotateCcw, ShieldAlert, Sparkles } from 'lucide-react';

type ConcurrencyMode = 'unprotected' | 'optimistic' | 'pessimistic' | 'redis_hold';

interface RequestResult {
  id: number;
  userId: string;
  status: 'SUCCESS' | 'WAITLISTED' | 'RACE_BUG' | 'CONFLICT_RETRY';
  message: string;
  latencyMs: number;
  version?: number;
}

export const Capstone2ConcurrencySimulator: React.FC = () => {
  const [totalLicenses] = useState(3);
  const [concurrentUsers, setConcurrentUsers] = useState<number>(50);
  const [mode, setMode] = useState<ConcurrencyMode>('pessimistic');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<RequestResult[]>([]);
  const [stats, setStats] = useState<{
    successful: number;
    waitlisted: number;
    violations: number;
    conflicts: number;
    finalInventory: number;
    elapsedMs: number;
  } | null>(null);

  const runSimulation = () => {
    setIsRunning(true);
    setResults([]);
    setStats(null);

    setTimeout(() => {
      let currentStock = totalLicenses;
      const simulatedResults: RequestResult[] = [];
      let successCount = 0;
      let waitlistCount = 0;
      let violationCount = 0;
      let conflictCount = 0;

      const startTime = performance.now();

      for (let i = 1; i <= concurrentUsers; i++) {
        const userId = `patron_${(100 + i).toString()}`;
        const latency = Math.floor(Math.random() * 25) + 5;

        if (mode === 'unprotected') {
          // RACE CONDITION BUG: Every thread reads the current stock before it is decremented!
          // Simulates race condition where threads observe stock > 0 simultaneously
          if (currentStock > 0 || Math.random() < 0.65) {
            currentStock -= 1;
            successCount++;
            if (currentStock < 0) {
              violationCount++;
              simulatedResults.push({
                id: i,
                userId,
                status: 'RACE_BUG',
                message: `Double-booking! Issued digital copy despite stock = ${currentStock}`,
                latencyMs: latency
              });
            } else {
              simulatedResults.push({
                id: i,
                userId,
                status: 'SUCCESS',
                message: `Checkout granted (Available: ${currentStock})`,
                latencyMs: latency
              });
            }
          } else {
            waitlistCount++;
            simulatedResults.push({
              id: i,
              userId,
              status: 'WAITLISTED',
              message: 'Out of stock (rejected without lock)',
              latencyMs: latency
            });
          }
        } else if (mode === 'optimistic') {
          // Optimistic locking with version check
          if (successCount < totalLicenses) {
            successCount++;
            currentStock--;
            simulatedResults.push({
              id: i,
              userId,
              status: 'SUCCESS',
              message: `Checkout granted (Version ${successCount})`,
              latencyMs: latency
            });
          } else {
            conflictCount++;
            simulatedResults.push({
              id: i,
              userId,
              status: 'CONFLICT_RETRY',
              message: '409 Conflict: Row version mismatch. Aborted transaction.',
              latencyMs: latency + 12
            });
          }
        } else if (mode === 'pessimistic') {
          // SELECT ... FOR UPDATE (Strict ACID Serialized Row Lock)
          if (currentStock > 0) {
            currentStock -= 1;
            successCount++;
            simulatedResults.push({
              id: i,
              userId,
              status: 'SUCCESS',
              message: `ACID row lock held. Copy #${successCount} issued.`,
              latencyMs: latency + (i * 2) // Queue wait
            });
          } else {
            waitlistCount++;
            simulatedResults.push({
              id: i,
              userId,
              status: 'WAITLISTED',
              message: `Transferred to Hold Queue (Position #${waitlistCount})`,
              latencyMs: latency + 4
            });
          }
        } else if (mode === 'redis_hold') {
          // Reactive Redis Sorted Set Hold-Queue
          if (currentStock > 0) {
            currentStock -= 1;
            successCount++;
            simulatedResults.push({
              id: i,
              userId,
              status: 'SUCCESS',
              message: `Instant loan issued. Expires in 14 days.`,
              latencyMs: latency
            });
          } else {
            waitlistCount++;
            simulatedResults.push({
              id: i,
              userId,
              status: 'WAITLISTED',
              message: `Redis ZADD hold_queue score=${Date.now() + i * 10}. Rank: #${waitlistCount}`,
              latencyMs: latency
            });
          }
        }
      }

      const elapsed = Math.round(performance.now() - startTime);

      setResults(simulatedResults);
      setStats({
        successful: successCount,
        waitlisted: waitlistCount,
        violations: violationCount,
        conflicts: conflictCount,
        finalInventory: currentStock,
        elapsedMs: elapsed
      });
      setIsRunning(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Users className="w-3.5 h-3.5" /> High-Concurrency Testbench
              </span>
              <span className="text-xs font-mono text-slate-400">PostgreSQL ACID & Redis State Machine</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">Multi-Threaded Checkout Race Condition Simulator</h3>
            <p className="text-sm text-slate-400">
              Simulates simultaneous checkout spikes against a fixed physical-digital constraint of exactly 3 licenses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* User Load Selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <span className="px-2 text-slate-500 font-mono">Load:</span>
              {[10, 50, 100, 200].map(count => (
                <button
                  key={count}
                  onClick={() => setConcurrentUsers(count)}
                  className={`px-2.5 py-1 rounded font-mono font-medium transition-colors ${
                    concurrentUsers === count
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {count} reqs
                </button>
              ))}
            </div>

            {/* Run Test Button */}
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-lg shadow-md transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              {isRunning ? 'Executing Transactions...' : 'Fire Concurrent Spike'}
            </button>
          </div>
        </div>

        {/* Concurrency Strategy Selection Cards */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'unprotected',
              name: '1. Unprotected / Dirty Read',
              desc: 'No row locks. Shows the catastrophic double-booking race condition.',
              icon: Unlock,
              color: 'border-rose-500/40 text-rose-400 bg-rose-950/20'
            },
            {
              id: 'optimistic',
              name: '2. Optimistic Locking',
              desc: 'Version check (@Version). High conflict rollbacks under spikes.',
              icon: Database,
              color: 'border-amber-500/40 text-amber-400 bg-amber-950/20'
            },
            {
              id: 'pessimistic',
              name: '3. Pessimistic Row Lock',
              desc: 'SELECT ... FOR UPDATE. Zero double-booking, guaranteed ACID serialization.',
              icon: Lock,
              color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20'
            },
            {
              id: 'redis_hold',
              name: '4. Redis Hold-Queue Machine',
              desc: 'Sorted Sets (ZADD). Instant waitlist ranking & rolling auto-returns.',
              icon: Sparkles,
              color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20'
            }
          ].map(item => {
            const Icon = item.icon;
            const isSelected = mode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setMode(item.id as ConcurrencyMode)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? `${item.color} ring-1 ring-white/20`
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-white">
                  <Icon className="w-4 h-4" />
                  {item.name}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results & Contention Statistics */}
      {stats && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              Contention Benchmark & Inventory Ledger Audit
            </h4>
            <span className="text-xs font-mono text-slate-400">Processed in {stats.elapsedMs}ms</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Initial Physical Licenses</span>
              <span className="text-xl font-bold font-mono text-white">3 Copies</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Checkouts Issued</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{stats.successful}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Enqueued on Hold Queue</span>
              <span className="text-xl font-bold font-mono text-cyan-400">{stats.waitlisted}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Double-Booking Bugs</span>
              <span className={`text-xl font-bold font-mono ${stats.violations > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
                {stats.violations}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Final Inventory Ledger</span>
              <span className={`text-xl font-bold font-mono ${stats.finalInventory < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                {stats.finalInventory}
              </span>
            </div>
          </div>

          {/* Verdict Banner */}
          <div className={`mt-4 p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
            stats.violations > 0
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              : mode === 'optimistic' && stats.conflicts > 0
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
          }`}>
            {stats.violations > 0 ? (
              <>
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>
                  <strong>CRITICAL ANOMALY:</strong> {stats.violations} double-booking race condition violations occurred! The library only owns 3 licenses, but {stats.successful} patrons were issued loans! This demonstrates why unprotected reads fail in production.
                </span>
              </>
            ) : mode === 'optimistic' ? (
              <>
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  <strong>ACID INTEGRITY PRESERVED:</strong> Zero double-booking, but {stats.conflicts} transactions suffered 409 version conflicts. Under high contention, optimistic locking causes excessive retry waste compared to pessimistic row locks.
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  <strong>PERFECT TRANSACTION ISOLATION:</strong> Exactly 3 licenses were granted. All {stats.waitlisted} subsequent patrons were systematically and deterministically routed into the waitlist queue without any data anomalies!
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Visual Thread Requests Grid */}
      {results.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
            <span>Simulated Thread Execution Timeline ({results.length} requests)</span>
            <span className="text-xs text-slate-400 font-normal">
              Hover over pills to inspect transaction state
            </span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
            {results.map(r => (
              <div
                key={r.id}
                title={r.message}
                className={`p-2 rounded border text-[11px] font-mono truncate transition-all ${
                  r.status === 'SUCCESS'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : r.status === 'RACE_BUG'
                    ? 'bg-rose-950/60 border-rose-500/70 text-rose-200 animate-pulse'
                    : r.status === 'CONFLICT_RETRY'
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                    : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>#{r.id} {r.userId}</span>
                  <span className="text-[10px] opacity-75">{r.latencyMs}ms</span>
                </div>
                <div className="text-[10px] truncate opacity-90">{r.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
