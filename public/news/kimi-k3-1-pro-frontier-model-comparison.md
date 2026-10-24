# Kimi K3.1 Pro launches: specs and comparison with frontier AI models

Moonshot has launched **Kimi K3.1 Pro**, with reported terminal-coding results close to Claude Opus 5.5 and stronger scores on extended engineering tasks. Moonshot is targeting complete game projects, editable 3D models and financial research.

The model is available through Kimi’s apps, Kimi Work, Kimi Code and API. Moonshot plans to release **downloadable weights by November 4, 2026**.

## What is inside Kimi K3.1 Pro?

K3.1 Pro builds on K3 with more [reinforcement learning across different tasks](/blog/reinforcement-learning-from-rlhf-to-rlsc/). Its gains come from further training at the same model scale.

The [K3 technical report](https://arxiv.org/abs/2607.24653) documents the underlying mixture-of-experts architecture. The launch retains its 2.8-trillion-parameter scale and million-token context.

| Specification | Kimi K3.1 Pro |
| --- | --- |
| Total parameters | 2.8 trillion; “3T-class” is a rounded label |
| Active parameters | 104 billion per token |
| Architecture | Mixture of Experts (MoE), based on Kimi K3 |
| Context window | 1,048,576 tokens, per Kimi’s API documentation |
| Input capabilities | Multimodal, including visual understanding |
| Hosted access | Available now |
| Downloadable weights | Scheduled by November 4, 2026 |

> **MoE** activates selected parts of the network for each token. Kimi uses 104B parameters at a time, but the full 2.8T model still has to be stored.

Its active parameters amount to approximately **3.7%** of the total. The K3 report describes 16 selected experts from 896; shared components also contribute to the active parameter count.

For a rough storage illustration, 2.8 trillion values at two bytes each would occupy **5.6 TB**, or **1.4 TB at four bits each**, before extra data and runtime memory. These are arithmetic estimates, not K3.1 download sizes or deployment requirements. The final checkpoint format and serving setup determine the actual footprint.

## How it compares with frontier models

The launch chart compares Kimi with **Claude Opus 5.5, Claude Fable 5.1, GPT-6 Astra, DeepSeek V4.1 Flash 1017 and GLM-5.3**. These are selected peers in Moonshot’s announcement, not an exhaustive ranking of every current model.

| Model | Terminal-Bench 4.0 | Terminal-Bench Science 0.1 | SWE Marathon | OfficeQA Pro v2 |
| --- | --- | --- | --- | --- |
| **Kimi K3.1 Pro** | **65.7** | **38.1** | **51.7** | **64.4** |
| Claude Opus 5.5 | 66.4 | 63.3 | 46.3 | 62.2 |
| Claude Fable 5.1 | 57.9 | 49.0 | 45.6 | 54.5 |
| GPT-6 Astra | 58.2 | 68.1 | 42.5 | 54.4 |
| DeepSeek V4.1 Flash 1017 | 42.3 | 15.7* | 40.0 | 40.4 |
| GLM-5.3 | 41.8 | 8.1 | 42.5 | 31.1 |

Higher is better. Figures are from [Moonshot’s launch chart and evaluation notes](https://www.kimi.ai/blog/kimi-k3-1-pro). Terminal-Bench covers terminal tasks; Science adds scientific workloads; SWE Marathon tests extended engineering work; OfficeQA concerns analysis of financial documents. *The DeepSeek Science result is for the older V4.1 Flash checkpoint, as Moonshot explicitly notes.*

> These are **launch-reported comparisons**, combining internal evaluations with published scores. Harnesses—the software controlling tools and execution—differ across some tests. Kimi generally uses maximum reasoning effort. The table does not establish a universal winner or equal cost per task.

Kimi is **0.7 percentage points behind Opus** on terminal coding and leads this group on SWE Marathon. Yet it trails Astra by **30 points** on scientific terminal tasks. A team choosing an agent for repository maintenance could reach a different decision from one automating scientific analysis.

## Price and the open-weight question

The [Kimi API platform](https://platform.kimi.ai/) lists Pro at **$2 per million input tokens and $10 per million output tokens**, with cached input at **$0.20 per million**. Its [pricing documentation](https://platform.kimi.ai/docs/pricing/chat) distinguishes API billing from app memberships and Kimi Code subscriptions.

Moonshot also offers **Pro Highspeed**, claiming two to three times the speed. The claim concerns serving speed; [task completion also depends on reasoning time, output length and retries](/news/deepseek-fireworks-deepinfer-faster-inference/).

Kimi’s reported gains are strongest on extended engineering and document-analysis tasks, while scientific terminal work remains a clear weakness against Astra. Its planned weight release adds the option of independent deployment, though the model’s size makes that a substantial infrastructure commitment.
