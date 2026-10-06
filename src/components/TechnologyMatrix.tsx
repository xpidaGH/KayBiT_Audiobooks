import React, { useState } from 'react';
import { Code2, Filter, Layers, CheckCircle2, Terminal } from 'lucide-react';

interface TechItem {
  name: string;
  category: 'Media & API' | 'Systems & Crypto' | 'Enterprise Ledger' | 'ETL & Analytics' | 'Embedded';
  capstones: number[];
  libraries: string[];
  role: string;
  difficulty: 'Advanced' | 'Senior' | 'Expert';
}

const ALL_LANGUAGES: TechItem[] = [
  { name: 'Python', category: 'Media & API', capstones: [1, 3], libraries: ['FastAPI', 'cryptography', 'xml.etree (iterparse)', 'aiofiles'], role: 'Chunked HLS delivery, AES-CTR streaming decryption, ONIX 3.0 SAX parser', difficulty: 'Advanced' },
  { name: 'Go (Golang)', category: 'Media & API', capstones: [1, 3], libraries: ['net/http', 'io.Pipe', 'go-redis/v9', 'goroutines'], role: 'Zero-copy HLS streaming daemon, sub-50ms edge cache invalidator', difficulty: 'Advanced' },
  { name: 'Rust', category: 'Systems & Crypto', capstones: [1, 3], libraries: ['tokio', 'tokio-process', 'ffmpeg-next', 'ring'], role: 'Multi-threaded FFmpeg transcode worker, memory-safe cryptographic packaging', difficulty: 'Senior' },
  { name: 'C++', category: 'Systems & Crypto', capstones: [1, 4], libraries: ['libavcodec', 'libavformat', 'std::thread', 'POSIX'], role: 'Raw audio frame segmenter, zero-copy high-performance LRU byte cache', difficulty: 'Senior' },
  { name: 'C', category: 'Embedded', capstones: [4], libraries: ['POSIX unistd.h', 'sys/mman.h', 'CRC32', 'pwrite'], role: 'Embedded zero-copy LRU byte cache with atomic chunk writes and bit-rot checks', difficulty: 'Expert' },
  { name: 'Java', category: 'Enterprise Ledger', capstones: [2], libraries: ['Spring Boot 3', 'Spring Data JPA', 'HikariCP', 'Jakarta Persistence'], role: 'ACID transaction boundaries, Repeatable Read isolation, pessimistic row locks', difficulty: 'Senior' },
  { name: 'C# (.NET Core)', category: 'Enterprise Ledger', capstones: [2], libraries: ['ASP.NET Core', 'Entity Framework Core', 'Npgsql'], role: 'Enterprise inventory ledger, idempotent token validator, row-level locking', difficulty: 'Senior' },
  { name: 'Kotlin', category: 'Enterprise Ledger', capstones: [2, 4], libraries: ['Kotlinx Coroutines', 'Ktor / Spring', 'Android MediaSessionService'], role: 'Reactive hold-queue state machine, Android foreground audio service', difficulty: 'Advanced' },
  { name: 'TypeScript', category: 'Media & API', capstones: [2], libraries: ['Node.js', 'ioredis', 'bullmq', 'Web Audio API'], role: 'Redis Sorted Sets waitlist broker, interactive audio synthesis engine', difficulty: 'Advanced' },
  { name: 'JavaScript', category: 'Media & API', capstones: [1, 2], libraries: ['Web Audio API', 'Web Crypto API', 'Fetch Streams'], role: 'Client-side chunk decryption, audio buffer gauges, adaptive bitrate UI', difficulty: 'Advanced' },
  { name: 'Dart / Flutter', category: 'Embedded', capstones: [4], libraries: ['audio_service', 'just_audio', 'flutter/services'], role: 'Cross-platform background audio service surviving OS low-memory termination', difficulty: 'Advanced' },
  { name: 'Bash / Shell', category: 'Systems & Crypto', capstones: [1], libraries: ['openssl', 'sha256sum', 'shred', 'coreutils'], role: 'Automated AES-256 envelope encryption pipeline for cloud object storage', difficulty: 'Advanced' },
  { name: 'PowerShell', category: 'Systems & Crypto', capstones: [1], libraries: ['Get-FileHash', 'openssl.exe', 'System.Security.Cryptography'], role: 'Windows Server object storage cryptographic packaging and verification', difficulty: 'Advanced' },
  { name: 'SQL (PostgreSQL)', category: 'Enterprise Ledger', capstones: [2], libraries: ['PL/pgSQL', 'SELECT ... FOR UPDATE', 'Row-Level Security (RLS)'], role: 'Strict transaction isolation levels, row locks, anti-double-booking constraints', difficulty: 'Senior' },
  { name: 'R', category: 'ETL & Analytics', capstones: [3], libraries: ['stats (lm)', 'ggplot2', 'forecast'], role: 'Log-log demand elasticity regression, dynamic flash-sale boundary optimizer', difficulty: 'Senior' },
  { name: 'MATLAB', category: 'ETL & Analytics', capstones: [3], libraries: ['Optimization Toolbox', 'Econometrics Toolbox'], role: 'Non-linear royalty boundary solver, algorithmic dynamic bidding curves', difficulty: 'Senior' },
  { name: 'Scala', category: 'ETL & Analytics', capstones: [3], libraries: ['Akka / Apache Pekko Streams', 'Alpakka Kafka'], role: 'High-throughput publisher catalog streaming ingestion and backpressure queue', difficulty: 'Senior' },
  { name: 'Ruby', category: 'ETL & Analytics', capstones: [3], libraries: ['Nokogiri (SAX)', 'Sidekiq', 'redis'], role: 'Memory-safe SAX parser for multi-gigabyte ONIX feeds with Dead-Letter Queues', difficulty: 'Advanced' },
  { name: 'PHP', category: 'ETL & Analytics', capstones: [3], libraries: ['PHP 8.3 Fibers', 'XMLReader', 'Swoole / RoadRunner'], role: 'Streaming pull-parser for publisher XML feeds with batch upsert pipelines', difficulty: 'Advanced' },
  { name: 'Assembly / COBOL', category: 'Embedded', capstones: [4], libraries: ['x86_64 SIMD / Fixed records', 'File Section OCCURS'], role: 'Fixed-size raw memory block mapping, byte manipulation on legacy architectures', difficulty: 'Expert' },
];

export const TechnologyMatrix: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCapstone, setSelectedCapstone] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLangs = ALL_LANGUAGES.filter(item => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (selectedCapstone !== 'ALL' && !item.capstones.includes(selectedCapstone)) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) && !item.role.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Curriculum Matrix
            </span>
            <span className="text-xs text-slate-400 font-mono">20+ Production Languages Covered</span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">Student Technology Matrix & Track Specializations</h3>
          <p className="text-xs text-slate-400">
            Filtered by architecture domain, capstone project alignment, and systems difficulty level.
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Filter language or role..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 w-full lg:w-64 focus:outline-none focus:border-amber-500 font-mono"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['ALL', 'Media & API', 'Systems & Crypto', 'Enterprise Ledger', 'ETL & Analytics', 'Embedded'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedCategory === cat
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}

        <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

        {[
          { id: 'ALL', label: 'All Projects' },
          { id: 1, label: 'Proj 1: Streaming' },
          { id: 2, label: 'Proj 2: Concurrency' },
          { id: 3, label: 'Proj 3: ETL & Pricing' },
          { id: 4, label: 'Proj 4: Embedded' },
        ].map(cap => (
          <button
            key={cap.id}
            onClick={() => setSelectedCapstone(cap.id as number | 'ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
              selectedCapstone === cap.id
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cap.label}
          </button>
        ))}
      </div>

      {/* Grid of Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLangs.map(tech => (
          <div
            key={tech.name}
            className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-white flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-amber-400" />
                  {tech.name}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  tech.difficulty === 'Expert'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                    : tech.difficulty === 'Senior'
                    ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {tech.difficulty}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-2.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                  {tech.category}
                </span>
                {tech.capstones.map(c => (
                  <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 font-mono">
                    Proj {c}
                  </span>
                ))}
              </div>

              <p className="text-xs text-slate-300 leading-snug mb-3 font-sans">
                {tech.role}
              </p>
            </div>

            <div className="pt-2.5 border-t border-slate-900">
              <span className="text-[10px] text-slate-500 font-mono block mb-1">Key Ecosystem Libraries:</span>
              <div className="flex flex-wrap gap-1">
                {tech.libraries.map(lib => (
                  <code key={lib} className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-amber-400/90 font-mono border border-slate-800">
                    {lib}
                  </code>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
