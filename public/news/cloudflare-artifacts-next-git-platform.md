# Cloudflare opens Artifacts beta for GitHub alternatives built around AI agents

Cloudflare is inviting developers to build the next GitHub on its infrastructure. On **October 1, 2026**, the company opened **Artifacts** to public beta and launched a competition for Git platforms designed around AI coding agents. Artifacts supplies the repository service; entrants will build the experience for coordinating, reviewing and merging work.

That distinction explains the announcement. Cloudflare expects many agents to work on the same project at once, each fixing bugs or trying a different implementation. Its challenge is to make those parallel efforts understandable: what changed, why it changed, and which result should reach the main project.

## Artifacts gives each agent a place to work

**Artifacts stores files and their history through a Git-compatible interface.** Developers can import existing repositories and connect through standard Git clients, the REST API or Cloudflare Workers, its platform for running application code.

For example, a platform could give two agents separate copies of the same project to fix a login bug. Each agent would push its changes to its own repository. The platform could then compare the results and preserve the instructions and context behind each attempt. Artifacts supports that repository workflow; the platform's developers decide how to review and combine the changes.

## From an agent's push to review and deployment

The open beta adds tools for connecting those repositories to the rest of the workflow. A Worker can create or fork a repository, inspect files and commits, and issue a token limited to that repository. Event subscriptions let a push trigger tests or a review workflow.

For projects deployed to Workers, **Workers Builds** can turn a production-branch push into a deployment. Other branches get shareable previews, allowing changes to be tried before release. Teams can also select US or EU storage and processing for a group of repositories, and monitor operations and errors.

## What the Git platform competition asks teams to build

Cloudflare wants entrants to show **multiple agents working concurrently** and design how their work is coordinated and reviewed. Submissions close on **October 14, 2026** and require a five-to-ten-minute demo video, source code under a permissive open source license, and instructions for trying the project. The first-place team receives **$25,000 in Cloudflare credits**.

Artifacts requires the Workers Paid plan. Its published pricing includes 10,000 repository operations and 1 GB of storage per month, with additional usage charged at $0.15 per 1,000 operations and $0.50 per GB-month.

For developers building coding platforms, Artifacts offers a way to automate repository management while retaining Git tools. The competition asks them to turn that infrastructure into a useful collaboration product—one where people can follow and judge the work produced by many agents.

Sources: [Cloudflare announcement](https://blog.cloudflare.com/next-git-platform-on-cloudflare/) · [Artifacts documentation](https://developers.cloudflare.com/artifacts/) · [Open beta capabilities](https://developers.cloudflare.com/changelog/post/2026-10-01-artifacts-open-beta/) · [Artifacts pricing](https://developers.cloudflare.com/artifacts/platform/pricing/)
