# Rune is Anomaly’s native Rust UI framework for desktop apps

Open a settings window and slide out a panel. The app decides where the panel goes, but the renderer can handle the movement from there. That split is central to **Rune**, the open-source Rust UI framework Anomaly is building for its desktop apps.

## Anomaly is building Rune for Hex and OpenCode Desktop

Rune gives the team behind OpenCode a shared toolkit for windows, controls, text and motion. It’s MIT-licensed, and its widgets are drawn by Rune. An app can use the toolkit’s controls while supplying its own theme. Anomaly keeps the OpenCode theme in a separate crate so it can reuse the same colors and styles across apps. [Rune repository](https://github.com/anomalyco/rune) · [Design plan](https://github.com/anomalyco/rune/blob/dev/PLAN.md#7-the-design-language)

The first example is **Hex**, Anomaly’s desktop dictation app. Its settings and floating overlays already use Rune, and the app pins the framework and OpenCode theme to a specific Git revision. That gives the team a real app in which to work through changes to the toolkit. [Hex desktop UI notes](https://github.com/anomalyco/hex/blob/dev/AGENTS.md)

## How Rune turns Rust views into frames

When you open that settings panel, the app updates its state and describes the new view in Rust. **Taffy** works out the target size and position of the panel and its controls. The app side sends scene updates and animation targets through a command channel to the render thread. [Rune architecture](https://github.com/anomalyco/rune/blob/dev/PLAN.md)

![Isometric illustration of Rune’s rendering pipeline, from Rust views and Taffy layout through scene updates to a GPU-rendered settings window.](/news/assets/rune-native-ui-framework/rendering-pipeline.svg)

The render thread advances the panel’s spring animation and draws each frame on the GPU. The app can calculate the panel’s destination once, leaving the renderer to draw the movement between positions without rebuilding the view tree on each frame. On macOS, Rune uses its own Metal backend by default and also offers wgpu. [Rune core crate](https://github.com/anomalyco/rune/tree/dev/crates/rune)

## What OpenCode Desktop would test

Hex shows how the toolkit fits a settings window and an overlay. OpenCode Desktop would put the same approach to work on longer sessions, scrolling transcripts and keyboard-heavy interaction across platforms. Anomaly’s roadmap leaves the decision about replacing Electron open. The question is whether the rendering approach that works for a sliding panel can carry a full desktop app. [OpenCode Desktop roadmap](https://github.com/anomalyco/rune/blob/dev/PLAN.md#11-where-rune-fits-at-anomaly)
