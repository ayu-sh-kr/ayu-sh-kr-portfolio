# Mirendil’s Fern puts 10 million tokens of context to work on AI research

Mirendil has introduced **Fern 0.1**, an AI model designed to investigate research code, training logs and agent histories with **up to 10 million tokens of context**. Announced on October 26, the preview addresses a familiar difficulty in long investigations: evidence disappears from an agent’s working context before its significance becomes clear.

A failed training run can leave clues across configuration files, data-processing code and hours of logs. Fern’s premise is that more of that record can remain available during the investigation, reducing the need to repeatedly select files or summarize earlier findings.

## Keeping the investigation together

The context window holds the material a model can use during a response, including supplied code, documents and tool results. Increasing it gives Fern more evidence to work with; it does not give the model permanent memory or guarantee that it will connect the evidence correctly.

Mirendil illustrates the capacity as roughly 23 MB of code, or half a million lines. Those figures depend on the material being processed, but they convey the scale of the intended workloads: tracing failures through research software, reviewing training data and examining the sequence of actions behind an agent’s mistake.

The company is led by **Behnam Neyshabur and Harsh Mehta**. Fern builds on Mirendil-Base with a short post-training stage. Mirendil discloses a broad size range of 100–500 billion parameters, without an exact count or active-parameter figure.

## Finding evidence is easier than connecting it

The launch’s long-context evaluation makes that distinction visible. At 10 million tokens, Mirendil reports these results for **Mirendil-Base**:

| Task | Reported result |
| --- | ---: |
| Find a single embedded fact | 100% |
| Retrieve information associated with multiple keys | 90% |
| Answer questions requiring multiple reasoning steps | 45% |

Each result uses just 20 examples, with thinking disabled and exact-answer matching. The decline on questions requiring several steps matters: locating a warning in a long log is only part of explaining why a run failed. These are also base-model results, rather than a comprehensive evaluation of the post-trained Fern release.

Fern’s separate coding evaluation is similarly uneven. Using OpenCode with one attempt, Mirendil reports **73.4% on SWE-bench Verified**, **53.2% on SWE Atlas Codebase QnA** and **6.1% on Terminal-Bench 4.0**. The benchmarks cover different kinds of work, from repository issues to terminal tasks. Together, they show why the size of the context window cannot describe the model’s overall ability.

## A preview of longer investigations

Most coding agents already use search and selective retrieval to bring relevant material into context. Fern explores how much of that selection can be avoided when the model can read a larger record. The underlying challenge is related to the one discussed in the [PageIndex explainer](/news/pageindex-tree-based-rag-relevance/): useful evidence must both be available and lead to the right conclusion.

**Access is listed as coming soon**, with early-access requests open. The announcement provides no public pricing, downloadable weights or open-source license.

Fern’s contribution is a larger working context for investigations that span many files and events. Its early results also expose the harder task ahead: turning the additional material into a reliable explanation of what went wrong.

Sources: [Fern announcement and evaluations](https://mirendil.com/news/introducing-fern/), [Mirendil’s pretraining account](https://mirendil.com/news/pretraining-at-scale-without-a-pretraining-team/), [RULER paper](https://arxiv.org/abs/2404.06654), [WSJ company reporting](https://www.wsj.com/tech/ai/anthropic-veterans-startup-seeks-to-help-scientists-develop-their-own-ai-09e2f3e5), and [Startup Fortune’s launch coverage](https://startupfortune.com/mirendil-unveils-fern-an-ai-model-claiming-a-10-million-token-context-window/).
