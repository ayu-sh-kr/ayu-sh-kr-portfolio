# Gemini 4 expands the frontier-model shortlist

Google's **Gemini 4** releases give developers more to consider when choosing an alternative to Claude or GPT. Carbon brings a stronger option for demanding reasoning, Argon remains Google's general-purpose choice, and Hydrogen adds a faster-execution model. Together, they give Google a broader offering to put into the same evaluation.

Hydrogen arrived on November 12, two days after Carbon's broader release. With the lineup available, the useful questions are how competitive it is, where the models differ, and what those differences mean for someone building with them.

## What Google is adding to the choice

Google [positions Argon for most software engineering and knowledge work, and Carbon for harder, multi-step problems](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/). Carbon can spend more thinking tokens exploring possibilities and checking its work. Hydrogen adds a different priority: [rapid execution with adjustable thinking levels](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/).

These options reached users in stages. Argon and Carbon each had a 13-day period of restricted access through Google's Fairwind cybersecurity programme before their broader releases:

| Model | First announcement | Broader access | Google's intended role |
| --- | --- | --- | --- |
| Argon | September 30 | October 13 | General software and knowledge work |
| Carbon | October 28 | November 10 | Harder, longer-running tasks |
| Hydrogen | November 12 | November 12 | Faster execution with adjustable reasoning |

For a developer, those differences affect how much time and reasoning to spend on a task. A routine task may need a quick, reliable answer; an unresolved debugging problem may justify a longer investigation. Google's positioning suggests where to start testing. Independent results help establish whether its strongest option belongs alongside the alternatives.

## Where Carbon stands among frontier models

How does that deeper-reasoning option compare with other frontier models? The [Artificial Analysis Intelligence Index v5.0.1](https://artificialanalysis.ai/leaderboards/models) offers an independent reference point. On November 15, Carbon high scored 60, above Opus 5.5 max at 59 and GPT-6 Astra max at 57, while Fable 5.2 max remained ahead at 65. The chart includes selected peers and their reported thinking settings; Claude entries use the provider's default fallback configuration.

![Artificial Analysis Intelligence Index: Fable 5.2 65, Carbon 60, Opus 5.5 59, GPT-6 Astra 57, Hydrogen 54, Argon 50 and Kimi K3.1 Pro 46.](/news/assets/gemini-4-argon-carbon-hydrogen-comparison/capability.svg)

The [index combines nine evaluations](https://artificialanalysis.ai/methodology/intelligence-benchmarking) across knowledge work, coding, science and reasoning, primarily in English and text with some image inputs. These are composite scores at different reasoning settings. A small gap is a reason to test, rather than evidence that one model will consistently beat another on your work.

Carbon's position supports including it alongside OpenAI and Anthropic in a frontier-model evaluation. Argon's lower score also makes the distinction within Google's lineup visible: choosing the general-purpose option is a different decision from choosing its strongest reasoning model.

## A wider shortlist changes the decision

The practical benefit of another competitive model is having somewhere else to take a difficult task. A team can compare Carbon with its existing Claude or GPT setup while keeping the workflow that already works. That is a more useful form of competition than choosing a provider solely because it leads a headline ranking.

This is about **available alternatives**, rather than evidence of customers switching or market share changing. To become a real alternative, a model still needs to work with the team's tools, pass its tests and fit its budget. The next step is to turn that wider shortlist into a focused evaluation.

## Different flavours of frontier work

A service-maintenance workflow illustrates what that evaluation could look like. Most changes are routine: understanding a module, drafting a fix and checking the tests. Occasionally, a failure crosses several systems and needs a longer investigation. Treating both jobs identically can mean paying for reasoning that the first task does not need, or rushing the second.

![An animated isometric task tray connects to Carbon, Argon and Hydrogen workstations and a shared review bench. Light packets show input, processing and reviewed output. The scene is illustrative.](/news/assets/gemini-4-argon-carbon-hydrogen-comparison/workflow.svg)

That is where the Argon–Carbon distinction becomes useful. Based on Google's positioning, **Argon is a candidate for the everyday path; Carbon is a candidate for escalation** when the problem needs deeper exploration. These are starting hypotheses for evaluation, not results from a test of that service.

The comparison with peers should follow the same logic. If a team's current Claude or OpenAI setup already handles routine changes reliably, replacing it wholesale adds risk without a clear benefit. A narrower experiment is more informative: give Carbon a small set of difficult cases that currently require retries or substantial human intervention. Compare accepted fixes, review effort and the complete bill, not just how impressive the first answer looks.

Hydrogen adds a third option. Its [four thinking levels and Orchestrator integration](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) let developers vary reasoning depth or route between Hydrogen and Carbon during an agent session. The interesting possibility is a mixed workflow: spend more reasoning on the uncertain decision, then use faster execution for the surrounding steps. Whether that helps depends on how well the handoff preserves context and correctness.

## The choice extends beyond capability

The next question is whether that choice improves the cost of finishing the task. [Google's standard Developer API rates](https://aistudio.google.com/docs/pricing) currently put Argon and Carbon at $2 per million input tokens and $10 per million output tokens, rising to $4 and $20 on December 1. Hydrogen is $1.50 and $7.50. Output charges include thinking tokens, so equal token prices can still produce different bills.

As with the earlier [Opus 5.5 pricing changes](/news/claude-opus-5-5-cost-coding/), the useful unit is a completed task. A deeper model may cost more per attempt but save a retry; a cheaper model may be sufficient without escalation. That is the economic question a real workload can answer.

## Availability has a separate clock

A model that earns a place in the workflow also needs a migration plan. On **Google Cloud's Gemini Enterprise Agent Platform**, these standard versions are generally available with different support commitments:

| Model | Cloud availability commitment | Retirement status on November 15 |
| --- | --- | --- |
| Argon | At least 12 months after release | October 13, 2027 or later |
| Carbon | Short-term availability | No date announced |
| Hydrogen | Short-term availability | No date announced |

Under [Google Cloud's lifecycle policy](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/model-versions), short-term models remain active until their announced retirement date, with **at least 45 days to migrate once it is scheduled**. The notice period starts with that announcement, even if a replacement has already launched. The table covers standard model versions; cyber-permissive variants have separate terms.

The separate **Gemini Developer API** [schedule](https://aistudio.google.com/docs/deprecations) lists no shutdown date for any of the three. It promises advance notice but does not specify the same 45-day minimum. Consumer Gemini app availability is separate from these developer policies.

## More choice where it matters

Gemini 4 expands the frontier-model shortlist because Carbon offers a competitive reasoning option alongside the established peers, while Argon and Hydrogen give developers different ways to handle everyday work and faster execution. Those choices come with different costs and availability commitments, so the best fit depends on more than the benchmark.

For the user, the gain is room to choose: keep the setup that handles routine work well, compare an alternative on the cases it struggles with, and adopt it when the finished results justify the change. That is where a broader frontier-model market becomes useful in practice.
