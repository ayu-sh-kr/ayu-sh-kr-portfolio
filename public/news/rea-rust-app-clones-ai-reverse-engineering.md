# REA, Rust App Clones and AI Reverse Engineering: Where the Line Sits

A familiar app appears again, this time with a new name, open-source code and a Rust engine. ArtCraft’s alternatives to Adobe tools—and now Microsoft Office—have made that prospect more concrete. For users, it promises more choice and fewer subscription costs. For software creators, it raises concern about how easily years of work could be imitated.

**REA (Reverse Engineer Anything)** brings another part of that story into view: giving AI coding agents tools to investigate how existing software works, even when its source code is unavailable. The NSA tool mentioned alongside REA is Ghidra, an established reverse-engineering framework.

Understanding those tools helps put the recent replicas in context. What can an agent actually learn from an application, and how much work remains before that knowledge becomes a dependable alternative?

## REA gives coding agents a path into software they cannot read

A coding agent usually starts with readable source files. A commercial desktop app often arrives as a **binary**: a compiled program that a computer can run, with the original source left out. Reverse engineering examines that program, its resources and its behavior to work out what it does.

[REA](https://github.com/morluto/rea) connects this investigation to a coding agent through **MCP**, an interface for calling external tools. Its documentation covers native binaries, JavaScript and Electron applications, .NET assemblies, Android packages and websites. The target determines which analyzer is needed.

Consider a developer who wants to understand how a desktop app handles a search shortcut. The agent can ask REA to inspect the application, trace relevant code or events, and return findings with evidence and limitations. The agent then uses that information to explain the behavior or implement a similar feature in a separate project.

![Isometric workflow showing a coding agent sending an investigation through REA to local analysis tools, which return evidence and unknowns for a separate implementation.](/news/assets/rea-rust-app-clones-ai-reverse-engineering/rea-investigation.svg)

The result is evidence for the next question: which function handles the shortcut, what it calls, and what remains uncertain. REA’s documentation says it does not recover the original source code or automatically clone an application. The coding agent still has to interpret the findings, write an implementation and test its behavior.

## Ghidra, Hopper and IDA supply the binary analysis

For native programs, REA can work with **Ghidra, Hopper or IDA**. These tools inspect machine instructions, find strings and functions, and show relationships between parts of a program. A decompiler can also produce pseudocode—a readable approximation of what the compiled instructions do.

[Ghidra](https://github.com/NationalSecurityAgency/ghidra) is the open-source framework developed by the NSA, which explains the NSA reference accompanying REA. Hopper and IDA are other established analysis tools. REA connects these capabilities to an agent’s investigation; supported formats, installation requirements and available features vary by provider.

Pseudocode is useful, but compilation can remove names and reorganize logic. A readable reconstruction therefore needs checking against the actual program. The change REA pursues is making this specialist workflow easier for an agent to navigate through focused questions and follow-up inspection.

## Why the same investigation interests defenders and competitors

Reverse engineering is not inherently a shortcut to copying. Security researchers use it to understand suspicious software, inspect how a file format is handled, or investigate a vulnerability. Developers may study compatibility, interoperability, or how a public-facing feature behaves when no source code is available.

The same capability can also lower the cost of imitation. An agent that can map menus, file formats, and behavior may help someone reproduce a familiar workflow without access to the vendor’s source. That does not establish that any particular project copied code, nor does a similar interface alone settle whether a legal boundary was crossed. The method, materials used, jurisdiction, and resulting implementation all matter.

That search-shortcut example shows both possibilities. A maintainer might investigate unexpected behavior; a competitor might use the findings to design a similar feature. REA makes the investigation more accessible, while the purpose and implementation determine what follows.

> Reverse engineering can reveal behavior; it does not by itself prove that protected code was copied.

## ArtCraft shows what a new implementation can offer

The next step—turning a familiar workflow into a new application—is what ArtCraft is attempting. Its [PhotoCraft project](https://github.com/storytold/photocraft) is presented as an open-source, clean-room reimplementation of Adobe Photoshop, written in Rust. Its project page describes layers, masks, adjustment layers, vector shapes, brushes, PSD support and a command system that can be driven from the interface, command line or an MCP server. The repository labels the application **early alpha** and names gaps including generative features, missing tools, typography depth and plugin compatibility.

The documented features give users something concrete to evaluate. Professional readiness requires more than a familiar set of menus. A creative professional also depends on predictable file round-tripping, specialized workflows, plugins, color management, performance and years of learned muscle memory. PhotoCraft’s own status is a reason to test it on copies of real work before relying on it.

The wider ArtCraft collection targets several Adobe workflows, including vector design, video editing, effects, desktop publishing, photo cataloguing and PDF work. The practical appeal is easy to understand: open-source software can be inspected, modified and used without the same subscription commitment. Rust can also support native desktop delivery and shared code across platforms. Those advantages still need to be judged against feature completeness, compatibility and support.

## What a clean-room implementation needs to establish

“Clean-room” usually describes an effort to build an independent implementation from permitted observations or public specifications, rather than copying the original source. The authors’ description explains their intended approach. Verifying it requires evidence about how the implementation was produced.

![Isometric comparison of a protected commercial application, observed behavior and public formats feeding an independently written open-source alternative, with the origin boundary marked for review.](/news/assets/rea-rust-app-clones-ai-reverse-engineering/clean-room-boundary.svg)

Compatibility work reproduces visible behavior, such as a file format or keyboard shortcut. Assessing the implementation also means examining its source materials, branding, interface elements and distribution. Writing new code addresses only part of that question.

Both interests deserve attention. **Competition can benefit users** when it creates lower-cost tools and gives people more control over their files. **Copying can harm creators** when a product appropriates protected work or misleads users about its origin. Neither conclusion should be presumed just because the new app looks familiar or is written in a different language.

## The projects have now reached Microsoft Office, too

The trend has moved beyond creative tools. In October, ArtCraft added WordCraft, GridCraft and DeckCraft, projects modeled on Microsoft Word, Excel and PowerPoint. Their repositories describe Rust implementations and support for common Office formats, while reporting around the releases notes that they remain early-stage software.

That makes the question more concrete for everyday users. Opening a DOCX, XLSX or PPTX file is only the start: layout fidelity, formulas, macros, collaboration, accessibility and complex documents determine whether a substitute can be trusted. For now, these projects are better understood as experiments in how quickly a small team, aided by coding agents, can assemble a familiar software surface.

The recent releases make both reactions understandable. Users see a chance to pay less, work locally and keep more control over their files. Creators see familiar products being rebuilt with tools that make investigation and implementation easier.

REA helps explain how an agent can study software; ArtCraft shows the ambition to build alternatives. The sources reviewed here do not establish that ArtCraft used REA. These are related developments in a wider trend, with different roles.

For the familiar app in the opening, the meaningful test is whether the new version preserves the work people depend on and has a defensible development history. Cheaper access is valuable. Becoming a better solution still takes reliable behavior, compatibility and sustained maintenance.

Sources: [REA on GitHub](https://github.com/morluto/rea), [PhotoCraft on GitHub](https://github.com/storytold/photocraft), [ArtCraft projects](https://github.com/storytold), [The Register on the Microsoft Office projects](https://www.theregister.com/software/2026/10/08/rust-upstart-reveals-reimplementation-of-microsoft-office-with-claude-on-coding-duty/), and [TechRadar’s PhotoCraft test](https://www.techradar.com/pro/one-dev-is-recreating-7-adobe-apps-in-rust-for-free-so-i-tested-it-out).