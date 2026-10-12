# REA, Rust App Clones and AI Reverse Engineering: Where the Line Sits

An editor, video tool or office suite can take years to build. Yet a recent wave of AI-assisted projects is trying to map familiar software and recreate parts of it in new, open-source code. The shift is drawing attention to **REA (Reverse Engineer Anything)**, a GitHub project that gives coding agents a common way to inspect applications and compiled programs.

The distinction matters. REA helps an agent gather evidence about how software behaves. A separate ArtCraft project family uses Rust to build new applications that resemble Adobe tools; its authors call them clean-room reimplementations. That can create cheaper alternatives, but it also raises a question: when does reproducing a product’s behavior become copying protected implementation or design?

## REA gives coding agents a path into software they cannot read

Most coding agents work from source code: files that developers can inspect and change. Commercial desktop applications usually arrive as compiled programs, where the original source is not included. Reverse engineering is the process of examining those binaries, their resources, or their runtime behavior to learn how they work.

REA packages that investigation behind an **MCP server**—a standard interface that lets an AI agent call external tools. Its README describes support for native binaries, JavaScript and Electron apps, .NET assemblies, Android packages, websites, and other targets. For native analysis, it can connect to tools such as Hopper, Ghidra or IDA; some formats use separate analyzers.

Consider a developer who wants to understand how a desktop app handles a search shortcut. The agent can ask REA to inspect the application, trace relevant code or events, and return findings with evidence and limitations. The agent then uses that information to explain the behavior or implement a similar feature in a separate project.

![Isometric workflow showing a coding agent sending an investigation through REA to local analysis tools, which return evidence and unknowns for a separate implementation.](/news/assets/rea-artcraft-reverse-engineering/rea-investigation.svg)

![Isometric comparison of a protected commercial application, observed behavior and public formats feeding an independently written open-source alternative, with the origin boundary marked for review.](/news/assets/rea-artcraft-reverse-engineering/clean-room-boundary.svg)

That evidence step is important. REA’s documentation says it does not recover the original source code or automatically clone an application. It can make analysis easier to ask for and repeat; interpreting results and deciding what to build remain separate work. For native analysis it also depends on the chosen provider and host setup, while an agent’s conclusion still needs review.

## The same techniques can support security and imitation

Reverse engineering is not inherently a shortcut to copying. Security researchers use it to understand suspicious software, inspect how a file format is handled, or investigate a vulnerability. Developers may study compatibility, interoperability, or how a public-facing feature behaves when no source code is available.

The same capability can also lower the cost of imitation. An agent that can map menus, file formats, and behavior may help someone reproduce a familiar workflow without access to the vendor’s source. That does not establish that any particular project copied code, nor does a similar interface alone settle whether a legal boundary was crossed. The method, materials used, jurisdiction, and resulting implementation all matter.

REA’s value is that it reduces the friction between a question and an evidence-backed inspection. That is useful for defenders and maintainers. It also means product teams may face more attempts to reproduce the user-visible parts of their software, whether or not the internals are copied.

> Reverse engineering can reveal behavior; it does not by itself prove that protected code was copied.

## ArtCraft shows what a new implementation can offer

ArtCraft’s PhotoCraft is presented as an open-source, clean-room reimplementation of Adobe Photoshop, written in Rust. Its project page describes layers, masks, adjustment layers, vector shapes, brushes, PSD support and a command system that can be driven from the interface, command line or an MCP server. The repository labels the application **early alpha** and names gaps including generative features, missing tools, typography depth and plugin compatibility.

Those details make it more than a mock screenshot: there is a working project surface and stated functionality. But a feature list is not the same as a mature production replacement. A creative professional also depends on predictable file round-tripping, specialized workflows, plugins, color management, performance and years of learned muscle memory. PhotoCraft’s own status is a reason to test it on copies of real work before relying on it.

The wider ArtCraft collection targets several Adobe workflows, including vector design, video editing, effects, desktop publishing, photo cataloguing and PDF work. The practical appeal is easy to understand: open-source software can be inspected, modified and used without the same subscription commitment. Rust can also support native desktop delivery and shared code across platforms. Those advantages still need to be judged against feature completeness, compatibility and support.

## A clean-room claim is a method, not a verdict

“Clean-room” usually describes an effort to build an independent implementation from permitted observations or public specifications, rather than copying the original source. It is a meaningful distinction, but the label on a README is not independent proof that every legal or engineering requirement has been met.

Compatibility work often needs to reproduce externally visible behavior: a file format, a keyboard shortcut, or a workflow users already understand. The harder questions are what was observed, what material was used, whether protected expression was copied, and how the implementation is distributed. A project can be technically independent and still invite legal questions about names, branding, interface elements or other protected material.

So there are two concerns to keep in view. **Competition can benefit users** when it creates lower-cost tools and gives people more control over their files. **Copying can harm creators** when a product appropriates protected work or misleads users about its origin. Neither conclusion should be presumed just because the new app looks familiar or is written in a different language.

## The projects have now reached Microsoft Office, too

The trend has moved beyond creative tools. In October, ArtCraft added WordCraft, GridCraft and DeckCraft, projects modeled on Microsoft Word, Excel and PowerPoint. Their repositories describe Rust implementations and support for common Office formats, while reporting around the releases notes that they remain early-stage software.

That makes the question more concrete for everyday users. Opening a DOCX, XLSX or PPTX file is only the start: layout fidelity, formulas, macros, collaboration, accessibility and complex documents determine whether a substitute can be trusted. For now, these projects are better understood as experiments in how quickly a small team, aided by coding agents, can assemble a familiar software surface.

The useful boundary is not “replica equals theft” or “open source equals harmless.” REA is an analysis tool, not a cloning switch. ArtCraft’s projects show how reverse engineering, public formats and AI-assisted Rust development can contribute to real alternatives, while their alpha status and the clean-room claim both deserve scrutiny. If you are choosing software, test the formats and workflows you rely on; if you are building it, make the evidence and the origin of your implementation clear.

Sources: [REA on GitHub](https://github.com/morluto/rea), [PhotoCraft on GitHub](https://github.com/storytold/photocraft), [ArtCraft projects](https://github.com/storytold), [The Register on the Microsoft Office projects](https://www.theregister.com/software/2026/10/08/rust-upstart-reveals-reimplementation-of-microsoft-office-with-claude-on-coding-duty/), and [TechRadar’s PhotoCraft test](https://www.techradar.com/pro/one-dev-is-recreating-7-adobe-apps-in-rust-for-free-so-i-tested-it-out).