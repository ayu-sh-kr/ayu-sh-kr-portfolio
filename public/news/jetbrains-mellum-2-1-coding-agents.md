# JetBrains Mellum2.1: an open 12B model for local coding agents

**JetBrains released Mellum2.1 on October 8**, an open-weight model trained to work inside code repositories. It can be deployed locally or on private infrastructure, giving teams another option for coding agents that inspect files, make edits and check their work.

Consider a failing checkout test. Writing a replacement function is only part of the job: an agent has to locate the cause, understand the surrounding code and run the test after its edit. Mellum2.1’s update focuses on that sequence, while keeping the compact architecture introduced with Mellum2.

## Same model size, more practice inside repositories

Mellum2.1 has **12 billion total parameters, with 2.5 billion active per token**. Its mixture-of-experts design selects part of the model for each step of generation. That reduces active computation; it does not make the stored weights a 2.5B model.

JetBrains concentrated this update on reinforcement learning: training through tasks whose outcomes can be checked. It says training involved millions of sandbox runs across thousands of environments. For software engineering, the model worked with repositories, a shell and file-editing tools, receiving rewards when tests passed.

For the checkout failure, the training task can continue after an edit: the agent runs a test, sees whether the change worked and tries again if needed. That connects tool use to a verifiable result.

## What the benchmark jump actually measures

SWE-bench Verified measures fixes to real repository issues. Terminal-Bench tests tasks performed through a terminal, while LiveCodeBench evaluates coding problems. We checked the official model card’s scores and evaluation settings; the results below are **self-reported by JetBrains**.

| Benchmark | Mellum2 Thinking | Mellum2.1 Thinking | Qwen3.5-9B |
| --- | --- | --- | --- |
| SWE-bench Verified | 2.0% | 47.0% | 50.0% |
| Terminal-Bench 2.1 | 0.6% | 17.4% | 21.7% |
| LiveCodeBench v6 | 69.4% | 82.0% | 75.4% |

The repository evaluations used the same Pi v0.73.1 agent harness, shell and file tools, a 114K-token context and up to 16K tokens per turn. Each model used its default sampling settings. The non-agentic evaluations used greedy decoding.

Mellum2.1 improves substantially over Mellum2, but Qwen remains ahead on the two agentic tests shown here. The stronger LiveCodeBench result does not establish the same advantage when navigating a repository. These measurements support trying Mellum2.1 as a worker; they do not predict success on every project.

## Open weights, with a practical local option

The release uses the **Apache 2.0 license**. JetBrains’ official GGUF repository now provides files for local runtimes, although the launch announcement still describes those builds as forthcoming.

The smallest listed file is 7.0 GB; the recommended Q4_K_M version is 8.1 GB, compared with 24.3 GB for BF16. Quantization stores weights at lower precision to reduce their size, with a quality trade-off.

> A model’s download size is only one part of its runtime memory requirement.

Context storage and runtime overhead need additional memory. Its 131,072-token context window—the amount of text it can consider at once—also consumes memory. A 7 GB download does not imply that 7 GB of memory is enough to use that full window.

With Ollama installed and enough available memory, the official GGUF instructions give this command to download and start the recommended variant:

```bash
ollama run hf.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking-GGUF:Q4_K_M
```

This starts a model conversation. Repository access and test execution still require an agent application with those tools. We checked the documented command, but did not run inference or measure local performance.

## Where Mellum2.1 fits

JetBrains positions the model as a worker within larger agent systems. This connects with the [local and cloud model routing planned for GitHub Copilot](/news/github-copilot-local-model-routing-hydrafusion/): choosing where a task runs is becoming part of agent design. A bounded task, such as investigating one failing test, gives a team a concrete way to assess whether it is useful before delegating broader changes.

The release also advertises faster decoding with multi-token prediction, which proposes several tokens at once. Its MTP head remains marked as forthcoming in the launch documentation, so that speed claim should be separated from the available weights.

For the checkout failure at the start, the promise is a local worker that can follow a bug from investigation through a tested patch. The reported results show progress toward that role. Whether it earns a place in a team’s workflow depends on the fixes it produces on that team’s code, and the resources those fixes require.

Sources: [JetBrains release announcement](https://blog.jetbrains.com/ai/2026/10/mellum2-1-gets-to-work-a-fast-open-model-for-coding-agents/), [official model card and evaluation settings](https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking), and [official GGUF files and local instructions](https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking-GGUF).
