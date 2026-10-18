# OpenCode Console breach: how exposed API keys became AI bills

A developer can stop coding for the night while their AI account keeps spending. That is the immediate danger behind the **OpenCode Console breach**: a saved provider key can let someone else send requests and leave its owner paying for them.

OpenCode disclosed the incident on **October 17, 2026**, saying it affected **1.4% of Console users**, specifically a subset with external providers linked. Its customer notice described unauthorized access to a legacy system being decommissioned. The company called the incident a large-scale distillation attack and said it was working with Anthropic, OpenAI and Google.

Those statements describe two different parts of the story: where credentials may have escaped, and what attackers allegedly wanted to do with them. Understanding the breach starts with the first.

## The Console held a separate kind of access

OpenCode is an open-source coding agent. Its hosted Console is an optional service, and linking a provider there creates a different security arrangement from keeping a key in a local development environment.

The current [OpenCode provider documentation](https://opencode.ai/v2/docs/console/providers/) makes that arrangement explicit: Console stores a provider credential and uses its gateway to serve models to workspace members. Members can use the models without seeing the underlying key. The external provider bills the connected account for those requests.

This is convenient for a team. An administrator connects an Anthropic account once, and colleagues get access through the workspace. It also means the hosted service becomes responsible for protecting a credential with spending authority.

The documentation explains the product's trust relationship; it does not reveal how the affected legacy system implemented storage. Nor does the reported Console incident establish that the locally installed agent, its release packages or every local user's keys were compromised.

## What is known about the break-in

The [customer notice shared on Reddit](https://www.reddit.com/r/opencode/comments/1x8bas3/they_fd_up_breach/) says an unauthorized party accessed an older system that OpenCode was retiring. It warns that third-party provider keys saved in affected workspaces may have been exposed.

That is the disclosed entry surface. **The precise vulnerability remains unpublished.** An old system being decommissioned is a description of its lifecycle, not an explanation of the exploit. Publicly available material does not establish whether access came through broken authorization, stolen administrative credentials, an exposed service or another route.

It also does not establish whether keys were stored as plaintext, whether encrypted values were taken, or whether the intruder reached a component able to decrypt them. Encryption at rest can help, but a service that uses a secret must have some authorized way to access it. An investigation needs to establish which of those capabilities the attacker obtained.

For now, the supported explanation stops at legacy-system access and potential credential exposure. A complete postmortem would need to connect that access to the affected records and explain why existing controls failed.

## How a copied key turns into someone else's bill

Consider a hypothetical team that saves a dedicated provider key in Console. Normally, a developer's request goes through the gateway, which authenticates to the provider using that credential. The provider records usage against the team's account.

If an attacker obtains a usable copy, the credential can authorize requests from outside that normal workflow, subject to its restrictions. The attacker need not control the team's laptop or know its Console password to use a separate copy.

The following is an explanatory comparison, not a forensic reconstruction of the undisclosed exploit:

| Stage | Intended use | Exposure consequence |
| --- | --- | --- |
| Credential custody | Console holds the team's provider key. | Unauthorized access may expose a usable credential. |
| Request authorization | The gateway submits the team's requests. | A copied key may authorize unrelated requests. |
| Usage accounting | The provider charges the connected account. | Unauthorized consumption can land on that same bill. |
| Containment | Administrators manage access through Console. | Revocation at the provider disables the copied credential. |

This also explains why a gateway budget may be insufficient. A control enforced only on traffic passing through that gateway cannot govern requests made directly to the provider. Provider-side restrictions matter, and a billing alert should not be mistaken for an automatic spending cutoff.

[Notebookcheck's October 17 reporting](https://www.notebookcheck.net/OpenCode-hacked-users-urged-to-revoke-their-API-keys.1426957.0.html) collected accounts of unauthorized charges, including one user's reported $400 Anthropic bill. These are individual reports, not an audited total. The 1.4% figure likewise describes Console users; it cannot be applied to the entire OpenCode user base to calculate victim numbers.

## Why OpenCode called it a distillation attack

**Model distillation** uses a model's outputs to help train or improve another model. For example, a collection of questions and high-quality answers can become training material for a second system.

An attacker seeking that material needs access to many model responses. Stolen API credentials could supply that access while shifting the inference cost to victims. Credential theft would explain the unauthorized access; distillation would describe the proposed purpose of the resulting requests.

The label alone does not prove that training happened, that hidden reasoning was extracted, or that a competing laboratory directed the operation. OpenCode has not published enough technical evidence to reconstruct that downstream activity.

A useful comparison is [OpenAI's September 30 account of a separate distillation campaign](https://openai.com/index/disrupting-a-coordinated-model-distillation-campaign/). It described manipulated model interactions aimed at extracting protected reasoning, rather than a database break-in. That illustrates why distillation describes an objective or activity, not one specific intrusion method. It does not establish a connection between the two incidents.

## What affected users need to change

The customer notice asks affected users to revoke and replace provider keys, update dependent applications and review usage. Revocation needs to happen **at the issuing provider**. Removing a credential from a hosted dashboard cannot invalidate a copy already outside it.

For the hypothetical team, that means identifying the affected key, revoking it, and issuing a replacement for legitimate applications. If the same key was shared with CI jobs or other tools, those consumers also need updating. A separate key for each integration makes that dependency easier to track.

Keep usage records showing unexpected activity and contact the relevant provider about disputed charges. Check what restrictions the replacement supports: model permissions, project isolation, quotas or enforceable spending controls. Their availability and behavior vary by provider.

OpenCode's disclosure leaves important questions for its postmortem, particularly how a retiring system remained connected to live credentials. Meanwhile, the developer whose work stopped overnight needs the spending authority to stop too.

> A retired integration is only fully retired when its remaining credentials can no longer authorize requests.

OpenCode promotes free access to selected AI models, including [Cat Jam](https://x.com/opencode/status/2110068008945381853). A cheeky suggestion for its next offer: **make the most capable models free too**. Perhaps then the alleged distillers could use those instead of running up bills on customers' stolen API keys.

For more on the surrounding trust boundary, see [how AI routers handle requests and credentials](/news/malicious-ai-routers-agent-supply-chain/).

*Reporting checked on October 18, 2026. The intrusion mechanism and downstream use remain incompletely disclosed.*
