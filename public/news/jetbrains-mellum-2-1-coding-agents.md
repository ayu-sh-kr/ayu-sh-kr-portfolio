# JetBrains Mellum2.1: open coding model, benchmarks and local use

A coding agent fixing a failing test has to do more than suggest new code. It must find the cause, make an edit and check whether the change worked. **JetBrains released Mellum2.1 on October 8** to improve that kind of repository work, with open weights that teams can run on their own infrastructure.

The update keeps Mellum2’s model architecture and concentrates on what happens after its initial training. The question behind the release is practical: how much of a coding agent’s work can a smaller, locally deployed model handle?

## Learning to work through a bug

JetBrains says most of the work went into **reinforcement learning**, where a model learns from the outcomes of tasks it attempts. Training included millions of sandboxed runs across thousands of environments, with data filtered to remove problems such as broken tests and unverifiable answers.

For software engineering, the model used repositories, a shell and file-editing tools, earning rewards when tests passed. That gives it practice with the sequence an agent needs: read, act, observe the result and decide what to do next.

Imagine a checkout test failing because a discount is applied twice. The agent inspects the calculation, edits the relevant code and runs the test. If the failure remains, that result informs another attempt. The illustration follows this workflow; it is an example, not a measured Mellum2.1 run.

![Three isometric workstations show an agent inspecting repository files, editing code and running tests, with test feedback returning to the edit step.](/news/assets/jetbrains-mellum-2-1-coding-agents/repository-work-loop.svg)

Passing a test provides feedback. Reviewing the patch still matters: an edit can satisfy one test while changing behaviour elsewhere. Our [reinforcement learning explainer](/blog/reinforcement-learning-from-rlhf-to-rlsc/) explains how checkable outcomes become training signals.

## A 12B MoE model with 2.5B active parameters

Mellum2.1 uses a **mixture-of-experts (MoE)** architecture: only part of the model participates in generating each token, or piece of text. It has 12 billion parameters in total, with about 2.5 billion active per token.

The distinction matters for local deployment. Activating fewer parameters reduces computation, but the full set of weights still needs storage. A smaller active count does not turn it into a 2.5B model to download.

## Mellum2.1 benchmarks show progress and limits

The official model card reports the following results. SWE-bench Verified tests repository issue fixes, Terminal-Bench covers terminal tasks, and LiveCodeBench evaluates coding problems. **These are JetBrains’ own measurements**, checked here against its published evaluation settings.

| Benchmark | Mellum2 Thinking | Mellum2.1 Thinking | Qwen3.5-9B |
| --- | --- | --- | --- |
| SWE-bench Verified | 2.0% | 47.0% | 50.0% |
| Terminal-Bench 2.1 | 0.6% | 17.4% | 21.7% |
| LiveCodeBench v6 | 69.4% | 82.0% | 75.4% |

The agentic tests used Pi v0.73.1 with shell and file tools, a 114K-token context and up to 16K tokens per turn. Models used their respective default sampling settings; non-agentic tests used greedy decoding.

The improvement over Mellum2 is substantial. Qwen nevertheless leads on both agentic tests shown above, while Mellum2.1 leads on LiveCodeBench. Solving coding problems and completing repository tasks are related abilities, but strength in one does not establish the same advantage in the other.

## Running Mellum2.1 locally with GGUF and Ollama

The weights are released under **Apache 2.0**. JetBrains now lists GGUF builds for local runtimes, despite the launch post describing them as forthcoming. GGUF packages model weights for tools such as llama.cpp, Ollama and LM Studio.

The smallest listed file is 7.0 GB. JetBrains recommends the 8.1 GB Q4_K_M variant as a balanced choice; its BF16 version is 24.3 GB. The smaller files use quantization, which lowers weight precision to save space, with a quality trade-off.

> Download size is only part of the memory needed to run a model.

The runtime also needs working memory and storage for context. Mellum2.1 supports 131,072 tokens of context, but using that full window requires additional capacity; a 7 GB file is not a 7 GB total memory requirement.

With Ollama installed and sufficient memory, the official instructions provide this command to download and start the recommended variant:

```bash
ollama run hf.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking-GGUF:Q4_K_M
```

This opens a conversation with the model. An agent application must supply repository access and tools to edit files or run tests. The command is documented by JetBrains; local inference was not tested for this article.

## A local worker for a defined task

JetBrains positions Mellum2.1 as a worker inside an agent system, including smaller agents assigned parts of a larger plan. That fits the direction explored in [Copilot’s planned local and cloud model routing](/news/github-copilot-local-model-routing-hydrafusion/): different tasks can use different models.

For the checkout bug, the useful outcome is a correct patch that passes relevant tests and survives review. Mellum2.1’s reported gains make it a candidate for that work on private infrastructure. Its value will depend on how reliably it completes those tasks, and the time and memory each attempt takes.

Sources: [JetBrains release announcement](https://blog.jetbrains.com/ai/2026/10/mellum2-1-gets-to-work-a-fast-open-model-for-coding-agents/), [official model card and evaluation settings](https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking), and [official GGUF files and local instructions](https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking-GGUF).
