# Gemini 4 expands the frontier-model shortlist

Google's **Gemini 4** releases give developers more to consider when choosing an alternative to Claude or GPT. Carbon brings a stronger option for demanding reasoning, Argon remains Google's general-purpose choice, and Hydrogen adds a faster-execution model. Together, they broaden Google's challenge to the established frontier-model choices.

Hydrogen arrived on November 12, two days after Carbon's broader release. The releases bring two developments together: stronger competition at the demanding end of the market, and more ways to divide everyday work between models.

## What Google is adding to the choice

Google [positions Argon for most software engineering and knowledge work, and Carbon for harder, multi-step problems](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/). Carbon can spend more thinking tokens exploring possibilities and checking its work. Hydrogen adds a different priority: [rapid execution with adjustable thinking levels](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/).

These options reached users in stages. Argon and Carbon each had a 13-day period of restricted access through Google's Fairwind cybersecurity programme before their broader releases:

| Model | First announcement | Broader access | Google's intended role |
| --- | --- | --- | --- |
| Argon | September 30 | October 13 | General software and knowledge work |
| Carbon | October 28 | November 10 | Harder, longer-running tasks |
| Hydrogen | November 12 | November 12 | Faster execution with adjustable reasoning |

The lineup separates work by the time and reasoning it needs. A routine task calls for a quick answer; an unresolved debugging problem can warrant a longer investigation. Carbon's independent results show where Google's reasoning-focused option is competitive.

## Where Carbon stands among frontier models

The **Artificial Analysis Intelligence Index v5.0.1** tests how models handle knowledge work, coding, science and reasoning. Its [nine component evaluations](https://artificialanalysis.ai/methodology/intelligence-benchmarking) include completing software tasks, working across business applications, interpreting professional documents and answering difficult knowledge questions. The final index combines those results into a composite score.

On November 15, the [independent leaderboard](https://artificialanalysis.ai/leaderboards/models) put Carbon high at **60**, ahead of Opus 5.5 max at **59** and GPT-6 Astra max at **57**, but behind Fable 5.2 max at **65**. The chart shows selected peers at their stated thinking settings; Claude entries use the provider's default fallback configuration.

![Artificial Analysis Intelligence Index: Fable 5.2 65, Carbon 60, Opus 5.5 59, GPT-6 Astra 57, Hydrogen 54, Argon 50 and Kimi K3.1 Pro 46.](/news/assets/gemini-4-argon-carbon-hydrogen-comparison/capability.svg)

Carbon's strengths become clearer in the component results. Artificial Analysis's [Opus comparison](https://artificialanalysis.ai/models/comparisons/gemini-4-carbon-vs-claude-opus-5-5) and [Astra comparison](https://artificialanalysis.ai/models/comparisons/gemini-4-carbon-vs-gpt-6-astra) report these results from the same index:

| Selected component | Carbon high | Opus 5.5 max | GPT-6 Astra max |
| --- | --- | --- | --- |
| AutomationBench-AA: business-app objectives completed | 77.8% | 69.5% | 68.5% |
| Terminal-Bench 4.0: terminal tasks passed | 65.2% | 59.6% | 59.1% |
| FrontierCode-AA 2.0: repository-change score | 40.6% | 46.4% | 42.4% |

Carbon leads these two peers on [business-app automation](https://artificialanalysis.ai/evaluations/automationbench-aa), where the score measures the average share of objectives completed without guardrail violations. It also leads on [terminal work](https://artificialanalysis.ai/evaluations/terminalbench-4-0), where each task must pass every test; results average three attempts per task.

The order reverses for [changes to real open-source repositories](https://artificialanalysis.ai/evaluations/frontiercode-2-0). There, three attempts per task are graded against tests and a maintainer-oriented rubric. Opus leads this comparison at 46.4%, followed by Astra at 42.4% and Carbon at 40.6%.

The split gives developers a concrete reason to consider Carbon for multi-step automation and terminal workflows. For repository changes, Opus and Astra retain the stronger results in this comparison. Google's competitive position is therefore especially interesting for teams building agents that work across tools.

## Different flavours of frontier work

Carbon is only one part of that choice. Consider a service-maintenance workflow: routine changes involve understanding a module, drafting a fix and checking tests. A failure spanning several systems needs a longer investigation. Those jobs call for different amounts of reasoning.

![An animated isometric task tray connects to Carbon, Argon and Hydrogen workstations and a shared review bench. Light packets show input, processing and reviewed output. The scene is illustrative.](/news/assets/gemini-4-argon-carbon-hydrogen-comparison/workflow.svg)

Google's positioning maps onto that distinction: **Argon for general-purpose work; Carbon for deeper investigation**. A team could use the two as an everyday path and an escalation path, rather than sending every request to the most reasoning-intensive model.

For a team already using Claude or GPT, that creates a practical opening. Compare Carbon on difficult cases that require retries or substantial human intervention, while keeping routine work on the existing setup. Accepted fixes, review effort and the complete bill reveal what the extra option contributes.

Hydrogen adds a third option. Its [four thinking levels and Orchestrator integration](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) let developers vary reasoning depth or route between Hydrogen and Carbon during an agent session. That opens up a mixed workflow: spend more reasoning on an uncertain decision, then use faster execution for the surrounding steps.

## The choice extends beyond capability

Dividing work between models also changes its cost. [Google's standard Developer API rates](https://aistudio.google.com/docs/pricing) currently put Argon and Carbon at $2 per million input tokens and $10 per million output tokens, rising to $4 and $20 on December 1. Hydrogen is $1.50 and $7.50. Output charges include thinking tokens, so equal token prices can still produce different bills.

As with the earlier [Opus 5.5 pricing changes](/news/claude-opus-5-5-cost-coding/), the useful unit is a completed task. Longer reasoning can cost more per attempt while saving a retry; routine work may finish just as well with less reasoning.

## Availability has a separate clock

For longer-lived applications, support duration also shapes the choice. On **Google Cloud's Gemini Enterprise Agent Platform**, these standard versions are generally available with the following commitments:

| Model | Cloud availability commitment | Retirement status on November 15 |
| --- | --- | --- |
| Argon | At least 12 months after release | October 13, 2027 or later |
| Carbon | Short-term availability | No date announced |
| Hydrogen | Short-term availability | No date announced |

Under [Google Cloud's lifecycle policy](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/model-versions), short-term models remain active until their announced retirement date, with **at least 45 days to migrate once it is scheduled**. The notice period starts with that announcement, even if a replacement has already launched. The table covers standard model versions; cyber-permissive variants have separate terms.

The separate **Gemini Developer API** [schedule](https://aistudio.google.com/docs/deprecations) lists no shutdown date for any of the three. It promises advance notice but does not specify the same 45-day minimum. Consumer Gemini app availability is separate from these developer policies.

## More choice where it matters

Gemini 4 gives Google a stronger place in the frontier-model shortlist. Carbon's automation and terminal results provide a concrete reason to consider it alongside Claude and GPT, while Argon and Hydrogen extend the choice to general-purpose work and faster execution.

The useful shift is from choosing a single flagship to choosing how the work gets done. Developers have another competitive provider to consider, with options for spending more reasoning on difficult steps and less on routine ones. That is what Google's broader lineup adds to the market.
