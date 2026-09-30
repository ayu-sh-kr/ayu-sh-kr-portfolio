# InstaCloud raises $8M for an agent-native serverless cloud

An AI coding agent can finish an application and still stop at the deployment step: somebody has to provision a service, connect a database, inspect logs, and decide what reaches production. **InstaCloud**, from the team behind InsForge, is trying to put those operations into the agent's workflow. Co-founder Hang Huang says the company has raised **$8 million in seed funding** to pursue it.

## What does “agent-native cloud” mean here?

InstaCloud connects coding agents through a command-line tool and agent skill. Its pitch is that an agent can deploy code, add services such as Postgres and Redis, read operational feedback, and adjust a deployment through commands it can interpret. The company lists integrations for Codex, Claude Code, Cursor, and other agents. **Humans review and approve critical changes**, according to its product page.

This goes further than asking an agent to write a Dockerfile. Imagine it builds a small API: the next steps are creating the database, setting up the service, deploying it, and checking why a request fails. InstaCloud aims to make those steps part of the same workflow, with logs and service state available to the agent.

## What is the cloud offering?

The company advertises **serverless compute** that grows with demand and scales to zero while idle. It also offers **environment branching**: an agent can clone an environment to test a change or reproduce a fault away from production. Its site shows service and database controls alongside agent activity, making the human approval point visible.

The $8 million figure comes from Huang's announcement; it is a funding claim, not evidence that InstaCloud can replace AWS, Google Cloud, or Azure across their wider services. The product's useful question is narrower: can an agent reliably deploy, observe, and repair the applications it writes while a person retains control over consequential changes?

If that workflow holds up in real projects, the handoff between code and operations gets shorter. For now, the sensible test is a bounded service and a review of what the agent created, what it can change, and how to roll it back.

Sources: [InstaCloud product page](https://www.instacloud.com/), [Codex integration](https://www.instacloud.com/agents/codex), and [InsForge's Y Combinator profile](https://www.ycombinator.com/companies/insforge-instacloud).
