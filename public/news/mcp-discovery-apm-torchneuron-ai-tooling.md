# Today in AI: Cloudflare Clairic, TorchNeuron and agent tools

Building an AI model, using a ready-made one and giving an agent useful tools involve different kinds of work. Today's Dispatch follows that order: **TorchNeuron** brings PyTorch to Amazon's chips, **Cloudflare Clairic** extracts information from documents, and two tooling projects help configure agents and connect them to services.

Clairic was announced on October 19; TorchNeuron's public beta is scheduled for October 20. Alongside them, a new walkthrough explores dynamic discovery with Google Cloud's Agent Registry, while Microsoft's existing Agent Package Manager addresses sharing agent setup across projects.

## TorchNeuron brings familiar PyTorch code to Trainium

Amazon's [TorchNeuron announcement](https://www.aboutamazon.com/news/innovation-at-amazon/torchneuron-pytorch-aws-trainium-chips-ai) addresses the effort of moving models between chips. It adds native support for **Trainium2 and Trainium3**—the second and third generations of Amazon's custom AI chips—to PyTorch, the framework used to build and run AI models. The chips handle training, which updates a model's learned weights, and inference, which uses those weights to produce results.

TorchNeuron registers Trainium as a PyTorch device named `neuron`. Developers can use familiar APIs to run operations interactively or optimize them with `torch.compile`. The [PyTorch launch post](https://pytorch.org/blog/introducing-torchneuron-native-pytorch-backend-for-aws-trainium/) schedules the Apache 2.0 open-source public beta for October 20.

![PyTorch defines model operations, TorchNeuron connects them to AWS Neuron software, and Trainium2 or Trainium3 hardware executes the work. The isometric illustration distinguishes chip generations and explains training versus inference.](/news/assets/mcp-discovery-apm-torchneuron-ai-tooling/torchneuron-trainium.svg)

For a team evaluating where to run a document classifier, the benefit is a shorter route to a hardware comparison. More of the existing model code and debugging workflow can remain in place while the team measures Trainium's performance and cost.

The **“no rewrite”** promise has limits. AWS's [release notes](https://awsdocs-neuron.readthedocs-hosted.com/en/latest/release-notes/components/torchneuron.html) require `dynamic=False` for compilation; changing input shapes can trigger recompilation, and some APIs remain unsupported. Easier migration makes testing more accessible. Savings still depend on the workload, compilation overhead and tuning.

## Cloudflare Clairic extracts the fields an app needs

Cloudflare's [Clairic preview](https://blog.cloudflare.com/clairic-extraction-model/) is available through **Workers AI**. It reads text or images and returns typed values such as names, dates, amounts and lists. Open weights are planned for a later release.

The difference from TypeSafe's **Jev** and Cloudflare's earlier **Clef** is the question being answered. Jev and Clef are decision models: given options, they return probabilities for those choices. Clairic is an extraction model: it returns values without requiring every possible answer to be listed beforehand.

For an expense claim, Clairic could extract the merchant, purchase date and total. A decision model could then choose between “approve”, “reject” and “review” using those values and the expense policy. An LLM could write the response.

Cloudflare frames the distinction as **regression and extraction versus classification**. Regression predicts numerical values; classification scores predefined categories. The announcement does not establish that Clairic replaces reinforcement learning with a different training method. Its disclosed distinction concerns the task and output, so those should not be confused with how it was trained.

Like Clef, Clairic answers in a single forward pass rather than generating a text response token by token. It supplies confidence information, source offsets for extracted text and uncertainty ranges for estimates. **Valid types do not guarantee correct answers**: unfamiliar inputs and multi-step arithmetic still need checks.

## Microsoft APM shares the coding agent's setup

Once a team chooses its models and tools, it still needs a consistent setup for its coding agents. Microsoft's [Agent Package Manager](https://microsoft.github.io/apm/) applies dependency management to agent configuration. A repository declares its skills, instructions, prompts, plugins and MCP servers in **`apm.yml`**. Developers run `apm install` to deploy them into supported coding clients.

A team could package its API review guidance once, choose a version for each service and review updates alongside code. The lockfile records versions and content hashes, so another checkout can retrieve the same package content.

That addresses a practical complaint raised in a [mise community discussion](https://github.com/jdx/mise/discussions/10502): repeatedly copying skills and instruction files between projects.

Client support still varies, as APM's [support matrix](https://microsoft.github.io/apm/reference/targets-matrix/) shows. A shared manifest can reproduce the installed guidance; the coding application controls execution and permissions, and different models can respond differently to those same instructions.

## Dynamic MCP discovery finds tools when an agent needs them

Sharing an agent's setup and locating a running service are related but separate tasks. An agent using a delivery-tracking service usually needs that service's address in its configuration. Move the service, and every consumer may need an update.

An October 19 [dynamic MCP discovery walkthrough](https://leoy.blog/posts/dynamic-mcp-server-discovery/) shows another approach using Google Cloud's **Agent Registry**. MCP, or Model Context Protocol, is an interface for connecting agents to tools. The registry holds service details, letting an agent look up a known server or search for a capability before connecting.

In the delivery example, the service owner updates the registry when the endpoint changes. Agents resolve the new address after their cached discovery results expire, reducing configuration changes across deployments. Google's [companion codelab](https://codelabs.developers.google.com/agent-registry-dynamic-discovery-with-adk) walks through the implementation.

The boundary remains straightforward: **finding a tool does not grant permission to use it**. Authentication and access rules still govern the discovered service.

## Beyond today's announcements

Today's updates cover several parts of building with AI. **TorchNeuron** helps developers run PyTorch models on Trainium; **Clairic** offers a ready-made model for extracting information. **APM** packages the instructions and tools a coding agent starts with, while **dynamic MCP discovery** helps an agent locate services when it needs them. They are separate projects, but together they show attention moving beyond model capabilities to the work of using and connecting them.
