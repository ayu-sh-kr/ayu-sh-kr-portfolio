# GitHub Copilot local AI models: BYOK now, automatic cloud routing next

GitHub Copilot can already work with a local model or a model provider chosen by the developer. The next step is to make that choice automatic: **Copilot plans to route tasks between local and cloud AI models within the same coding session**, using local capacity where it suits the work.

Microsoft announced that direction on October 7, with availability targeted **by the end of October**. GitHub says the change should help save AI credits. Understanding the announcement starts with separating the support available today from the routing that is coming next.

## 1. Available now: local models and BYOK

Copilot CLI supports **bring your own key (BYOK)**, which connects the coding assistant to a developer’s chosen model provider. That can be a hosted service such as OpenAI, Azure OpenAI or Anthropic, or a local service exposing a compatible API, such as Ollama.

A local model generates responses on the developer’s machine. A hosted BYOK model still runs remotely, using the configured provider and credentials. Both offer control over the provider, but only the first moves inference onto the device.

### Selecting and configuring a provider

In Copilot CLI **1.0.94-0**, `/model` can discover supported models from a running Ollama instance. The developer reviews the endpoint, adds the model and can switch to it without restarting. This discovery flow does not install Ollama or download model weights; those must already be present. The model needs tool calling and streaming support to work with the agent.

The CLI also supports provider configuration through environment variables. `COPILOT_PROVIDER_BASE_URL` identifies the endpoint, while `COPILOT_MODEL` selects the model. A hosted provider may require `COPILOT_PROVIDER_API_KEY`; provider type settings distinguish OpenAI-compatible, Azure and Anthropic APIs. GitHub’s provider documentation gives the full examples.

These settings tell Copilot where to send model requests. They do not establish that a selected BYOK model automatically participates in the upcoming local/cloud router.

### Local inference and offline mode are separate choices

Selecting a local provider does not disable GitHub telemetry. Without offline mode, the CLI continues its usual communication with GitHub even though model responses come from the selected provider.

Setting `COPILOT_OFFLINE=true` prevents the CLI from contacting GitHub’s servers and disables telemetry. Model requests still go to the configured provider. If that endpoint is remote, prompts and code context still cross the network; a fully isolated setup needs a provider inside that same isolated environment.

## 2. Coming next: automatic routing and AI credits

Manual selection leaves the developer choosing where inference runs. The announced Auto orchestration would make that decision as a conversation develops, considering the task and cached work when routing between local and cloud models.

A session could therefore use both environments over time. That does not require every request to run on both models. The illustration shows the planned relationship, rather than a fixed sequence that every task follows.

![A local laptop and cloud model rack connected through Copilot’s router within one session](/news/assets/github-copilot-local-model-routing-hydrafusion/local-cloud-routing.svg)

### Where HydraFusion fits

> **HydraFusion** is GitHub’s research-preview orchestrator. It chooses one or more models and coordinates their work to balance coding quality, cost and latency.

Existing Auto selection chooses a model for a request. HydraFusion also chooses a workflow: one model can answer directly, an efficient model can draft before a quality check decides whether to escalate, or an independent critic can review a draft before revision.

The preview reached Copilot CLI in September and later expanded to VS Code and the Copilot app. Local/cloud routing extends that direction to compute placement—choosing where a model runs as well as how models contribute to the task.

### What will determine the savings

GitHub’s goal is to reduce cloud credit usage by handling suitable work locally. Actual savings will depend on routing quality, local model capability and whether a task needs another attempt. The announcement does not promise a fixed reduction for every session.

Hardware also matters. Microsoft’s on-device MAI Code 1.1 Flash example has a reported **53 GB model footprint**, targeting machines with substantial memory. Its reduced-precision weights lower storage needs, but running a capable local model still requires suitable resources.

Today, developers can choose their provider and control the CLI’s network behavior. The planned change adds automatic placement on top of model choice. Its value will come from keeping useful work local while preserving access to cloud capability when the task needs it.

Sources: [GitHub — CLI provider configuration](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models), [CLI authentication and offline mode](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/authenticate-copilot-cli), [Ollama discovery](https://github.blog/changelog/2026-10-07-discover-local-models-in-github-copilot-cli/), [Microsoft — Local models and routing announcement](https://commandline.microsoft.com/local-models-sandboxed-tools-github-windows/) and [GitHub — Project HydraFusion](https://github.blog/ai-and-ml/github-copilot/project-hydrafusion-frontier-quality-via-multi-model-orchestration/).
