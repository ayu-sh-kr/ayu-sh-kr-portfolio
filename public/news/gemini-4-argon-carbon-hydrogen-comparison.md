# Gemini 4 compared: what Argon, Carbon and Hydrogen change

Three names, several launch dates, and no single upgrade path. Google's **Gemini 4** rollout makes more sense as a choice between general-purpose work, longer reasoning and faster execution than as three successive replacements.

Hydrogen arrived on November 12, two days after Carbon became broadly available. The rollout started weeks earlier, with access expanding in stages.

## One family, different jobs

| Model | First announcement | Broader access | Google's intended role |
| --- | --- | --- | --- |
| Argon | September 30 | October 13 | General software and knowledge work |
| Carbon | October 28 | November 10 | Harder, longer-running tasks |
| Hydrogen | November 12 | November 12 | Faster execution with adjustable reasoning |

Argon and Carbon first reached selected cybersecurity defenders through Fairwind, before expanding to paying developers, enterprises and eligible subscribers. The [Argon launch](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) and [broader release](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/), like [Carbon's introduction](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/) and [expansion](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/), mark different access stages.

Google identifies [Argon as a new foundation model](https://storage.googleapis.com/transparencyreport/report-downloads/pdf-report-ii_Gemini_4_2026-10-13_2026-10-13_en_v1.pdf). [Carbon builds on it](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-4-Carbon-Model-Card.pdf), adding reasoning capacity within a one-million-token context window, sometimes at the cost of slower responses.

[Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) offers four thinking levels: low, medium, high and xhigh. Google's Orchestrator can route between Carbon and Hydrogen within one agent session, reserving deeper reasoning for harder steps.

## Capability is only one comparison

The chart below uses **Artificial Analysis Intelligence Index v5.0.1**, captured November 15, 2026. These are selected peers, not an exhaustive ranking.

![Artificial Analysis Intelligence Index: Fable 5.2 65, Carbon 60, Opus 5.5 59, GPT-6 Astra 57, Hydrogen 54, Argon 50 and Kimi K3.1 Pro 46.](/news/assets/gemini-4-argon-carbon-hydrogen-comparison/capability.svg)

Source: [Artificial Analysis model leaderboard](https://artificialanalysis.ai/leaderboards/models). Reported thinking settings are shown where specified; Claude entries use the provider's default fallback configuration. Kimi is the open-weight comparison.

Carbon leads the other Gemini entries here, but trails Fable 5.2. The [nine-evaluation index](https://artificialanalysis.ai/methodology/intelligence-benchmarking) covers knowledge work, coding, science and reasoning, primarily in English and text. It is not a percentage of tasks solved or a complete multimodal assessment.

For coding, the **agent's tools and workflow** also matter:

| Agent and model | Thinking | Coding Index v2.1 | Agent time/task |
| --- | --- | --- | --- |
| Claude Code · Fable 5.2 | xhigh, default fallback | 58 | 53.3 min |
| Antigravity CLI · Carbon | high | 55 | 33.6 min |
| Codex · GPT-6 Astra | max | 53 | 26.0 min |
| Antigravity CLI · Argon | high | 45 | 37.7 min |
| OpenCode · GLM-5.3 | max | 40 | 52.8 min |

Sources: Artificial Analysis [Claude Code/Codex](https://artificialanalysis.ai/agents/coding-agents/comparisons/claude-code-vs-codex) and [Antigravity/OpenCode](https://artificialanalysis.ai/agents/coding-agents/comparisons/antigravity-cli-vs-opencode), November 15. Hydrogen was absent from this comparison.

The [coding index](https://artificialanalysis.ai/methodology/coding-agents-benchmarking) averages three benchmarks, with three attempts per task. Times exclude startup and grading. These compare complete agents, not models inside an identical toolset.

## What people prefer, and what they wait for

In [Arena's text leaderboard](https://arena.ai/leaderboard/chat/text), Carbon high scored 1,526 ±10 and Argon high 1,522 ±5, with overlapping uncertainty intervals. Opus 5.5 high scored 1,507 ±6; GPT-6 Astra max scored 1,474 ±6. These measure voters' preferences, not verified correctness.

Carbon's 4,273-vote entry was provisional, versus Argon's 20,779 votes. Retrieved November 15, the page was labelled November 11: a different snapshot from Artificial Analysis.

For speed, Hydrogen's thinking setting matters as much as its name:

![Hydrogen thinking levels: low scores 27 with 1.4 estimated minutes per task; medium 41 with 3.8 minutes; high 51 with 8.3 minutes; xhigh 54 with 14.7 minutes.](/news/assets/gemini-4-argon-carbon-hydrogen-comparison/thinking.svg)

Source: [Artificial Analysis Hydrogen/Argon comparison](https://artificialanalysis.ai/models/comparisons/gemini-4-hydrogen-vs-gemini-4-argon), November 15. Hydrogen high reaches 51 versus Argon high's 50, with an estimated 8.3 versus 29.6 minutes per task. Xhigh adds three points but takes an estimated 14.7 minutes.

> **Reading the clock:** These are inference estimates from token use and recent throughput, including reasoning, not the coding-agent timings above or a promised response time. [Timing methodology](https://artificialanalysis.ai/methodology).

## API prices are not the whole bill

[Google's standard Developer API pricing](https://aistudio.google.com/docs/pricing) lists the following USD rates per million tokens. Output includes thinking tokens; cached input, batch processing and other discounts are separate.

| Model | Input / output now | Announced change |
| --- | --- | --- |
| Argon | $2 / $10 | $4 / $20 from December 1 |
| Carbon | $2 / $10 | $4 / $20 from December 1 |
| Hydrogen | $1.50 / $7.50 | No change listed |

As with the earlier [Opus 5.5 price changes](/news/claude-opus-5-5-cost-coding/), longer reasoning can offset cheaper tokens. For the tested coding agents above, Artificial Analysis reports $15.47 per task for Fable 5.2 xhigh, $7.13 for Carbon high and $7.63 for GPT-6 Astra max. Those costs depend on the workload and settings.

## Availability has a separate clock

On **Google Cloud's Gemini Enterprise Agent Platform**, the standard versions below are generally available, but their support commitments differ.

| Model | Cloud availability commitment | Retirement status on November 15 |
| --- | --- | --- |
| Argon | At least 12 months after release | October 13, 2027 or later |
| Carbon | Short-term availability | No date announced |
| Hydrogen | Short-term availability | No date announced |

Short-term models get **at least 45 days to migrate once retirement is scheduled**, not a 45-day lifetime. A replacement alone does not retire them. This covers standard models, not cyber-permissive variants. [Cloud lifecycle policy](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/model-versions).

The separate **Gemini Developer API** [schedule](https://aistudio.google.com/docs/deprecations) lists no shutdown date for any of the three. It promises advance notice, without the same stated 45-day minimum. Neither policy covers the consumer Gemini app.

## The practical shift

Carbon raises Google's capability ceiling; Hydrogen offers a more adjustable speed budget; Argon retains a longer stated Cloud availability window.

The useful next test is your own workload: does it finish correctly, how long do you wait, what does the complete run cost, and when might you need to migrate? The leaderboard is the starting point, not the decision.
