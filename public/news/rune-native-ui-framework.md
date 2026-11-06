# Rune is Anomaly’s native Rust UI framework for desktop apps

Building a native desktop interface means getting text input, scrolling, keyboard navigation and animation to work together across operating systems. Drawing the window is only one part of that work. A shared framework can carry those responsibilities across apps, which is what Anomaly is building with Rune.

**Rune is an open-source framework for building native desktop interfaces in Rust.** It is developed under the MIT license by **Anomaly, the team behind OpenCode**. It brings the native window, text rendering, controls and motion into one toolkit. Rune draws its own widgets, and apps can supply their own theme.

## How Rune renders a Rust interface

Rune splits the work between the application and the renderer. The application describes what the interface should look like. The renderer draws the result and handles movement between states. That handoff connects the Rust view tree to the settings window shown below.

![Isometric illustration of Rune’s rendering pipeline, from Rust views and Taffy layout through scene updates to a GPU-rendered settings window.](/news/assets/rune-native-ui-framework/rendering-pipeline.svg)

**Rust views** describe the controls and their hierarchy. **Taffy** calculates their sizes and positions. The application then sends scene updates and animation targets through a command channel to the render thread.

The **render thread** advances animations and draws each frame on the GPU. When a panel slides open, the app can calculate its destination once. The render thread draws the movement without asking the app to rebuild the view tree for each frame. On macOS, Rune defaults to its own Metal backend and also offers wgpu.

## How Rune connects to OpenCode

Anomaly wants a shared native UI toolkit for its apps, and its roadmap names **OpenCode Desktop** as the flagship test. Rune would provide the interface layer for the desktop client, including its controls, text and animations. The decision about replacing its existing desktop stack remains open.

Anomaly already uses Rune in **Hex, its voice dictation app**, for settings and floating overlays. That gives the framework an existing application to develop against while the broader desktop plans take shape.

For developers, Rune brings layout, rendering and motion into a reusable Rust toolkit. Its value will depend on how well those pieces work together in everyday use, from selecting text to scrolling through a long conversation. OpenCode Desktop would give Anomaly a demanding place to test that.

## Sources

- [Rune repository](https://github.com/anomalyco/rune)
- [Design plan](https://github.com/anomalyco/rune/blob/dev/PLAN.md#7-the-design-language)
- [Rune architecture](https://github.com/anomalyco/rune/blob/dev/PLAN.md)
- [Rune core crate](https://github.com/anomalyco/rune/tree/dev/crates/rune)
- [Hex desktop UI notes](https://github.com/anomalyco/hex/blob/dev/AGENTS.md)
- [OpenCode Desktop roadmap](https://github.com/anomalyco/rune/blob/dev/PLAN.md#11-where-rune-fits-at-anomaly)
