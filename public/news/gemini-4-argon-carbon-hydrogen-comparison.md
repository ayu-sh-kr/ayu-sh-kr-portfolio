# Google’s Gemini 4 lineup: Argon, Carbon and Hydrogen compared

Google's **Gemini 4** family now spans three priorities: general-purpose work with Argon, longer reasoning with Carbon, and faster tasks with Hydrogen. The latest arrival makes the choice less about picking the newest model and more about matching it to the job.

The rollout began with restricted access. Argon and Carbon each spent 13 days with selected cybersecurity defenders through Google's Fairwind initiative before reaching paying developers, enterprises and eligible subscribers. Hydrogen followed on November 12, just two days after Carbon's broader release on November 10.

## One family, different jobs

| Model | First announcement | Broader access | Google's intended role |
| --- | --- | --- | --- |
| Argon | September 30 | October 13 | General software and knowledge work |
| Carbon | October 28 | November 10 | Harder, longer-running tasks |
| Hydrogen | November 12 | November 12 | Faster execution with adjustable reasoning |

Google describes [Argon as the new foundation model](https://storage.googleapis.com/transparencyreport/report-downloads/pdf-report-ii_Gemini_4_2026-10-13_2026-10-13_en_v1.pdf). [Carbon builds on it](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-4-Carbon-Model-Card.pdf) with more reasoning capacity and a one-million-token context window, sometimes trading response speed for deeper work.

[Hydrogen offers four thinking levels](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/): low, medium, high and xhigh. Google's Orchestrator can route between Carbon and Hydrogen within one agent session, reserving deeper reasoning for harder steps. The independent results help put those choices in context.

## How Gemini 4 compares on capability and coding

The [Artificial Analysis model leaderboard](https://artificialanalysis.ai/leaderboards/models) places Carbon ahead of Google's other Gemini 4 models in **Intelligence Index v5.0.1**. This November 15, 2026 snapshot shows selected peers and their reported thinking settings, including Kimi as an open-weight comparison. Claude entries use the provider's default fallback configuration.

![Artificial Analysis Intelligence Index: Fable 5.2 65, Carbon 60, Opus 5.5 59, GPT-6 Astra 57, Hydrogen 54, Argon 50 and Kimi K3.1 Pro 46.](/news/assets/gemini-4-argon-carbon-hydrogen-comparison/capability.svg)

Carbon still trails Fable 5.2 in this snapshot. The [index combines nine evaluations](https://artificialanalysis.ai/methodology/intelligence-benchmarking) of knowledge work, coding, science and reasoning into a composite score. Its emphasis is English and text, with some image inputs.

For coding, the **agent's tools and workflow** also matter. Artificial Analysis's November 15 [Claude Code/Codex](https://artificialanalysis.ai/agents/coding-agents/comparisons/claude-code-vs-codex) and [Antigravity/OpenCode](https://artificialanalysis.ai/agents/coding-agents/comparisons/antigravity-cli-vs-opencode) comparisons show how the tested systems differ:

| Agent and model | Thinking | Coding Index v2.1 | Agent time/task |
| --- | --- | --- | --- |
| Claude Code · Fable 5.2 | xhigh, default fallback | 58 | 53.3 min |
| Antigravity CLI · Carbon | high | 55 | 33.6 min |
| Codex · GPT-6 Astra | max | 53 | 26.0 min |
| Antigravity CLI · Argon | high | 45 | 37.7 min |
| OpenCode · GLM-5.3 | max | 40 | 52.8 min |

The [coding index](https://artificialanalysis.ai/methodology/coding-agents-benchmarking) averages three benchmarks across complete agent systems, with three attempts per task. Times exclude startup and grading. Hydrogen was not included in the published comparison.

## What people prefer, and what they wait for

In [Arena's voter-ranked text leaderboard](https://arena.ai/leaderboard/chat/text), Carbon high scored 1,526 ±10 and Argon high 1,522 ±5, with overlapping uncertainty intervals. Opus 5.5 high scored 1,507 ±6; GPT-6 Astra max scored 1,474 ±6.

Carbon's result was still provisional, with 4,273 votes compared with Argon's 20,779. Arena displayed a November 11 date when checked on November 15, so the two leaderboards reflect different snapshots.

For speed, Hydrogen's thinking setting matters as much as its name. The [November 15 Artificial Analysis comparison](https://artificialanalysis.ai/models/comparisons/gemini-4-hydrogen-vs-gemini-4-argon) shows what changes as its reasoning budget increases:

![Hydrogen thinking levels: low scores 27 with 1.4 estimated minutes per task; medium 41 with 3.8 minutes; high 51 with 8.3 minutes; xhigh 54 with 14.7 minutes.](/news/assets/gemini-4-argon-carbon-hydrogen-comparison/thinking.svg)

Hydrogen high reaches 51 versus Argon high's 50, with an estimated 8.3 versus 29.6 minutes per task. Xhigh adds three points but takes an estimated 14.7 minutes.

> **Reading the clock:** Artificial Analysis [estimates inference time from token use and recent throughput](https://artificialanalysis.ai/methodology), including reasoning. The speed chart uses these estimates; the coding table reports active agent time. Actual response times vary with the task.

## API prices are not the whole bill

[Google's standard Developer API pricing](https://aistudio.google.com/docs/pricing) lists the following USD rates per million tokens. Output includes thinking tokens; cached input, batch processing and other discounts are separate.

| Model | Input / output now | Announced change |
| --- | --- | --- |
| Argon | $2 / $10 | $4 / $20 from December 1 |
| Carbon | $2 / $10 | $4 / $20 from December 1 |
| Hydrogen | $1.50 / $7.50 | No change listed |

As with the earlier [Opus 5.5 price changes](/news/claude-opus-5-5-cost-coding/), longer reasoning can offset cheaper tokens. For the tested coding agents above, Artificial Analysis reports $15.47 per task for Fable 5.2 xhigh, $7.13 for Carbon high and $7.63 for GPT-6 Astra max. Those are costs for the tested workloads and settings.

## Availability has a separate clock

On **Google Cloud's Gemini Enterprise Agent Platform**, the standard versions below are generally available, but their support commitments differ.

| Model | Cloud availability commitment | Retirement status on November 15 |
| --- | --- | --- |
| Argon | At least 12 months after release | October 13, 2027 or later |
| Carbon | Short-term availability | No date announced |
| Hydrogen | Short-term availability | No date announced |

Under [Google Cloud's lifecycle policy](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/model-versions), short-term models remain available until retirement is announced, with **at least 45 days to migrate once it is scheduled**. The notice period starts with that announcement, even if a replacement has already launched. The table covers standard model versions; cyber-permissive variants have separate terms.

The separate **Gemini Developer API** [schedule](https://aistudio.google.com/docs/deprecations) lists no shutdown date for any of the three. It promises advance notice but does not specify the same 45-day minimum. Consumer Gemini app availability is separate from these developer policies.

## The practical shift

Carbon raises Google's capability ceiling; Hydrogen offers a more adjustable speed budget; Argon retains a longer stated Cloud availability window.

The useful next test is your own workload: does it finish correctly, how long do you wait, what does the complete run cost, and when might you need to migrate? The leaderboard is the starting point, not the decision.
