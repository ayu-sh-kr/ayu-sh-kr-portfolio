# Rune is Anomaly’s native Rust UI framework for desktop apps

Building a native desktop interface means getting text input, scrolling, keyboard navigation and animation to work together across operating systems. Drawing the window is only one part of that work. A shared framework can carry those responsibilities across apps, which is what Anomaly is building with Rune.

**Rune is an open-source framework for building native desktop interfaces in Rust.** Anomaly is developing it under the MIT license. It brings the native window, text rendering, controls and motion into one toolkit. Rune draws its own widgets, and apps can supply their own theme.

## How Rune renders a Rust interface

Rune splits the work between the application and the renderer. The application describes what the interface should look like. The renderer draws the result and handles movement between states. That handoff connects the Rust view tree to the settings window shown below.

![Isometric illustration of Rune’s rendering pipeline, from Rust views and Taffy layout through scene updates to a GPU-rendered settings window.](/news/assets/rune-native-ui-framework/rendering-pipeline.svg)

**Rust views** describe the controls and their hierarchy. **Taffy** calculates their sizes and positions. The application then sends scene updates and animation targets through a command channel to the render thread.

The **render thread** advances animations and draws each frame on the GPU. When a panel slides open, the app can calculate its destination once. The render thread draws the movement without asking the app to rebuild the view tree for each frame. On macOS, Rune defaults to its own Metal backend and also offers wgpu.

## Where Hex and OpenCode Desktop fit

Anomaly already uses Rune for the settings window and floating dictation overlay in **Hex**. Hex pins Rune and the separately packaged OpenCode theme to a Git revision, giving Anomaly a place to test changes to the toolkit against a working desktop app.

**OpenCode Desktop** is the larger test on the roadmap, with the decision about replacing Electron still open. It would put Rune through longer sessions with scrolling transcripts, text selection and frequent keyboard interaction.

That brings Rune back to the work of making a desktop interface feel native. Hex gives Anomaly a working foundation. OpenCode Desktop would test whether the same toolkit can deliver responsive rendering and dependable everyday interactions across a more demanding app.

## Sources

- [Rune repository](https://github.com/anomalyco/rune)
- [Design plan](https://github.com/anomalyco/rune/blob/dev/PLAN.md#7-the-design-language)
- [Rune architecture](https://github.com/anomalyco/rune/blob/dev/PLAN.md)
- [Rune core crate](https://github.com/anomalyco/rune/tree/dev/crates/rune)
- [Hex desktop UI notes](https://github.com/anomalyco/hex/blob/dev/AGENTS.md)
- [OpenCode Desktop roadmap](https://github.com/anomalyco/rune/blob/dev/PLAN.md#11-where-rune-fits-at-anomaly)
