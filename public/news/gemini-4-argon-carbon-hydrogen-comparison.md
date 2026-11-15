# Gemini 4 expands the frontier-model shortlist

Google's **Gemini 4** lineup gives developers a stronger alternative alongside Claude and GPT. Carbon's independent results put it alongside leading Claude and GPT models, while Argon and Hydrogen extend Google's offer beyond demanding reasoning. For developers, the question becomes where each option fits in the work they already do.

The lineup arrived in stages: Argon reached broader availability on October 13 and Carbon on November 10, each after 13 days of restricted access through Google's Fairwind cybersecurity programme. Hydrogen followed on November 12. Google [positions Argon for most software and knowledge work, and Carbon for harder, multi-step problems](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/).

## Where Carbon is competitive

The **Artificial Analysis Intelligence Index v5.0.1** combines [nine evaluations of coding, knowledge work, science and reasoning](https://artificialanalysis.ai/methodology/intelligence-benchmarking). On November 15, its [leaderboard](https://artificialanalysis.ai/leaderboards/models) put Carbon high at **60**, ahead of Opus 5.5 max at **59** and GPT-6 Astra max at **57**, behind Fable 5.2 max at **65**. These are composite scores at the stated thinking settings; Claude entries use the provider's default fallback configuration.

![Artificial Analysis Intelligence Index: Fable 5.2 65, Carbon 60, Opus 5.5 59, GPT-6 Astra 57, Hydrogen 54, Argon 50 and Kimi K3.1 Pro 46.](/news/assets/gemini-4-argon-carbon-hydrogen-comparison/capability.svg)

Looking inside that overall score reveals a more useful distinction. The index's [Opus](https://artificialanalysis.ai/models/comparisons/gemini-4-carbon-vs-claude-opus-5-5) and [Astra comparisons](https://artificialanalysis.ai/models/comparisons/gemini-4-carbon-vs-gpt-6-astra) break down performance by task:

| Component | Carbon high | Opus 5.5 max | Astra max |
| --- | --- | --- | --- |
| Business-app objectives completed | 77.8% | 69.5% | 68.5% |
| Terminal tasks passed | 65.2% | 59.6% | 59.1% |
| Repository-change score | 40.6% | 46.4% | 42.4% |

[AutomationBench-AA](https://artificialanalysis.ai/evaluations/automationbench-aa) measures objectives completed without guardrail violations. [Terminal-Bench 4.0](https://artificialanalysis.ai/evaluations/terminalbench-4-0) requires every test to pass; [FrontierCode-AA 2.0](https://artificialanalysis.ai/evaluations/frontiercode-2-0) grades repository changes against tests and a maintainer-oriented rubric. Both coding evaluations average three attempts per task.

Carbon leads these peers on automation and terminal work; Opus and Astra score higher on repository changes. The clearest opening for Google in these results is therefore cross-tool agent work, where completing a sequence of actions matters.

## Different flavours of frontier work

Cross-tool work also involves different demands within the same task. Google's lineup addresses that range: **Argon for general-purpose work, Carbon for deeper investigation, Hydrogen for faster execution**.

![An animated isometric task tray connects to Carbon, Argon and Hydrogen workstations and a shared review bench. Light packets show input, processing and reviewed output. The scene is illustrative.](/news/assets/gemini-4-argon-carbon-hydrogen-comparison/workflow.svg)

Consider an agent handling a delayed order across support, inventory and delivery systems. Summarising the case is general-purpose work; investigating conflicting records calls for deeper reasoning; carrying out the agreed next steps emphasises execution.

Hydrogen's [four thinking levels and Orchestrator integration](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) support adjustable reasoning and routing between Hydrogen and Carbon within an agent session. This brings the division into one session: longer reasoning for uncertain decisions, faster execution for surrounding steps.

## Cost and availability shape the choice

That division also affects the bill. [Standard Developer API prices](https://aistudio.google.com/docs/pricing) for Argon and Carbon are $2 per million input tokens and $10 per million output tokens, rising to $4/$20 on December 1. Hydrogen costs $1.50/$7.50. Output includes thinking tokens. As with the [Opus 5.5 pricing changes](/news/claude-opus-5-5-cost-coding/), the useful comparison is the cost of completing a task, including retries.

Keeping those models in a longer-lived workflow introduces another choice: support duration. For standard generally available versions, [Google Cloud's Agent Platform](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/model-versions) commits to Argon availability until October 13, 2027 or later. Carbon and Hydrogen are short-term models with no retirement date announced on November 15. Once retirement is scheduled, Cloud gives **at least 45 days' notice**.

The separate [Gemini Developer API schedule](https://aistudio.google.com/docs/deprecations) lists no shutdown date for any of the three and promises advance notice without that stated minimum. These are developer-platform terms, not Gemini app commitments.

## More choice where it matters

Google's stronger shortlist position rests on something concrete: Carbon's automation and terminal results, alongside a lineup spanning general work, deeper reasoning and faster execution. That gives developers more than another flagship to compare. It gives them another provider to build around, choosing the models, costs and support commitments that fit their workflow.
