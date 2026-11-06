# Anomaly builds Rune, a Rust UI framework for its desktop apps

OpenCode has a terminal interface and a desktop app. Anomaly is now building **Rune**, an MIT-licensed Rust UI framework that could give the desktop app a native rendering stack. The project’s roadmap calls OpenCode Desktop its flagship test, while Anomaly’s Hex dictation app already uses Rune for its desktop interface. [Rune roadmap](https://github.com/anomalyco/rune/blob/dev/PLAN.md#11-where-rune-fits-at-anomaly) · [Hex desktop UI notes](https://github.com/anomalyco/hex/blob/dev/AGENTS.md)

## How Rune draws a desktop app

Take a settings window with a sidebar, toggles and a scrolling pane. Rune describes those views in Rust, then uses **Taffy** to calculate their sizes and positions. Its renderer draws the controls and text on the GPU, with a native shell providing the window and platform services. On macOS, Rune defaults to its own Metal backend and can also use wgpu. The controls come from Rune’s own widget kit, so the same theme can carry through from a settings screen to a floating overlay. [Core crate](https://github.com/anomalyco/rune/tree/dev/crates/rune) · [Settings example](https://github.com/anomalyco/rune/tree/dev/examples/settings)

That separation also shapes how Rune handles motion. The app can tell the renderer where a panel should end up, and the renderer can advance the spring animation between frames. A moving panel can keep animating without asking the app to rebuild its view tree or recalculate layout on every tick. [Rune architecture](https://github.com/anomalyco/rune/blob/dev/PLAN.md)

## Why Hex is the first test

Hex puts that architecture to work in its settings and dictation overlays. It pins Rune and the OpenCode theme to a Git revision, which gives Anomaly a way to evolve both together. Hex also uses **named scenes** to render repeatable screenshots in light and dark modes. A developer or coding agent can open a particular state directly and compare it against a saved baseline without starting a live dictation session. [Hex development notes](https://github.com/anomalyco/hex/blob/dev/AGENTS.md)

That close coupling also shows how early Rune is. Hex’s own instructions call out breaking changes when updating its pin. Rune’s browser target is experimental, rendering to a single WebGPU canvas, with accessibility mirroring still listed as follow-up work. [Rune changelog](https://github.com/anomalyco/rune/blob/dev/CHANGELOG.md) · [Web target](https://github.com/anomalyco/rune/blob/dev/WEB.md)

Hex shows what Rune can do for settings and overlays today. OpenCode Desktop will ask more of it. The roadmap leaves the Electron decision open, and the stronger test will be how the native build handles long sessions, text selection and keyboard navigation across platforms.
