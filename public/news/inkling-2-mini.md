# Inkling 2 Mini runs the same layers three times. What does that buy a laptop?

Open-weight models give developers a choice about where to run them. Models from families such as Qwen and GLM can run on a developer’s own hardware, provided there’s enough memory. **Inkling 2 Mini** fits in about **20 GB**. Its architecture lets it do more work before producing each token. Before writing the next piece of an answer, it sends its work in progress through the **same twelve layers three times**. Each pass can build on what the previous one found.

Thinking Machines Lab released Mini on November 20. It accepts text and images, generates text and tool calls, and is available through Tinker or as a download under **Apache 2.0**. The release builds on [Inkling 2 Small’s four-bit training recipe](/news/inkling-2-four-bit-training/), which we covered when the lab explained how it reduced the memory needed to represent each weight. Mini takes that idea further by cutting down the number of weights it stores and reusing some of the ones it keeps.

## What counts as one pass?

Imagine asking Mini which function in a code snippet returns an empty list. To begin its answer, the model must choose a **token**, a small piece of text such as a word or part of a function name. That choice may depend on two clues several lines apart: a return statement and the condition that leads to it. As the input moves through the network, each layer can bring information about those clues together.

Mini stores **24 layers**. The first six run once. The next twelve form a group that the model can revisit. Going through that group from beginning to end counts as **one pass**. Mini makes **three passes** through this group before the final six layers run and it chooses a token.

![Four six-layer blocks process one token. The middle pair runs three times, retaining access to the input block and the previous pass.](/news/assets/inkling-2-mini/layer-loop.svg)

Across the four blocks, those 24 stored layers do **48 layer operations per token**. Each trip through the middle pair starts with the first block’s output. On the second and third trips, the model also reads **a message from the previous pass**. A gate learned during training determines how much of that message to use.

In the code example, this gives Mini another chance to connect the condition to the return statement before naming the function. All three passes use **one stored copy** of the middle layers. The size of that copy depends in part on how many experts each layer contains.

## How the model fits in memory

Each expert layer started with **its own pool of 384 experts**. Thinking Machines kept the 128 most frequently used in that layer, then made the same selection independently in the other layers. So when a token moves to the next expert layer, it encounters **a different pool of 128**. When the loop brings it back to a layer it has already visited, that layer’s pool is still there.

Dropping two-thirds of each pool freed memory, but it also removed weights the model had learned to use. The lab trained the smaller network on **one trillion tokens** distilled from a larger Inkling model so the remaining experts could pick up that work.

> Mini stores **26.4 billion parameters** across the whole model. Its routing selects **3.4 billion distinct parameters** per token. Counting repeated uses in the middle layers brings that to **5.4 billion weight activations**.

The **26.4 billion** figure includes the weights inside all those expert pools as well as the rest of the network. Storing most expert weights at **four-bit precision** further reduces the memory footprint. The final four layers use eight-bit precision.

## Where the extra passes pay off

How much work can Mini do with those weights? **Qwen3.8-27B** offers a comparison at nearly the same total parameter count. On **DeepSWE**, which asks a coding agent to resolve software engineering tasks, Mini finished six percentage points ahead. Switch to terminal work and the order reverses. These figures come from Thinking Machines’ release table. Evaluation setups can vary by model.

| Benchmark | What it tests | Inkling 2 Mini | Qwen3.8-27B |
| --- | --- | ---: | ---: |
| DeepSWE v1.1 | Resolving software engineering tasks | **48.2%** | 42.2% |
| BrowseComp | Finding difficult answers on the web | **79.0%** | 61.6% |
| MCP Atlas Public | Completing tasks with connected tools | **82.7%** | 77.3% |
| Terminal Bench v2.1 | Working in a terminal | 71.6% | **73.0%** |

The widest gap in the table is on **BrowseComp**, where a model can follow a lead, inspect a page and use what it finds. To isolate what looping contributes, the lab released a separate **variable-loop research model**. Increasing its pass count helped it follow longer chains of references in supplied material. Its **closed-book factual recall** barely changed.

The distinction between a **model comparison** and a **loop experiment** also matters when counting tokens. Artificial Analysis gave Mini and Qwen the same overall Intelligence Index score. Mini used **about 38% more output tokens** to get there, although the evaluator estimated that it needed roughly **36% of Qwen’s compute**. In the lab’s own experiments, increasing the pass count could shorten the research model’s written reasoning. That prompted a further question. How much could it work out before writing any intermediate steps at all?

## What happens before the answer appears?

On **Think Fast**, the researchers required the variable-loop model to answer directly, without writing out intermediate steps. With one pass, it reached 50% reliability on tasks that take a human about **16 seconds**. At three passes, that rose to **37 seconds**, then largely leveled off. Those seconds describe task difficulty in human terms. They tell us how much work the model could handle before it had to put a step into words.

For someone supervising a coding agent, that gap matters. A reviewer can inspect the model’s **written reasoning**, while the calculations inside each pass are harder to see. In the lab’s initial experiments, written reasoning got shorter and remained readable. The researchers also found no clear trend toward more successful undetected side tasks as passes increased. The research model received reinforcement learning at three passes, so the study leaves open what a model trained specifically for deeper loops might learn.

For someone choosing a local coding model, the most revealing comparison is the kind of work it will do every day. Mini pulled ahead of Qwen on repository fixes and web research, while Qwen retained a small lead on the terminal benchmark. The variable-loop tests help explain where Mini’s design earns its keep. When a task depends on connecting clues already present in a file or a search result, another pass can help the model make that connection. When the missing piece is a fact it never learned, the same loop has little to work with.

## Sources

- [Thinking Machines Lab’s release, flight demo and benchmark tables](https://thinkingmachines.ai/news/inkling-2-mini/)
- [Technical model card and variable-loop evaluations](https://thinkingmachines.ai/model-card/inkling-2-mini/)
- [Model weights and license on Hugging Face](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Artificial Analysis comparison of intelligence, tokens and compute](https://artificialanalysis.ai/articles/inkling-2-mini)
