# Discord, GPUI and Rune: Rust’s native desktop push

The “rewrite it in Rust” trend is reaching desktop interfaces. Discord’s November 4 announcement puts a widely used chat app alongside Zed’s native editor and Rune, the UI framework being developed by Anomaly, the team behind OpenCode. They are at different stages, but share an ambition: more control over how an application responds and draws its interface across operating systems.

For years, **Electron** gave teams a practical answer: build an interface with the same HTML, CSS and JavaScript used for websites, then package it with Chromium, the browser engine behind Chrome. One web interface could become an app for Windows, macOS and Linux. **Tauri** kept that familiar approach while using the operating system’s web view and a Rust backend, avoiding the need to bundle Chromium. The web layer also brings memory overhead, layout work and, with different system browsers, platform-specific quirks.

> **Web view:** a browser surface embedded inside an application. It can display an entire interface without showing browser tabs or an address bar.

The newer Rust stacks take over the drawing too. They arrange text and controls, then send drawing instructions to the graphics processor. This gives teams more control over memory use, frame timing and the handoff between the interface and application code.

Discord CTO Stanislav Vishnevskiy says its new desktop client uses **GPUI**, the framework behind Zed. Mobile will keep native interfaces while sharing Rust application code, and embedded Activities will still use a web view. The company is preparing for user testing. Its announcement brings wider attention to a framework developed around the demands of a code editor.

## GPUI: from application state to pixels

[GPUI](https://gpui.rs/) is a Rust framework for building interfaces that it draws through the GPU. It grew out of Zed, whose founders had previously worked on the Electron-based Atom editor. Zed needed to respond consistently as you typed and scrolled, which meant controlling the path between an input and the next image on screen.

> **CPU and GPU:** the CPU runs general application work; the GPU is designed to carry out many graphics calculations in parallel. A **frame** is one image presented on screen. At 120 refreshes per second, each frame has about 8.3 milliseconds to arrive on time.

GPUI brings application state, layout and drawing into one framework. A channel switch in a chat application illustrates how those pieces work together.

### From a click to an updated view

In a chat app, the application remembers the selected channel and its messages. A view describes channels on the left, messages in the centre and a composer below. GPUI manages the persistent state while views build the elements needed to display it.

When you select another channel, an event handler changes the selection and asks GPUI to update. The handler runs Rust code directly, so it can call the application’s Rust functions without a browser-to-Rust messaging bridge.

> **State and element tree:** state is the information an app remembers, such as your selected channel. An element tree describes how visible pieces sit inside one another: a window contains panels, and a panel contains text or buttons.

### From layout to drawing

The updated view still needs to fit inside the window. GPUI works out how much space each panel gets, where text wraps and where the controls sit. Its Rust styling methods cover familiar layout ideas such as rows, columns, spacing and alignment.

The drawing stage turns that arrangement into a scene of **rectangles, shadows, text, icons and images**. GPUI prepares those pieces for specialized GPU programs to draw. Prepared letter images can be cached and reused as the conversation scrolls, rather than recreated for every occurrence.

> **Shader and glyph cache:** a shader is a small program running on the GPU to draw part of an image. A glyph is the visible shape of a character; a glyph cache keeps prepared character images available for reuse.

The illustration follows application state and optional GPUI Kit controls through layout, text and drawing. The platform bridge connects operating-system services.

![Isometric GPUI assembly: application state and GPUI Kit controls feed layout and text, cached drawing primitives reach the GPU, and a desktop window presents the result alongside platform input and accessibility integration.](/news/assets/rust-native-apps-discord-gpui-rune/native-rendering-assembly.svg)

### The platform work that remains

GPUI still needs real windows, keyboard and mouse input, and platform text services. Platform-specific graphics backends connect that shared drawing code to each operating system.

Developers gain access to the rendering path, but selecting text, typing in different languages or navigating with a keyboard must still work correctly. GPUI draws its own controls rather than adopting every operating system’s standard widgets.

Browsers already accelerate graphics with the GPU. GPUI gives developers a more focused rendering pipeline close to the application’s Rust code. Its performance still depends on how the application uses it. Turning that foundation into a complete product introduces another set of demands: usable controls, consistent styling and reliable interactions.

## GPUI Kit: the controls around the renderer

A working renderer still leaves a team needing inputs, menus, dialogs and all the interactions around them. [GPUI Kit](https://gpui-kit.com/), developed by Longbridge, packages **75-plus components and primitives** for that work. Its software uses the permissive Apache-2.0 licence, and Longbridge says it has powered its Pro desktop application from the beginning.

Its collection covers ordinary forms and denser editor or dashboard interfaces:

| Collection | What it provides |
| --- | --- |
| Forms | Inputs, textareas, selects, comboboxes, date and colour pickers |
| Navigation and overlays | Menus, command palette, sidebar, dialogs, popovers and sheets |
| Data and workspaces | Tables, trees, virtual lists, resizable panels and persistent docking |
| Rich content | Code editor, diff viewer, Markdown/HTML text view and charts |
| Shared behaviour | Themes, focus handling, accessibility and UI testing |

> **Virtual lists and docking:** a virtual list creates the visible portion of a long list instead of every row at once. Docking lets you rearrange, split and save panels, as you might in an editor.

Teams can use **`gpui-component`** for styled controls or build their own appearance over **`gpui-base`**, which supplies interaction behaviour. **`gpui-shell`** adds JavaScript extensions inside the Rust host, with permissions explicitly granted to each extension.

That gives teams reusable interaction behaviour while leaving room for their own design. GPUI Kit is a separate project built on GPUI; Discord’s announcement confirms the framework, without establishing that it uses Longbridge’s kit.

## Cap’s rewrite offers an early performance comparison

The screen recorder Cap has already taken this approach into a shipped release. It moved from Tauri to GPUI in version 0.6.1 while retaining its Rust recording engine. Its developer compared editor playback across the Tauri app, an Electron experiment and an early GPUI build on an **M4 Max**, using release builds, one warm-up and four runs each. The measurements were taken in August and published in its October 21 migration report.

![Cap’s developer-reported editor playback benchmark: Tauri uses 76.6 percent CPU and 3724 MiB, the Electron experiment 53.2 percent and 1035 MiB, and the first GPUI build 17.5 percent and 440 MiB. Lower is better.](/news/assets/rust-native-apps-discord-gpui-rune/cap-playback-benchmark.svg)

The GPUI build reported **17.5% CPU and 440 MiB of memory**, against Tauri’s 76.6% and 3,724 MiB. The result reflects a redesigned application path: on macOS, video frames could stay on the GPU instead of travelling through regular memory and back into the browser. The Electron experiment also had its own optimizations. These are Cap’s implementation measurements, rather than scores every app will inherit by switching frameworks.

## Rune pursues a separate native stack at Anomaly

GPUI is one route into this newer native stack. [Anomaly’s Rune](/news/rune-native-ui-framework/) develops another, with its own renderer, text, layout and animation systems. Anomaly already uses it for desktop surfaces in Hex, its voice dictation app. Recreating OpenCode Desktop is a flagship test in Rune’s roadmap; a completed migration of that client has not been announced. Rune remains pre-release.

Rune places particular emphasis on what happens between two interface states. Views describe the destination. Taffy, its layout library, calculates sizes and positions, while a separate drawing thread advances movement toward those targets. Opening a panel can therefore animate without rebuilding the application view on every frame. Interrupted movements preserve their velocity as they head toward a new target.

> **Spring animation and headless testing:** a spring models movement toward a target, including how it settles. Headless testing runs without an interactive window; Rune can produce screenshots and expose its element tree for scripted checks.

Those checks give coding agents a way to inspect the interfaces they generate. Anomaly is developing the tools for building and verifying native interfaces alongside the framework itself.

Zed established a working foundation, Cap has shipped a migration with measurable gains, and Discord is preparing to test the approach in a much broader everyday workload. Rune adds another direction for teams that want to own rendering and motion. Together, these projects show native Rust UI moving beyond the editor that helped popularize it. The test now is whether that control translates into consistently better typing, scrolling and navigation across the machines people actually use.

## Sources

- [Discord CTO’s November 4 announcement and replies](https://x.com/svishnevskiy/status/2118081920194203799) and [November 5 demonstration](https://x.com/svishnevskiy/status/2118398632236073156).
- [Cap’s October 21 migration report and benchmark methodology](https://cap.so/blog/rebuilding-cap-in-gpui).
- [GPUI’s current documentation](https://gpui.rs/examples/), [core framework overview](https://github.com/zed-industries/zed/blob/main/crates/gpui/README.md) and [Zed’s original rendering architecture](https://zed.dev/blog/videogame).
- [GPUI Kit component collection](https://gpui-kit.com/component/), [repository](https://github.com/longbridge/gpui-kit) and [architecture](https://github.com/longbridge/gpui-kit/blob/main/docs/ARCHITECTURE.md).
- [Rune’s repository](https://github.com/anomalyco/rune), [core documentation](https://github.com/anomalyco/rune/blob/dev/crates/rune/README.md), [roadmap](https://github.com/anomalyco/rune/blob/dev/PLAN.md) and [Hex integration](https://github.com/anomalyco/hex/blob/dev/AGENTS.md).
