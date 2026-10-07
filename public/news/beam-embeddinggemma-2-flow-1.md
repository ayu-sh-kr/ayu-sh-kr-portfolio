# Beam, EmbeddingGemma 2 and flow-1: AI models for coding, search and debugging

**Reflection, Google and Laminar have announced models for three different parts of AI development.** Beam targets coding and reasoning, EmbeddingGemma 2 brings multimodal search to consumer devices, and flow-1 looks for mistakes inside agent runs.

The announcements arrived within days of each other: Laminar’s flow-1 post is dated October 2, Reflection introduced Beam on October 5, and Google launched EmbeddingGemma 2 on October 6. Read together, they show why a model’s job matters as much as its size. Writing code, finding the right evidence and checking what an agent actually did each place different demands on a system.

## Reflection Beam: a large model with selective computation

[Reflection’s first model, Beam](https://reflection.company/blog/introducing-beam), has **501 billion total parameters, with 23 billion active per token**. It uses a sparse mixture-of-experts architecture: a router sends each token through selected experts, rather than running every expert for every token.

The isometric illustration shows that selection. Solid paths pass through active experts; the pale blocks remain unused for this token. It is a conceptual view, not Beam’s exact expert layout.

![Isometric routing diagram showing one token passing through two selected experts while other experts stay idle, before their outputs are combined.](/news/assets/beam-embeddinggemma-2-flow-1/beam-routing.svg)

That distinction explains the efficiency pitch. **Active parameters describe computation; total parameters still matter for storage.** Selecting fewer experts can reduce work during generation, but it does not turn a 501B model into a small download or establish that it will fit on an ordinary laptop. Memory, quantization and the serving setup are separate questions.

Reflection says Beam is text-only and designed for coding, reasoning and agentic tasks. Its training included more than 100 million reinforcement-learning rollouts on 10,500 NVIDIA GB300 GPUs over four weeks. A rollout is an attempted sequence of actions from which training can learn, including whether the attempt succeeds.

The company’s efficiency comparisons use estimated generation compute and exclude prompt processing and serving overhead. They should therefore be read as compute estimates, rather than measured hosting bills.

**Beam is still a preview.** Reflection plans to publish its weights under Apache 2.0, alongside a technical report and developer materials, later in October. The upcoming release will be the point to assess deployment requirements and reproduce its results.

For organizations considering a coding model, this leaves two questions to answer separately. Can it solve the work reliably, and can it be operated economically within the intended environment? Sparse routing helps with the second question, but a practical evaluation needs both. A successful demonstration also needs to survive unfamiliar repositories, incomplete instructions and failing tools.

## EmbeddingGemma 2: search across text, pictures and sound

Google’s [EmbeddingGemma 2 launch](https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2/) addresses the information an application needs before it answers. An embedding model turns content into numerical representations that a search system can compare. It supplies a way to locate related material; a separate generative model can then use that material to produce an answer.

The new model maps **text, code, images, video and audio into a shared embedding space**. Its [model card](https://ai.google.dev/gemma/docs/embeddinggemma/model_card_2) lists 740 million total parameters: a 270M text model, a 170M vision encoder and a 300M audio encoder. The encoders are modular, so text-only workloads can load the smaller text component.

The illustration brings different media onto one search plane. Nearby markers represent related content, not files being merged into a single document. Their positions are illustrative, rather than an actual projection of model outputs.

![Isometric media cards for text, images and audio feeding a shared search plane, with related items grouped nearby.](/news/assets/beam-embeddinggemma-2-flow-1/shared-search.svg)

Consider a recorded demonstration with a screenshot and a written explanation. Searching for a concept might need the spoken description, the visible screen or both. Representing those media in a compatible space makes that kind of cross-modal retrieval possible without building an entirely separate search experience for each format.

Google reports an 8K context window and support for vectors of 768, 512, 256 or 128 dimensions. Shorter vectors can reduce the size of an index. Its Apache 2.0 release is available through model distribution platforms and supported development tools.

### What the small-memory claim actually covers

The screenshot’s “0.5GB RAM” headline needs a workload attached to it. Google reports approximately **191MB active RAM for quantized text-only weights and 567MB for the full multimodal model on a Pixel 11 Pro**. Those figures describe a particular configuration, rather than a universal memory requirement for an application and its search index.

[Unsloth’s guide](https://unsloth.ai/docs/models/embeddinggemma-2) provides local inference and fine-tuning paths, including GGUF files. It also distinguishes text-and-code serving from multimodal use: images and audio need a runtime that supports the corresponding encoders and processor files.

The practical appeal is local retrieval, especially when files should remain on the device or search must work offline. That benefit depends on the whole application’s data flow. Generating embeddings locally does not establish where a later answer-generation request sends the retrieved content.

And retrieval still needs evaluation. A nearby vector is a candidate match, not proof that a passage answers the question. A system searching a return policy, for example, must distinguish the policy for electronics from one for clothing even when both passages discuss refunds. Better representations help find candidates; the application must still check which evidence applies.

## Laminar flow-1: finding errors after an agent acts

Once an agent has retrieved information and acted on it, its completion message is only one part of the evidence. The useful record is its **trace**: the sequence of model responses, tool calls and results that led to the outcome.

[Laminar’s flow-1](https://laminar.sh/blog/flow-1) is trained with reinforcement learning to investigate those traces. The company reports results on 523 difficult traces, with detection F1 of 0.835 for flow-1 and 0.816 for GPT-6-sol using the same Signals agent. F1 balances precision and recall; it is not a percentage of all runs handled correctly.

Its **23× cost claim** comes from Signals runs on traces with fewer than 100,000 total LLM tokens, including retrieval steps. Laminar reports 888 traces per dollar for flow-1 versus 38 for GPT-6-sol. This is a vendor benchmark for trace analysis, rather than evidence that flow-1 matches that model across general tasks.

The illustration follows an investigation from recorded steps to a finding, with the supporting evidence kept visible.

![Isometric agent trace with recorded tool steps, a magnifying glass over a failed step, and an evidence-linked finding card.](/news/assets/beam-embeddinggemma-2-flow-1/trace-investigation.svg)

Laminar’s [Signals documentation](https://laminar.sh/docs/signals/introduction) describes configurable investigations that return structured findings. Instead of only asking whether the final answer looks plausible, a team can ask whether the recorded actions support it. An example question would be whether an agent’s claim that tests passed agrees with the test output.

That is useful because mistakes can happen between otherwise reasonable steps. An agent may read the correct requirement, edit the wrong file and still produce a confident summary. Inspecting the trail offers a chance to identify the point where its actions stopped matching the request.

Detection remains fallible. Laminar’s announcement includes a case where flow-1 missed required contract protections that the comparison models caught. Wider coverage can help surface issues, but critical findings still need verification against the evidence.

## Three announcements, three different responsibilities

These products are not an announced integration. A pipeline combining them would be a design choice, with compatibility, latency and data handling to evaluate.

Their releases nevertheless describe complementary responsibilities. **Beam** aims to perform coding and reasoning work. **EmbeddingGemma 2** helps locate information across media. **flow-1** investigates the record of what an agent did. Each needs a test suited to that responsibility: task completion, retrieval quality or failure detection.

The next milestones are concrete: Reflection’s downloadable release, testing Google’s retrieval model on real collections, and checking Laminar’s diagnostic quality on unfamiliar traces. The useful comparison is whether each model makes its assigned job cheaper or more reliable—and whether the evidence supports that result.

Sources: [Reflection Beam announcement](https://reflection.company/blog/introducing-beam) · [Google launch](https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2/) · [Google model card](https://ai.google.dev/gemma/docs/embeddinggemma/model_card_2) · [Unsloth guide](https://unsloth.ai/docs/models/embeddinggemma-2) · [Laminar flow-1 benchmark](https://laminar.sh/blog/flow-1) · [Signals documentation](https://laminar.sh/docs/signals/introduction).
