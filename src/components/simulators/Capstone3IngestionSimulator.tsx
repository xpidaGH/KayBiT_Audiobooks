import React, { useState } from 'react';
import { Database, TrendingUp, Zap, FileText, AlertOctagon, CheckCircle2, Play, Globe } from 'lucide-react';

export const Capstone3IngestionSimulator: React.FC = () => {
  // Feed Parser state
  const [isParsingFeed, setIsParsingFeed] = useState(false);
  const [injectErrors, setInjectErrors] = useState(true);
  const [parsedCount, setParsedCount] = useState(0);
  const [dlqCount, setDlqCount] = useState(0);
  const [parserLogs, setParserLogs] = useState<string[]>([]);

  // Pricing Model state
  const [basePrice, setBasePrice] = useState<number>(24.99);
  const [elasticity, setElasticity] = useState<number>(-1.75); // Highly elastic
  const [royaltyFloor, setRoyaltyFloor] = useState<number>(6.50);

  // Cache Invalidation state
  const [isInvalidating, setIsInvalidating] = useState(false);
  const [edgeLatencies, setEdgeLatencies] = useState<{ [region: string]: number | null }>({
    'us-east': null,
    'eu-central': null,
    'ap-southeast': null
  });

  // Calculate pricing model metrics (R/MATLAB logic)
  const isElastic = elasticity < -1.0;
  // Dynamic formula: Optimal discount percentage proportional to elasticity
  const calculatedDiscount = Math.min(0.65, Math.max(0.10, (Math.abs(elasticity) - 0.5) * 0.28));
  const rawOptimalPrice = basePrice * (1 - calculatedDiscount);
  const guardedOptimalPrice = Math.max(rawOptimalPrice, royaltyFloor * 1.25);
  const estimatedVolumeBoost = Math.round(Math.pow(basePrice / guardedOptimalPrice, Math.abs(elasticity)) * 100 - 100);
  const projectedRevenueBoost = Math.round(((guardedOptimalPrice * (1 + estimatedVolumeBoost / 100)) / basePrice - 1) * 100);

  // Run simulated streaming parser
  const runFeedIngestion = () => {
    setIsParsingFeed(true);
    setParsedCount(0);
    setDlqCount(0);
    setParserLogs([
      '[ETL Ingestion] Connecting to incoming publisher stream: `feed_penguin_random_onix30.xml` (1.4 GB)',
      '[Memory Safe] Initializing SAX stream reader with constant 512KB buffer window...',
      '[Batch Worker] Setting batch insertion chunk size to 500 records per upsert.'
    ]);

    let current = 0;
    let bad = 0;
    const interval = setInterval(() => {
      current += 650;
      if (injectErrors && Math.random() > 0.4) {
        bad += Math.floor(Math.random() * 4) + 1;
      }

      setParsedCount(current);
      setDlqCount(bad);

      if (current >= 5000) {
        clearInterval(interval);
        setIsParsingFeed(false);
        setParserLogs(prev => [
          ...prev,
          `[BATCH COMMIT] Successfully upserted ${current} records to catalog index.`,
          `[DLQ ROUTE] Isolated ${bad} malformed publisher records to dead-letter queue without dropping stream.`,
          '[PIPELINE FINISHED] Stream digested in O(1) memory space.'
        ]);
      }
    }, 250);
  };

  // Run simulated edge cache invalidation
  const runCacheInvalidation = () => {
    setIsInvalidating(true);
    setEdgeLatencies({ 'us-east': null, 'eu-central': null, 'ap-southeast': null });

    setTimeout(() => {
      setEdgeLatencies(prev => ({ ...prev, 'us-east': 14 }));
    }, 200);

    setTimeout(() => {
      setEdgeLatencies(prev => ({ ...prev, 'eu-central': 29 }));
    }, 380);

    setTimeout(() => {
      setEdgeLatencies(prev => ({ ...prev, 'ap-southeast': 43 }));
      setIsInvalidating(false);
    }, 520);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Zap className="w-3.5 h-3.5" /> High-Throughput ETL Engine
              </span>
              <span className="text-xs font-mono text-slate-400">ONIX 3.0 & Econometric Pricing Pipeline</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">Multi-Gigabyte Streaming Feed Ingest & Dynamic Pricing</h3>
            <p className="text-sm text-slate-400">
              Parses compressed publisher XML catalogs with dead-letter queue isolation, computes pricing curves, and purges edge caches globally.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Feed Parser + Pricing Optimizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bulk ONIX Feed Ingestion */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Streaming ONIX 3.0 Parser
                </h4>
                <p className="text-xs text-slate-400">Constant $O(1)$ memory streaming parser with DLQ</p>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={injectErrors}
                    onChange={e => setInjectErrors(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Inject Bad XML</span>
                </label>

                <button
                  onClick={runFeedIngestion}
                  disabled={isParsingFeed}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {isParsingFeed ? 'Ingesting Stream...' : 'Parse Feed'}
                </button>
              </div>
            </div>

            {/* Counters */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-500 block">Valid Ingested Records</span>
                <span className="text-xl font-bold font-mono text-cyan-400">{parsedCount.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-500 block">Dead-Letter Queue (DLQ)</span>
                <span className={`text-xl font-bold font-mono ${dlqCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {dlqCount}
                </span>
              </div>
            </div>

            {/* Ingestion Logs */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 max-h-40 overflow-y-auto space-y-1">
              {parserLogs.length === 0 ? (
                <span className="text-slate-600">Click &quot;Parse Feed&quot; to ingest simulated 1.4GB ONIX catalog...</span>
              ) : (
                parserLogs.map((log, i) => (
                  <div key={i} className="leading-tight">{log}</div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Statistical Pricing Microservice (R / MATLAB) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Statistical Pricing Optimization (R / MATLAB)
                </h4>
                <p className="text-xs text-slate-400">Demand elasticity regression: Price = Base * (1 - ElasticityFactor)</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                isElastic ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                {isElastic ? 'Elastic (|Ed| > 1)' : 'Inelastic'}
              </span>
            </div>

            {/* Sliders */}
            <div className="space-y-3.5 mb-4 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Base Catalog Price</span>
                  <span className="text-white font-bold">${basePrice.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="12.99"
                  max="49.99"
                  step="1"
                  value={basePrice}
                  onChange={e => setBasePrice(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Price Elasticity Coefficient (Ed)</span>
                  <span className="text-amber-400 font-bold">{elasticity.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-3.00"
                  max="-0.50"
                  step="0.05"
                  value={elasticity}
                  onChange={e => setElasticity(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Publisher Minimum Royalty Floor</span>
                  <span className="text-slate-300 font-bold">${royaltyFloor.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="3.00"
                  max="15.00"
                  step="0.5"
                  value={royaltyFloor}
                  onChange={e => setRoyaltyFloor(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            {/* Optimization Output Summary */}
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Flash Price</span>
                <span className="text-lg font-bold font-mono text-emerald-400">${guardedOptimalPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Volume Lift</span>
                <span className="text-lg font-bold font-mono text-cyan-400">+{estimatedVolumeBoost}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Net Revenue</span>
                <span className="text-lg font-bold font-mono text-amber-400">+{projectedRevenueBoost}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Edge Cache Invalidation Layer (Go / Rust / Scala) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              Sub-50ms Global Edge Cache Invalidation (Go / Rust)
            </h4>
            <p className="text-xs text-slate-400">
              Broadcasting Redis Pub/Sub purge signals across regional edge nodes during flash sale transitions
            </p>
          </div>

          <button
            onClick={runCacheInvalidation}
            disabled={isInvalidating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg flex items-center gap-2 transition"
          >
            <Zap className="w-3.5 h-3.5" />
            {isInvalidating ? 'Broadcasting Purge...' : 'Broadcast Flash Sale Mutation'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          {[
            { region: 'us-east', name: 'US-East (N. Virginia)', latency: edgeLatencies['us-east'], target: '< 20ms' },
            { region: 'eu-central', name: 'EU-Central (Frankfurt)', latency: edgeLatencies['eu-central'], target: '< 35ms' },
            { region: 'ap-southeast', name: 'AP-Southeast (Singapore)', latency: edgeLatencies['ap-southeast'], target: '< 50ms' },
          ].map(edge => (
            <div key={edge.region} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-300 font-semibold block">{edge.name}</span>
                <span className="text-[11px] text-slate-500">Target: {edge.target}</span>
              </div>
              <div>
                {edge.latency !== null ? (
                  <span className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-bold">
                    {edge.latency} ms [PURGED]
                  </span>
                ) : (
                  <span className="text-slate-600">Cached</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
