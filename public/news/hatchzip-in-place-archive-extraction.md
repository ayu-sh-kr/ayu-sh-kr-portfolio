# Hatchzip shrinks archives while extracting: claims, benchmarks and design

A **180 GB download** finishes, then extraction fails because the disk cannot hold another 200 GB. **Hatchzip**, a free Rust extractor for Windows, macOS and Linux, reclaims space by shrinking the archive as it extracts.

Its 180-to-200 GB example is an illustration, not the benchmark: ordinary extraction holds roughly **380 GB** at its peak; Hatchzip aims for a little above the final output size. The saving depends on the archive’s structure and filesystem.

## How the architecture releases space

The desktop app and CLI share **`hatchzip-core`**. Format readers identify independently decodable pieces: files in ZIP and tar, or groups compressed together in 7z. A planner calculates peak space before extraction starts.

It saves the archive index separately, then extracts batches from the end. Once a batch is safely written, it removes those bytes from the archive and reuses the space.

![Hatchzip saves archive metadata, checks peak space, extracts the last batch, flushes files, commits its progress journal and trims the archive before processing the next batch.](/news/assets/hatchzip-in-place-archive-extraction/extraction-architecture.svg)

In the [engine I inspected](https://github.com/xevrion/hatchzip/blob/main/crates/core/src/engine.rs), output reaches durable storage **before** the progress journal is saved, and truncation follows that commit. The journal records completed work so an interrupted run can resume. The [tests](https://github.com/xevrion/hatchzip/blob/main/crates/cli/tests/extract.rs) exercise crashes around those boundaries; I reviewed their code but did not run them.

## What the published benchmarks show

The [project reports](https://github.com/xevrion/hatchzip#highlights) extracting **200 MB across 21 files** on a **220 MiB memory-backed filesystem**, initially with about 50 MB free:

| Test | Reported result |
| --- | --- |
| 180 MB ZIP | `unzip` stopped at file 6; Hatchzip finished with identical output. |
| 7z, ten solid blocks | Hatchzip finished in 0.64 seconds. |
| Split 7z, five volumes | Finished; peak total usage was 210 MB. |
| 7z, one solid block | Refused: the block required 200 MB free before reclamation. |

Separately, ZIP extraction took **0.25–0.35 seconds**, versus **1.48–1.50 seconds** for `unzip` 6.00. The author used Fedora 43, an i7-14700HX and SK Hynix NVMe storage, with a warm cache; speed runs used ext4. These **author-reported results** apply to that small, cached workload. The [ClickBench dispute](/news/clickbench-removes-pgrust-benchmark-dispute/) offers another example of why cache behavior matters in performance comparisons.

## Where the saving stops

A **solid block** compresses several files as one stream. Hatchzip must finish that block before trimming it, so a single-block 7z can erase the advantage. Large ZIP/tar files have an additional path that releases consumed regions where the filesystem supports it.

Compressed `.tar.gz` behaves differently: it decodes forwards and needs **hole punching**, which releases occupied regions inside a file, to reclaim space during extraction. FAT32/exFAT cannot provide that saving. Output on another filesystem also cannot reuse the archive’s released space.

Hatchzip is useful when the extracted files are what you want to keep: it consumes the original archive. Run **`hatchzip check`** first to see whether the extraction fits, including temporary working space. The saving depends on what it can release before the next batch needs room.
