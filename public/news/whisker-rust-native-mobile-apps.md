# Whisker takes Rust’s native UI push to iOS and Android

The Rust UI conversation is moving beyond desktop windows. As [GPUI and GPUI Kit attract attention](/news/rust-native-apps-discord-gpui-rune/), developer **itome** is pointing mobile developers toward **Whisker**, an open-source framework for writing applications in Rust across iOS, Android, web and desktop.

Its approach puts interface declarations, application state and layout in Rust, then hands the result to each platform. On phones, that means native views. Whisker is still **pre-alpha**, but it offers a different direction from building a shared GPU renderer for every screen.

## One Rust interface, different platform renderers

Whisker keeps the interface structure in memory. When application data changes, its reactive signals update the properties that depend on it. A playback timer, for example, can update its label without rerunning the component that declared the whole player.

**Taffy**, the layout engine, calculates sizes and positions. Whisker then produces a `FramePacket` containing interface operations and resolved geometry. A platform adapter, called a **Host**, applies that packet:

| Target | How the interface reaches the screen |
| --- | --- |
| iOS | UIKit views and platform drawing |
| Android | Android views and platform drawing |
| Web | Positioned browser DOM elements |
| Desktop | GPU drawing through wgpu |

This is the important distinction from GPUI. Whisker shares the Rust interface model while allowing different rendering mechanisms underneath. Its mobile application runs as one native process, with the Rust library inside it; there is no separate Rust server or JavaScript engine managing the mobile UI.

The Host also supplies measurements when text or native controls need them. Rust resolves the layout before the Host presents the result. That division lets the shared code own the interface without replacing every platform service.

## The development loop matters too

Whisker includes routing, media, storage and other modules, with an extension system for native controls and services. Its tooling generates the platform projects from application configuration and Cargo dependencies, keeping them buildable through Xcode or Gradle.

The project also reports **sub-second hot patches** for eligible edits: changed code is loaded into the running app, while unedited components retain their state. Dependency and native-configuration changes require a full rebuild.

Those conveniences have boundaries. The documented desktop run path currently ships for **macOS**. iOS hot reload works in the Simulator, not on physical iPhones or iPads; those use the normal Xcode build-and-install workflow. APIs and platform coverage can still change before 1.0.

Whisker extends the Rust UI discussion from controlling desktop pixels to sharing mobile application code and native views. For a team considering that route, the useful next step is a small screen with real input, scrolling and device integration. Those everyday interactions will reveal more about its readiness than the language choice alone.

## Sources

- [Whisker repository and pre-alpha status](https://github.com/whiskerrs/whisker).
- [Runtime and Host architecture](https://whisker.rs/docs/how-it-works) and [modules](https://whisker.rs/docs/modules-and-plugins).
- [Platform prerequisites](https://whisker.rs/docs/installation) and [hot-reload support and limits](https://whisker.rs/docs/hot-reload).
