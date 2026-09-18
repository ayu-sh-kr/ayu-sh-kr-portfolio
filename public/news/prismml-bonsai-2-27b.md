# PrismML's Bonsai 2 27B: near-lossless ternary compression at a 5.9GB footprint

PrismML shipped **Ternary Bonsai 2 27B** on September 17 — a Qwen3.8 27B derivative squeezed down to **5.9GB** with a **262K-token context**, under Apache 2.0.

The headline is retention: **98.2%** of the full-precision model's score at a footprint **over 9x smaller**. Their last release held 95%. The gap between "compressed" and "lossless" is nearly gone.

## The numbers that actually matter

Averages hide where errors compound, so look at the hard categories: **77.6 on agentic tool use** (vs. 79.7 full-precision), **81.6 on coding**, **78.6 on vision**. It runs at **143 tokens/second** on an RTX 5090 and **46.8 on Apple's M5 Max** — and at **0.714 mWh/token** on a 4090, **40% more energy-efficient** than a full-precision 8B.

## How it squeezes under 6GB

Most weights aren't FP16 numbers at all. Each one collapses to **−1, 0, or +1**. That alone would be too crude, so groups of weights share **one FP16 scale** — a +1 in one group might mean +0.037, while −1 in another means −0.12. That trick lands the model at **1.76 bits per weight** instead of 16, and **5.9GB instead of ~54GB**.

| Type | Bits/param | 27B size | Typical use case |
|------|-----------|----------|------------------|
| FP16 | 16 | ~54 GB | Training, full-precision inference |
| BF16 | 16 | ~54 GB | Training, wider dynamic range |
| INT8 | 8 | ~27 GB | Serving where memory and latency matter |
| INT4 | 4 | ~13.5 GB | Consumer GPUs, local deployment |
| **Ternary + FP16 scales** | **~1.76** | **~5.9 GB** | Extreme compression for local and edge |

Two things worth knowing: this applies **end to end** — no exception layers stay at FP16. And the 262K context is separate; KV cache and activation memory still add up on top.

## Why it matters to me

A 27B-class model running locally at usable speed changes what "call the model" means. **Document processing**, **agent loops**, **offline assistants** — none of them need a network hop or a per-token bill anymore. **Hybrid architectures** shift from slide to reality.

The real question is operational: fine-tuning, versioning, observability all assume hosted APIs. Self-hosted at this quality means owning that stack again — and for some workloads, that's the right trade.

You'll find the weights on **Hugging Face**, running on NVIDIA via CUDA and Apple devices via MLX.

Source: [PrismML news](https://prismml.com/news/bonsai-2-27b)
