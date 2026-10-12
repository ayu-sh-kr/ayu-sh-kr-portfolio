# Urban VPN AI chat harvesting: where conversation privacy breaks

A browser extension installed for privacy can become another reader of an AI conversation. In December 2025, **Koi Security reported that Urban VPN Proxy captured prompts and replies** from ChatGPT, Claude, Gemini and other services, sending copies to its own servers.

Koi linked the collection to data broker BiScience and marketing analytics. Its [investigation, preserved by the AI Incident Database](https://incidentdatabase.ai/reports/6825/), counted more than eight million installations across eight Chrome and Edge listings, including related VPN, browser guard and ad blocker extensions. That is an installation count, not proof that eight million distinct people had conversations sold.

## The extension read the exchange inside the browser

Koi traced the change to **version 5.5.0, released on July 9, 2025**. Injected scripts wrapped the browser functions used to send requests and receive replies. They extracted messages, conversation identifiers and timestamps, then compressed and uploaded the data.

The capture happened where the browser already handled readable messages. A VPN connection could not hide the chat from code running there. Koi found collection continued with the VPN disconnected and the “AI protection” warnings switched off.

The investigation concerns those historical extension versions. It does not establish what the currently distributed version collects.

## A reseller can become another reader too

A separate [April 9, 2026 study, Your Agent Is Mine](https://arxiv.org/html/2604.08407v1), examined AI routers: services that accept model requests and forward them to another provider. Researchers tested 28 paid and 400 free routers. **Seventeen touched researcher-owned AWS credentials** placed in the traffic; nine injected malicious code into returned tool calls.

The two cases expose different access points:

| Access point | How the exchange becomes visible |
| --- | --- |
| Browser extension | Code running on the chat page copies messages handled by the browser. |
| AI router | The application sends its request to the router, which receives the contents before forwarding them. |

The study also deployed deliberately weak relay services. Other operators discovered and used them, bringing downstream traffic onto researchers’ infrastructure: 440 Codex sessions exposed 99 credentials. This demonstrated how another intermediary can enter the chain without the end user choosing it directly. These findings describe the tested services, not every router.

For a coding task, that visibility can include configuration files and logs sent as tool results. A copied password can remain useful after the conversation is deleted.

Our [report on router leaks and command tampering](/news/malicious-ai-routers-agent-supply-chain/) explains that path in detail. The practical question extends beyond which model receives a message: which extensions and services can read it along the way? Review that access before sharing sensitive material, and revoke exposed credentials when a service is suspected of misuse.
