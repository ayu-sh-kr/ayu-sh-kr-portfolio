# Cheap AI routers and leaked conversations: where the data goes

Cheap access to several AI models can come with an extra recipient: the company routing the conversation. Everything sent through that service—including code, documents and credentials accidentally included in a debugging session—can reach its servers before reaching the model provider.

Security researcher **Chaofan Shou** says he bought a **6 TB dataset** from a major Chinese LLM router containing SSH keys, VPN configurations, Aliyun cloud keys and GitLab tokens. His [post](https://twitter.com/shoucccc/status/2098169782541631871) claims the credentials could enable access to seven Chinese/CIS government entities and 19 companies, including Xiaomi, Huawei, NIO and MiniMax.

The router is unnamed, and the dataset and claimed access remain unverified here. The question is how selling AI access could also expose customers’ exchanges.

## The router receives the conversation to forward it

An **AI router** is a service between an application and model providers. It offers a shared interface for accessing different models, often with one account and billing balance. The application sends its request to the router; the router forwards it upstream and returns the answer.

Requests can include earlier messages, attachments, source code and results returned by an agent’s tools. Replies pass through the router too.

Imagine a developer asking a coding agent why a database connection fails. The agent reads a configuration file, and the application sends its contents back for diagnosis. If the file includes a database password, that password travels with the exchange. [Anthropic's tool documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls) describes this round trip: the application executes a client tool and returns its output in the next message.

Credentials can enter the exchange through files, terminal output or logs, without being deliberately pasted into chat.

## Where an exchange can leak

The first exposure happens **at the router handling the request**. An operator can retain a copy while still forwarding the request and returning a normal answer. The coding session can appear successful throughout.

A second exposure can happen in stored records. Request logs, debugging traces and databases may retain conversations after the session ends. Those copies can be misused by the operator, accessed through a storage breach or sold. These are possible leak paths; Shou's post does not establish the unnamed router's exact collection or sale process.

[OpenRouter's explanation of data retention](https://openrouter.ai/blog/insights/zero-data-retention/) makes a useful distinction: a provider's promise not to retain a request does not remove copies made elsewhere, such as application logs or error trackers. The same question needs asking at each service handling an exchange.

| Place | What could leave the intended workflow |
| --- | --- |
| Router processing | A copy of the request and answer while they pass through. |
| Logs or stored traffic | A retained conversation later exposed or sold. |
| Additional upstream relay | The same exchange forwarded to an operator the customer did not choose. |

For our database example, someone obtaining the conversation could reuse its password if it remains valid and grants access.

## How cheap access can hide questionable sourcing

Lower prices are not proof of theft. Discounts, unused capacity and legitimate resale arrangements can reduce costs. The concern is an unexplained discount combined with an opaque source of model access.

In its [June 2025 investigation of China's LLM resale market](https://www.chinatalk.media/p/the-grey-market-for-american-llms), ChinaTalk described transferred API access sold well below official rates. Reported tactics included bulk-registering accounts to exploit free credits, reselling unused quotas, aggregating traffic and using corporate or educational discounts. It also described sellers disguising domestic models as US models.

Legitimate savings can benefit customers. Abusing credits shifts costs onto someone else; secretly substituting a model changes what the customer receives. Reselling quotas also leaves questions about authorisation and whose account processes the traffic.

Credential reuse adds another risk. In **Your Agent Is Mine**, researchers deliberately exposed an API key and deployed weakly configured relay decoys. The [paper](https://arxiv.org/html/2604.08407v1) reports that the decoys entered active routing paths and exposed 99 credentials across 440 Codex sessions.

A reseller sourcing access through another relay can therefore send customer exchanges into that relay too. Its own front-facing service need not steal data for the downstream path to expose it.

Shou's claimed dataset purchase raises the separate possibility of traffic becoming something an operator sells. It does **not** establish that selling data financed that router's discount. The sourcing risk and the alleged data sale should be examined together without treating that financial connection as proven.

## The risk extends from reading exchanges to changing actions

The same paper studied 28 paid and 400 free routers, reporting nine that injected malicious code and 17 that accessed researcher-owned AWS test credentials. Those findings describe the sampled services, not the whole router market.

It also describes intermediaries changing returned tool calls—the structured instructions an agent uses to run commands. A compromised exchange can consequently affect what executes on the customer's machine. Keeping secrets out of requests addresses exposure; limiting tool permissions addresses what an altered response can do.

> A low token price explains the bill. It does not explain who handles the conversation.

For the database debugging session, the practical boundary is straightforward: share the error and relevant settings, keep live credentials out of the exchange, and check the router's upstream sourcing and retention terms. If a secret has already crossed a suspected service, revoke it rather than relying on deleting the chat.

Routers can make AI access cheaper and easier. The missing part of a bargain is whether those savings come from legitimate efficiencies—or from access and data practices the customer was never told about.
