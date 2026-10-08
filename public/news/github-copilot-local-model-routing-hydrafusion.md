# GitHub Copilot plans automatic routing between local and cloud AI models

A small code edit and a difficult bug do not always need the same model. Choosing a cloud model for every task can spend credits on work a local model could handle. **GitHub Copilot plans to route work between local and cloud AI models automatically**, keeping both available within the same coding session.

Microsoft announced the direction on October 7, targeting availability **by the end of October**. GitHub says routing suitable tasks locally should help save AI credits. The idea is to let Copilot choose where the model runs as the work changes.

## One session, with local and cloud models available

Local inference runs a model on the developer’s machine; cloud inference sends the request to a hosted model. The planned Auto orchestration can consider the task and cached work across a conversation when choosing between them.

That allows a session to use both environments over time. It does not mean every request must run on both models, or that every simple edit will stay local. The illustration shows the relationship, rather than a fixed execution order.

![Isometric laptop and cloud model rack connected to a Copilot router, with animated requests and responses within one session](/news/assets/github-copilot-local-model-routing-hydrafusion/local-cloud-routing.svg)

## HydraFusion adds a workflow behind that choice

> **What is HydraFusion?** GitHub’s research-preview orchestrator chooses one or more models and coordinates their work to balance coding quality, cost and latency. It is a system for using models, rather than a new model itself.

Copilot’s existing Auto selection chooses a model for a request. HydraFusion also chooses how to complete it: one model can answer directly, an efficient model can draft before a quality check decides whether to escalate, or an independent critic can review a draft before revision.

The preview launched in Copilot CLI in September, then expanded to VS Code and the Copilot app. Local/cloud routing extends that direction to the place where inference happens. It brings model choice and compute placement into the same conversation.

## Local models still need suitable hardware

Microsoft’s on-device **MAI Code 1.1 Flash** is one example, offered through the Windows ML provider. Its mixture-of-experts design activates part of the model per token. Quantization reduces the precision of stored values to lower memory requirements.

Microsoft reports a 53 GB model footprint. That targets machines with substantial memory; local inference is not automatically practical on every laptop. Neither the announcement nor that footprint establishes a universal credit saving for the coming router.

## Manual local selection is available before automatic routing

Copilot CLI **1.0.94-0** already discovers supported models from a running Ollama instance through `/model`. Developers review the provider and endpoint, then add and optionally switch to a model without restarting. Ollama and the model must already be installed, with tool calling and streaming support.

Local selection does not enable offline mode or disable telemetry. CLI offline mode requires `COPILOT_OFFLINE=true`; a configured remote provider can still receive prompts and code context.

The practical promise returns to the opening problem: use local capacity where it helps, and cloud capability where it is needed. Whether that saves credits will depend on routing quality and how much work needs another attempt.

Sources: [Microsoft — Local models and sandboxed tools](https://commandline.microsoft.com/local-models-sandboxed-tools-github-windows/), [GitHub — Project HydraFusion](https://github.blog/ai-and-ml/github-copilot/project-hydrafusion-frontier-quality-via-multi-model-orchestration/), [HydraFusion in VS Code and the Copilot app](https://github.blog/changelog/2026-09-30-hydrafusion-in-vs-code-and-the-github-copilot-app/) and [Ollama model discovery in Copilot CLI](https://github.blog/changelog/2026-10-07-discover-local-models-in-github-copilot-cli/).
