# LiteLLM supply chain attack: how an AI router exposed credentials

A routine Python dependency update became a route to credential theft on **March 24, 2026**. Attackers published two malicious versions of **LiteLLM**, the open-source software that lets applications connect to multiple AI providers through one interface.

The affected releases, **1.82.7 and 1.82.8**, appeared on PyPI, the registry Python developers use to install packages. LiteLLM says they were available for about 40 minutes before quarantine. This was a compromise of the real package, so developers could encounter it while installing a dependency they already knew.

The incident began upstream of those installations. According to the project's investigation, a compromised security scanner gained access to publishing credentials. Following that path explains why the consequences extended beyond AI requests.

## What LiteLLM does between an app and AI providers

Imagine a support application that uses one model to summarise tickets and another to draft replies. Each provider has its own integration, authentication and failure handling.

LiteLLM gives the application a **shared interface**. Its [router](https://docs.litellm.ai/docs/routing) can distribute calls across configured deployments, retry failures and use fallbacks. The support application sends a request to LiteLLM, which connects it to the configured model provider.

Developers can use LiteLLM as a Python library or run it as a gateway service. It does not have to host the models itself; it connects the application to services running elsewhere.

That role requires access to provider credentials. For our support app, an AI key authorises model calls. Other secrets available on the same machine might authorise database access, cloud operations or software releases. The gateway's usefulness and its permissions therefore need to be considered together.

## How a security scanner reached the publishing keys

**Trivy** scans software for security problems. LiteLLM used it in its CI/CD pipeline: the automated steps that test, check and release software.

In its [March 27 town hall account](https://docs.litellm.ai/blog/security-townhall-updates), LiteLLM described three contributing conditions. Pipeline steps shared an environment, long-lived publishing credentials were stored in environment variables, and the Trivy dependency was unpinned.

An unpinned dependency can change between runs because the installation does not select one fixed version. [JFrog's analysis](https://research.jfrog.com/post/litellm-compromised-teampcp/) found that LiteLLM's scanner installation fetched the latest available Trivy package. A compromised release could consequently enter the pipeline without a deliberate version change.

LiteLLM's account says that malicious scanner could access the environment and obtain release credentials. Its advisory says initial evidence indicated that attackers then uploaded the poisoned Python packages directly to PyPI, bypassing the official release workflow.

This is a **supply chain attack**: a trusted component becomes a path into the software and systems that depend on it. The scanner's access to publishing keys connected one compromise to the next.

## Why the second release could run before an AI call

The malicious versions used different triggers. This comparison follows [Datadog's technical investigation](https://securitylabs.datadoghq.com/articles/litellm-compromised-pypi-teampcp-supply-chain-campaign/), rather than a local execution of the malware.

| Release | Execution path | Why it matters |
| --- | --- | --- |
| 1.82.7 | Malicious code inside the proxy module | Executing the affected module could launch the payload. |
| 1.82.8 | Also added `litellm_init.pth` | Normal Python startup could launch the payload without an explicit LiteLLM import. |

A `.pth` file helps configure Python's module search paths. Python also executes supported code lines in these files during normal startup. The attacker used that behaviour to trigger the second release's payload earlier.

For the support app, this means the risk could begin when Python started in the affected environment. Sending a ticket to an AI model was not a prerequisite for that trigger.

## The payload looked beyond model API keys

JFrog documented a collection routine targeting environment variables, SSH keys, cloud credentials, database configuration and other sensitive files. Collected data was encrypted and sent to an attacker-controlled domain resembling LiteLLM infrastructure.

The consequences depend on what the process could actually access. An AI key could enable unauthorised model usage; a publishing token could enable another poisoned release. A targeted credential location does not establish that every victim had that credential or that every collection attempt succeeded.

Datadog also found persistence mechanisms, which let malware remain active, and attempts to spread through Kubernetes when usable permissions were available. That makes removing the original dependency an incomplete response.

> Replacing a malicious package does not revoke credentials it may already have stolen.

## Affected installations and the recovery boundary

LiteLLM's [incident advisory](https://docs.litellm.ai/blog/security-update-march-2026) distinguishes the compromised PyPI releases from its official Proxy Docker image. The team said that image was unaffected because it pinned dependencies and did not consume those packages. A custom container installing either malicious version remained a possible exposure path.

The team also reported that no malicious code reached its main source branch. A clean repository and a poisoned registry download can therefore coexist.

Datadog recommended tracing affected hosts and build jobs, rotating reachable credentials, investigating persistence and rebuilding critical systems from known-good images. Our [PostgreSQL permissions guide](/blog/postgresql-access-control/) explains the related principle of limiting what a database role can do.

LiteLLM later released **1.83.0** through a revised pipeline and described changes toward isolated stages, shorter-lived publishing credentials and release verification.

For the support application, recovery means checking both the software that ran and the access it held. The same question applies upstream: a scanner needs enough permission to inspect a build, while publishing credentials should be restricted to the release step that needs them.
