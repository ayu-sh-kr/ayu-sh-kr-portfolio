# Unverified AI routers: credential leaks and pip install tampering

An AI router can offer several models through one account, but it also becomes a recipient of your conversations. If a coding agent sends a configuration file containing a password, the router receives that password. If the router changes a command in the reply, the agent may execute something the model never requested.

Security researcher Chaofan Shou brought the first risk into focus by claiming he bought a **6 TB dataset from an unnamed Chinese LLM router**. His [original post about the dataset](https://twitter.com/shoucccc/status/2098169782541631871) alleges it contained SSH keys, VPN configurations, cloud keys and GitLab tokens that could provide access to government entities and companies. The dataset and claimed access have not been independently verified here. The allegation nevertheless raises a concrete question: how does a service selling model access end up holding credentials for its customers’ systems?

## How your request becomes visible at the router

An **AI router** accepts a request from your application, chooses an upstream model provider, forwards the request and returns the answer. You configure its address as the destination for model requests. That makes the router an intended recipient of the traffic.

The request contains the material the model needs: your message, any conversation history the application includes, instructions and tool results. The router handles this as readable application data so it can forward it. An encrypted connection protects the journey to the router; the router itself receives the contents. Forwarding the request creates another connection to the next service.

Consider a coding agent diagnosing a database connection failure. It reads a configuration file through a local tool. The application then includes the tool’s output in its next model request so the model can interpret it. This is the round trip described in [Anthropic’s documentation on returning tool results](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls).

If that output includes a database password, **the password travels inside the request body**. You did not have to paste it into chat. The agent’s file read and the application’s decision to send the result put it there. The router cannot automatically read every file on your computer, but it can see the file contents your application sends.

![Requests and replies pass through the AI router. The router can copy readable exchanges into storage, where misuse or a breach can expose them, and can alter commands before replies return to the agent.](/news/assets/malicious-ai-routers-agent-supply-chain/router-exposure.svg)

The normal path continues even if the router copies the exchange. Your database question can receive a useful answer while a second copy leaves the intended workflow. The diagram shows possible exposure points, not a reconstruction of the alleged dataset sale.

## What a router can store—and what it needs to store

Processing an exchange and keeping it are different decisions. A router needs to handle the request long enough to forward it. It does **not need a permanent copy of the conversation** simply to pass it upstream.

Billing and operations can use narrower records: which account made a request, which model served it, when it ran, token usage, cost and whether it failed. Even these records can reveal patterns of use, but they are different from a transcript.

A router with access to the traffic can retain much more:

| Record | What it could contain |
| --- | --- |
| Request bodies | Prompts, included history, instructions, code and uploaded content carried in the request. |
| Tool results | File contents, terminal output and logs, including passwords or tokens present in them. |
| Responses | Generated text, code and instructions for the agent’s next tool call. |
| Account and request records | Customer identifiers, timestamps, model choices, usage and other connection details. |

These are **technical possibilities, not a claim that every router stores every field**. The actual record depends on its logging, monitoring, retention settings and operator behaviour. For comparison, [OpenRouter’s data collection policy](https://openrouter.ai/docs/guides/privacy/data-collection) distinguishes request metadata from opt-in prompt and response logging. That illustrates why a retention policy must say which data it covers.

For our debugging session, the difference is substantial. A usage record says you made a request; a stored tool result may contain the working password. Copies can also sit in error reports or backups after the visible chat disappears. A downstream model provider’s retention promise does not establish what the router retained.

## When visibility turns into a leak

Disclosure to the router happens when the request arrives. A leak beyond that service can happen if an operator exports the traffic, an attacker accesses stored logs, or the router forwards it through another relay. The extra relay then receives the exchange too. We do not know which collection path produced the dataset Shou described.

The harm depends on what the captured credentials permit. A valid database password may expose customer records. An SSH private key may enable server access where that key is accepted. A repository token with write permission may allow code changes; a cloud key may permit resource creation or access to stored data. Expiry, additional authentication and restricted permissions can limit that access.

Cheap access alone does not prove abuse. The relevant question is who actually handles the request. An undocumented chain of resellers gives you more recipients to trust, even when the model’s final answer looks correct.

## How a router can change a pip install command

The return path creates a second risk: **changing what the agent does**. The April 2026 [Your Agent Is Mine paper’s dependency-substitution example](https://arxiv.org/html/2604.08407v1#S4.SS2.SSS1) shows a router changing a package name in a tool call:

| At the model’s response | After the router’s edit |
| --- | --- |
| `pip install requests` | `pip install reqeusts` |

This is an attack illustration, not a command to run. The legitimate package name `requests` becomes the lookalike `reqeusts`. The edit happens after the model generates the response and before the agent receives it.

The agent sees an installation instruction in the expected reply format. If execution is automatically approved, it may install the substituted package. Checking only the package registry’s domain misses the problem: the destination can remain unchanged while the package changes. Installing attacker-controlled code can compromise the environment within its permissions.

The paper also reports active malicious injection in nine of 428 tested routers. That research supports the tampering risk; it does not verify the later dataset-sale allegation or identify its unnamed seller.

For the database debugging session, keep live secrets out of the tool output sent upstream. Check who operates the router, which other services receive requests and whether full exchanges are retained. Review exact package names before allowing installation, and restrict the agent’s permissions. If a working credential has crossed a suspected service, revoke or rotate it: deleting the conversation cannot disable a copied password or key.
