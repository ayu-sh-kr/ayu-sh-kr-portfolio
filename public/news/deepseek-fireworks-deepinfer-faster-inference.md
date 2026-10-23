# The race to faster AI inference: Meta, Fireworks and DeepSeek

**Meta and Paradigm have launched a $100,000 prize challenge to make Muse Spark Open run faster**, while Fireworks is promoting DeepSeek generation above **1,521 tokens per second**. DeepSeek has also released DeepInfer, the framework behind its production inference service. This week's announcements put the software running AI models at the centre of the competition.

The goal is shorter waits and more work from the available hardware. Improving inference can make an existing model more responsive and cheaper to serve, without waiting for another generation of training.

> **Note — the terms:** Inference is running a trained model to produce an answer. A token is a piece of text it processes or generates. GPU kernels perform individual calculations; an inference framework coordinates that work and serves requests.

## Meta puts a reward on faster Muse Spark

Announced on **October 22**, the [Muse Spark Open Kernel Challenge](https://openkernelchallenge.dev/) offers **$100,000 in total prizes**. [Paradigm's Matt Huang describes it as a joint Meta and Paradigm challenge](https://x.com/matthuang/status/2113354212642066518); Daniel Gross also [announced it](https://x.com/danielgross/status/2113351902402613558). Contestants start by optimizing GPU kernels, then improve how SGLang serves the model.

Meta has already shipped improvements. Its [October 15 release](https://research.meta.ai/blog/muse-spark-open) includes auto-tunable **Helion kernels**, reporting **1.03–3.95× speedups for individual operations** and a **3% increase in overall throughput on AMD MI350**.

The [PyTorch engineering post](https://pytorch.org/blog/muse-spark-open/) also describes **megakernels** that combine operations, reducing repeated launches and idle gaps on the GPU. The challenge gives developers a financial incentive to find further gains across the serving system.

## Fireworks makes the speed difference visible

Fireworks says **DeepSeek V4.1 Flash 1017** runs at more than **1,521 tokens/s** on its Ultrafast platform. In the [company's Tetris demonstration](https://x.com/FireworksAI_HQ/status/2112973992097468795), the game was ready in **11 seconds**, with a claimed **sevenfold task-time advantage over Claude Opus 5.5**.

The [DeepSeek update](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017) also reports shorter outputs and reduced task execution time. Producing fewer tokens to complete a task can help alongside generating them faster.

The reported gains cover different parts of the system:

| Development | Reported result | Measurement |
| --- | --- | --- |
| Fireworks Ultrafast | 1,521+ tokens/s with DeepSeek | Generation rate in its demonstration. |
| Tetris versus Opus 5.5 | 11 seconds; claimed 7× faster | Time to complete the demonstrated task. |
| Meta's Helion kernels | 1.03–3.95× operation speedups; 3% overall gain on MI350 | Individual kernels and total serving throughput. |
| DeepInfer's draft verification | 4–7% throughput gain | Against checking a fixed five-token draft at its production operating point. |

> **Note — reading the comparison:** These are producer-reported results. Fireworks' sevenfold task-time claim is not an Opus token-rate measurement. Output length, reasoning settings and correctness affect completion time; the 1,521+ rate belongs to Fireworks' deployment.

## Less repeated work, less idle hardware

The gains come from several directions. **Caching** reuses work already done on matching instructions and context. **Speculative decoding** drafts several next tokens and checks them together. **Scheduling** keeps the hardware working while the next batch is prepared.

DeepSeek's [DeepInfer documentation](https://github.com/deepseek-ai/DeepInfer/blob/main/doc/inference_deployment_qa.md) makes those improvements concrete. Its DSpark mechanism selects drafts using confidence estimates, reporting **4–7% more throughput** than checking all five draft tokens each time. It also overlaps CPU scheduling with GPU execution and describes retaining reusable context caches for days.

Meta's kernel work and DeepSeek's engine changes target different sources of wasted time. For an agent that repeatedly edits code, calls tools and reads results, savings can accumulate across many turns. More requests per GPU can also lower the cost of serving them. The [DeepInfer release](https://github.com/deepseek-ai/DeepInfer) exposes core engine features, although parts of its production cache and service infrastructure remain outside it.

## A faster week for AI, a difficult week for security

The speed push arrives during a week of serious security disclosures. Recent Dispatch coverage followed [PHP2Shell's remote-code-execution flaws](/news/php-critical-rce-october-2026/), [Railway's possible exposure of customer secrets](/news/railway-environment-variables-security-breach/) and the [OpenCode Console breach involving saved provider keys](/news/opencode-console-breach-api-keys/).

Railway's [October 21 disclosure](https://blog.railway.com/p/security-disclosure-wednesday-october-21st) connects the concern directly to this industry: it believes the incident forms part of attacks aimed at compromising AI inference providers. The entry point and full impact remain under investigation.

Faster inference makes legitimate automation more useful. It can also shorten automated steps after an attacker gains access, or help an over-permissioned agent act before a person reviews the result. A stolen provider key carries spending authority; an agent with deployment credentials can change a running system. **The concern is how much authority sits behind the faster response.**

Meta's challenge and the new serving engines could make capable agents cheaper and more responsive. This week's breaches sharpen the question that belongs alongside the speed figures: **what can that agent access, and which actions still need approval?** The time saved should make room for review, testing and recovery as the tools take on more work.
