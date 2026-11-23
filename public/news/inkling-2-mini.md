# Inkling 2 Mini runs the same layers three times. What does that buy a laptop?

An open-weight model can fit on a laptop’s drive and still need more memory than the laptop has. **Inkling 2 Mini** tackles part of that problem by sending each token through the same twelve layers three times, without storing three copies of those layers. **Gall**, a separate runtime for Apple Silicon, lowers the hardware requirement further: its maintainer ran Mini on a **24 GB MacBook Air**, below the 32 GB that Thinking Machines lists for the original checkpoint.

Thinking Machines Lab released Mini on November 20. It accepts text and images, generates text and tool calls, and is available through Tinker or as an **Apache 2.0** download. It builds on [Inkling 2 Small’s four-bit training recipe](/news/inkling-2-four-bit-training/), which lets the lab store each expert weight in fewer bits. Mini also stores fewer weights and gets more work out of the ones it keeps.

## What counts as one pass?

Inkling generates text one **token** at a time. Thinking Machines describes a network with **24 layers** arranged in four blocks of six. For each token, the first block runs once. The two middle blocks then run together, from layer 7 through layer 18. One trip through those twelve layers is **one pass**. After three passes, the final block runs once and the model predicts the next token.

![Four six-layer blocks process one token. The middle pair runs three times, retaining access to the input block and the previous pass.](/news/assets/inkling-2-mini/layer-loop.svg)

Those 24 stored layers do **48 layer operations per token**. Each trip through the middle pair starts with the first block’s output. On the second and third trips, the model also reads **a message from the previous pass**. A gate learned during training determines how much of that message to use.

Reusing the middle layers gives each token more processing without adding another copy of those weights. Mini also cuts the size of the layers themselves by keeping fewer experts.

## How the model fits in memory

Each expert layer started with **its own pool of 384 experts**, or groups of weights the model can choose among. Thinking Machines kept the **128 most-used experts in each layer**. Different layers keep different pools; when the loop revisits a layer, it uses that layer’s existing pool.

Dropping two-thirds of each pool freed memory, but it also removed weights the model had learned to use. The lab trained the smaller network on **one trillion tokens** distilled from a larger Inkling model so the remaining experts could pick up that work.

> Mini stores **26.4 billion parameters** across the whole model. Its routing selects **3.4 billion distinct parameters** per token. Counting repeated uses in the middle layers brings that to **5.4 billion weight activations**.

Most expert weights are stored at **four-bit precision**; the final four layers use eight-bit precision. This brings the original checkpoint to about **20 GB on disk**.

## How Mini compares with Qwen

**Qwen3.8-27B** has a similar total parameter count. In [Thinking Machines’ release benchmarks](https://thinkingmachines.ai/news/inkling-2-mini/), Mini led by six percentage points on software engineering tasks and by 17.4 points on difficult web research. Qwen held a small lead on the terminal benchmark.

| Benchmark | What it tests | Inkling 2 Mini | Qwen3.8-27B |
| --- | --- | ---: | ---: |
| DeepSWE v1.1 | Resolving software engineering tasks | **48.2%** | 42.2% |
| BrowseComp | Finding difficult answers on the web | **79.0%** | 61.6% |
| MCP Atlas Public | Completing tasks with connected tools | **82.7%** | 77.3% |
| Terminal Bench v2.1 | Working in a terminal | 71.6% | **73.0%** |

[Artificial Analysis](https://artificialanalysis.ai/articles/inkling-2-mini) gave Mini and Qwen the same overall Intelligence Index score. Mini produced **about 38% more output tokens**, while the evaluator estimated that Mini used **roughly 36% of Qwen’s compute**.

## What do the extra passes change?

To isolate the effect of looping, Thinking Machines tested a separate **variable-loop research model**. More passes helped it follow longer chains of references in supplied material, while recall without reference material barely changed. On **Think Fast**, the model had to answer directly without writing intermediate steps. At one pass it got half the tasks right at a difficulty that takes a human about **16 seconds**. At three passes that rose to **37 seconds** before largely leveling off.

The team also checked whether shorter written reasoning made the research model harder to supervise. In its initial tests, the reasoning remained readable and longer loops showed no clear pattern of making undisclosed side tasks more successful.

More passes can give the model more room to work before it answers. On a laptop, that work still needs to fit in memory.

## How Gall runs Mini on a 24 GB Mac

Thinking Machines lists Apple Silicon Macs with **32 GB or more** for the [original checkpoint](https://thinkingmachines.ai/model-card/inkling-2-mini/). [Gall](https://github.com/ltrgoddard/gall) uses a more compact version of the weights from Unsloth. Its Rust host and custom **Metal GPU kernels** read the **12.7 GB** GGUF file in place, avoiding a larger copy in memory.

Gall’s maintainer measured a **5.3 GB server footprint** with an 805-token prompt on a **24 GB M2 MacBook Air**. Allowing for the full 12.7 GB weights file brings the estimated memory budget to about **18 GB**. Separate runs on that Mac reached **20.5 tokens per second** at short context and **16.2–16.5** at roughly 30,000 tokens.

Gall unloads the model after **one idle second** by default. It can save conversation state for prefixes of at least 512 tokens, so a later turn can reuse that work without keeping the model in memory between requests.

Mini’s layer reuse makes more processing possible with the same stored weights. Gall changes where that work can happen: on the tested 24 GB Air, the model could answer locally and give memory back when it was idle.

## Sources

- [Thinking Machines Lab’s release, flight demo and benchmark tables](https://thinkingmachines.ai/news/inkling-2-mini/)
- [Technical model card and variable-loop evaluations](https://thinkingmachines.ai/model-card/inkling-2-mini/)
- [Model weights and license on Hugging Face](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Artificial Analysis comparison of intelligence, tokens and compute](https://artificialanalysis.ai/articles/inkling-2-mini)
- [Gall’s Metal runtime, memory budget and M2 MacBook Air measurements](https://github.com/ltrgoddard/gall)
