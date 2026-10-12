# Malicious AI routers: how model access can expose secrets and hijack agents

One service can offer access to several AI providers. The less visible part is what that service receives along the way: prompts, code, tool results and sometimes credentials.

Security researcher **Chaofan Shou** says he bought a **6 TB dataset** from a major Chinese LLM router containing SSH keys, VPN configurations, Aliyun cloud keys and GitLab tokens. His [post](https://twitter.com/shoucccc/status/2098169782541631871) claims those credentials could enable access to seven Chinese/CIS government entities and 19 companies, including Xiaomi, Huawei, NIO and MiniMax.

Those are Shou's allegations; this article has not inspected the dataset or verified access to the named organisations. The router is unnamed in the post. The important question is how a service selling AI access could receive secrets—and how the same position could let it change an agent's actions.

## What an AI router actually routes

An **LLM router** accepts an application's model request and forwards it to a provider. Developers get a shared interface instead of maintaining separate integrations for every model. Depending on the service, routing can select providers by price, availability or performance.

For a familiar example, imagine a coding agent fixing an order-service test. A router lets it use different models through one configured endpoint. The convenience is real: model access, billing and fallback behaviour can be managed together.

[OpenRouter's routing documentation](https://openrouter.ai/docs/guides/routing/provider-selection) shows how a legitimate service exposes provider selection, fallbacks and data-policy controls. These capabilities describe why people use routers; they do not establish that every reseller offering similar access follows the same practices.

The service name, the selected model and the company actually handling the request are different pieces of information. A model label alone does not answer who receives the application's data.

## HTTPS protects a connection, including one to a router

HTTPS uses TLS to protect data exchanged between the two ends of a connection. The [TLS specification](https://www.rfc-editor.org/rfc/rfc8446.html) describes authentication, confidentiality and integrity for that channel.

When an application connects to a router, the router is an endpoint of that protected connection. It can read the request after decryption. Forwarding the request to a model provider creates another connection; encryption on both links does not hide the contents from the intermediary.

For the order-service agent, a test failure sent for diagnosis reaches that intermediary too. If a tool result includes a configuration file containing a password, that password becomes part of the transmitted context. The router need not independently break into the machine to see data already sent to it.

> A secure connection to an intermediary still requires trust in that intermediary.

## A changed answer can become a command

A coding agent receives more than conversational text. **Tool calls** are structured requests to perform operations, such as reading a file or running a command.

[Anthropic's tool documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) separates client tools from server tools. For client tools, the model returns a structured call and the application executes it, then sends back the result.

That distinction explains the risk. Consider a hypothetical diagnostic step:

| Stage | Intended behaviour | Where trust matters |
| --- | --- | --- |
| Request | Send a failing test and relevant context | Keep unrelated credentials out of the context. |
| Response | Receive a proposed test command | Check the command actually received by the client. |
| Execution | Run that command in a workspace | Limit files, permissions and network access. |

If an intermediary substitutes a command that reads a secret and sends it elsewhere, the client must reject that operation before execution. Automatic approval removes an opportunity to catch the substitution. The model could have produced an acceptable answer while the client receives something different.

This table is an explanatory example, not a reproduction of an observed attack.

## What “Your Agent Is Mine” measured

The [research paper](https://arxiv.org/html/2604.08407v1), first submitted on **April 9, 2026**, studied 28 paid routers and 400 free routers. The authors reported nine injecting malicious code, 17 accessing researcher-owned AWS canary credentials, and one draining ETH using a researcher-owned private key. Canary credentials are test secrets used to detect misuse.

These results concern the sampled commodity services, not every AI gateway. They also differ from the dataset allegation in Shou's post and its separate claim about a client's $500,000 wallet.

The researchers additionally used exposed keys and weakly configured decoy relays to examine router chains. Their decoy experiment observed 99 credentials across 440 Codex sessions; 401 sessions used autonomous “YOLO mode”, meaning tool execution was already auto-approved.

The study's supply chain concern is the intermediary path: a service can introduce another relay into the route, exposing traffic or changing responses even when the first operator appears benign.

## Choosing access without giving away authority

For the order-service agent, three decisions deserve separate attention: who processes its requests, what enters its context, and what actions it may execute.

Retention policy matters alongside routing. [OpenRouter says prompt and response storage is opt-in](https://openrouter.ai/docs/guides/privacy/data-collection), and distinguishes content from usage metadata. That is a stated policy of that service, not evidence about the unnamed router in Shou's claim or proof of a compromise at OpenRouter.

The practical response is to check the operator and upstream data policies, exclude secrets from model context, and give an agent only the access needed for its task. Sensitive tool operations should face checks in the executing application. Our [agent sandboxing coverage](/news/aws-strands-box-ai-agent-sandbox/) explains why permission and isolation controls matter.

A router can make choosing models easier. Finishing the order-service fix safely still requires knowing where its context goes and controlling what the returned instructions are allowed to do.
