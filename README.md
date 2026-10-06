# KayBiT_Audiobooks: Advanced Capstone Projects & Interactive Digital Audio Ecosystem

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/kaybit/audiobooks)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Android%20%7C%20iOS%20%7C%20Desktop-blue.svg)](INSTALLATION.md)
[![Languages](https://img.shields.io/badge/languages-20%2B%20Languages%20Supported-orange.svg)](#supported-technologies)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

KayBiT_Audiobooks is a comprehensive, production-grade pedagogical platform and laboratory suite engineered for advanced computer science students, software engineers, and system architects. Inspired by the engineering architectures of **Spotify, Libro.fm, Libby, Hoopla, Chirp, Everand, and LibriVox**, it bridges complex systems programming with distributed enterprise patterns.

---

## Architectural Capstones

### 🎧 Project 1: Micro-Streaming Architecture & DRM Engine
- **Inspiration:** Spotify & Libro.fm (Subscription & DRM-Free Ownership Frameworks)
- **Challenge:** Low-latency chunked adaptive bitrate streaming and secure automated packaging for DRM-free assets without loading entire files into server memory.
- **Components:**
  - **Streaming Engine:** Python (FastAPI) or Go with chunked byte-range delivery and HLS manifest generation (`.m3u8`).
  - **Media Transcoder:** Rust or C++ multi-threaded daemon orchestrating FFmpeg for 64k/128k/320k fragmenting and ID3v2 tag injection.
  - **Storage Cryptography:** Bash and PowerShell scripts using AES-256 envelope encryption.

### 📚 Project 2: Distributed Concurrency & Inventory Ledger
- **Inspiration:** Libby & Hoopla (Library Checkouts, Hold Queues, & Concurrent Licenses)
- **Challenge:** Transactional synchronization across race-condition-prone checkout systems when a finite number of digital book copies exist.
- **Components:**
  - **Licensing Ledger:** Java (Spring Boot) or C# (.NET Core) enforcing ACID transactions, idempotency keys, and zero double-booking under load spikes.
  - **Dynamic Hold-Queue:** TypeScript (Node.js) or Kotlin reactive message queue utilizing Redis Sorted Sets and Kafka for rolling waitlists.
  - **Database Isolation:** PostgreSQL SQL utilizing Row-Level Security (RLS) and pessimistic locking (`SELECT ... FOR UPDATE`).

### ⚡ Project 3: Serverless Dynamic Bidding & Promotional Ingestion System
- **Inspiration:** Chirp & Everand (Flash Sales, Dynamic Pricing, & Multi-Publisher Feeds)
- **Challenge:** Event-driven big-data ETL engine parsing multi-gigabyte publisher catalogs, applying statistical price curves, and invalidating edge caches globally.
- **Components:**
  - **Feed Parser:** Python, Ruby, or PHP memory-efficient streaming XML/JSON parser for ONIX 3.0 records with dead-letter queue isolation.
  - **Cache Invalidation:** Go, Rust, or Scala pub/sub layer purging edge caches in under 50 milliseconds.
  - **Pricing Optimization:** R and MATLAB statistical microservices calculating optimal discount boundaries using demand elasticity models.

### 📱 Project 4: Ultra-Low Overhead Offline Audio Player & Embedded Engine
- **Inspiration:** LibriVox (Public Domain Audio & Legacy/Low-Resource Devices)
- **Challenge:** Systems-level engineering for efficient local caching, binary manipulation, and background process survival on low-powered devices.
- **Components:**
  - **Runtime Bridge:** Dart (Flutter), Kotlin, or Swift audio services interfacing with OS hardware layers, wake locks, and media sessions.
  - **Memory Cache:** C, C++, or Assembly/COBOL fixed-size LRU binary byte cache with POSIX file descriptors, atomic chunk writes, and CRC32/SHA-256 verification.

---

## Supported Technologies Matrix

| Programming Language | Capstone Focus | Specific Assignment Modules |
| :--- | :--- | :--- |
| **Python** | Project 1 & 3 | FastAPI Chunked Streamer, ONIX 3.0 SAX Parser |
| **Go (Golang)** | Project 1 & 3 | HLS Segment Delivery Engine, Edge Cache Pub/Sub Invalidator |
| **Rust** | Project 1 & 3 | Multi-threaded FFmpeg Transcoder, Zero-Copy Ingestion |
| **C++** | Project 1 & 4 | Media Segmenter Daemon, Fast Binary LRU Cache |
| **C** | Project 4 | Kernel-level POSIX `mmap` LRU Byte Cache & Checksum Engine |
| **Java** | Project 2 | Spring Boot ACID Inventory Ledger, Pessimistic Row Locking |
| **C# (.NET Core)** | Project 2 | Enterprise Entity Framework Ledger & Idempotent Transactions |
| **Kotlin** | Project 2 & 4 | Reactive Hold-Queue State Machine, Android MediaSessionService |
| **TypeScript / JS** | Project 2 | Redis Sorted Set Waitlist Broker, Web Audio Interactive Engine |
| **Dart / Flutter** | Project 4 | Native Hardware Background Audio Service Bridge |
| **Bash / Shell** | Project 1 | S3 Automated AES-256-CBC Envelope Encryption Pipeline |
| **PowerShell** | Project 1 | Windows Server Object Storage Cryptographic Packaging |
| **SQL (PostgreSQL)** | Project 2 | RLS Policies, Transaction Isolation Levels, `SELECT ... FOR UPDATE` |
| **R** | Project 3 | Promotional Demand Elasticity & Price Dip Optimization |
| **MATLAB** | Project 3 | Algorithmic Dynamic Bidding Boundaries & Royalties Matrix |
| **Scala** | Project 3 | Akka/Pekko Stream Ingestion & Edge Cache Invalidation |
| **Ruby** | Project 3 | Resilient Nokogiri Streaming Parser with Dead-Letter Queues |
| **PHP** | Project 3 | Modern PHP 8.3 Fiber/Coroutine Feed Ingestion Engine |
| **COBOL / Assembly**| Project 4 | Fixed-size memory block mapper & low-level byte manipulator |

---

## Internationalization & Accessibility (22 Languages + TTS)
KayBiT_Audiobooks includes full documentation and interactive audio assistance translated into **22 languages**:
1. English (US)
2. French (Français)
3. German (Deutsch)
4. Italian (Italiano)
5. Spanish (Español)
6. Portuguese (Português)
7. Indonesian (Bahasa Indonesia)
8. Swahili (Kiswahili)
9. Turkish (Türkçe)
10. Russian (Русский)
11. Chinese (简体中文)
12. Japanese (日本語)
13. Arabic (العربية - RTL)
14. Urdu (اردو - RTL)
15. Hindi (हिन्दी)
16. Vietnamese (Tiếng Việt)
17. Korean (한국어)
18. Farsi/Persian (فارسی - RTL)
19. Marathi (मराठी)
20. Bangla/Bengali (বাংলা)
21. Tamil (தமிழ்)
22. Telugu (తెలుగు)

Each language guide includes native browser Text-to-Speech (`window.speechSynthesis`) support with playback, pause, stop, speed modulation, and voice selection.

---

## Native Installation
See [INSTALLATION.md](INSTALLATION.md) for complete instructions to build:
- **Android:** `.apk` and Google Play `.aab` (Capacitor)
- **iOS:** PWA standalone and `.ipa` (Xcode/Capacitor)
- **Windows:** `.exe` and `.msi` (Tauri / Electron)
- **macOS:** `.dmg` (Universal binary for Intel & Apple Silicon)

---

## License
MIT License. Created for advanced engineering curricula and distributed systems pedagogy.
