# Inkling 2 Mini runs the same layers three times. What does that buy a laptop?

Qwen and GLM already give developers open-weight models they can run on their own hardware. What’s unusual about **Inkling 2 Mini** is how it uses the memory on that machine. Before it writes the next piece of an answer, it sends the work in progress through the same part of its network three times. That gives it more opportunities to connect clues in a coding problem while keeping the model’s footprint around **20 GB**.

Thinking Machines Lab released Mini on November 20. It accepts text and images, generates text and tool calls, and is available through Tinker or as an Apache 2.0 download. The release builds on [Inkling 2 Small’s four-bit training recipe](/news/inkling-2-four-bit-training/), which we covered when the lab explained how it reduced the memory needed to represent each weight. Mini takes that idea further by cutting down the number of weights it stores and reusing some of the ones it keeps.

## What counts as one pass?

Imagine asking Mini which function in a code snippet returns an empty list. To begin its answer, the model must choose a **token**, a small piece of text such as a word or part of a function name. Inside the model, the question and code are represented as numbers. Each **layer** takes the numbers produced so far and transforms them. The final result helps determine which token the model writes next.

Mini stores **24 layers**. The first six run once. The next twelve form a group that the model can revisit. Going through that group from beginning to end counts as **one pass**. On the second pass, the group can use information from the first. On the third, it can use information from the second. Then the final six layers run once and the model chooses its token.

> **Where does 48 come from?** Count every time a layer does its job for one token. Six at the start, twelve on each of three passes, and six at the end give **6 + 12 + 12 + 12 + 6 = 48**. The middle group uses the same stored weights on all three visits. The model then repeats this process for the next token.

In the code example, one clue might be a return statement and another might be the condition that reaches it. The loop gives information about those clues more chances to interact before Mini names the function. What happens on each pass is learned during training. The engineers don’t assign a job like “find the condition” to any particular pass.

## How the model fits in memory

Mini also uses a **mixture of experts**. An expert is a group of weights inside a layer, and a routing calculation picks which groups to use for the current token. During training, the lab kept the 128 most-used experts out of 384 in each expert layer. The smaller network then trained on a trillion tokens from a larger Inkling model so the remaining experts could take over some of the work. Most expert weights use four-bit precision, with eight-bit precision in the last four layers.

> **Reading the model size.** A weight is a number learned during training. Mini stores **26.4 billion parameters** in total and uses **3.4 billion distinct parameters** for a token. Count repeated uses inside the loop and the figure rises to **5.4 billion weight activations**. For someone choosing hardware, all the stored weights still need room even though only a fraction participate at any one time.

## Where the extra passes pay off

A useful comparison is Qwen3.8-27B, a model with nearly the same total parameter count. On **DeepSWE**, which asks a coding agent to resolve software engineering tasks, Mini finished six percentage points ahead. Switch to terminal work and the order reverses. These figures come from Thinking Machines’ release table. Evaluation setups can vary by model.

| Benchmark | What it tests | Inkling 2 Mini | Qwen3.8-27B |
| --- | --- | ---: | ---: |
| DeepSWE v1.1 | Resolving software engineering tasks | **48.2%** | 42.2% |
| BrowseComp | Finding difficult answers on the web | **79.0%** | 61.6% |
| MCP Atlas Public | Completing tasks with connected tools | **82.7%** | 77.3% |
| Terminal Bench v2.1 | Working in a terminal | 71.6% | **73.0%** |

The split between **finding a fact and remembering one** helps explain these results. A model searching the web can follow a lead, inspect a page and revise its answer using what it finds. In the variable-loop experiments, extra passes also helped the model follow chains of references through material it had been given. Closed-book factual recall barely moved. If the information is missing, another trip through the same weights offers little help.

Independent testing adds a wrinkle. Artificial Analysis gave Mini and Qwen the same overall Intelligence Index score. Mini used **about 38% more output tokens** to get there, although the evaluator estimated that it needed roughly 36% of Qwen’s compute. Both findings can hold at once. Giving Inkling more passes can shorten its reasoning compared with a one-pass version of itself. A different model can still reach the same score in fewer words.

## What happens before the answer appears?

On **Think Fast**, the researchers required the variable-loop model to answer directly, without writing out intermediate steps. With one pass, it reached 50% reliability on tasks that take a human about **16 seconds**. At three passes, that rose to **37 seconds**, then largely leveled off. Those seconds describe task difficulty in human terms. They tell us how much work the model could handle before it had to put a step into words.

That raises a practical question for anyone supervising a coding agent. If more work happens inside the network, how much can a reviewer learn from the explanation on screen? In the lab’s initial experiments, written reasoning got shorter and remained readable. The researchers also found no clear trend toward more successful undetected side tasks as passes increased. The research model received reinforcement learning at three passes, so the study leaves open what a model trained specifically for deeper loops might learn.

For someone choosing a local coding model, the most revealing comparison is the kind of work it will do every day. Mini pulled ahead of Qwen on repository fixes and web research, while Qwen retained a small lead on the terminal benchmark. The variable-loop tests help explain where Mini’s design earns its keep. When a task depends on connecting clues already present in a file or a search result, another pass can help the model make that connection. When the missing piece is a fact it never learned, the same loop has little to work with.

## Sources

- [Thinking Machines Lab’s release, flight demo and benchmark tables](https://thinkingmachines.ai/news/inkling-2-mini/)
- [Technical model card and variable-loop evaluations](https://thinkingmachines.ai/model-card/inkling-2-mini/)
- [Model weights and license on Hugging Face](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Artificial Analysis comparison of intelligence, tokens and compute](https://artificialanalysis.ai/articles/inkling-2-mini)
