# Rune is Anomaly’s native Rust UI framework for desktop apps

**Rune is an open-source framework for building native desktop interfaces in Rust.** Anomaly is developing it under the MIT license. The framework provides windows, controls, text and animation, and draws its own widgets. Apps can use Rune’s controls with their own theme. [Rune repository](https://github.com/anomalyco/rune) · [Design plan](https://github.com/anomalyco/rune/blob/dev/PLAN.md#7-the-design-language)

## How Rune renders a Rust interface

Rune splits the work between the application and the renderer. The application describes what the interface should look like. The renderer draws it and handles how it moves between states. The illustration follows that handoff from the Rust view tree to a settings window on screen.

![Isometric illustration of Rune’s rendering pipeline, from Rust views and Taffy layout through scene updates to a GPU-rendered settings window.](/news/assets/rune-native-ui-framework/rendering-pipeline.svg)

**Rust views** describe the controls and their hierarchy. **Taffy** calculates their sizes and positions. The application then sends scene updates and animation targets through a command channel to the render thread. [Rune architecture](https://github.com/anomalyco/rune/blob/dev/PLAN.md)

The **render thread** advances animations and draws each frame on the GPU. When a panel slides open, the app can calculate its destination once. The render thread draws the movement without asking the app to rebuild the view tree for each frame. On macOS, Rune defaults to its own Metal backend and also offers wgpu. [Rune core crate](https://github.com/anomalyco/rune/tree/dev/crates/rune)

## Where Hex and OpenCode Desktop fit

Anomaly already uses Rune for the settings window and floating dictation overlay in **Hex**. Hex pins Rune and the separately packaged OpenCode theme to a Git revision, giving Anomaly a place to test changes to the toolkit against a working desktop app. [Hex desktop UI notes](https://github.com/anomalyco/hex/blob/dev/AGENTS.md)

**OpenCode Desktop** is the larger test on the roadmap. Anomaly has left the decision about replacing Electron open. Hex shows how Rune handles settings and overlays. OpenCode Desktop would test that same rendering stack against long scrolling transcripts, text selection and keyboard-heavy work across platforms. [OpenCode Desktop roadmap](https://github.com/anomalyco/rune/blob/dev/PLAN.md#11-where-rune-fits-at-anomaly)
