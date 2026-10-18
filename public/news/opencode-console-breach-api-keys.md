# OpenCode Console breach: how exposed API keys became AI bills

Finish a long coding session, close the laptop, and get some sleep. By morning, a hefty AI bill is waiting. The work stopped hours ago, but someone using a stolen API key kept spending.

For some OpenCode users, the nasty surprise was a bill for AI requests they hadn’t made, after a breach of the hosted Console exposed their saved API keys.

OpenCode disclosed the incident on **October 17, 2026**, saying it affected **1.4% of Console users**, specifically a subset with external providers linked. Its customer notice described unauthorized access to a legacy system being decommissioned. The company called the incident a large-scale distillation attack and said it was working with Anthropic, OpenAI and Google.

To understand what happened, start with where Console held those keys and how the older system put them at risk.

## Where Console stored the provider keys

OpenCode is an open-source coding agent. Its hosted Console is an optional service, and linking a provider there creates a different security arrangement from keeping a key in a local development environment.

The current [OpenCode provider documentation](https://opencode.ai/v2/docs/console/providers/) makes that arrangement explicit: Console stores a provider credential and uses its gateway to serve models to workspace members. Members can use the models without seeing the underlying key. The external provider bills the connected account for those requests.

This is convenient for a team. An administrator connects an Anthropic account once, and colleagues get access through the workspace. It also means the hosted service becomes responsible for protecting a credential with spending authority.

The documentation explains the product's trust relationship; it does not reveal how the affected legacy system implemented storage. Nor does the reported Console incident establish that the locally installed agent, its release packages or every local user's keys were compromised.

## What is known about the break-in

The [customer notice shared on Reddit](https://www.reddit.com/r/opencode/comments/1x8bas3/they_fd_up_breach/) says an unauthorized party accessed an older system that OpenCode was retiring. It warns that third-party provider keys saved in affected workspaces may have been exposed.

**The precise vulnerability remains unpublished.** Identifying a retiring system does not explain how the intruder entered it. The available material does not establish whether access came through broken authorization, stolen administrative credentials, an exposed service or another route.

It also does not establish whether keys were stored as plaintext, whether encrypted values were taken, or whether the intruder reached a component able to decrypt them. Encryption at rest can help, but a service that uses a secret must have some authorized way to access it. An investigation needs to establish which of those capabilities the attacker obtained.

A complete postmortem would need to connect the intruder’s access to the affected records and explain why existing controls failed.

## The keys were entrusted to OpenCode

The concern here is where the exposure happened. Customers saved provider keys in OpenCode Console so the service could use them on their behalf. The reported breach put those credentials at risk inside the system entrusted to protect them, leaving affected customers facing charges for requests they never made.

[Notebookcheck's October 17 reporting](https://www.notebookcheck.net/OpenCode-hacked-users-urged-to-revoke-their-API-keys.1426957.0.html) collected accounts of unauthorized charges, including one user's reported $400 Anthropic bill. These are individual reports, not an audited total.

That explains the immediate harm. OpenCode’s description of a **distillation attack** addresses the next question: what were the attackers using that access to obtain?

## Distillation explains the alleged motive, not the security failure

OpenCode called the incident a **distillation attack**: attackers allegedly used the exposed keys to collect responses from external AI providers for training another model. The target of that activity would be those providers’ models, accessed at customers’ expense.

The **OpenCode security breach** concerns the failure to protect the keys that enabled that access. Calling the subsequent abuse distillation puts the spotlight on what the attackers wanted; it does not explain or excuse the credential exposure.

The attackers are responsible for stealing and abusing the keys. **OpenCode remains responsible for protecting the credentials entrusted to it**, explaining how the exposure happened and what will prevent it from happening again. The distillation claim does not, by itself, establish that training occurred or identify who directed it.

## What affected users need to change

The customer notice asks affected users to revoke and replace provider keys, update dependent applications and review usage. Revocation needs to happen **at the issuing provider**. Removing a credential from a hosted dashboard cannot invalidate a copy already outside it.

If an affected key was also used by CI jobs or other tools, those applications need the replacement too. A separate key for each integration makes those dependencies easier to track.

Keep usage records showing unexpected activity and contact the relevant provider about disputed charges. Check what restrictions the replacement supports: model permissions, project isolation, quotas or enforceable spending controls. Their availability and behavior vary by provider.

OpenCode's disclosure leaves important questions for its postmortem, particularly how a retiring system remained connected to live credentials. Meanwhile, the developer whose work stopped overnight needs the spending authority to stop too.

> A retired integration is only fully retired when its remaining credentials can no longer authorize requests.

Another day, another model free for a limited time on OpenCode. Perhaps the next offer could include the frontier models—so the alleged distillers can enjoy the free access without making customers unknowingly sponsor it.

For more on the surrounding trust boundary, see [how AI routers handle requests and credentials](/news/malicious-ai-routers-agent-supply-chain/).

*Reporting checked on October 18, 2026. The intrusion mechanism and downstream use remain incompletely disclosed.*
