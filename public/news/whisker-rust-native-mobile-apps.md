# Whisker takes Rust’s native UI push to iOS and Android

**Whisker brings the Rust native UI push to mobile.** Alongside the desktop work around [GPUI and GPUI Kit](/news/rust-native-apps-discord-gpui-rune/), the open-source framework offers a shared Rust application model for iOS, Android, web and desktop.

Its guiding principle is to **keep application state, interface declarations and layout in Rust, while letting each platform handle presentation**. On iOS and Android, that means native views; on the web, browser elements; on desktop, GPU drawing. The shared code describes the interface without requiring every platform to draw it the same way. Whisker remains **pre-alpha**.

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

Whisker’s contribution to the Rust UI trend is that division of responsibility: shared application behaviour and layout, with presentation handled by platform Hosts. It gives mobile developers a way to carry more of their application in Rust while retaining native views. Its readiness will depend on how consistently those pieces work together across devices as the framework matures.

## Sources

- [Whisker repository and pre-alpha status](https://github.com/whiskerrs/whisker).
- [Runtime and Host architecture](https://whisker.rs/docs/how-it-works) and [modules](https://whisker.rs/docs/modules-and-plugins).
- [Platform prerequisites](https://whisker.rs/docs/installation) and [hot-reload support and limits](https://whisker.rs/docs/hot-reload).
