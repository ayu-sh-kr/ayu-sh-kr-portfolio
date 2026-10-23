# The race to faster AI inference: Meta, Fireworks and DeepSeek

**Meta and Paradigm have launched a $100,000 prize challenge to make Muse Spark Open run faster**, while Fireworks is promoting DeepSeek generation above **1,521 tokens per second**. DeepSeek has also released DeepInfer, the framework behind its production inference service. This week's announcements put the software running AI models at the centre of the competition.

The goal is shorter waits and more work from the available hardware. Improving inference can make an existing model more responsive and cheaper to serve, without waiting for another generation of training.

> **Inference** is what happens when a trained AI model processes a request and produces a response. Asking a coding assistant to write a function is one example; training is the earlier work that taught the model its patterns.

## Meta puts a reward on faster Muse Spark

Announced on **October 22**, the [Muse Spark Open Kernel Challenge](https://openkernelchallenge.dev/) offers **$100,000 in total prizes**. [Paradigm's Matt Huang describes it as a joint Meta and Paradigm challenge](https://x.com/matthuang/status/2113354212642066518); Daniel Gross also [announced it](https://x.com/danielgross/status/2113351902402613558). Contestants start by optimizing GPU kernels, then improve how SGLang runs the model and handles requests.

> A **GPU kernel** is a small program that carries out part of the model’s calculations on a graphics processor. Making it faster reduces the time spent on that operation.
>
> An **inference framework**, such as SGLang or DeepInfer, runs the model and manages incoming requests. It organizes calculations and shares the available hardware between them.

Meta has already shipped improvements. Its [October 15 release](https://research.meta.ai/blog/muse-spark-open) includes auto-tunable **Helion kernels**, reporting **1.03–3.95× speedups for individual operations** and a **3% increase in the total work processed per second on AMD MI350**.

The [PyTorch engineering post](https://pytorch.org/blog/muse-spark-open/) also describes **megakernels** that combine operations, reducing repeated launches and idle gaps on the GPU. The challenge gives developers a financial incentive to find further gains across the serving system.

## Fireworks makes the speed difference visible

Fireworks says **DeepSeek V4.1 Flash 1017** runs at more than **1,521 tokens/s** on its Ultrafast platform. In the [company's Tetris demonstration](https://x.com/FireworksAI_HQ/status/2112973992097468795), the game was ready in **11 seconds**, with a claimed **sevenfold task-time advantage over Claude Opus 5.5**.

> A **token** is a small piece of text, such as a word, part of a word or punctuation. Tokens per second measures how quickly the model generates those pieces while producing its answer.

The [DeepSeek update](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017) also reports shorter outputs and reduced task execution time. Producing fewer tokens to complete a task can help alongside generating them faster.

The reported gains cover different parts of the system. **Throughput** means how much work a system completes in a given time, often across many users at once; it does not directly measure how quickly one person receives an answer.

| Development | Reported result | Measurement |
| --- | --- | --- |
| Fireworks Ultrafast | 1,521+ tokens/s with DeepSeek | Generation rate in its demonstration. |
| Tetris versus Opus 5.5 | 11 seconds; claimed 7× faster | Time to complete the demonstrated task. |
| Meta's Helion kernels | 1.03–3.95× operation speedups; 3% overall gain on MI350 | Individual kernels and total serving throughput. |
| DeepInfer's draft verification | 4–7% throughput gain | Against checking a fixed five-token draft at its production operating point. |

> Fireworks says DeepSeek finished this game-building task seven times sooner than Opus. That does not mean it generated text seven times faster: the models may write different amounts or spend different time reasoning. The figures come from the companies themselves, and the 1,521+ tokens/s result was measured on Fireworks’ service.

## Less repeated work, less idle hardware

The gains come from avoiding repeated calculations and reducing time when the GPU has no work to do.

> **Caching** saves results from earlier calculations so repeated instructions or context do not need to be processed from scratch.
>
> **Speculative decoding** drafts several possible next tokens, then has the main model check them together. Accepting several at once can produce an answer in fewer steps.
>
> **Scheduling** decides which requests run next. Preparing that work while the GPU is still calculating helps it start the next step sooner.

DeepSeek's [DeepInfer documentation](https://github.com/deepseek-ai/DeepInfer/blob/main/doc/inference_deployment_qa.md) makes those improvements concrete. Its DSpark mechanism selects drafts using confidence estimates, reporting **4–7% more throughput** than checking all five draft tokens each time. It also overlaps CPU scheduling with GPU execution and describes retaining reusable context caches for days.

Meta's kernel work and DeepSeek's engine changes target different sources of wasted time. For an agent that repeatedly edits code, calls tools and reads results, savings can accumulate across many turns. More requests per GPU can also lower the cost of serving them. The [DeepInfer release](https://github.com/deepseek-ai/DeepInfer) exposes core engine features, although parts of its production cache and service infrastructure remain outside it.

## A faster week for AI, a difficult week for security

The speed push arrives during a week of serious security disclosures. Recent Dispatch coverage followed [PHP2Shell's remote-code-execution flaws](/news/php-critical-rce-october-2026/), [Railway's possible exposure of customer secrets](/news/railway-environment-variables-security-breach/) and the [OpenCode Console breach involving saved provider keys](/news/opencode-console-breach-api-keys/).

Railway's [October 21 disclosure](https://blog.railway.com/p/security-disclosure-wednesday-october-21st) connects the concern directly to this industry: it believes the incident forms part of attacks aimed at compromising AI inference providers. The entry point and full impact remain under investigation.

Faster inference makes legitimate automation more useful. It can also shorten automated steps after an attacker gains access, or help an over-permissioned agent act before a person reviews the result. A stolen provider key carries spending authority; an agent with deployment credentials can change a running system. **The concern is how much authority sits behind the faster response.**

Meta's challenge and the new serving engines could make capable agents cheaper and more responsive. This week's breaches sharpen the question that belongs alongside the speed figures: **what can that agent access, and which actions still need approval?** The time saved should make room for review, testing and recovery as the tools take on more work.
