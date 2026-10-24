# Hatchzip shrinks archives while extracting: claims, benchmarks and design

A **180 GB download** finishes, then extraction fails because the disk cannot hold another 200 GB. **Hatchzip**, a free Rust extractor for Windows, macOS and Linux, tackles that overlap by consuming the archive as files come out.

Its 180-to-200 GB example is an illustration, not the benchmark: ordinary extraction holds roughly **380 GB** at its peak; Hatchzip aims for a little above the final output size. The saving depends on the archive’s structure and filesystem.

## How the architecture releases space

The desktop app and CLI share **`hatchzip-core`**. Format readers identify independently decodable pieces: files in ZIP and tar, or groups compressed together in 7z. A planner calculates peak space before extraction starts.

The diagram shows the ordinary reverse-extraction path. Saving the index separately lets the engine keep reading after the archive’s original ending disappears.

![Hatchzip saves archive metadata, checks peak space, extracts the last batch, flushes files, commits its progress journal and trims the archive before processing the next batch.](/news/assets/hatchzip-in-place-archive-extraction/extraction-architecture.svg)

In the [inspected engine](https://github.com/xevrion/hatchzip/blob/main/crates/core/src/engine.rs), output reaches durable storage **before** the progress journal is saved, and truncation follows that commit. The journal records completed work so an interrupted run can resume. The [tests](https://github.com/xevrion/hatchzip/blob/main/crates/cli/tests/extract.rs) exercise crashes around those boundaries; this article did not independently run them.

## What the published benchmarks show

The [project reports](https://github.com/xevrion/hatchzip#highlights) extracting **200 MB across 21 files** on a **220 MiB memory-backed filesystem**, initially with about 50 MB free:

| Test | Reported result |
| --- | --- |
| 180 MB ZIP | `unzip` stopped at file 6; Hatchzip finished with identical output. |
| 7z, ten solid blocks | Hatchzip finished in 0.64 seconds. |
| Split 7z, five volumes | Finished; peak total usage was 210 MB. |
| 7z, one solid block | Refused: the block required 200 MB free before reclamation. |

Separately, ZIP extraction took **0.25–0.35 seconds**, versus **1.48–1.50 seconds** for `unzip` 6.00. The author used Fedora 43, an i7-14700HX and SK Hynix NVMe storage, with a warm cache; speed runs used ext4. These are **author-reported results**, not a 180 GB trial or a broad comparison with modern extractors.

## Where the saving stops

A **solid block** compresses several files as one stream. Hatchzip must finish that block before trimming it, so a single-block 7z can erase the advantage. Large ZIP/tar files have an additional path that releases consumed regions where the filesystem supports it.

Compressed `.tar.gz` behaves differently: it decodes forwards and needs **hole punching**, which releases occupied regions inside a file, to reclaim space during extraction. FAT32/exFAT cannot provide that saving. Output on another filesystem also cannot reuse the archive’s released space.

The archive is consumed, so this is a trade-off for downloads that no longer need preserving. For the nearly full disk in the opening example, **`hatchzip check`** answers the useful question: will this particular archive fit, including its temporary working space?
