# Mirendil Fern: what a 10-million-token context means for coding AI

Mirendil’s first model, **Fern 0.1**, is built around a problem familiar to anyone investigating a large software system: the relevant evidence can be scattered across code, logs and earlier attempts to fix it. Announced on October 26, Fern accepts **up to 10 million tokens of model context**, with AI research and coding workflows as its intended use.

That is a capacity claim worth understanding. It tells us how much material the model can receive together. The accompanying evaluations begin to show what it can do with that material—and where its early capabilities fall short.

## The context belongs to the model’s current task

A language model’s **context window** is the material available to it while producing a response: instructions, supplied documents, conversation history, code and tool results. Its size is measured in tokens, the pieces into which a model divides that material. It is different from the information learned during training, and it does not imply permanent memory between sessions.

For a coding agent, context might include the user’s request, files it has opened, terminal output and the changes it has already tried. A long session accumulates evidence. When that evidence no longer fits, the surrounding application must select passages, summarize earlier steps or fetch files again.

Consider a training job that starts producing invalid results several hours into a run. The explanation might involve a data transformation, a configuration change and an earlier warning that only becomes meaningful later. More context gives a model the opportunity to consider those pieces together. Whether it connects them correctly is a separate capability.

Mirendil’s [launch announcement](https://mirendil.com/news/introducing-fern/) equates Fern’s capacity with roughly **23 MB of code, or half a million lines**. Those are workload-specific illustrations, not fixed conversions between file size, lines and tokens.

## A model aimed at the work behind other models

Fern’s stated jobs include research-code changes, training-log debugging, agent-trace analysis and training-data audits. A trace is the recorded sequence of an agent’s decisions, tool calls and results. Reading the full sequence can help explain how an apparently reasonable step led to a wrong outcome.

Its creator, **Mirendil**, is led by Behnam Neyshabur and Harsh Mehta, with Shayan Salehian and Tara Rezaei among its co-founders. [The Wall Street Journal’s June reporting](https://www.wsj.com/tech/ai/anthropic-veterans-startup-seeks-to-help-scientists-develop-their-own-ai-09e2f3e5) placed the company’s goal in context: making AI-assisted research available beyond the largest AI laboratories.

Fern follows Mirendil-Base, which the company [describes as an experiment in agent-assisted pretraining](https://mirendil.com/news/pretraining-at-scale-without-a-pretraining-team/). Mirendil says one researcher built it with agents in 3.5 months using less than $10 million of compute, including experiments, agent usage and data processing. That is the company’s account of the project, rather than an independently audited cost comparison.

The disclosed size range is **100–500 billion parameters**. An exact count, active-parameter count and sufficiently detailed architecture for independent deployment are not provided. Fern 0.1 adds a short post-training stage to the base model.

## Retrieval and coding results answer different questions

The [RULER research](https://arxiv.org/abs/2404.06654) explains why finding one fact inside a long input is an incomplete test of understanding. Its tasks also examine following relationships and combining information. A model can retrieve a name successfully while struggling to reason across several distant passages.

At the full 10-million-token length, Mirendil reports the following results for **Mirendil-Base**, rather than a separate comprehensive evaluation of the post-trained Fern release:

| Long-context task | Reported result |
| --- | ---: |
| Find a single embedded fact | 100% |
| Retrieve information associated with multiple keys | 90% |
| Multi-hop question answering | 45% |

There are **20 examples per result at 10M**, with thinking disabled and exact-answer matching. [Startup Fortune’s October 27 coverage](https://startupfortune.com/mirendil-unveils-fern-an-ai-model-claiming-a-10-million-token-context-window/) also highlights the drop on multi-hop questions. The sample is small, and the scores describe particular tasks rather than a general accuracy rate.

The separate agent evaluation measures work performed with code and tools. Mirendil reports these Fern results using **OpenCode and one attempt**:

| Benchmark | Work being evaluated | Fern pass rate |
| --- | --- | ---: |
| [SWE-bench Verified](https://www.swebench.com/) | Resolve real repository issues | 73.4% |
| [SWE Atlas Codebase QnA](https://labs.scale.com/leaderboard/sweatlas-qna) | Explain systems through code exploration and execution | 53.2% |
| [Terminal-Bench 4.0](https://snorkel.ai/leaderboard/terminal-bench/) | Complete software tasks in terminal environments | 6.1% |

These results show why context capacity should not stand in for overall coding ability. Mirendil’s comparison table also mixes agent setups and score sources, so it should not be read as a controlled head-to-head experiment.

## Where Fern could fit beside retrieval-based agents

An alternative is to keep a stronger general coding model supplied with carefully selected files and search results. That can avoid processing a huge input on every request, but it depends on selecting the right evidence. The [PageIndex explainer](/news/pageindex-tree-based-rag-relevance/) examines that selection problem for documents; [flow-1’s trace-analysis approach](/news/beam-embeddinggemma-2-flow-1/) applies a specialized model to investigating agent histories.

Fern proposes another option for tasks where the relationships are hard to identify before reading the whole record. A fair comparison would give both approaches the same failed run, then measure the explanation, fix, latency and cost.

**Access remains “coming soon,” with early-access requests open.** No downloadable weights, open-source license or public pricing are supplied with the announcement. Fern is therefore a model preview with early evidence, not a tool readers can already self-host.

For the failed training run, the promise is understandable: keep more of the investigation available while reasoning about it. The unresolved question is how reliably Fern can turn that additional evidence into a correct diagnosis.

Sources: [Fern announcement and evaluations](https://mirendil.com/news/introducing-fern/), [Mirendil’s pretraining account](https://mirendil.com/news/pretraining-at-scale-without-a-pretraining-team/), [RULER paper](https://arxiv.org/abs/2404.06654), [WSJ company reporting](https://www.wsj.com/tech/ai/anthropic-veterans-startup-seeks-to-help-scientists-develop-their-own-ai-09e2f3e5), and [Startup Fortune’s launch coverage](https://startupfortune.com/mirendil-unveils-fern-an-ai-model-claiming-a-10-million-token-context-window/).
