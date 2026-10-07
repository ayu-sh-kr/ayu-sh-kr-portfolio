# Reflection Beam, EmbeddingGemma 2 and flow-1: Features and Release Status

**Reflection has previewed Beam for coding and reasoning, Google has released EmbeddingGemma 2 for multimodal search, and Laminar has introduced flow-1 for agent debugging.** The releases span model execution, local retrieval and trace analysis, with different approaches to reducing the cost of those tasks.

Beam’s downloadable weights are planned for later this month. EmbeddingGemma 2 is available now, while flow-1 is offered through Laminar’s Signals. Here is what each announcement brings.

## Reflection Beam: open-weight coding and reasoning preview

Reflection [introduced Beam on October 5](https://reflection.company/blog/introducing-beam) as its first model for coding, reasoning and agentic workloads. The preview is undergoing final evaluations, with early access through a waitlist. **Weights, a technical report, a model card and developer tools are planned for October**, with the weights to use Apache 2.0.

Beam has **501 billion total parameters and 23 billion active per token**. Its sparse mixture-of-experts design selects parts of the network for each token, reducing generation work while retaining a much larger total model.

![Beam routes an input token through selected experts, leaves other experts idle, and combines the selected outputs.](/news/assets/beam-embeddinggemma-2-flow-1/beam-routing.svg)

### Coding, tools and adjustable reasoning

Reflection’s demonstrations cover application development, research and model fine-tuning. Beam is **text-only**, but can use tools to access information from other media. Its reasoning-effort setting lets developers trade shorter responses for more extensive reasoning.

The company positions inference efficiency as a central capability. Its compute comparisons estimate generation work and exclude prompt processing and serving overhead, so they are not measured API-cost comparisons. Deployment requirements will become clearer with the downloadable release.

The preview therefore establishes the model’s intended role and reported capabilities; the weight release is the next availability milestone.

## Google EmbeddingGemma 2: local search across media

Google [released EmbeddingGemma 2 on October 6](https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2/) under Apache 2.0. **It is an embedding model: it turns content into lists of numbers that capture its meaning, so an application can find related information.** It produces searchable representations rather than chat answers.

The new model supports **text, code, images, video and audio in one shared space**. A text query can find a relevant video clip or audio recording, even when the file name does not describe it. These searches can run locally on consumer devices.

![Animated media inputs enter an embedding model, emerge as a numerical vector, and reach local search results.](/news/assets/beam-embeddinggemma-2-flow-1/shared-search.svg)

The [740M-parameter model](https://ai.google.dev/gemma/docs/embeddinggemma/model_card_2) combines a 270M text component with optional vision and audio encoders. It supports more than 100 languages, an **8K context window**, and shorter output vectors to reduce index storage.

Google reports about **191MB active RAM for quantized text-only weights and 567MB for the full model on a Pixel 11 Pro**. Those measurements cover the stated configurations; application and search-index memory are additional.

Weights are available through Hugging Face and Kaggle. [Unsloth provides GGUF downloads and fine-tuning guidance](https://unsloth.ai/docs/models/embeddinggemma-2), while Google lists local deployment support through tools including LiteRT, MediaPipe, llama.cpp and Ollama.

## Laminar flow-1: a model for investigating agent failures

Laminar’s [flow-1 announcement, dated October 2](https://laminar.sh/blog/flow-1), introduces a model trained with reinforcement learning to find errors in agent traces. A trace records the model calls, tool calls and results behind an agent’s output.

flow-1 runs inside **Signals**, Laminar’s trace-investigation agent. It can search the recorded steps, inspect evidence and return findings in a requested JSON schema. Its role is to identify failures and explain their causes.

![flow-1 finds a contradiction between an agent’s all-tests-passed message and recorded test output showing two failures.](/news/assets/beam-embeddinggemma-2-flow-1/trace-investigation.svg)

### Reported detection quality and analysis cost

Laminar evaluated 523 difficult traces using the same Signals agent across models. It reports detection F1 of **0.835 for flow-1 and 0.816 for GPT-6-sol**. F1 balances precision and recall; these are task-specific results from Laminar’s benchmark.

The company’s **23× lower-cost claim** covers complete Signals runs on traces with fewer than 100,000 total LLM tokens, including retrieval steps. It reports 888 traces per dollar for flow-1 versus 38 for GPT-6-sol, and analysis costs approximately 25% below GPT-6-luna.

Laminar prices flow-1 at $0.05 per million input tokens, $0.01 for cached input and $0.30 for output. The announcement also includes a missed-failure example, making clear that wider trace coverage does not eliminate diagnostic errors.

### Structured findings beyond debugging

[Signals supports configurable investigations](https://laminar.sh/docs/signals/introduction), using a natural-language question and a schema for the result. Teams can investigate contradictions, extract structured information and track recurring patterns across agent runs.

That can turn a recorded session into something easier to act on: a specific finding with supporting steps, rather than another long transcript to read. The scope comes from the investigation definition, and the output can feed subsequent review and evaluation workflows.

## What is available now

| Model | Release status | Main capabilities |
| --- | --- | --- |
| Reflection Beam | Early-access preview; Apache 2.0 weights planned for October | Coding, reasoning and tool use with sparse expert routing |
| EmbeddingGemma 2 | Apache 2.0 weights available | Local text, code, image, video and audio embeddings |
| Laminar flow-1 | Available through Signals | Agent trace investigation and structured findings |

The immediate releases are Google’s embedding model and Laminar’s trace analysis offering. Reflection’s upcoming weight release will add the downloadable part of Beam’s announcement, alongside the materials needed to run and evaluate it.

Sources: [Reflection Beam](https://reflection.company/blog/introducing-beam) · [Google launch](https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2/) · [Google model card](https://ai.google.dev/gemma/docs/embeddinggemma/model_card_2) · [Unsloth guide](https://unsloth.ai/docs/models/embeddinggemma-2) · [Laminar flow-1](https://laminar.sh/blog/flow-1) · [Signals documentation](https://laminar.sh/docs/signals/introduction).
