# Discord, GPUI and Rune: Rust’s native desktop push

The “rewrite it in Rust” trend is reaching desktop interfaces. Discord’s November 4 announcement puts a widely used chat app alongside Zed’s native editor and Rune, the UI framework being developed by Anomaly, the team behind OpenCode. They are at different stages, but share an ambition: more control over how an application responds and draws its interface across operating systems.

For years, **Electron** gave teams a practical answer: build an interface with the same HTML, CSS and JavaScript used for websites, then package it with Chromium, the browser engine behind Chrome. One web interface could become an app for Windows, macOS and Linux. **Tauri** kept that familiar approach while using the operating system’s web view and a Rust backend, avoiding the need to bundle Chromium. The web layer also brings memory overhead, layout work and, with different system browsers, platform-specific quirks.

> **Web view:** a browser engine embedded in an application to render its interface.

The newer Rust stacks take over the drawing too. They arrange text and controls, then send drawing instructions to the graphics processor. This gives teams more control over memory use, frame timing and the handoff between the interface and application code.

Discord CTO Stanislav Vishnevskiy says its new desktop client uses **GPUI**, the framework behind Zed. Mobile will keep native interfaces while sharing Rust application code, and embedded Activities will still use a web view. The company is preparing for user testing. Its announcement brings wider attention to a framework developed around the demands of a code editor.

## GPUI: from application state to pixels

[GPUI](https://gpui.rs/) is a Rust framework for building interfaces that it draws through the GPU. It grew out of Zed, whose founders had previously worked on the Electron-based Atom editor. Zed needed to respond consistently as you typed and scrolled, which meant controlling the path between an input and the next image on screen.

At 120 refreshes per second, the interface has about 8.3 milliseconds to deliver each frame. GPUI brings application state, layout and drawing into one framework to give developers control over that work.

### From a click to an updated view

GPUI keeps application state separate from the elements a view builds to display it. An action such as switching channels updates that state and requests a refresh. Input handlers run Rust code directly, allowing the interface to call application functions without a browser-to-Rust messaging bridge.

### From layout to drawing

GPUI calculates panel sizes, text wrapping and control positions using Rust styling methods for layout, spacing and alignment.

The drawing stage turns that arrangement into a scene of **rectangles, shadows, text, icons and images**. GPUI prepares those pieces for specialized GPU programs to draw. Prepared letter images can be cached and reused as the conversation scrolls, rather than recreated for every occurrence.

> **Shader and glyph cache:** a shader is a small program running on the GPU to draw part of an image. A glyph is the visible shape of a character; a glyph cache keeps prepared character images available for reuse.

![Isometric GPUI assembly: application state and GPUI Kit controls feed layout and text, cached drawing primitives reach the GPU, and a desktop window presents the result alongside platform input and accessibility integration.](/news/assets/rust-native-apps-discord-gpui-rune/native-rendering-assembly.svg)

### The platform work that remains

Platform-specific backends connect GPUI to windows, input, text services and graphics APIs. Because it draws its own controls, text selection, multilingual input and keyboard navigation need deliberate support rather than arriving with the operating system’s standard widgets.

Browsers already accelerate graphics with the GPU. GPUI gives developers a more focused rendering pipeline close to the application’s Rust code. Teams also need consistent controls and interaction behaviour around that renderer.

## GPUI Kit: the controls around the renderer

[GPUI Kit](https://gpui-kit.com/), developed by Longbridge, packages **75-plus components and primitives** for building those interfaces. Its software uses the permissive Apache-2.0 licence, and Longbridge says it has powered its Pro desktop application from the beginning.

Its collection covers ordinary forms and denser editor or dashboard interfaces:

| Collection | What it provides |
| --- | --- |
| Forms | Inputs, textareas, selects, comboboxes, date and colour pickers |
| Navigation and overlays | Menus, command palette, sidebar, dialogs, popovers and sheets |
| Data and workspaces | Tables, trees, virtual lists, resizable panels and persistent docking |
| Rich content | Code editor, diff viewer, Markdown/HTML text view and charts |
| Shared behaviour | Themes, focus handling, accessibility and UI testing |

> **Virtual lists** render only the visible rows and a small buffer, reducing the work required for large datasets.

Teams can use **`gpui-component`** for styled controls or build their own appearance over **`gpui-base`**, which supplies interaction behaviour. **`gpui-shell`** adds JavaScript extensions inside the Rust host, with permissions explicitly granted to each extension.

GPUI Kit is a separate project built on GPUI; Discord’s announcement confirms the framework, without establishing that it uses Longbridge’s kit.

## Cap’s rewrite offers an early performance comparison

The screen recorder Cap has already taken this approach into a shipped release. It moved from Tauri to GPUI in version 0.6.1 while retaining its Rust recording engine. Its developer compared editor playback across the Tauri app, an Electron experiment and an early GPUI build on an **M4 Max**, using release builds, one warm-up and four runs each. The measurements were taken in August and published in its October 21 migration report.

![Cap’s developer-reported editor playback benchmark: Tauri uses 76.6 percent CPU and 3724 MiB, the Electron experiment 53.2 percent and 1035 MiB, and the first GPUI build 17.5 percent and 440 MiB. Lower is better.](/news/assets/rust-native-apps-discord-gpui-rune/cap-playback-benchmark.svg)

The GPUI build reported **17.5% CPU and 440 MiB of memory**, against Tauri’s 76.6% and 3,724 MiB. The result reflects a redesigned application path: on macOS, video frames could stay on the GPU instead of travelling through regular memory and back into the browser. The Electron experiment also had its own optimizations. These are Cap’s implementation measurements, rather than scores every app will inherit by switching frameworks.

## Rune pursues a separate native stack at Anomaly

GPUI is one route into this newer native stack. [Anomaly’s Rune](/news/rune-native-ui-framework/) develops another, with its own renderer, text, layout and animation systems. Anomaly already uses it for desktop surfaces in Hex, its voice dictation app. Recreating OpenCode Desktop is a flagship test in Rune’s roadmap; a completed migration of that client has not been announced. Rune remains pre-release.

Rune places particular emphasis on what happens between two interface states. Views describe the destination. Taffy, its layout library, calculates sizes and positions, while a separate drawing thread advances movement toward those targets. Opening a panel can therefore animate without rebuilding the application view on every frame. Interrupted movements preserve their velocity as they head toward a new target.

Rune can also produce screenshots and expose its interface structure for scripted checks without opening an interactive window. That gives coding agents a way to inspect the interfaces they generate, making verification part of Anomaly’s native development workflow.

Zed established a working foundation, Cap has shipped a migration with measurable gains, and Discord is preparing to test the approach in a much broader everyday workload. Rune adds another direction for teams that want to own rendering and motion. Together, these projects show native Rust UI moving beyond the editor that helped popularize it. The test now is whether that control translates into consistently better typing, scrolling and navigation across the machines people actually use.

## Sources

- [Discord CTO’s November 4 announcement and replies](https://x.com/svishnevskiy/status/2118081920194203799) and [November 5 demonstration](https://x.com/svishnevskiy/status/2118398632236073156).
- [Cap’s October 21 migration report and benchmark methodology](https://cap.so/blog/rebuilding-cap-in-gpui).
- [GPUI’s current documentation](https://gpui.rs/examples/), [core framework overview](https://github.com/zed-industries/zed/blob/main/crates/gpui/README.md) and [Zed’s original rendering architecture](https://zed.dev/blog/videogame).
- [GPUI Kit component collection](https://gpui-kit.com/component/), [repository](https://github.com/longbridge/gpui-kit) and [architecture](https://github.com/longbridge/gpui-kit/blob/main/docs/ARCHITECTURE.md).
- [Rune’s repository](https://github.com/anomalyco/rune), [core documentation](https://github.com/anomalyco/rune/blob/dev/crates/rune/README.md), [roadmap](https://github.com/anomalyco/rune/blob/dev/PLAN.md) and [Hex integration](https://github.com/anomalyco/hex/blob/dev/AGENTS.md).
