# Pomerado turns repeated browser tasks into reusable MCP tools

Pomerado’s launch takes aim at a costly habit in browser agents: working out how to perform the same operation on every run. Its approach is to let an agent explore a website once, generate an integration, and expose that operation as a tool another agent can call.

The company, founded by **Akshay Manglik and Alan Ma** in Y Combinator’s Fall 2026 batch, is targeting websites that lack suitable APIs: internal portals, legacy business systems and consumer services. The open-source core lets developers build and run these integrations locally; its cloud service manages deployment and maintenance.

## From navigating a page to calling an operation

A general browser agent repeatedly observes a page, decides what to do and checks the result. That flexibility is useful when the task changes. Repeating it for a stable workflow also repeats model calls and opportunities for navigation errors.

Pomerado instead builds an operation with defined inputs and outputs. **MCP, or Model Context Protocol**, is how that operation becomes available to a tool-using assistant. An agent can ask for the latest invoices from a portal without having to reason through every menu and filter each time.

The [documented build process](https://github.com/Pomerado/pomerado/blob/main/docs/how-it-works.md) has three responsibilities. A **minter** explores the site in a real Chromium browser, writes operation modules and tests them. **Guardian** reviews its actions and finished code. The **runtime** executes the saved integration when it is called later.

The result is source code and schemas in a local folder. That matters for debugging: you can inspect the implementation behind “list invoices,” rather than treating the successful browser session as the only record of how it worked.

## Build cost and repeated-run cost are different

The [local core](https://github.com/Pomerado/pomerado) currently requires an OpenAI API key to build integrations. The assistant consuming a finished tool can use another model. Running the generated integration itself makes no model request, although the assistant deciding to invoke it can still incur model usage.

That separation explains the product’s appeal for recurring operations. You pay the exploration and generation cost during construction, then reuse the implementation. A task performed once has less opportunity to recover that setup cost than one performed hundreds of times.

Pomerado’s [YC launch post](https://www.ycombinator.com/companies/pomerado) claims **2–4× faster execution, 10–1,000× lower cost and improved reliability** compared with browser use. Those are the company’s reported comparisons. Its onboarding demonstration is one example, rather than a standard benchmark establishing the same gains for arbitrary websites. [AlphaSignal’s launch coverage](https://alphasignal.ai/news/pomerado-turns-any-browser-task-into-a-reusable-mcp-tool-in-30-minutes) describes the reusable-tool approach but is not an independent reproduction of those numbers.

For an invoice integration, a meaningful comparison would include the build, repeated successful runs, failed sessions and repairs after a page update. Measuring only the steady-state operation can answer a useful question, but leaves setup and maintenance outside the result.

## The local core and hosted product have different responsibilities

The current core is **MIT-licensed**, covering integration construction, Guardian and the local MCP host. The repository notes that **versions 0.1.2 and earlier used AGPL-3.0-only**. The version therefore matters when discussing the project’s license.

Pomerado Cloud adds hosting, stored logins, access controls, a managed browser fleet and automatic repair. Those are service capabilities around the core, rather than a promise that a local installation supplies the same managed operations.

The local setup targets macOS or Linux, Node 24 and Chromium. Integrations that sign in can ask for credentials and two-factor answers; the README describes the local host as saving none of those answers. It separately describes saved logins as a cloud feature.

Read and write integrations also need different treatment. A write build performs the requested action while creating the tool. A later failed run may report that an operation possibly committed before the error. Retrying an employee creation or invoice submission requires checking the site’s state first.

## Where it fits beside Browser Use and Playwright

| Approach | Where the work goes | A useful fit |
| --- | --- | --- |
| Browser Use | The agent interprets the website during execution | Tasks that vary or need exploration |
| Playwright | A developer writes and maintains the automation | Precisely controlled, tested browser workflows |
| Pomerado | An agent generates a reusable integration | Repeated operations on sites without suitable APIs |

These approaches overlap: Pomerado itself uses Playwright while building. Its differentiator is the route from a plain-language request to a saved operation, with the agent exposed to a smaller tool interface afterward. The [dynamic MCP discovery article](/news/mcp-discovery-apm-torchneuron-ai-tooling/) covers a related problem: locating a tool after one exists.

For the invoice portal, the question is whether the recurring operation can become stable enough to maintain as software. Pomerado offers a way to generate that software. The quality of the resulting integration, and the work needed when the portal changes, determine how much of the launch’s cost argument carries into practice.

Sources: [Pomerado’s YC launch and founders](https://www.ycombinator.com/companies/pomerado), [core repository and license](https://github.com/Pomerado/pomerado), [architecture documentation](https://github.com/Pomerado/pomerado/blob/main/docs/how-it-works.md), [Browser Use](https://github.com/browser-use/browser-use), [Playwright](https://github.com/microsoft/playwright), and [AlphaSignal’s launch coverage](https://alphasignal.ai/news/pomerado-turns-any-browser-task-into-a-reusable-mcp-tool-in-30-minutes).
