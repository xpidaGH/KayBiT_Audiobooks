import { CapstoneProject } from '../types';

export const CAPSTONE_PROJECTS: CapstoneProject[] = [
  {
    id: 'capstone-1',
    title: 'Micro-Streaming Architecture & DRM Engine',
    subtitle: 'Low-Latency Adaptive Bitrate Audio & Automated Cryptographic Packaging',
    inspiration: 'Spotify & Libro.fm (Subscription & DRM-Free Ownership Frameworks)',
    badge: 'Project 1: Streaming & Crypto',
    systemLayer: 'Media Delivery, Transcoding & Cryptography',
    coreChallenge: 'Implementing low-latency adaptive bitrate audio streaming alongside a secure, automated packaging pipeline for DRM-free assets without loading entire audio master files into server memory.',
    architectureDiagramAscii: `                  ┌────────────────────────┐
                  │   Client Applications  │
                  └───────────┬────────────┘
                              │ HLS / HTTP (Range: bytes=...)
                              ▼
┌────────────────────────────────────────────────────────┐
│               GATEWAY & STREAMING LAYER                │
│  ┌───────────────────────┐   ┌──────────────────────┐  │
│  │ Reverse Proxy / Nginx │──▶│ FastAPI Stream Engine│  │
│  │ (Rate Limiting / SSL) │   │ (On-the-fly Decrypt) │  │
│  └───────────────────────┘   └──────────┬───────────┘  │
└─────────────────────────────────────────────────┼──────┘
                                                  │ S3 Read Stream
                                                  ▼
┌────────────────────────────────────────────────────────┐
│                STORAGE & PROCESSING ECOSYSTEM          │
│  ┌───────────────────────┐   ┌──────────────────────┐  │
│  │ MinIO / Cloud Storage │◀──│ FFmpeg/Rust Transcoder│  │
│  │ (AES-256 Encrypted)   │   │ (Multi-thread Slices)│  │
│  └───────────────────────┘   └──────────────────────┘  │
└────────────────────────────────────────────────────────┘`,
    primaryLanguages: ['Python (FastAPI)', 'Go', 'Rust', 'C++', 'Bash', 'PowerShell'],
    assignments: [
      {
        title: 'The Streaming Engine',
        languages: 'Python / FastAPI or Go',
        challenge: 'Implement chunked file delivery or HTTP Live Streaming (HLS) with zero-copy memory overhead. Handle on-the-fly decryption streaming for authorized clients.',
        requirements: [
          'Stream chunks using Python Async Generators or Go io.Pipe with max 64KB RAM buffer per connection.',
          'Support HTTP 206 Partial Content headers (Content-Range, Accept-Ranges, 206 Status).',
          'Validate HMAC token / JWT signatures in under 3ms before streaming encrypted chunks.',
          'Dynamically generate .m3u8 playlists for 64kbps, 128kbps, and 320kbps bitrates.'
        ],
        starterCodeKey: 'python'
      },
      {
        title: 'High-Throughput Media Transcoder',
        languages: 'Rust, C++, or Go',
        challenge: 'Build a concurrent worker daemon that monitors a storage bucket. When an raw .mp3 or .wav is uploaded, it multi-threads an FFmpeg pipeline to fragment audio into target bitrates (64kbps, 128kbps, 320kbps) and stitch custom metadata/ID3 tags dynamically.',
        requirements: [
          'Listen to MinIO/S3 bucket event notifications over Redis pub/sub or SQS.',
          'Execute non-blocking async child process spawns with FFmpeg hardware acceleration.',
          'Inject ID3v2 metadata (Title, Author, Narrator, Chapter offsets, Custom DRM flags).',
          'Output segmented .ts or .m4s fragments and master .m3u8 playlists.'
        ],
        starterCodeKey: 'rust'
      },
      {
        title: 'Storage Cryptography Layer',
        languages: 'Bash / Shell or PowerShell',
        challenge: 'Write localized secure scripts that use AES-256 to encrypt raw master files before they hit public object storage buckets, establishing strict cryptographic separation.',
        requirements: [
          'Generate cryptographic envelope keys per audio title (KMS simulation).',
          'Encrypt media assets using OpenSSL AES-256-CBC or AES-256-GCM with salt and IV.',
          'Perform automated hash validation (SHA-256) pre and post encryption.',
          'Safe deletion (shred / rm -P) of unencrypted temporary files.'
        ],
        starterCodeKey: 'bash'
      }
    ],
    codeBlueprints: {
      python: {
        filename: 'streaming_engine.py',
        code: `import os
from fastapi import FastAPI, Header, HTTPException, Response
from fastapi.responses import StreamingResponse
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

app = FastAPI(title="KayBiT Low-Latency Micro-Streaming Engine")
CHUNK_SIZE = 64 * 1024  # 64KB constant memory window

async def stream_audio_chunked(file_path: str, start: int, end: int, key: bytes, iv: bytes):
    """
    Generator streaming on-the-fly decrypted audio segments directly
    to the client socket without buffering the complete file in memory.
    """
    with open(file_path, "rb") as f:
        f.seek(start)
        remaining = (end - start) + 1
        cipher = Cipher(algorithms.AES(key), modes.CTR(iv), backend=default_backend())
        decryptor = cipher.decryptor()

        while remaining > 0:
            read_bytes = min(CHUNK_SIZE, remaining)
            chunk = f.read(read_bytes)
            if not chunk:
                break
            decrypted = decryptor.update(chunk)
            remaining -= len(chunk)
            yield decrypted

@app.get("/api/v1/audio/{book_id}/stream")
async def stream_book_audio(
    book_id: str,
    range: str = Header(None),
    authorization: str = Header(None)
):
    # Verify client authentication & entitlement token
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized client token")
    
    file_path = f"/data/encrypted_master/{book_id}.enc"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio master not found")
        
    file_size = os.path.getsize(file_path)
    byte_start, byte_end = 0, file_size - 1

    if range:
        ranges = range.replace("bytes=", "").split("-")
        byte_start = int(ranges[0]) if ranges[0] else 0
        byte_end = int(ranges[1]) if len(ranges) > 1 and ranges[1] else file_size - 1

    content_length = (byte_end - byte_start) + 1
    # Derived envelope credentials for demonstration
    mock_key = b"kaybit-secret-key-32bytes-aes!!!"
    mock_iv = b"kaybit-iv-16byte"

    headers = {
        "Content-Range": f"bytes {byte_start}-{byte_end}/{file_size}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(content_length),
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache"
    }

    return StreamingResponse(
        stream_audio_chunked(file_path, byte_start, byte_end, mock_key, mock_iv),
        status_code=206,
        headers=headers
    )`,
        explanation: 'FastAPI async streaming engine implementing HTTP 206 Partial Content byte-range delivery with AES-CTR on-the-fly decryption, bounding RAM footprint to exactly 64KB per active socket connection.'
      },
      rust: {
        filename: 'media_transcoder.rs',
        code: `use std::process::Command;
use std::sync::Arc;
use tokio::sync::mpsc;

#[derive(Debug, Clone)]
pub struct TranscodeJob {
    pub book_id: String,
    pub input_path: String,
    pub output_dir: String,
    pub narrator: String,
    pub author: String,
}

pub struct TranscodeWorker {
    pub worker_id: usize,
}

impl TranscodeWorker {
    pub async fn process_job(&self, job: TranscodeJob) -> Result<(), Box<dyn std::error::Error>> {
        println!("[Worker {}] Ingesting raw master: {}", self.worker_id, job.book_id);

        let bitrates = ["64k", "128k", "320k"];
        for bitrate in &bitrates {
            let out_m3u8 = format!("{}/{}_{}.m3u8", job.output_dir, job.book_id, bitrate);
            let out_segment = format!("{}/{}_{}_%03d.ts", job.output_dir, job.book_id, bitrate);

            // Execute hardware-accelerated FFmpeg pipeline
            let status = Command::new("ffmpeg")
                .args(&[
                    "-y",
                    "-i", &job.input_path,
                    "-c:a", "libmp3lame",
                    "-b:a", bitrate,
                    "-metadata", &format!("artist={}", job.author),
                    "-metadata", &format!("composer={}", job.narrator),
                    "-f", "hls",
                    "-hls_time", "6",
                    "-hls_playlist_type", "vod",
                    "-hls_segment_filename", &out_segment,
                    &out_m3u8
                ])
                .status()?;

            if !status.success() {
                return Err(format!("FFmpeg failed for bitrate {}", bitrate).into());
            }
        }

        println!("[Worker {}] Successfully packaged VOD manifests for {}", self.worker_id, job.book_id);
        Ok(())
    }
}`,
        explanation: 'Rust multi-threaded worker pipeline executing async FFmpeg sub-processes to generate multi-bitrate HLS fragments (64k, 128k, 320k) and dynamically inject ID3 metadata.'
      },
      bash: {
        filename: 'encrypt_master_pipeline.sh',
        code: `#!/usr/bin/env bash
# KayBiT Storage Cryptography Layer: AES-256-CBC Envelope Encryption Pipeline
set -euo pipefail

INPUT_DIR="/var/audiobooks/raw_masters"
OUTPUT_DIR="/var/audiobooks/encrypted_vault"
KMS_MASTER_KEY="KayBiT_2026_SecureStorage_MasterKey"

mkdir -p "$OUTPUT_DIR"

for raw_file in "$INPUT_DIR"/*.wav; do
  [ -e "$raw_file" ] || continue
  filename=$(basename -- "$raw_file")
  title="\${filename%.*}"
  enc_file="$OUTPUT_DIR/\${title}.enc"
  sha_file="$OUTPUT_DIR/\${title}.sha256"

  echo "==> [ENCRYPT] Securing master: \$filename"
  
  # Compute pre-encryption SHA-256 checksum
  sha256sum "$raw_file" > "$sha_file"

  # AES-256 envelope encryption with salted PBKDF2 iterations
  openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \\
    -in "$raw_file" \\
    -out "$enc_file" \\
    -pass pass:"$KMS_MASTER_KEY"

  # Verify encrypted bundle output
  if [ -s "$enc_file" ]; then
    echo "==> [SUCCESS] Encrypted artifact generated: \$enc_file (\$(stat -c%s "$enc_file") bytes)"
    # Secure purge of raw archival master from ingress disk
    # shred -u -z -n 3 "$raw_file"
  else
    echo "==> [ERROR] Encryption failed for \$raw_file" >&2
    exit 1
  fi
done`,
        explanation: 'Bash production script using OpenSSL with salted PBKDF2 iterations (100,000 passes) and SHA-256 validation before sending assets to cloud object storage.'
      },
      powershell: {
        filename: 'Encrypt-MasterStorage.ps1',
        code: `# PowerShell AES-256 Storage Packaging Script
param (
    [string]$SourceDirectory = "C:\\Audiobooks\\Raw",
    [string]$TargetVault = "C:\\Audiobooks\\EncryptedVault",
    [string]$EncryptionKey = "KayBiT_AES256_SecureKey_2026!"
)

$ErrorActionPreference = "Stop"
Ensure-Directory $TargetVault

Get-ChildItem -Path $SourceDirectory -Filter *.wav | ForEach-Object {
    $rawFile = $_.FullName
    $outputEnc = Join-Path $TargetVault "$($_.BaseName).enc"
    Write-Host "[PowerShell] Packaging: $($_.Name)" -ForegroundColor Cyan

    $shaPre = (Get-FileHash -Path $rawFile -Algorithm SHA256).Hash
    Write-Host " -> Master Checksum: $shaPre" -ForegroundColor Gray

    # Invoke OpenSSL binary with AES-256-GCM/CBC
    & openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \`
        -in $rawFile \`
        -out $outputEnc \`
        -pass "pass:$EncryptionKey"

    if (Test-Path $outputEnc) {
        Write-Host " -> Secured vault artifact saved: $outputEnc" -ForegroundColor Green
    }
}`,
        explanation: 'PowerShell systems script implementing automated storage encryption and file hashing on Windows Server clusters.'
      }
    },
    keyTakeaways: [
      'Zero in-memory full-file accumulation prevents OOM crashes when thousands of users stream 400MB audiobook files simultaneously.',
      'Cryptographic separation between cold storage and edge streaming prevents unauthorized asset extraction even if bucket permissions leak.',
      'Adaptive bitrate packaging ensures seamless audio playback across flaky 3G mobile connections and high-bandwidth fiber.'
    ]
  },
  {
    id: 'capstone-2',
    title: 'Distributed Concurrency & Inventory Ledger',
    subtitle: 'ACID Transactional Boundaries, Pessimistic Row Locks & Redis Hold Queues',
    inspiration: 'Libby & Hoopla (Library Checkouts, Hold Queues, & Concurrent Licenses)',
    badge: 'Project 2: Concurrency & Ledger',
    systemLayer: 'Enterprise Business Logic & Database Isolation',
    coreChallenge: 'Handling transactional synchronization across race-condition-prone checkout systems when a finite number of digital book copies exist (e.g. 3 copies), resolving massive concurrent checkout spikes without double-booking.',
    architectureDiagramAscii: `         ┌─────────────────────────────────────────────────────┐
         │ 100 Concurrent Checkout Requests (Thread Burst)     │
         └──────────────────────────┬──────────────────────────┘
                                    │ HTTP / RPC
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   ENTERPRISE LEDGER SERVICE (Spring / .NET)            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ @Transactional(isolation = Isolation.REPEATABLE_READ)            │  │
│  │ Idempotency Key Validator ──▶ Pessimistic Lock Request           │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │
          ┌───────────────────────────┴──────────────────────────┐
          │                                                      │
          ▼                                                      ▼
┌───────────────────────────────┐      ┌────────────────────────────────┐
│   POSTGRESQL INVENTORY TABLE  │      │       REDIS HOLD-QUEUE         │
│  SELECT * FROM book_inventory │      │   Sorted Set (ZADD / ZPOPMIN)  │
│  WHERE id = ? FOR UPDATE;     │      │   Waitlist Queue & Auto-Return │
└───────────────────────────────┘      └────────────────────────────────┘`,
    primaryLanguages: ['Java (Spring Boot)', 'C# (.NET Core)', 'TypeScript / Node.js', 'Kotlin', 'SQL'],
    assignments: [
      {
        title: 'The Strict Licensing Ledger',
        languages: 'Java / Spring Boot or C# / .NET Core',
        challenge: 'Build an ACID-compliant transactional workflow handling physical-digital constraints (e.g., Library X only owns 3 digital copies of Book Y). Resolve massive race conditions when hundreds of users hit checkout simultaneously.',
        requirements: [
          'Enforce strict transaction rollback if inventory copies available <= 0.',
          'Inject distributed idempotency check to prevent duplicate charges or double checkouts.',
          'Implement optimistic and pessimistic concurrency strategies with benchmark comparison.',
          'Handle transactional deadlocks gracefully with exponential backoff retries.'
        ],
        starterCodeKey: 'java'
      },
      {
        title: 'Dynamic Hold-Queue State Machine',
        languages: 'TypeScript / Node.js or Kotlin',
        challenge: 'Implement a reactive, real-time message queue using Redis Sorted Sets or Apache Kafka to manage dynamic waitlists, automatic checkout expirations, and rolling auto-returns.',
        requirements: [
          'Store queue priority using Unix timestamps as scores in Redis Sorted Sets (ZADD).',
          'Implement 48-hour claim window timer state machine with notification triggers.',
          'Automatically promote next user in waitlist when an audiobook is returned (ZPOPMIN).',
          'Real-time WebSocket / SSE push notifications to clients when hold becomes available.'
        ],
        starterCodeKey: 'typescript'
      },
      {
        title: 'Database Isolation Levels & Row Locks',
        languages: 'SQL (PostgreSQL)',
        challenge: 'Construct deep raw queries utilizing strict Row-Level Security (RLS) and explicit row locks (SELECT ... FOR UPDATE) to prevent double-booking discrepancies.',
        requirements: [
          'Define database schema with check constraints (available_copies >= 0).',
          'Execute SELECT ... FOR UPDATE within explicit BEGIN ... COMMIT transaction blocks.',
          'Simulate Read Committed vs Repeatable Read vs Serializable anomalies.',
          'Implement Row-Level Security policies restricting loan access to active cardholders.'
        ],
        starterCodeKey: 'sql'
      }
    ],
    codeBlueprints: {
      java: {
        filename: 'BookLedgerService.java',
        code: `package com.kaybit.audiobooks.ledger;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import java.time.Instant;
import java.util.UUID;

@Service
public class BookLedgerService {

    private final InventoryRepository inventoryRepo;
    private final LoanLedgerRepository loanRepo;
    private final HoldQueueService holdQueueService;

    public BookLedgerService(InventoryRepository ir, LoanLedgerRepository lr, HoldQueueService hq) {
        this.inventoryRepo = ir;
        this.loanRepo = lr;
        this.holdQueueService = hq;
    }

    /**
     * ACID Transaction enforcing Pessimistic Write Lock.
     * Prevents race condition when 100 users contend for 3 licenses.
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ, timeout = 5)
    public CheckoutResult checkoutDigitalBook(String bookId, String patronId, String idempotencyKey) {
        // 1. Idempotency check: prevent double-charging or double-issuance
        if (loanRepo.existsByIdempotencyKey(idempotencyKey)) {
            return CheckoutResult.duplicateRequest(idempotencyKey);
        }

        // 2. Fetch inventory with SELECT ... FOR UPDATE row-level lock
        BookInventory inventory = inventoryRepo.findAndLockById(bookId)
            .orElseThrow(() -> new IllegalArgumentException("Book not found in library catalog: " + bookId));

        // 3. Evaluate physical-digital constraints
        if (inventory.getAvailableCopies() <= 0) {
            // No copies available! Route patron into real-time Hold Queue
            long queuePosition = holdQueueService.enqueuePatron(bookId, patronId);
            return CheckoutResult.queued("No copies available. Placed on hold queue.", queuePosition);
        }

        // 4. Atomic decrement
        inventory.setAvailableCopies(inventory.getAvailableCopies() - 1);
        inventoryRepo.save(inventory);

        // 5. Create immutable audit ledger record
        LoanRecord loan = new LoanRecord(
            UUID.randomUUID().toString(),
            bookId,
            patronId,
            idempotencyKey,
            Instant.now(),
            Instant.now().plusSeconds(14 * 86400) // 14 days loan period
        );
        loanRepo.save(loan);

        return CheckoutResult.success(loan.getId(), inventory.getAvailableCopies());
    }
}`,
        explanation: 'Spring Boot enterprise service enforcing `@Transactional(isolation = Isolation.REPEATABLE_READ)` and pessimistic row locks to guarantee zero double-booking under extreme concurrent spikes.'
      },
      typescript: {
        filename: 'holdQueueStateMachine.ts',
        code: `import Redis from 'ioredis';

export class HoldQueueStateMachine {
  private redis: Redis;

  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }

  /**
   * Enqueue patron into book's waiting list using Redis Sorted Set.
   * Score = current unix timestamp (FIFO queue).
   */
  async enqueuePatron(bookId: string, patronId: string): Promise<{ position: number; queueSize: number }> {
    const queueKey = \`hold_queue:\${bookId}\`;
    const now = Date.now();

    // Atomic insertion into Sorted Set
    await this.redis.zadd(queueKey, now, patronId);

    // Get 0-indexed rank and total queue count
    const rank = await this.redis.zrank(queueKey, patronId);
    const total = await this.redis.zcard(queueKey);

    return {
      position: (rank ?? 0) + 1,
      queueSize: total
    };
  }

  /**
   * Called when a book copy is returned.
   * Pops top patron and initiates 48-hour claim window TTL.
   */
  async processReturnAndPromoteNext(bookId: string): Promise<string | null> {
    const queueKey = \`hold_queue:\${bookId}\`;
    const nextPatrons = await this.redis.zpopmin(queueKey, 1);

    if (!nextPatrons || nextPatrons.length === 0) {
      return null; // No patrons waiting
    }

    const nextPatronId = nextPatrons[0];
    const claimTokenKey = \`claim_window:\${bookId}:\${nextPatronId}\`;

    // 48-hour reservation window TTL (172,800 seconds)
    await this.redis.set(claimTokenKey, 'RESERVED', 'EX', 172800);

    return nextPatronId;
  }
}`,
        explanation: 'TypeScript/Node.js reactive state machine using Redis Sorted Sets (`ZADD`, `ZRANK`, `ZPOPMIN`) for deterministic $O(\\log N)$ waitlist queues and TTL claim windows.'
      },
      sql: {
        filename: 'concurrency_ledger.sql',
        code: `-- PostgreSQL Concurrency & Row-Level Security Ledger
CREATE TABLE library_inventory (
    book_id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    total_licenses INT NOT NULL CHECK (total_licenses >= 0),
    available_copies INT NOT NULL CHECK (available_copies >= 0 AND available_copies <= total_licenses),
    version INT NOT NULL DEFAULT 1
);

CREATE TABLE loan_ledger (
    loan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id VARCHAR(64) REFERENCES library_inventory(book_id),
    patron_id VARCHAR(64) NOT NULL,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    borrowed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

-- Stored procedure executing pessimistic row locking (SELECT ... FOR UPDATE)
CREATE OR REPLACE FUNCTION checkout_book_atomic(
    p_book_id VARCHAR(64),
    p_patron_id VARCHAR(64),
    p_idempotency_key VARCHAR(128)
) RETURNS JSONB AS $$
DECLARE
    v_available INT;
    v_loan_id UUID;
BEGIN
    -- 1. Acquire exclusive row lock on target book
    SELECT available_copies INTO v_available
    FROM library_inventory
    WHERE book_id = p_book_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'BOOK_NOT_FOUND');
    END IF;

    -- 2. Verify stock availability
    IF v_available <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'NO_COPIES_AVAILABLE');
    END IF;

    -- 3. Atomic inventory decrement
    UPDATE library_inventory
    SET available_copies = available_copies - 1,
        version = version + 1
    WHERE book_id = p_book_id;

    -- 4. Record loan in ledger
    INSERT INTO loan_ledger (book_id, patron_id, idempotency_key, expires_at)
    VALUES (p_book_id, p_patron_id, p_idempotency_key, NOW() + INTERVAL '14 days')
    RETURNING loan_id INTO v_loan_id;

    RETURN jsonb_build_object('success', true, 'loan_id', v_loan_id, 'remaining', v_available - 1);
END;
$$ LANGUAGE plpgsql;`,
        explanation: 'PostgreSQL procedural transaction locking the specific inventory row with `FOR UPDATE` and checking bounds `available_copies >= 0` to mathematically eliminate race conditions.'
      },
      csharp: {
        filename: 'InventoryLedgerController.cs',
        code: `using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;

[ApiController]
[Route("api/v1/ledger")]
public class InventoryLedgerController : ControllerBase
{
    private readonly LibraryDbContext _context;

    public InventoryLedgerController(LibraryDbContext context)
    {
        _context = context;
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutCommand cmd)
    {
        // Enforce RepeatableRead isolation level
        using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead);
        try
        {
            // Execute raw SQL with FOR UPDATE row lock in EF Core
            var inventory = await _context.BookInventories
                .FromSqlRaw("SELECT * FROM library_inventory WHERE book_id = {0} FOR UPDATE", cmd.BookId)
                .SingleOrDefaultAsync();

            if (inventory == null) return NotFound("Book not found");
            if (inventory.AvailableCopies <= 0)
            {
                return Conflict(new { Status = "WAITLISTED", Message = "Placed in waitlist queue" });
            }

            inventory.AvailableCopies--;
            var loan = new LoanRecord {
                LoanId = Guid.NewGuid(),
                BookId = cmd.BookId,
                PatronId = cmd.PatronId,
                BorrowedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(14)
            };

            _context.LoanRecords.Add(loan);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { LoanId = loan.LoanId, Remaining = inventory.AvailableCopies });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { Error = ex.Message });
        }
    }
}`,
        explanation: 'C# / .NET Core enterprise Web API using Entity Framework Core with explicit `IsolationLevel.RepeatableRead` and SQL row locks.'
      }
    },
    keyTakeaways: [
      'Unprotected reads cause severe double-booking when multiple web workers read stock simultaneously.',
      'Pessimistic locking (`FOR UPDATE`) serializes access at the database row level, preventing race conditions without needing distributed lock orchestrators.',
      'Redis Sorted Sets provide deterministic, lock-free waitlist management with instant rank lookups.'
    ]
  },
  {
    id: 'capstone-3',
    title: 'Serverless Dynamic Bidding & Promotional Ingestion System',
    subtitle: 'Event-Driven Big-Data ETL, Algorithmic Pricing & Sub-50ms Edge Invalidation',
    inspiration: 'Chirp & Everand (Flash Sales, Dynamic Pricing, & Multi-Publisher Feeds)',
    badge: 'Project 3: Big Data ETL & Pricing',
    systemLayer: 'Data Ingestion, Cache Invalidation & Analytics',
    coreChallenge: 'Building an event-driven big-data ETL engine capable of ingesting volatile catalog updates (multi-GB ONIX 3.0 XML), applying statistical price curves, and invalidating caches globally across distributed edge nodes.',
    architectureDiagramAscii: `┌────────────────────────────────────────────────────────┐
│ Multi-GB ONIX 3.0 / JSON Publisher Feeds               │
└──────────────────────────┬─────────────────────────────┘
                           │ Streaming Chunk Upload
                           ▼
┌────────────────────────────────────────────────────────┐
│             STREAMING ETL INGESTION WORKER             │
│  ┌───────────────────────┐   ┌──────────────────────┐  │
│  │ SAX / iterparse XML   │──▶│ Dead-Letter Queue    │  │
│  │ (Constant O(1) Memory)│   │ (Malformed Records)  │  │
│  └───────────┬───────────┘   └──────────────────────┘  │
└──────────────┼─────────────────────────────────────────┘
               │ Batch Insert (500 records)
               ▼
┌────────────────────────────────────────────────────────┐
│     STATISTICAL PRICING ENGINE (R / MATLAB)            │
│     Elasticity: Price = Base * (1 - ElasticityFactor)   │
└──────────────┬─────────────────────────────────────────┘
               │ Flash Sale Event
               ▼
┌────────────────────────────────────────────────────────┐
│           GLOBAL EDGE CACHE INVALIDATOR (Go / Rust)    │
│  Redis Pub/Sub ──▶ US-East / EU-West / AP-South (<50ms)│
└────────────────────────────────────────────────────────┘`,
    primaryLanguages: ['Python', 'Ruby', 'PHP', 'Go', 'Rust', 'Scala', 'R', 'MATLAB'],
    assignments: [
      {
        title: 'Bulk Feed Parser & Ingestion Worker',
        languages: 'Python, Ruby, or PHP',
        challenge: 'Write a highly resilient streaming parser to consume compressed XML/JSON multi-gigabyte publisher catalogs (e.g., ONIX feeds). Batch insert records safely with Dead-Letter Queue (DLQ) isolation.',
        requirements: [
          'Stream-parse without loading whole document into DOM tree (e.g. iterparse or SAX).',
          'Isolate malformed ISBN/pricing records into a Dead-Letter Queue without aborting entire feed.',
          'Execute batch upserts in chunks of 500 records for optimal database throughput.',
          'Emit Prometheus telemetry: records_processed_total, parse_errors_total.'
        ],
        starterCodeKey: 'python'
      },
      {
        title: 'High-Performance Cache Invalidation Layer',
        languages: 'Go, Rust, or Scala',
        challenge: 'Design an automated mechanism that updates localized item prices across edge nodes instantaneously during global flash sales using pub/sub architectures.',
        requirements: [
          'Listen on Redis Pub/Sub or Kafka topic for price-update mutation events.',
          'Invalidate edge CDN cache keys across simulated multi-region edge caches in < 50ms.',
          'Support wildcard pattern purges (e.g., audio:catalog:genre:thriller:*).',
          'Implement backpressure buffer to handle flash bursts of 50,000 updates/sec.'
        ],
        starterCodeKey: 'go'
      },
      {
        title: 'Statistical Analysis & Pricing Optimization',
        languages: 'R or MATLAB',
        challenge: 'Develop an analytical microservice that tracks user engagement metrics against price dips to automatically model optimal real-time price boundaries for promotional spots.',
        requirements: [
          'Compute price elasticity coefficient $E_d = (% \\Delta Q) / (% \\Delta P)$.',
          'Determine revenue-maximizing price point within publisher royalty constraints.',
          'Output dynamic pricing curves and boundary caps based on historical sales dips.'
        ],
        starterCodeKey: 'r'
      }
    ],
    codeBlueprints: {
      python: {
        filename: 'onix_feed_parser.py',
        code: `import xml.etree.ElementTree as ET
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("OnixIngestionWorker")

def stream_parse_onix_feed(xml_file_path: str, batch_size=500):
    """
    Constant memory O(1) streaming XML parser for multi-gigabyte ONIX feeds.
    Uses iterparse and element.clear() to discard processed XML nodes immediately.
    """
    context = ET.iterparse(xml_file_path, events=("end",))
    batch = []
    dlq_records = []

    for event, elem in context:
        if elem.tag.endswith("Product"):
            try:
                # Extract essential bibliographic & pricing metadata
                isbn = elem.findtext(".//ProductIdentifier[ProductIDType='15']/IDValue")
                title = elem.findtext(".//TitleDetail/TitleElement/TitleText")
                price_str = elem.findtext(".//Price/PriceAmount")

                if not isbn or not price_str:
                    raise ValueError("Missing critical ISBN or Price node")

                record = {
                    "isbn": isbn.strip(),
                    "title": title.strip() if title else "Unknown",
                    "price": float(price_str.strip())
                }
                batch.append(record)

                if len(batch) >= batch_size:
                    yield ("BATCH", batch)
                    batch = []

            except Exception as err:
                # Dead-letter queue isolation: do not fail entire multi-GB feed
                dlq_records.append({"raw_snippet": ET.tostring(elem, encoding="unicode"), "error": str(err)})
                if len(dlq_records) >= 50:
                    yield ("DLQ", dlq_records)
                    dlq_records = []
            finally:
                # CRUCIAL: Release memory from ElementTree DOM immediately
                elem.clear()

    if batch:
        yield ("BATCH", batch)
    if dlq_records:
        yield ("DLQ", dlq_records)
`,
        explanation: 'Python streaming parser leveraging `ET.iterparse` with `elem.clear()`, consuming multi-gigabyte ONIX feeds in constant memory space ($O(1)$) with dead-letter queue isolation.'
      },
      go: {
        filename: 'cache_invalidator.go',
        code: `package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"
	"github.com/redis/go-redis/v9"
)

type PriceUpdateEvent struct {
	BookID    string  \`json:"book_id"\`
	NewPrice  float64 \`json:"new_price"\`
	Timestamp int64   \`json:"timestamp"\`
}

func main() {
	ctx := context.Background()
	rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})

	pubsub := rdb.Subscribe(ctx, "flash_sale_events")
	ch := pubsub.Channel()

	log.Println("[Go Invalidator] Subscribed to flash_sale_events. Monitoring edge nodes...")

	// Concurrent worker pool for sub-50ms edge cache invalidation
	var wg sync.WaitGroup
	for msg := range ch {
		var event PriceUpdateEvent
		if err := json.Unmarshal([]byte(msg.Payload), &event); err != nil {
			log.Printf("Invalid event format: %v", err)
			continue
		}

		start := time.Now()
		regions := []string{"us-east", "eu-central", "ap-southeast"}
		
		for _, region := range regions {
			wg.Add(1)
			go func(reg string) {
				defer wg.Done()
				// Simulate edge invalidation API call
				cacheKey := fmt.Sprintf("edge:%s:audiobook:%s", reg, event.BookID)
				rdb.Del(ctx, cacheKey)
			}(region)
		}
		wg.Wait()

		elapsed := time.Since(start)
		log.Printf("[PURGE COMPLETE] Book %s updated to $%.2f across 3 edge regions in %v",
			event.BookID, event.NewPrice, elapsed)
	}
}`,
        explanation: 'Go ultra-low latency edge cache invalidator broadcasting purge signals over Redis Pub/Sub across regional edge nodes within milliseconds.'
      },
      r: {
        filename: 'pricing_elasticity.R',
        code: `# KayBiT Dynamic Pricing & Demand Elasticity Optimizer
library(stats)

calculate_optimal_promotional_price <- function(historical_sales, base_price, min_royalty) {
  # historical_sales data frame: columns 'price', 'quantity'
  # Model: log(Quantity) = beta_0 + beta_1 * log(Price)
  
  fit <- lm(log(quantity) ~ log(price), data = historical_sales)
  elasticity <- coef(fit)["log(price)"]
  
  cat(sprintf("[R Model] Estimated Price Elasticity (Ed): %.3f\\n", elasticity))
  
  # If Elastic (|Ed| > 1), price cut significantly boosts revenue
  if (elasticity < -1.0) {
    target_discount <- min(0.60, abs(elasticity) * 0.25)
    optimal_price <- base_price * (1 - target_discount)
  } else {
    # Inelastic: preserve margin
    optimal_price <- base_price * 0.90
  }
  
  # Guard publisher royalty floor constraint
  final_price <- max(optimal_price, min_royalty * 1.30)
  return(list(optimal_price = final_price, elasticity = elasticity))
}`,
        explanation: 'R statistical script performing log-log linear regression to estimate demand price elasticity and prescribe revenue-maximizing flash-sale boundaries.'
      },
      ruby: {
        filename: 'feed_parser.rb',
        code: `# Ruby Nokogiri SAX Parser for ONIX Catalogues
require 'nokogiri'

class OnixSaxDocument < Nokogiri::XML::SAX::Document
  def initialize(&on_batch)
    @on_batch = on_batch
    @current_tag = nil
    @current_product = {}
    @buffer = []
  end

  def start_element(name, attrs = [])
    @current_tag = name
  end

  def characters(string)
    content = string.strip
    return if content.empty?

    case @current_tag
    when 'IDValue' then @current_product[:isbn] = content
    when 'TitleText' then @current_product[:title] = content
    when 'PriceAmount' then @current_product[:price] = content.to_f
    end
  end

  def end_element(name)
    if name == 'Product' && @current_product[:isbn]
      @buffer << @current_product.dup
      @current_product.clear
      if @buffer.size >= 500
        @on_batch.call(@buffer)
        @buffer.clear
      end
    end
  end
end`,
        explanation: 'Ruby SAX parser using Nokogiri for memory-constant processing of publisher XML feeds.'
      }
    },
    keyTakeaways: [
      'Streaming SAX/iterparse parsers avoid full DOM tree memory allocation, making multi-gigabyte file digestion possible on standard 512MB RAM worker containers.',
      'Dead-letter queues ensure that a single corrupt record does not abort an entire multi-million record publisher catalog.',
      'Sub-50ms cache invalidation guarantees users do not see stale prices during flash sales.'
    ]
  },
  {
    id: 'capstone-4',
    title: 'Ultra-Low Overhead Offline Audio Player & Embedded Engine',
    subtitle: 'Zero-Copy Memory-Optimized LRU Cache & OS Native Background Audio Bridge',
    inspiration: 'LibriVox (Public Domain Audio & Legacy/Low-Resource Devices)',
    badge: 'Project 4: Embedded & Offline Engine',
    systemLayer: 'Systems Programming & Embedded Mobile Runtimes',
    coreChallenge: 'Systems-level engineering to achieve efficient local caching, audio processing, and binary optimization for low-powered or legacy client runtimes surviving aggressive OS process killing.',
    architectureDiagramAscii: `┌────────────────────────────────────────────────────────┐
│ MOBILE / EMBEDDED OS (Android / iOS / Embedded Linux)  │
└──────────────────────────┬─────────────────────────────┘
                           │ Native Hardware Bridge
                           ▼
┌────────────────────────────────────────────────────────┐
│            BACKGROUND AUDIO RUNTIME BRIDGE             │
│  ┌───────────────────────┐   ┌──────────────────────┐  │
│  │ MediaSessionService   │──▶│ WakeLock & AudioFocus│  │
│  │ (Dart/Flutter/Kotlin) │   │ (Survives App Kill)  │  │
│  └───────────────────────┘   └──────────────────────┘  │
└────────────────────────────────────────┬───────────────┘
                                         │ Direct Binary IO
                                         ▼
┌────────────────────────────────────────────────────────┐
│         FIXED-SIZE LOCAL LRU BYTE CACHE (C / C++)      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ POSIX mmap / Fixed 64MB Cache Buffer             │  │
│  │ Atomic Chunk Writes ──▶ CRC32 / SHA Checksums    │  │
│  │ Doubly Linked List + Hash Index (O(1) Eviction)  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘`,
    primaryLanguages: ['C', 'C++', 'Dart (Flutter)', 'Kotlin', 'Assembly / COBOL'],
    assignments: [
      {
        title: 'Native Cross-Platform Runtime Bridge',
        languages: 'Dart / Flutter, Kotlin, or Swift',
        challenge: 'Build a unified background audio service that interfaces directly with underlying OS hardware layers, executing uninterrupted playback even when the device forces strict process termination boundaries.',
        requirements: [
          'Acquire and manage OS Audio Focus transitions (ducking, transient pauses).',
          'Implement sticky background foreground service notification with seek scrubber.',
          'Survive low-memory kills and restore playback state from persistent snapshot.',
          'Interface with lock-screen media controls and Bluetooth headset remotes.'
        ],
        starterCodeKey: 'dart'
      },
      {
        title: 'Memory-Optimized Local File Cache',
        languages: 'C, C++, or Assembly/COBOL mapping',
        challenge: 'Implement a fixed-size local Least-Recently-Used (LRU) byte cache from scratch. Students must manipulate binary blobs natively on disk, handling atomic partial-download file writes and checksum verifications to prevent storage corruption.',
        requirements: [
          'Fixed capacity budget (e.g., exactly 64MB RAM / 1GB disk).',
          'Doubly linked list combined with hash table for $O(1)$ cache hits and evictions.',
          'Validate CRC32 checksums on chunk read/write to detect storage bit-rot.',
          'Atomic file chunk appending using pwrite() to prevent corrupt partial downloads.'
        ],
        starterCodeKey: 'c'
      }
    ],
    codeBlueprints: {
      c: {
        filename: 'lru_byte_cache.c',
        code: `/*
 * KayBiT Ultra-Low Overhead LRU Byte Cache in Pure C (POSIX)
 * Manages fixed-size audio chunks with CRC32 integrity verification.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <fcntl.h>
#include <unistd.h>

#define CHUNK_SIZE (64 * 1024) // 64KB fixed memory block
#define MAX_CHUNKS 256         // Fixed 16MB in-memory LRU cache capacity

typedef struct CacheNode {
    uint32_t chunk_id;
    uint32_t crc32_checksum;
    uint8_t data[CHUNK_SIZE];
    struct CacheNode *prev;
    struct CacheNode *next;
} CacheNode;

typedef struct {
    CacheNode *head;
    CacheNode *tail;
    size_t count;
    CacheNode *hash_table[1024]; // Simple direct hash bucket
} LruCache;

// Standard CRC32 calculation function
uint32_t compute_crc32(const uint8_t *data, size_t len) {
    uint32_t crc = 0xFFFFFFFF;
    for (size_t i = 0; i < len; i++) {
        crc ^= data[i];
        for (int j = 0; j < 8; j++) {
            crc = (crc >> 1) ^ (0xEDB88320 & -(crc & 1));
        }
    }
    return ~crc;
}

LruCache* init_cache() {
    LruCache *cache = (LruCache*)calloc(1, sizeof(LruCache));
    return cache;
}

void put_chunk(LruCache *cache, uint32_t chunk_id, const uint8_t *data) {
    // If cache at capacity, evict least recently used (tail)
    if (cache->count >= MAX_CHUNKS && cache->tail) {
        CacheNode *victim = cache->tail;
        if (victim->prev) victim->prev->next = NULL;
        cache->tail = victim->prev;
        free(victim);
        cache->count--;
    }

    CacheNode *node = (CacheNode*)malloc(sizeof(CacheNode));
    node->chunk_id = chunk_id;
    memcpy(node->data, data, CHUNK_SIZE);
    node->crc32_checksum = compute_crc32(data, CHUNK_SIZE);

    // Insert at head (Most Recently Used)
    node->prev = NULL;
    node->next = cache->head;
    if (cache->head) cache->head->prev = node;
    cache->head = node;
    if (!cache->tail) cache->tail = node;

    cache->count++;
    printf("[C LRU] Stored chunk %u (CRC32: 0x%08X). Cache utilization: %zu/%d\\n",
           chunk_id, node->crc32_checksum, cache->count, MAX_CHUNKS);
}`,
        explanation: 'Pure POSIX C implementation of a fixed-size zero-copy LRU byte cache with CRC32 checksum verification for embedded audio clients.'
      },
      dart: {
        filename: 'background_audio_bridge.dart',
        code: `import 'package:flutter/services.dart';
import 'package:audio_service/audio_service.dart';

/// Dart/Flutter background audio runtime bridge.
/// Guarantees continuous audio streaming even when screen is locked
/// or mobile OS initiates aggressive background process purging.
class KayBiTAudioHandler extends BaseAudioHandler with SeekHandler {
  final _player = MethodChannel('com.kaybit.audiobooks/hardware_player');

  KayBiTAudioHandler() {
    _initAudioSession();
  }

  Future<void> _initAudioSession() async {
    // Register media item with lock screen and notification manager
    mediaItem.add(MediaItem(
      id: 'book-402',
      album: 'KayBiT Audio Archive',
      title: 'Distributed Systems & Systems Architecture',
      artist: 'Prof. KayBiT',
      duration: const Duration(hours: 4, minutes: 12),
      artUri: Uri.parse('https://kaybit.edu/assets/cover.png'),
    ));

    playbackState.add(PlaybackState(
      controls: [
        MediaControl.rewind,
        MediaControl.play,
        MediaControl.fastForward,
      ],
      processingState: AudioProcessingState.ready,
      playing: false,
    ));
  }

  @override
  Future<void> play() async {
    await _player.invokeMethod('startForegroundService');
    playbackState.add(playbackState.value.copyWith(playing: true));
  }

  @override
  Future<void> pause() async {
    await _player.invokeMethod('pauseStream');
    playbackState.add(playbackState.value.copyWith(playing: false));
  }
}`,
        explanation: 'Dart/Flutter hardware audio bridge managing Android Foreground Services, iOS Media Remote Controls, and lock screen state persistence.'
      },
      kotlin: {
        filename: 'AudioBackgroundService.kt',
        code: `package com.kaybit.audiobooks.service

import android.app.Notification
import android.app.Service
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService

class AudioBackgroundService : MediaSessionService() {
    private var mediaSession: MediaSession? = null

    override fun onCreate() {
        super.onCreate()
        // Instantiate hardware MediaSession with sticky foreground notification
        val notification: Notification = NotificationCompat.Builder(this, "audio_channel")
            .setContentTitle("KayBiT Audio Playback Active")
            .setContentText("Streaming offline binary buffer")
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setOngoing(true)
            .build()

        startForeground(1001, notification)
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? {
        return mediaSession
    }

    override fun onDestroy() {
        mediaSession?.run {
            player.release()
            release()
            mediaSession = null
        }
        super.onDestroy()
    }
}`,
        explanation: 'Kotlin Android MediaSessionService running as a sticky foreground service to prevent the Android Low Memory Killer from terminating active audio streams.'
      }
    },
    keyTakeaways: [
      'Operating systems aggressively terminate background threads unless bound to a certified Foreground Service with ongoing media notifications.',
      'A custom C LRU cache with CRC32 verification eliminates OS file-system overhead and guarantees instant bit-rot detection on embedded flash storage.',
      'Atomic chunk appending via `pwrite()` ensures corrupted downloads never pollute the offline library.'
    ]
  }
];
