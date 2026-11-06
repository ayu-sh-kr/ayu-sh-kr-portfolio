# Rune is Anomaly’s native Rust UI framework for desktop apps

When you dictate with Hex, Anomaly’s desktop app, the floating dictation overlay is drawn by **Rune**. It’s an open-source native UI framework written in Rust and built by the team behind OpenCode. Anomaly is already using it in Hex and has marked OpenCode Desktop as its next major test. [Hex desktop UI notes](https://github.com/anomalyco/hex/blob/dev/AGENTS.md) · [Rune roadmap](https://github.com/anomalyco/rune/blob/dev/PLAN.md#11-where-rune-fits-at-anomaly)

## Anomaly is building Rune for Hex and OpenCode Desktop

Rune gives the team behind OpenCode a shared toolkit for windows, controls, text and motion. It’s MIT-licensed, and its widgets are drawn by Rune. An app can use the toolkit’s controls while supplying its own theme. Anomaly keeps the OpenCode theme in a separate crate so it can reuse the same colors and styles across apps. [Rune repository](https://github.com/anomalyco/rune) · [Design plan](https://github.com/anomalyco/rune/blob/dev/PLAN.md#7-the-design-language)

Hex also uses Rune for its settings window. It pins the framework and OpenCode theme to a specific Git revision, so changes to the toolkit can be tested against both the settings and the dictation overlay. [Hex desktop UI notes](https://github.com/anomalyco/hex/blob/dev/AGENTS.md)

## How Rune turns Rust views into frames

When a panel opens in Hex’s settings, the app updates its state and describes the new view in Rust. **Taffy** works out the target size and position of the panel and its controls. The app side sends scene updates and animation targets through a command channel to the render thread. [Rune architecture](https://github.com/anomalyco/rune/blob/dev/PLAN.md)

![Isometric illustration of Rune’s rendering pipeline, from Rust views and Taffy layout through scene updates to a GPU-rendered settings window.](/news/assets/rune-native-ui-framework/rendering-pipeline.svg)

The render thread advances the panel’s spring animation and draws each frame on the GPU. The app can calculate the panel’s destination once, leaving the renderer to draw the movement between positions without rebuilding the view tree on each frame. On macOS, Rune uses its own Metal backend by default and also offers wgpu. [Rune core crate](https://github.com/anomalyco/rune/tree/dev/crates/rune)

## What OpenCode Desktop would test

Hex shows how the toolkit fits a settings window and an overlay. OpenCode Desktop would put the same approach to work on longer sessions, scrolling transcripts and keyboard-heavy interaction across platforms. Anomaly’s roadmap leaves the decision about replacing Electron open. The question is whether the rendering approach behind Hex’s settings and overlays can carry a full desktop app. [OpenCode Desktop roadmap](https://github.com/anomalyco/rune/blob/dev/PLAN.md#11-where-rune-fits-at-anomaly)
