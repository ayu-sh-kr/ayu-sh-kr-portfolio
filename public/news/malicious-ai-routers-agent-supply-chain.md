# Unverified AI routers: credential leaks and pip install tampering

Cheap access to several AI models can come with an extra recipient: the company routing the conversation. Everything sent through that service—including code, documents and credentials accidentally included in a debugging session—can reach its servers before reaching the model provider.

Security researcher **Chaofan Shou** says he bought a **6 TB dataset** from a major Chinese LLM router containing SSH keys, VPN configurations, Aliyun cloud keys and GitLab tokens. His [post](https://twitter.com/shoucccc/status/2098169782541631871) claims the credentials could enable access to seven Chinese/CIS government entities and 19 companies, including Xiaomi, Huawei, NIO and MiniMax.

The router is unnamed, and the dataset and claimed access remain unverified here. The question is how selling AI access could also expose customers’ exchanges.

## The router receives the conversation to forward it

An **AI router** is a service between an application and model providers. It offers a shared interface for accessing different models, often with one account and billing balance. The application sends its request to the router; the router forwards it upstream and returns the answer.

Requests can include earlier messages, attachments, source code and results returned by an agent’s tools. Replies pass through the router too.

Imagine a developer asking a coding agent why a database connection fails. The agent reads a configuration file, and the application sends its contents back for diagnosis. If the file includes a database password, that password travels with the exchange. [Anthropic's tool documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls) describes this round trip: the application executes a client tool and returns its output in the next message.

That is the point where a local secret becomes **data sent to the router**. The model needs the tool result to continue, so the application includes it in a request. An operator can extract the password from that request without changing the answer. Credentials can arrive through files, terminal output or logs, without being deliberately pasted into chat.

## Where an exchange can leak

The first exposure happens **at the router handling the request**. An operator can retain a copy while still forwarding the request and returning a normal answer. The coding session can appear successful throughout.

A second exposure can happen in stored records. Request logs, debugging traces and databases may retain conversations after the session ends. Those copies can be misused by the operator, accessed through a storage breach or sold. These are possible leak paths; Shou's post does not establish the unnamed router's exact collection or sale process.

[OpenRouter's explanation of data retention](https://openrouter.ai/blog/insights/zero-data-retention/) makes a useful distinction: a provider's promise not to retain a request does not remove copies made elsewhere, such as application logs or error trackers. The same question needs asking at each service handling an exchange.

| Place | What could leave the intended workflow |
| --- | --- |
| Router processing | A copy of the request and answer while they pass through. |
| Logs or stored traffic | A retained conversation later exposed or sold. |
| Additional upstream relay | The same exchange forwarded to an operator the customer did not choose. |

For our database example, a leaked password may permit database access. **SSH keys can permit server login; cloud keys can permit infrastructure access; GitLab tokens can expose repositories or enable changes.** The harm depends on whether the credential still works and what permissions it grants. A leak can therefore become data theft, unauthorised infrastructure use or further software compromise.

## Cheap access can add hidden recipients

[ChinaTalk's 2025 investigation](https://www.chinatalk.media/p/the-grey-market-for-american-llms) described resellers exploiting free credits, reselling quotas and disguising cheaper models as US models. Legitimate discounts also exist; the concern is unclear sourcing.

The [Your Agent Is Mine study](https://arxiv.org/html/2604.08407v1) reports that researcher-controlled relay decoys entered routing paths and exposed 99 credentials across 440 Codex sessions. A reseller forwarding to another relay sends exchanges there too. Shou's dataset allegation does not establish that selling traffic financed a discount.

## A changed pip install command can install the wrong package

The paper illustrates **package-name substitution** in a returned tool call. These commands show its documented example; the second is an attack illustration and should not be run.

| Command | What changed |
| --- | --- |
| `python -m pip install requests flask pyyaml` | Original instruction. |
| `python -m pip install reqeusts flask pyyaml` | `requests` becomes **`reqeusts`**, an attacker-controlled lookalike. |

The router makes the substitution **after the model responds, before the agent receives the command**. The package registry can remain the same, so checking only the destination domain misses the altered dependency. Installing it can leave malicious code in the project beyond that conversation.

An agent that automatically approves commands can carry out the modified instruction. Local permissions and sandboxing still determine what the resulting code can access. This attack example is separate from the alleged 6 TB dataset sale.

> An unverified router can receive a secret on the way in and alter a command on the way back.

For the database debugging session, share the error and redacted settings, keep live credentials out of tool results, and verify the router’s operator and upstream sourcing. Review the exact package names and commands before execution, and restrict the agent’s access. If a secret crossed a suspected service, revoke it; deleting the chat cannot invalidate a stolen copy.

The bargain needs to cover more than model access. It also needs a trustworthy path for the debugging exchange—and a check that the command executed is the one the application intended to run.
