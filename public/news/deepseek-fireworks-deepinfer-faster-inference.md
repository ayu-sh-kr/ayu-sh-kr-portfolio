# AI inference race: Meta’s $100K challenge and DeepSeek’s speed push

Meta and Paradigm have launched a **$100,000 challenge** to accelerate Muse Spark Open, as Fireworks claims **1,521+ tokens per second** with DeepSeek and DeepSeek releases its DeepInfer engine. The announcements shift attention to inference software: how much speed developers can extract from models already trained.

> **Inference** is what happens when a trained AI model processes a request and produces a response. Its speed affects how long users wait and how many requests a service can handle.

## Meta’s $100,000 Muse Spark Open Kernel Challenge

Announced on **October 22**, the [Muse Spark Open Kernel Challenge](https://openkernelchallenge.dev/) offers **$100,000 in total prizes**. [Paradigm's Matt Huang describes it as a joint Meta and Paradigm challenge](https://x.com/matthuang/status/2113354212642066518); Daniel Gross also [announced it](https://x.com/danielgross/status/2113351902402613558). Contestants start by optimizing GPU kernels, then improve how SGLang runs the model and handles requests.

> A **GPU kernel** is a small program that carries out part of the model’s calculations on a graphics processor. Kernels handle operations such as multiplying the large arrays of numbers used by the model.
>
> An **inference framework**, such as SGLang or DeepInfer, runs the model and manages incoming requests. It organizes calculations and shares the available hardware between them.

Meta has already shipped improvements. Its [October 15 release](https://research.meta.ai/blog/muse-spark-open) includes auto-tunable **Helion kernels**, reporting **1.03–3.95× speedups for individual operations** and a **3% increase in overall throughput on AMD MI350**.

The [PyTorch engineering post](https://pytorch.org/blog/muse-spark-open/) also describes **megakernels** that combine operations, reducing repeated launches and idle gaps on the GPU. The challenge gives developers a financial incentive to find further gains across the serving system.

## Fireworks claims 1,521+ tokens/s with DeepSeek V4.1 Flash

Fireworks says **DeepSeek V4.1 Flash 1017** runs at more than **1,521 tokens/s** on its Ultrafast platform. In the [company's Tetris demonstration](https://x.com/FireworksAI_HQ/status/2112973992097468795), the game was ready in **11 seconds**, with a claimed **sevenfold task-time advantage over Claude Opus 5.5**.

The [DeepSeek update](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017) also reports shorter outputs and reduced task execution time. Both output length and generation speed affect completion time.

| Development | Reported result | Measurement |
| --- | --- | --- |
| Fireworks Ultrafast | 1,521+ tokens/s with DeepSeek | Generation rate in its demonstration. |
| Tetris versus Opus 5.5 | 11 seconds; claimed 7× faster | Time to complete the demonstrated task. |
| Meta's Helion kernels | 1.03–3.95× operation speedups; 3% overall gain on MI350 | Individual kernels and total serving throughput. |
| DeepInfer's draft verification | 4–7% throughput gain | Against checking a fixed five-token draft at its production operating point. |

> These are company-reported results. Fireworks’ 7× claim compares task completion, not token rates: output length and reasoning time can differ. The 1,521+ tokens/s figure applies to its DeepSeek deployment, not every service running the model.

## DeepInfer targets decoding, caching and GPU scheduling

> **Caching** saves results from earlier calculations so repeated instructions or context do not need to be processed from scratch.
>
> **Speculative decoding** drafts several possible next tokens, then has the main model check them together. Accepting several at once can produce an answer in fewer steps.
>
> **Scheduling** decides which requests run next. Preparing that work while the GPU is still calculating helps it start the next step sooner.

DeepSeek's [DeepInfer documentation](https://github.com/deepseek-ai/DeepInfer/blob/main/doc/inference_deployment_qa.md) reports that its DSpark mechanism selects drafts using confidence estimates, delivering **4–7% more throughput** than checking all five draft tokens each time. It also overlaps CPU scheduling with GPU execution and describes retaining reusable context caches for days.

For coding agents that repeatedly edit files and call tools, these savings can accumulate across many turns. The [DeepInfer release](https://github.com/deepseek-ai/DeepInfer) exposes core engine features, although parts of its production cache and service infrastructure remain outside it.

## Inference security comes under pressure

The speed push arrives during a week of serious security disclosures. Recent Dispatch coverage followed [PHP2Shell's remote-code-execution flaws](/news/php-critical-rce-october-2026/), [Railway's possible exposure of customer secrets](/news/railway-environment-variables-security-breach/) and the [OpenCode Console breach involving saved provider keys](/news/opencode-console-breach-api-keys/).

Railway's [October 21 disclosure](https://blog.railway.com/p/security-disclosure-wednesday-october-21st) connects the concern directly to this industry: it believes the incident forms part of attacks aimed at compromising AI inference providers. The entry point and full impact remain under investigation.

The disclosures put access controls alongside performance as an operational concern. Faster automation could also accelerate misuse of stolen credentials or mistakes by agents with broad permissions. The incidents do not establish that inference speed played a role.

Meta is paying for further gains; Fireworks and DeepSeek are already reporting them. For teams deploying agents, the useful measure is how quickly they complete correct work within defined permissions. Tokens per second captures only part of that result.
