# GitHub moves Copilot’s agent runtime from TypeScript to Rust

The GitHub Copilot CLI had become more than a terminal app. Its agent runtime also powered SDKs in six languages, yet each SDK client still had to start a CLI subprocess carrying Node.js and V8. That meant another process to supervise, an event hop across a process boundary, and startup work before an agent could take a turn.

GitHub has now **ported that runtime to Rust**. The engineering goal was to let applications embed the same engine **in process through a C interface**, while retaining a server mode for callers that need a separate process. The terminal interface sits above the runtime; GitHub says moving all remaining CLI calls onto the public SDK surface is still in progress.

## A migration while the product kept shipping

Rather than switch the whole runtime at once, the team moved components across in **128 merged pull requests**. GitHub reports **135 releases** over roughly fourteen and a half weeks, with the production runtime reaching more than 800,000 lines of Rust by August 21. Copilot agents wrote most of the port, while engineers directed the work, reviewed changes, maintained interoperability, and dealt with regressions.

The measured gain reflects the **new runtime and the ability to embed it**, not a clean language-only comparison. In GitHub’s local benchmark, creating a client and session, completing one small turn, and tearing them down fell from **5.25 seconds** with the TypeScript CLI to **292 milliseconds** with Rust in process. The Rust server mode took 1.33 seconds. For ten clients, measured added private memory fell from **1,383 MB to 126 MB** in the in-process setup. The test used a deterministic local model response, so those times do not describe a normal networked Copilot request.

The story is less about a million lines generated and more about a boundary removed. When a CLI becomes an SDK’s hidden runtime, every integration inherits its process and startup costs. GitHub’s port shows what changes when that shared engine becomes something applications can load directly—and why the architecture, not the language alone, explains the result.

Source: [GitHub Engineering — Migrating the GitHub Copilot runtime to Rust, using Copilot](https://github.blog/ai-and-ml/generative-ai/migrating-the-github-copilot-runtime-to-rust-using-copilot/).
