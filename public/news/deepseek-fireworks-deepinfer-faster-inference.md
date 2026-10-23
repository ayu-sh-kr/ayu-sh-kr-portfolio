# DeepSeek, Fireworks and the race to faster AI inference

A coding assistant can build a game, but watching it finish is still part of the experience. **Fireworks says DeepSeek V4.1 Flash 1017 can generate more than 1,521 tokens per second** on its Ultrafast platform. In its demonstration, a Tetris game was ready in 11 seconds, a task it says finished seven times faster than Claude Opus 5.5.

The claim arrives alongside another development: DeepSeek has opened **DeepInfer**, the inference framework behind its production service. One announcement shows how quickly an answer can arrive; the other exposes some of the engineering required to serve a model efficiently at scale.

Together, they point to a practical competition. Model capability matters, but so does how long an application waits before it can use the result.

## What Fireworks' 1,521 tokens per second measures

The model in the [Fireworks demonstration](https://x.com/FireworksAI_HQ/status/2112973992097468795) is **DeepSeek V4.1 Flash 1017**, the October update to V4.1 Flash. DeepSeek's [model card](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017) describes improvements in reasoning, coding, agent tasks and visual benchmarks, alongside shorter outputs and faster task completion. The weights are available under the MIT licence.

**Inference** is running a trained model to produce an answer. A token is a piece of text the model processes or generates, so tokens per second describes how quickly generation progresses. Fireworks' figure belongs to its own Ultrafast deployment; it is not a speed guarantee for every provider running those weights.

The announcement combines a streaming rate with a completed-task comparison. Keeping those measurements separate makes the Opus result easier to understand:

| Subject | Reported measurement | What it establishes |
| --- | --- | --- |
| DeepSeek on Fireworks Ultrafast | More than 1,521 tokens/s | Fireworks' reported generation speed in its demonstration. |
| DeepSeek versus Opus 5.5 | Tetris ready in 11 seconds; claimed sevenfold task-time advantage | A comparison of the demonstrated task, rather than a general Opus speed ranking. |
| DeepSeek's DeepInfer deployment | 155 trillion tokens per day from one production cluster | DeepSeek's reported service volume across requests, rather than one person's streaming speed. |

Dividing 1,521 by seven would not establish Opus's token rate. The models can generate different amounts of code, spend different amounts of time reasoning and begin streaming at different times. Their tokenizers can also represent the same text with different token counts.

> **Generation speed measures how quickly text arrives. Task time measures how long the application waits for a result.**

For the Tetris example, the useful comparison is time to a working game, including checks that the controls and game logic behave correctly. The demo makes the responsiveness visible; a broader comparison would need repeated tasks with comparable settings and correctness checks.

## DeepInfer explains where the time goes

Fast inference needs software that keeps the hardware busy. An **inference engine** runs the model's calculations, schedules requests and coordinates work across chips. DeepSeek's [DeepInfer release](https://github.com/deepseek-ai/DeepInfer) includes optimized kernels—the small programs performing accelerator operations—along with distributed execution, asynchronous scheduling and speculative decoding.

Those features address different delays. Scheduling can overlap CPU work with accelerator execution, reducing idle gaps. **Speculative decoding** drafts several possible next tokens, then checks them with the model, potentially accepting several in one step.

DeepInfer's DSpark mechanism uses confidence estimates to choose which drafts are worth verifying. DeepSeek's [deployment Q&A](https://github.com/deepseek-ai/DeepInfer/blob/main/doc/inference_deployment_qa.md) reports a **4–7% throughput gain at its production operating point** over verifying a fixed five-token draft. That is a bounded improvement within the engine, rather than the explanation for Fireworks' entire speed claim.

The same document reports the 155-trillion-token daily cluster volume. Large service totals and a fast individual response answer different questions: how much work the service handles, and how quickly one request progresses. DeepSeek's number cannot be ranked directly against 1,521 tokens/s on Fireworks.

Inspecting the release also reveals its scope. The README provides offline inference and lists the cache system, service disaggregation and load balancing as requirements outside the release. The code exposes important engine work, while reproducing the production service still requires additional infrastructure.

## Why the speed race extends beyond a typing animation

The interest is spreading to the software beneath other models. Daniel Gross has [announced a $100,000 challenge](https://x.com/danielgross/status/2113351902402613558) to make Muse Spark run faster, linking to the [Open Kernel Challenge](https://openkernelchallenge.dev/). It puts a direct incentive on improving inference performance after a model has been trained.

For coding agents, the potential benefit compounds across steps. An agent generates a change, runs a tool, reads the result and decides what to do next. Faster generation can shorten each turn, while shorter correct answers can reduce the work required in the first place. Network calls, tests and external tools still contribute to the total wait.

That extends the competition covered in [Opus 5.5's cost and efficiency changes](/news/claude-opus-5-5-cost-coding/): the useful outcome is dependable work completed with less time and expense.

Fireworks' Tetris demo gives that race a visible finish line. DeepInfer shows how much work happens underneath it. As inference gets faster, the question becomes more concrete: **how soon is the generated application ready to use, and does it work when it gets there?**
