# OpenAI Pando: how its Git backend scales pushes and fetches

An agent finishes a change and pushes its branch. That push triggers tests, while other agents start work and fetch the same repository. Each operation is familiar; the problem appears when thousands happen together.

At OpenAI, growing demand on its monorepo made pushes and fetches slow and caused merges to fail. The company says reliability sometimes fell below 90%. On November 2, it described **Pando**, a Git backend built to handle more concurrent work while letting engineers and agents continue using Git.

## Why Git hosting came under pressure

The pressure comes from two directions. Agents create branches and push changes in parallel. Meanwhile, CI jobs, fresh agent environments and developers repeatedly fetch overlapping repository history. A single change can lead to many readers asking for the same code.

A Git server must both accept writes and deliver the objects that make up a repository: commits, directory trees and file contents. With a conventional fetch, client and server negotiate what the client already has and what it wants. The server can then calculate and compress a pack tailored to that request. That saves unnecessary transfers, but repeating the calculation for many clients consumes CPU.

Writes bring a different problem. A branch name is a **reference** to a commit. Updating that reference safely matters: two writers must not silently overwrite each other’s changes to the same branch. But requiring unrelated branch updates to participate in a single repository-wide order can introduce coordination that grows with the workload.

OpenAI does not claim every Git server has the same bottleneck, or that Git itself cannot scale. Its question was how to serve its particular monorepo: accept many independent pushes and deliver the same history to many readers without repeating as much work.

## The idea behind Pando

Pando separates **branch metadata** from the Git data clients transfer. It stores pushed packfiles in blob storage, records branch versions in a metadata store and serves reusable packs through regional caches. It also treats updates to different branches independently.

The diagram follows one push into storage and a later fetch by agents or CI. The text below walks through each step and the problem it addresses.

![Pando stores pushed packfiles and branch metadata, then serves reusable packs to agents and CI through regional caches. Background compaction groups small packs.](/news/assets/pando-git-flow.svg)

## A push: store the pack, then update the branch

Suppose an agent creates a commit locally and runs `git push`. Its Git client collects the objects to send into a **packfile**, a compressed bundle of Git objects. Pando receives the pack, validates it and streams it to blob storage.

Pando then records a new version of the branch in its metadata store and atomically moves the branch reference to that version. The record connects the new tip to the pack and its dependencies. Once the push succeeds, the new revision and the history needed to fetch it are available.

This division matters for concurrency. Two agents pushing different branches do not need to wait for a single ordering of every branch in the repository. Competing updates to the **same branch** still need coordination: Pando guards that reference against conflicting changes. If multiple branches are viewed together, their states can reflect different points in time rather than one repository-wide snapshot.

The approach is called **causal consistency** in OpenAI’s design. For a reader, the useful guarantee is that a branch revision comes with the history needed to use it; it does not mean every branch is observed at the same instant.

## A fetch: reuse work for many readers

Now a CI job asks for the branch. It tells Pando which commits it has and which it wants. Using the recorded branch versions and dependencies, Pando selects stored packs that cover the missing history.

Instead of rebuilding a unique compressed pack for each reader, Pando returns links to existing packs. The Git client downloads them through **Express**, a service that caches packs in each region. Later jobs can receive the same bytes from a nearby cache without making the server recompress them. OpenAI reports that more than 99% of bytes came from local disk cache during a peak hour in which it served over 57 TB of packs.

> **What is a packfile URI?** Git can return a URL for a pack as part of a fetch, allowing the client to download that pack separately. The URI is the address of the bundle; it is not the branch or the commit itself. Pando uses these links to send reusable packs through Express.

Reusing a whole pack is not always the smallest possible download. A client may receive objects it already has. Pando accepts that extra transfer to save repeated server-side computation and make cache reuse practical.

## Making packs reusable without losing the branch

A pack created for a push can omit objects the receiving server already has. That is efficient for the push, but makes reuse harder: a different reader might not have those omitted objects.

Pando controls this by limiting which references it advertises as a base when a client pushes. For a new feature branch, it normally advertises the designated **trunk** branch. A reader with that trunk history can then use the feature branch’s pack. Pando tracks dependencies so it can select additional packs when they are needed.

The trade-off is on subsequent pushes: changes outside trunk may be sent again even if Pando received them in an earlier push. OpenAI says the median pack in its monorepo was under 20 KiB, so it considered the extra bandwidth acceptable for its workload.

## Keeping a fast-moving history manageable

Reusing individual pushes creates another problem. A client catching up with a busy trunk could otherwise need tens of thousands of packfiles. Pando groups small packs into larger **covers** in the background, then compacts them into bigger packs. Its indexes help it choose an appropriate combination for a client that is slightly or far behind.

Pando keeps packs at multiple levels, so it can continue serving readers while compaction runs. This makes catching up more manageable, but it also means retaining multiple representations of history rather than discarding old packs in the usual cleanup cycle.

OpenAI reports that Pando reduced **median push latency by nearly 80%** and delivers nearly **one petabyte of Git data per day**. Those are measurements from its own workload, not a comparison with every Git host.

> **Median push latency** is the middle measured push duration: half the pushes were faster and half slower. The reported reduction does not mean every push improved by 80%; OpenAI does not publish the before-and-after median times in its article.

The company says it built the Rust backend with Codex in ten weeks. Some Git client improvements have gone upstream, while others remain in [OpenAI’s public Git repository](https://github.com/openai/git); OpenAI says it is exploring ways to share Pando’s underlying technology.

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
