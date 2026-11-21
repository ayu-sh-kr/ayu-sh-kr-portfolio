# Inkling 2 Mini runs the same layers three times. What does that buy a laptop?

Somewhere mid-flight, a Thinking Machines Lab researcher put a MacBook Pro in airplane mode and asked it to build a flight simulator. A few minutes later, the simulator was playable. The laptop had 48 GB of unified memory, and the model writing the code took up roughly 20 GB. How did a model that fits in that space work through a coding problem? Part of the answer is that it uses the same part of its network three times.

Released on November 20, **Inkling 2 Mini** takes text and images as input and produces text, including code and tool calls. Thinking Machines published the weights under **Apache 2.0** and made the model available through Tinker for hosted inference and customization. Alongside Mini, the lab released a second model that lets researchers change the number of passes. Together, the two releases let us ask a more precise question than the flight demo can answer. Which tasks actually benefit from another pass?

## How 24 layers do 48 layers’ worth of work

A language model generates an answer a token at a time. In a conventional transformer, information used to predict the next token travels through a stack of layers once. Inkling has **24 stored layers**. The first six process the input, the middle twelve run three times, and the final six produce the representation used to predict the next token. That adds up to **48 layer applications**. The laptop only needs to hold one copy of the middle twelve.

What makes a second pass worthwhile is what it receives. Each pass can read the first six layers’ output, and later passes also receive information from the preceding pass. Imagine following a reference from one function to another while tracing a bug. On the second reading, you still have the original code in front of you, but now you know where the first reference led. The architecture gives the model a way to carry an intermediate result forward before it writes another token.

> **Why three parameter counts?** Mini stores **26.4 billion** parameters. Its mixture-of-experts design selects a subset for each token, bringing the distinct active count to **3.4 billion**. Counting repeated use inside the loop gives **5.4 billion weight activations**. The first figure helps explain what must fit in memory. The last describes how often the selected weights are used.

The team also changed what the laptop had to store. During training, it kept the 128 most-used experts out of 384 in each expert layer. The remaining experts then trained on a trillion tokens distilled from a larger Inkling model to recover lost performance. Most expert weights use four-bit precision, with eight-bit precision in the final four layers. Pruning and lower precision explain much of the small footprint. Looping explains how Mini spends additional computation within it.

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

Back on the plane, the researcher could test the result by flying the simulator. That is also where Mini makes its clearest case for developers. Give it a repository to inspect, a tool to call or a test it can rerun, and it has evidence to work with on the next step. The benchmarks suggest that a machine with enough memory can do much of that work locally. Ask it for an obscure fact from memory, and the advantage of those extra passes largely disappears.

## Sources

- [Thinking Machines Lab’s release, flight demo and benchmark tables](https://thinkingmachines.ai/news/inkling-2-mini/)
- [Technical model card and variable-loop evaluations](https://thinkingmachines.ai/model-card/inkling-2-mini/)
- [Model weights and license on Hugging Face](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Artificial Analysis comparison of intelligence, tokens and compute](https://artificialanalysis.ai/articles/inkling-2-mini)
