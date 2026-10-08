# GitHub Copilot plans local AI model routing to reduce cloud usage

A small code change and a difficult debugging task do not always need the same model. **GitHub Copilot plans to choose between local and cloud models automatically**, giving suitable work to an on-device model while keeping cloud models available when needed. GitHub says the change should help developers save AI credits.

Microsoft’s October 7 announcement targets availability **by the end of October**. It extends the Project HydraFusion direction: choosing how to solve a task while balancing quality, cost and latency.

## From choosing a model to choosing a workflow

Copilot’s existing Auto selection picks a model for a request. HydraFusion goes further: it selects an execution pattern, which may involve several models.

One model can solve a task directly. Alternatively, an efficient model can draft a solution, with a quality check deciding whether to accept it or escalate to a stronger model. A third pattern brings in an independent critic to review a draft before revision.

That research preview arrived in Copilot CLI in September and later expanded to VS Code and the Copilot app. It provides the background for the next step: deciding where inference runs as well as which models participate.

## The next choice is local or cloud

The planned routing can consider task context and cached work across a conversation when moving between local and cloud inference. Inference means running the model to generate its response; local inference uses the developer’s machine.

Microsoft is also bringing an on-device version of **MAI Code 1.1 Flash** through the Windows ML provider. Its mixture-of-experts design activates part of the model per token, while quantization lowers the precision of stored values to reduce memory needs. Microsoft reports a 53 GB model footprint, so this example targets hardware with substantial memory rather than every laptop.

GitHub’s credit-saving goal is a product promise at this stage. Its announcement does not establish a universal saving for the coming local router.

## Local selection is already available while routing is coming

Copilot CLI version **1.0.94-0** can discover supported models from a running Ollama instance through `/model`. Developers review the provider and endpoint, then add a model and optionally switch to it without restarting.

Ollama and the model must already be installed; discovery does not download either. Models need tool calling and streaming support. This is manual selection, distinct from the automatic routing announced for later this month.

Choosing a local model also does not enable offline mode or disable GitHub telemetry. CLI offline mode requires `COPILOT_OFFLINE=true`, and even then a configured remote provider can receive prompts and code context.

The planned change makes model placement part of Copilot’s decision. Its practical test will be whether suitable tasks stay local without extra retries or a loss of coding quality—the balance that determines whether fewer cloud calls actually save credits.

Sources: [Microsoft — Local models and sandboxed tools](https://commandline.microsoft.com/local-models-sandboxed-tools-github-windows/), [GitHub — Project HydraFusion](https://github.blog/ai-and-ml/github-copilot/project-hydrafusion-frontier-quality-via-multi-model-orchestration/), [HydraFusion in VS Code and the Copilot app](https://github.blog/changelog/2026-09-30-hydrafusion-in-vs-code-and-the-github-copilot-app/) and [Ollama model discovery in Copilot CLI](https://github.blog/changelog/2026-10-07-discover-local-models-in-github-copilot-cli/).
