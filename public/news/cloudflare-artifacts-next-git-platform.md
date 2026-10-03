# Cloudflare invites developers to build the next Git platform with Artifacts

Cloudflare wants developers to build a GitHub alternative for AI agents. On October 1, it put **Artifacts**, its Git-compatible repository service, into open beta and announced a competition to build the collaboration platform above it. Cloudflare is supplying the repository infrastructure; the finished GitHub-like product is still a challenge for entrants.

The pitch starts with a question: if an agent gets its own repository for each task, how do people and other agents track, review and combine all those changes? A normal Git workflow can store the code, but the coordination around many simultaneous tasks needs a useful interface and rules.

## What Artifacts provides

Artifacts is a **versioned file system that speaks Git**. An application can create or fork repositories programmatically, read files and commits, and give an agent a repository-specific token. A developer could fork a project for a bug-fixing agent, let it push a change, then inspect the result before merging it.

Cloudflare has added event subscriptions for pushes and other repository activity, so a Worker can start a review or CI workflow when that agent pushes. Repositories can also connect to **Workers Builds**: a production-branch push deploys the Worker, while another branch gets a preview. These are building blocks for a platform, not a ready-made replacement for GitHub's issues, pull requests and review experience.

## The invitation and its limits

Cloudflare is asking teams to use **Workers and Artifacts** to design that missing layer: how agents coordinate tasks, how conflicting changes are handled, and how people review the output. Competition submissions are open until **October 14, 2026**; the first-place team is offered $25,000 in Cloudflare credits. Artifacts itself is available on the Workers Paid plan, with usage billing scheduled to begin October 14.

The practical news is a new place to store and automate Git repositories at agent scale. Whether it becomes a compelling GitHub alternative depends on what developers build around those repositories—and whether their approach makes many agents' changes easier to understand and trust.

Sources: [Cloudflare — Next Git platform announcement](https://blog.cloudflare.com/next-git-platform-on-cloudflare/) · [Cloudflare — Artifacts open beta](https://developers.cloudflare.com/changelog/post/2026-10-01-artifacts-open-beta/)
