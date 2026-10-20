# MCP discovery, Microsoft APM and TorchNeuron: less setup around AI

An AI assistant can answer a question and still leave plenty of work around it: connecting the right business tools, carrying project instructions between coding applications, or getting a model onto different hardware. Three developments address those separate jobs.

An October 19 walkthrough on **dynamic MCP discovery** shows agents finding services when needed. Microsoft's **Agent Package Manager (APM)** makes agent configuration a versioned project dependency. Amazon's **TorchNeuron**, announced October 19 ahead of an October 20 public beta, brings native PyTorch support to Trainium.

Consider a small team building a support assistant. It needs access to order information, developers need consistent coding guidance, and a future self-hosted model needs somewhere to run. These stories explain what changes at each stage—and which responsibilities remain with the team.

## Dynamic MCP discovery: find the service when the task needs it

**Model Context Protocol (MCP)** gives AI applications a common way to use external tools. An order service might expose actions for looking up a delivery or checking a refund. The agent connects to an MCP server, reads its available tools and calls the appropriate action.

Usually, somebody configures that server's address first. If the service moves, agents carrying the old address can fail until their configuration is updated. In [minherz's Google Cloud walkthrough](https://leoy.blog/posts/dynamic-mcp-server-discovery/), the address lives in **Agent Registry**, a catalog that agents consult instead.

The article separates two useful steps. First, an agent can look up a known service identity and obtain its current endpoint. Second, it can search by meaning: a request for order information can lead to a search for a relevant capability, without the agent knowing the service's exact identifier.

Finding a catalog entry still leaves the connection to establish. The walkthrough uses Google's Agent Development Kit (ADK), a framework for building agents. Its custom toolset reads the discovered records, creates MCP connections and exposes their tools to the running agent. Discovery results expire after a configured interval, allowing later requests to refresh them.

For the support assistant, imagine the delivery service moving to a new deployment. With an updated registration and expired discovery cache, the agent can resolve it again. This avoids editing every consumer's saved URL. It does not promise an uninterrupted move: old cached results and failed connections still need handling.

The broader demand is visible in a January [LangChain feature request for dynamic discovery](https://github.com/langchain-ai/langchain/issues/34795). Its author wanted agents to adapt their tools to a task; the request was closed as not planned. That is evidence of developer interest, rather than an adopted LangChain feature.

Google's [companion codelab](https://codelabs.developers.google.com/agent-registry-dynamic-discovery-with-adk) provides the worked example. The operational lesson is to separate finding a service from being allowed to call it. A registry search needs its own access, and each MCP server may require different credentials. A relevant search result cannot grant permission to view an order or issue a refund.

## Microsoft APM: give agent configuration a dependency file

The team also uses coding agents to maintain the assistant. One developer has useful review instructions in Copilot; another uses Claude Code with an older copy. A third starts a fresh checkout without either. The repository matches, but the guidance around the work differs.

[Microsoft APM](https://microsoft.github.io/apm/) addresses that configuration drift. Its manifest, **`apm.yml`**, declares the project's skills, prompts, instructions, plugins and MCP servers. A skill is a reusable set of instructions for a task, such as reviewing an API. APM installs the declared material into supported coding applications.

The package-manager comparison is practical. Application dependencies record which libraries the program needs; agent dependencies record which guidance and integrations its coding environment needs. Packages can bring their own dependencies, and a lockfile records resolved versions and content hashes so another checkout can obtain the same package content.

For the support project, a team could maintain an API review package containing its error-response conventions and test guidance. Repositories depend on an approved version. Updating the package becomes a change reviewers can inspect, rather than a message asking everyone to replace a Markdown file manually.

That use case appears in a June [mise community discussion about adding APM](https://github.com/jdx/mise/discussions/10502). The requester specifically wanted to stop copying skills and instruction files. It also establishes that APM predates this week's TorchNeuron announcement; this is a roundup of useful developments, not three simultaneous launches.

Portability has limits. A **harness** is the application that runs an agent and supplies its tools. APM's [targets matrix](https://microsoft.github.io/apm/reference/targets-matrix/) documents different support across harnesses. For Codex, for example, dependency instructions need a separate root-context compilation step. Sharing a manifest does not make every client understand every feature, or make model responses identical.

APM also documents install-time checks, including hidden Unicode scanning, integrity hashes and restrictions on indirectly introduced MCP servers. Those controls help review what enters an agent's environment. The harness still controls execution and permissions, and installed instructions still deserve review.

> Reproducing the agent's setup makes differences easier to investigate; it cannot guarantee the same answer.

APM and runtime discovery therefore meet different needs: one prepares the development environment; the other lets a running application find a service.

## TorchNeuron: make Trainium a familiar PyTorch target

The third story matters if the team later runs its own model. **PyTorch** is a framework for defining, training and running neural networks. **Trainium** is Amazon's AI accelerator hardware. Trying a different chip can involve substantial software work before a team even knows whether the move is worthwhile.

Amazon's [TorchNeuron announcement](https://www.aboutamazon.com/news/innovation-at-amazon/torchneuron-pytorch-aws-trainium-chips-ai) promises a shorter starting point: existing PyTorch code targeting Trainium with minimal changes. The [PyTorch launch post](https://pytorch.org/blog/introducing-torchneuron-native-pytorch-backend-for-aws-trainium/) schedules an Apache 2.0 open-source public beta for October 20, supporting Trainium2 and Trainium3.

TorchNeuron registers a device named `neuron` through PyTorch's hardware extension mechanism. Model operations can then reach the Neuron software stack and execute on Trainium. The familiar framework remains the place where developers describe the model.

There are two important execution modes. **Eager execution** runs operations as they are encountered, which helps experimentation and debugging. **`torch.compile`** captures groups of operations so a compiler can optimize them together. TorchNeuron supports both, with the Neuron backend selected for compilation. AWS's [native PyTorch overview](https://awsdocs-neuron.readthedocs-hosted.com/en/latest/frameworks/torch/pytorch-native-overview.html) explains that path.

For a support team evaluating a text classifier, the benefit is a smaller migration experiment: check whether the existing model runs correctly, then measure its performance and cost on candidate hardware. Standard PyTorch code provides a better starting point than a pipeline built around device-specific custom operations.

**“No rewrite” still needs qualification.** AWS's [release notes](https://awsdocs-neuron.readthedocs-hosted.com/en/latest/release-notes/components/torchneuron.html) say compilation requires `dynamic=False`; a new input shape can require another compilation. First runs can include compilation time, and several APIs remain unsupported. Padding or grouping variable-length inputs may therefore matter for a text workload.

This is already a developer concern: an October 13 [Hugging Face TRL bug report](https://github.com/huggingface/trl/issues/7660) describes a compiled training run failing on its second step during a dynamic-shape recompile. That report concerns a particular setup, but shows why compatibility must be checked beyond the launch example.

Free, open-source software also leaves hardware costs to pay. The useful comparison is cost for a validated workload, including compilation and tuning—not an assumed saving from changing a device name.

## What gets easier, and what still needs a decision?

These tools remove different pieces of setup around the support assistant:

| Development | Work it reduces | Responsibility that remains |
| --- | --- | --- |
| Dynamic MCP discovery | Keeping service addresses in every agent | Access control and connection failures |
| Microsoft APM | Copying agent guidance between environments | Reviewing dependencies and client support |
| TorchNeuron | Adapting PyTorch code to try Trainium | Validating compatibility, speed and cost |

For that team, the immediate step follows the actual bottleneck: service discovery for changing endpoints, APM for inconsistent coding environments, or TorchNeuron for a hardware evaluation. Each makes an experiment easier to start. Whether it belongs in production depends on what happens after setup succeeds.
