# Gemini 4 compared: what Argon, Carbon and Hydrogen change

Three names, several launch dates, and no single upgrade path. Google's **Gemini 4** rollout makes more sense as a choice between general-purpose work, longer reasoning and faster execution than as three successive replacements.

Hydrogen arrived on November 12, two days after Carbon became broadly available. But the sequence started weeks earlier. Understanding that rollout matters before comparing a launch-day leaderboard with what developers can use now.

## One family, different jobs

| Model | First announcement | Broader access | Google's intended role |
| --- | --- | --- | --- |
| Argon | September 30 | October 13 | General software and knowledge work |
| Carbon | October 28 | November 10 | Harder, longer-running tasks |
| Hydrogen | November 12 | November 12 | Faster execution with adjustable reasoning |

Argon and Carbon initially went to selected cybersecurity defenders through Google's Fairwind initiative. Their later announcements expanded access to paying developers and enterprise customers, alongside eligible consumer subscriptions. Those are **access milestones**, not five separate model launches. See the [Argon announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/), [expanded Argon release](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/), [Carbon introduction](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/) and [Carbon expansion](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/).

Nor does a new name necessarily mean training a new foundation from scratch. Google's [Argon disclosure](https://storage.googleapis.com/transparencyreport/report-downloads/pdf-report-ii_Gemini_4_2026-10-13_2026-10-13_en_v1.pdf) identifies it as a new model rather than a modification of an earlier one. The [Carbon model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-4-Carbon-Model-Card.pdf) describes Carbon as based on Argon, with more reasoning capacity and a one-million-token context window. Spending longer thinking can also mean slower responses or timeouts.

[Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) takes the other direction. Its low, medium, high and xhigh thinking settings let developers trade response time for deeper reasoning. Google's Orchestrator can also route between Carbon and Hydrogen within an agent session: use more expensive reasoning where needed, faster execution elsewhere.

## Capability is only one comparison

The chart below uses **Artificial Analysis Intelligence Index v5.0.1**, captured November 15, 2026. These are selected peers, not an exhaustive ranking.

![Artificial Analysis Intelligence Index: Fable 5.2 65, Carbon 60, Opus 5.5 59, GPT-6 Astra 57, Hydrogen 54, Argon 50 and Kimi K3.1 Pro 46.](/news/assets/gemini-4-argon-carbon-hydrogen-comparison/capability.svg)

Source: [Artificial Analysis model leaderboard](https://artificialanalysis.ai/leaderboards/models). Reported thinking settings are shown where specified; Claude entries use the provider's default fallback configuration. Kimi is the open-weight comparison.

Carbon sits above Argon and Hydrogen on this snapshot, but below Fable 5.2. That describes this test suite, not every workflow. The [index methodology](https://artificialanalysis.ai/methodology/intelligence-benchmarking) combines nine evaluations spanning knowledge work, coding, science and reasoning. It is primarily English and text-based, with some image inputs; the score is neither a percentage of all tasks solved nor a complete multimodal assessment.

Coding adds another variable: the **agent around the model**. A terminal, editing tools and recovery behaviour can change results even when the underlying model stays the same.

| Agent and model | Thinking | Coding Index v2.1 | Agent time/task |
| --- | --- | --- | --- |
| Claude Code · Fable 5.2 | xhigh, default fallback | 58 | 53.3 min |
| Antigravity CLI · Carbon | high | 55 | 33.6 min |
| Codex · GPT-6 Astra | max | 53 | 26.0 min |
| Antigravity CLI · Argon | high | 45 | 37.7 min |
| OpenCode · GLM-5.3 | max | 40 | 52.8 min |

Sources: Artificial Analysis [Claude Code/Codex](https://artificialanalysis.ai/agents/coding-agents/comparisons/claude-code-vs-codex) and [Antigravity/OpenCode](https://artificialanalysis.ai/agents/coding-agents/comparisons/antigravity-cli-vs-opencode), November 15. Hydrogen was not present in the retrieved comparison, so there is no equivalent row here.

The [coding methodology](https://artificialanalysis.ai/methodology/coding-agents-benchmarking) averages FrontierCode-AA 2.0, Terminal-Bench 4.1 and SWE-Atlas QnA-AA, using three attempts per task. Time excludes environment startup and grading. These are agent-system results, not a controlled model swap inside one identical toolset.

## What people prefer, and what they wait for

Human preference measures something different again. In [Arena's text leaderboard](https://arena.ai/leaderboard/chat/text), Carbon high scored 1,526 ±10 and Argon high 1,522 ±5. Their intervals overlap; declaring a clear preference winner between them would overstate that evidence. Opus 5.5 high scored 1,507 ±6 and GPT-6 Astra max 1,474 ±6.

Carbon's entry was provisional, with 4,273 votes versus Argon's 20,779. This was retrieved November 15 from a page labelled November 11, so it is not a perfectly synchronized snapshot with Artificial Analysis. Preference scores reflect voters' choices, not verified correctness.

For speed, Hydrogen's thinking setting matters as much as its name:

![Hydrogen thinking levels: low scores 27 with 1.4 estimated minutes per task; medium 41 with 3.8 minutes; high 51 with 8.3 minutes; xhigh 54 with 14.7 minutes.](/news/assets/gemini-4-argon-carbon-hydrogen-comparison/thinking.svg)

Source: [Artificial Analysis Hydrogen/Argon comparison](https://artificialanalysis.ai/models/comparisons/gemini-4-hydrogen-vs-gemini-4-argon), November 15. Hydrogen high reaches 51 versus Argon high's 50, with an estimated 8.3 versus 29.6 minutes per task. Turning Hydrogen up to xhigh adds three index points but increases estimated time to 14.7 minutes.

> **Reading the clock:** These inference times are estimates based on token use and measured throughput, not stopwatch timings of the coding agents above. Artificial Analysis uses recent speed measurements and includes reasoning tokens. They illustrate a trade-off, not a promised response time for your prompt. [Timing methodology](https://artificialanalysis.ai/methodology).

## API prices are not the whole bill

[Google's standard Developer API pricing](https://aistudio.google.com/docs/pricing) lists the following USD rates per million tokens. Output includes thinking tokens; cached input, batch processing and other discounts are separate.

| Model | Input / output now | Announced change |
| --- | --- | --- |
| Argon | $2 / $10 | $4 / $20 from December 1 |
| Carbon | $2 / $10 | $4 / $20 from December 1 |
| Hydrogen | $1.50 / $7.50 | No change listed |

As with the earlier [Opus 5.5 pricing changes](/news/claude-opus-5-5-cost-coding/), token prices do not tell the whole story: a model that thinks longer can consume more output tokens. Cross-provider task costs offer another view: Artificial Analysis's coding comparisons put Fable 5.2 xhigh at $15.47 per task, Carbon high at $7.13 and GPT-6 Astra max at $7.63. Those figures belong to the tested agents and settings, not a universal price ranking.

## Availability has a separate clock

On **Google Cloud's Gemini Enterprise Agent Platform**, the standard versions below are generally available, but their support commitments differ.

| Model | Cloud availability commitment | Retirement status on November 15 |
| --- | --- | --- |
| Argon | At least 12 months after release | October 13, 2027 or later |
| Carbon | Short-term availability | No date announced |
| Hydrogen | Short-term availability | No date announced |

For the short-term models, Google promises **at least 45 days to migrate once retirement is scheduled**. That is notice, not a 45-day model lifetime. Even a replacement's launch does not immediately retire them. This table concerns the standard models, not separate cyber-permissive variants. [Cloud lifecycle policy](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/model-versions).

The **Gemini Developer API** has its own [deprecation schedule](https://aistudio.google.com/docs/deprecations): all three currently have no shutdown date announced. That page promises advance notice but does not state the same 45-day minimum for these entries. Neither policy should be read as a guarantee about availability in the consumer Gemini app.

## The practical shift

Gemini 4 is becoming a set of operating choices rather than one model to replace everything. Carbon raises Google's capability ceiling; Hydrogen offers a more adjustable speed budget; Argon retains a longer stated Cloud availability window.

For a developer, the useful next comparison is a familiar workload: does it finish correctly, how long do you wait, what does the complete run cost, and how soon might you need to migrate? These releases change those trade-offs. The leaderboard is the starting point, not the decision.
