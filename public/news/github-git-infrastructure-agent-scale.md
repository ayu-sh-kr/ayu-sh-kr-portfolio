# GitHub redesigns Git storage as AI agents push write demand higher

Adding servers usually helps a busy service handle more traffic. For GitHub, adding machines to serve repository reads also makes pushes slower. That trade-off sits behind the **Git infrastructure rebuild** outlined on October 6.

## More agents, more writes, more work after each push

GitHub reports monthly pushes reached 3.35 billion, up 4.9× year over year. Agents checkpoint frequently, CI multiplies reads, and merges converge on the same branch.

Consider two agents fixing separate bugs. Each can work on its own branch, but landing both changes on `main` requires an agreed order. A branch name points to a commit; the next build needs to know which version it is testing. The work is parallel until it reaches that shared pointer.

## The current setup ties read capacity to write coordination

Today, **Spokes** stores complete repositories on fileserver disks, with five copies by default. Reference updates use a three-phase commit with quorum agreement.

Those replicas also serve reads. GitHub says every copy participates in writes, so pushes depend on the slowest replica. More read replicas add write overhead; losing quorum stops writes.

> The same copies that help serve readers also increase coordination for writers.

That creates a difficult scaling decision: a repository needs more capacity to answer requests, yet adding it increases the work involved in accepting changes.

## The redesign separates storage from serving capacity

GitHub plans authoritative storage in **Azure Blob Storage**, with caching workers serving reads and separate workers handling maintenance. Coordination will focus on reference updates; object storage, connectivity checks and secret scanning can proceed alongside other writes.

GitHub reports **up to 35× higher write throughput in internal benchmarks**. The rebuild is underway, without a published general rollout date; branch protections and reviews remain design requirements.

The redesign returns to the problem at the start: a busy repository needs more machines to serve it without making each push coordinate with a larger group. Separating those responsibilities gives GitHub a way to absorb more activity while keeping an agreed version of the code at the centre of the workflow.

Source: [GitHub Engineering — Building Git infrastructure for agent-scale development](https://github.blog/engineering/architecture-optimization/building-git-infrastructure-for-agent-scale-development/).
