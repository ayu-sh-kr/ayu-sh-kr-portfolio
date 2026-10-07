# GitHub redesigns Git storage as AI agents push write demand higher

GitHub outlined a **Git infrastructure rebuild** on October 6. Monthly pushes reached 3.35 billion, up 4.9× year over year. Agents checkpoint frequently; CI multiplies reads, while merges compete to update the same branch.

## Today: repository copies serve reads and protect writes

**Spokes** keeps complete repositories on fileserver disks—five copies by default. Reference updates use a three-phase commit with quorum agreement.

A reference is a pointer, such as a branch name, to a commit. Imagine two agents fixing different bugs on separate branches. Their files can differ freely. When both changes reach `main`, however, the system must establish which commit the branch points to. A reader fetching that branch needs a coherent answer before it can build or test the code.

## Why more read replicas slow pushes

GitHub says every replica participates in writes, making pushes dependent on the slowest copy. Adding read capacity increases write overhead; losing quorum stops writes.

> More copies for readers can mean more coordination for writers.

## Planned: durable storage apart from Git workers

Authoritative data will live in **Azure Blob Storage**. Caching workers will serve reads independently, with separate maintenance workers. Coordination will focus on reference updates; object storage, connectivity validation and secret scanning can proceed alongside other writes.

GitHub reports **up to 35× higher write throughput in internal benchmarks**. This is work underway, without a published general rollout date. Branch protections and reviews remain design requirements.

The useful distinction is between preserving accepted code and providing enough machines to serve it. A temporary surge of readers should be handled by serving capacity, without forcing every new change through a larger group of machines.

Source: [GitHub Engineering — Building Git infrastructure for agent-scale development](https://github.blog/engineering/architecture-optimization/building-git-infrastructure-for-agent-scale-development/).
