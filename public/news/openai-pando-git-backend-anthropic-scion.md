# OpenAI’s Pando scales Git as Anthropic takes a different path

When hundreds of coding agents work at once, the bottleneck can move from writing code to sharing it. OpenAI says its monorepo—the shared repository holding much of its code—began suffering slow pushes and fetches and failed merges as demand grew. Reliability sometimes fell below 90%.

Its answer is **Pando**, a new Git backend designed for concurrent agent work. Announced on November 2, it now serves OpenAI’s monorepo while engineers and agents continue using familiar Git commands.

## How Pando handles a push and a fetch

A push sends Git objects in a compressed bundle called a **packfile** and updates a branch reference, the pointer to its latest commit. Pando stores the pack in blob storage, then records the new branch version and updates its pointer in a metadata store. Updates to different branches can proceed independently instead of waiting for a repository-wide ordering.

When another agent fetches that branch, Pando selects stored packs containing the history it needs. Rather than generating a custom bundle for every request, it returns links to reusable packs through Git’s **packfile-URI** feature. A service called Express delivers them through regional caches. Background compaction combines smaller packs to keep a fast-moving history practical to fetch.

The design makes trade-offs. Reusing packs can send a client some objects it already has; limiting the history advertised during a push can also make repeated pushes larger. And a view across several branches can reflect different points in time, even though a reader can fetch the history needed for a particular branch version.

OpenAI reports that Pando reduced **median push latency by nearly 80%** and now delivers nearly **one petabyte of Git data per day**. These are results from its own workload, not a general benchmark. The company says it built the Rust backend with Codex in ten weeks and has contributed some Git client improvements upstream.

## Pando vs. Anthropic’s Scion

Anthropic faced its own surge: it reports roughly **25 million CI checkouts a day** and more than 30,000 daily merges by September. Its response, [Scion](https://www.anthropic.com/research/redesigning-source-control), moves its monorepo away from Git.

| | OpenAI Pando | Anthropic Scion |
| --- | --- | --- |
| Approach | Git-compatible backend and client workflow | New source-control system and client |
| Sharing changes | Git pushes and reusable packfiles | Server-side changesets and content-addressed files |
| Access | Git clients fetch stored packs | Clients request needed objects; APIs can answer some queries without a checkout |
| Trade-off | Preserves Git workflows while changing server architecture | Redesigns the workflow around an available server and sparse access |

Anthropic reports faster checkouts and a smaller infrastructure footprint than its previous Git mirrors. Those figures and OpenAI’s push results measure different workloads, so they are not a head-to-head comparison.

## An older problem with a new source of demand

Large repositories strained source control before coding agents. Meta built **Mononoke** to scale its Mercurial backend and later developed Sapling; Google’s Piper is another earlier monorepo system. Cloudflare’s [Artifacts](/news/cloudflare-artifacts-next-git-platform/) takes a different approach, providing Git-compatible repositories that platforms can create and fork for individual agent tasks. [GitHub is also rebuilding its storage infrastructure](/news/github-git-infrastructure-agent-scale/) to separate read capacity from write coordination.

For OpenAI, the practical goal is that an agent can push its branch while others fetch the same history without slowing each other down. Pando keeps the Git workflow and changes what happens behind it; Scion shows how far the architecture can change when the client changes too.

Sources: [OpenAI’s Pando architecture](https://openai.com/index/scaling-git-at-openai/), [Anthropic’s Scion design](https://www.anthropic.com/research/redesigning-source-control), [Meta on Mononoke](https://engineering.fb.com/2021/04/29/developer-tools/rust/), and [Cloudflare Artifacts](https://blog.cloudflare.com/artifacts-git-for-agents-beta/).
