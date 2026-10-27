# Pomerado turns browser workflows into tools agents can reuse

A browser agent may navigate the same menus and filters every time it retrieves an invoice. **Pomerado aims to turn that repeated work into a saved integration**: an agent explores the website, generates code for the operation and exposes it as a tool for later use.

Founded by **Akshay Manglik and Alan Ma**, the Y Combinator Fall 2026 company focuses on websites without suitable APIs, including internal portals and legacy business systems. Its open-source core builds and runs integrations locally; a hosted service adds deployment and maintenance.

## From a browser session to a reusable operation

The distinction is where the agent does its reasoning. A general browser agent interprets the page as it works through a task. Pomerado uses that exploration to construct an operation with defined inputs and outputs, such as retrieving invoices for a given month.

Its documented build process starts with a **minter**, which explores the site in Chromium, writes operation modules and tests them. **Guardian** reviews the actions and finished code. A runtime then executes the saved integration when it is called again.

The output includes source code and schemas in a local folder. Through **Model Context Protocol (MCP)**, an assistant can discover and invoke the resulting operation without navigating each page itself. This complements the [tool-discovery work discussed here](/news/mcp-discovery-apm-torchneuron-ai-tooling/): one process creates an integration, while the other helps agents find available tools.

Pomerado uses Playwright during construction. Its contribution is the generation of reusable automation from a requested task, rather than a new browser engine.

## Reuse changes the cost calculation

Building an integration with the local core requires an OpenAI API key. Executing the generated integration makes no model request, although the assistant choosing to call it can still use a model.

That separation underlies Pomerado’s launch claims of **2–4× faster execution and 10–1,000× lower cost** compared with browser use. These are company-reported figures, supported by its demonstrations rather than a standard benchmark across arbitrary websites.

The savings depend on repetition. Construction takes work upfront, and a changing website can require repairs later. A recurring invoice retrieval has more opportunities to recover that effort than a task performed once. The launch figures therefore describe an execution-cost argument, not the full lifetime cost of every integration.

## The website still determines reliability

The current core is **MIT-licensed**, following AGPL-3.0-only licensing in versions 0.1.2 and earlier. It targets macOS or Linux with Node 24 and Chromium. Pomerado Cloud adds managed browsers, stored logins, access controls and automatic repair.

There is also an important distinction between reading a website and changing it. Building a write integration performs the requested action during construction. A later failed execution may leave an operation partially or fully committed, so retrying cannot always be treated as harmless.

Pomerado brings a familiar software idea to browser agents: preserve a successful operation as code instead of reconstructing it on every run. The lasting question is how well that code survives changing pages, authentication flows and ambiguous failures. Those are the conditions that determine whether reuse remains cheaper than repeated exploration.

Sources: [Pomerado’s YC launch and founders](https://www.ycombinator.com/companies/pomerado), [core repository and license](https://github.com/Pomerado/pomerado), [architecture documentation](https://github.com/Pomerado/pomerado/blob/main/docs/how-it-works.md), [Browser Use](https://github.com/browser-use/browser-use), [Playwright](https://github.com/microsoft/playwright), and [AlphaSignal’s launch coverage](https://alphasignal.ai/news/pomerado-turns-any-browser-task-into-a-reusable-mcp-tool-in-30-minutes).
