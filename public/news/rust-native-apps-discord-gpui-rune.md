# Discord, GPUI and Rune: Rust’s native desktop push

Discord wants opening a channel to feel instant. Cap has removed the web view from its screen recorder. Anomaly, the team behind OpenCode, is building its own native UI framework. After years of Rust rewrites beneath the interface, the interface itself is becoming the next target.

The connection is **control over how an app reaches the screen**. Electron and Tauri helped teams share web interfaces across operating systems. A growing set of projects now wants to own layout, text and drawing too. GPUI gives them a reusable foundation; GPUI Kit supplies the controls around it. Rune explores a separate approach with animation and agent-driven verification built into its design.

## Discord makes the shift visible

On November 4, Discord CTO **Stanislav Vishnevskiy confirmed a Rust client rewrite**, replacing Electron on desktop and React Native on mobile. Desktop uses GPUI. Mobile keeps native interfaces while sharing application code through Rust. This extends adoption that already includes Discord’s infrastructure and voice technology.

His follow-up showed the client opening on older laptops. A development screenshot circulating with the announcement showed about **290 MB** of memory, reportedly with two accounts running. It is an encouraging preview, but there is no published, controlled comparison establishing a universal reduction. User testing is still ahead; this is not a replacement everyone can download today.

The main interface moves away from the browser, while embedded Activities still use a system web view. Discord also maintains patches over GPUI. Its announcement confirms GPUI, **not the separate GPUI Kit library** mentioned in some posts.

This puts a widely used communication app alongside a smaller group already testing the same architectural choice:

| Project | What changed | Status of the evidence |
| --- | --- | --- |
| Discord | Electron desktop client → Rust and GPUI | Announced rewrite; development demonstrations |
| Cap | Tauri interface → GPUI, retaining its Rust recording engine | Shipped in 0.6.1; developer-published measurements |
| Zed | A Rust editor built around GPUI after its founders’ experience with Atom and Electron | Existing native app; foundation for the framework |
| Anomaly’s Hex / Rune | Rune supplies Hex’s shared desktop UI; OpenCode Desktop is a flagship roadmap test | Existing integration plus pre-release framework work |

These are different stages of adoption. Together they show interest extending from editors into recording, communication and developer tools, without establishing an industry-wide exodus.

## What changes when the browser leaves

**Electron** bundles Chromium and Node.js, allowing one HTML, CSS and JavaScript interface to run across desktops. **Tauri** usually pairs a Rust backend with the operating system’s web view. It can avoid shipping a browser engine, but its interface still follows the web’s rendering model.

GPUI changes that boundary. Rust code describes an element tree; the framework measures and positions it, handles input and turns the visible interface into drawing commands. The GPU draws the result inside a platform window. There is no browser DOM between that tree and the renderer, and event handlers can call application Rust code directly.

> A Rust backend and a Rust-rendered interface are separate architectural choices. Tauri already gives you the first.

Browsers also use GPU acceleration. The distinction is who owns the rendering pipeline and which layers an interaction crosses. Nor does GPUI’s “native” mean that every button comes from AppKit or WinUI: the framework draws its own controls.

## GPUI supplies the rendering foundation

[GPUI](https://gpui.rs/) grew out of Zed’s work on a responsive editor. Its hybrid design combines persistent application state with views that describe the elements to render. Layout and styling use Rust methods familiar to anyone who has composed flex layouts or Tailwind utilities.

The drawing side reduces an interface to primitives such as rectangles, shadows, glyphs, icons and images. Specialized shaders draw them, while cached glyphs and images avoid repeating preparation unnecessarily. Platform integration connects windows and input to the renderer; current documentation lists Metal on macOS, DirectX 11 on Windows and wgpu on Linux.

The assembly below follows a GPUI application that chooses GPUI Kit. Controls and application state feed the framework; text and shapes become a GPU scene. Platform input returns to the app through the operating system integration.

![Isometric GPUI assembly: application state and GPUI Kit controls feed layout and text, cached drawing primitives reach the GPU, and a desktop window presents the result alongside platform input and accessibility integration.](/news/assets/rust-native-apps-discord-gpui-rune/native-rendering-assembly.svg)

GPUI’s original 120 FPS rendering work gives this architecture a concrete motivation: a 120 Hz screen leaves roughly **8.3 milliseconds per frame** for state updates, layout and drawing. That is a budget to engineer against, rather than a promise that every GPUI app meets it.

## GPUI Kit fills in the application around it

A renderer does not automatically provide a usable date picker or keyboard-friendly command palette. [Longbridge’s GPUI Kit](https://gpui-kit.com/) packages **75-plus components and primitives**, with software under Apache-2.0. Longbridge says the toolkit has powered its Pro desktop application from the beginning.

Its collection extends well beyond basic buttons:

| Collection | Examples |
| --- | --- |
| Forms | Inputs, textareas, selects, comboboxes, date and colour pickers |
| Navigation and overlays | Menus, command palette, sidebar, dialogs, popovers, sheets |
| Data and workspaces | Tables, trees, virtual lists, resizable panels, persistent docking |
| Rich content | Code editor, diff viewer, Markdown/HTML text view, charts |
| Shared behaviour | Themes, focus handling, accessibility and UI testing |

The toolkit separates responsibilities. **`gpui-base`** provides interaction primitives for teams creating their own visual system. **`gpui-component`** adds styled controls. **`gpui-shell`** allows capability-controlled JavaScript extensions to create interfaces within the Rust host. Native rendering therefore need not exclude scripting.

This is how the ecosystem can make adoption easier: another team can reuse focus, selection, overlays and virtualization instead of rebuilding every interaction. It does not establish that Discord or Cap uses the whole kit.

## Rune takes its own route at Anomaly

[Rune, covered in the previous Dispatch](/news/rune-native-ui-framework/), is Anomaly’s **separate native Rust UI framework**. It is not an OpenCode plugin or a GPUI Kit theme. Its own renderer, text system, layout and animation machinery sit behind a Rust view API.

Views describe the target interface, Taffy calculates layout, and scene updates reach the render thread. Spring animation tracks move properties toward their targets while preserving velocity when interrupted. That separation lets motion advance without rebuilding the application view for every animation frame.

Rune also makes verification part of the workflow: an app can render headlessly to PNG, expose its element tree and accept scripted input. Agents can check the interface they generate. Hex, Anomaly’s voice dictation app, supplies real desktop surfaces; recreating OpenCode Desktop is a flagship test in the plan, rather than evidence that its public desktop client has completed a migration. Rune remains pre-release.

## What the benchmark actually supports

Cap published a useful comparison: editor playback of the same recording on an **M4 Max**, using release builds, one warm-up and four runs per build. The chart preserves its reported CPU percentages and memory in MiB.

![Cap’s developer-reported editor playback benchmark: Tauri uses 76.6 percent CPU and 3724 MiB, the Electron experiment 53.2 percent and 1035 MiB, and the first GPUI build 17.5 percent and 440 MiB. Lower is better.](/news/assets/rust-native-apps-discord-gpui-rune/cap-playback-benchmark.svg)

These compare Cap implementations, not interchangeable framework benchmarks. The Electron experiment had its own optimizations. The GPUI version also changed the video-frame path, avoiding a GPU-to-CPU-to-browser round trip on macOS. Architecture and implementation changed together. Neither Discord’s screenshot nor Rune’s performance targets belongs on these measured bars.

## The work moves into the native stack

Owning the renderer also means owning more behaviour. Text selection, input methods, focus, screen-reader information and platform conventions need deliberate implementation. GPUI remains under active development alongside Zed. Libraries reduce that work, but they cannot prove an entire application behaves correctly.

The recent shift is compelling because reusable foundations are appearing beneath it. GPUI carries rendering across applications; GPUI Kit carries common controls; Rune couples its own native stack to motion and verification. For users, the test remains straightforward: opening a channel, scrolling a conversation or editing a recording should feel faster while preserving the interactions they rely on. That is what these rewrites still have to deliver beyond the first impressive launch video.

## Sources

- [Discord CTO’s November 4 announcement and replies](https://x.com/svishnevskiy/status/2118081920194203799) and [November 5 demonstration](https://x.com/svishnevskiy/status/2118398632236073156).
- [Cap’s October 21 migration report and benchmark methodology](https://cap.so/blog/rebuilding-cap-in-gpui).
- [GPUI’s current documentation](https://gpui.rs/examples/) and [Zed’s original rendering architecture](https://zed.dev/blog/videogame).
- [GPUI Kit component collection](https://gpui-kit.com/component/), [repository](https://github.com/longbridge/gpui-kit) and [architecture](https://github.com/longbridge/gpui-kit/blob/main/docs/ARCHITECTURE.md).
- [Rune’s repository](https://github.com/anomalyco/rune), [core documentation](https://github.com/anomalyco/rune/blob/dev/crates/rune/README.md), [roadmap](https://github.com/anomalyco/rune/blob/dev/PLAN.md) and [Hex integration](https://github.com/anomalyco/hex/blob/dev/AGENTS.md).
