# Thinking Machines details how Inkling 2 Small trains with fewer bits

Running a model with fewer bits can make it cheaper to serve. Using that reduced precision while it learns is harder: rounding errors can change the updates that teach it what to do.

On November 13, **Thinking Machines** published its [4-bit training recipe](https://thinkingmachines.ai/blog/end-to-end-4-bit-training/) for Inkling 2 Small. The approach keeps a native 4-bit forward pass from pretraining through reinforcement learning, rather than introducing quantization only after training.

The model itself [launched on November 5](https://thinkingmachines.ai/news/inkling-2-small/), with weights released on November 12. It accepts text and images, generates text, and uses a mixture-of-experts architecture: selected groups of parameters handle each token instead of activating the entire network. Its 594 billion total parameters include 17 billion active per token.

## Where four bits fit

**Quantization** represents numbers using a smaller set of possible values. NVIDIA's [NVFP4 format](https://docs.nvidia.com/deeplearning/transformer-engine/features/low_precision_training/nvfp4/nvfp4.html) combines 4-bit values with shared scaling factors, allowing groups of numbers to cover different ranges. Blackwell hardware accelerates this arithmetic, but rounding still loses information.

Think of a prediction and its correction as two different jobs. The **forward pass** produces the prediction; the **backward pass** calculates gradients, which guide changes to the model's weights. Thinking Machines uses different precision for those jobs:

| Part of the recipe | What the team uses |
| --- | --- |
| Expert-layer forward calculations | NVFP4 |
| Backward calculations | MXFP8, an 8-bit format |
| Re-quantizing saved values for backward computation | Stochastic rounding to limit systematic bias |
| Communication between GPUs | Compressed transfers to reduce waiting |

Stochastic rounding sometimes chooses the value above a number and sometimes the one below, with probabilities based on distance. In NVIDIA's description, the purpose is to preserve the original value on average rather than repeatedly biasing it in one direction.

## The reported gain is in the complete training job

Thinking Machines reports **8% faster pretraining and 20% faster reinforcement learning** than its full-MXFP8 setup on its largest jobs. These are its own measurements, not an independently reproduced result.

> **Precision matters:** The recipe is mixed-precision, not an assertion that every training operation uses four bits. GPU arithmetic throughput and complete-job speedups are different measurements.

[Reinforcement learning](/blog/reinforcement-learning-from-rlhf-to-rlsc/) also generates candidate answers before updating the model. Faster generation can therefore help the learning loop, not only the final deployed service.

This builds on earlier low-precision research. [Quartet II](https://proceedings.mlr.press/v306/panferov26a.html) studied NVFP4 in both forward and backward computations, validating training on models up to 1.9 billion parameters. Its recipe and experimental scale differ, so its kernel speedups should not be placed beside Inkling's full-job results as a direct comparison.

## What developers can use

The [model card](https://thinkingmachines.ai/model-card/inkling-2-small/) lists Apache 2.0 weights and NVFP4 and MXFP8 checkpoints. It specifies at least **500 GB of aggregate GPU memory** for the NVFP4 version: “Small” is a model-family name, not a laptop requirement.

For teams adopting Inkling, the immediate deliverable is an available model. For training teams, the new post explains a numerical recipe they can study: use lower precision where it saves work, while protecting the calculations that guide learning.
