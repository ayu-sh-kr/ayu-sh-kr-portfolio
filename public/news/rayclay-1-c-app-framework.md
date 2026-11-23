# RayClay 1.0 brings web-style layouts to C apps

Writing an app in C usually means taking on more of the interface work yourself. **RayClay 1.0** tries to narrow that gap: it combines flexbox-style layouts, familiar styling classes and application services in a framework that builds for Windows, macOS, Linux, iOS, Android and the web.

Released on [November 22](https://github.com/impizulu/rayclay/releases/tag/v1.0), the MIT-licensed project offers a different starting point for teams considering Electron or a JavaScript-based mobile stack. Application logic and UI declarations live in C, with widgets and networking supplied by the framework. The appeal is carrying less runtime overhead while keeping some conveniences of web development.

## From layout declarations to pixels

RayClay’s [programming model](https://github.com/impizulu/rayclay/blob/v1.0/docs/getting-started.md) uses rows, columns and boxes, with sizing, spacing and Tailwind-style classes. These describe the interface in C; they do not turn it into an HTML page or provide the full CSS feature set.

Each rendered frame runs the layout declaration against the app’s current state. Stable element IDs preserve focus, cursor position and scrolling between frames. Crucially, **declaring the interface each frame does not mean drawing continuously**: the default loop sleeps until input, a resize, a timer or another event requires work.

Underneath, RayClay includes a modified Clay layout engine and draws the interface itself. The [v1.0 build configuration](https://github.com/impizulu/rayclay/blob/v1.0/CMakeLists.txt) separates window handling from graphics: GLFW is the desktop default, while mobile and web use SDL3. Drawing defaults to Direct3D 11 on Windows, Metal on Apple platforms and OpenGL elsewhere. The web target uses WebGL 2.

> **Native builds, custom controls.** RayClay draws its widgets rather than making each button an operating-system control. Its desktop and mobile UI needs no JavaScript runtime, but the browser build still includes JavaScript glue alongside WebAssembly and draws into a canvas.

That differs from [Whisker’s mobile approach](/news/whisker-rust-native-mobile-apps/), which uses platform-native views. Shared application code does not imply the same rendering strategy.

## More than a layout library

RayClay includes text fields, menus, modals, virtual lists, HTTP requests, WebSockets and media support. For a dashboard or desktop utility, that reduces the number of separate libraries needed before the app can display data and respond to input.

The release’s single `rayclay.h` download needs context, though. **A GUI build also requires the repository’s window hosts and bundled dependencies**. The documented route is CMake or the starter template; mobile delivery still involves Android’s build tools or Xcode and signing. C’s memory responsibilities remain too: the documentation specifies how long borrowed strings stay valid and when request results must be freed.

## What the performance case establishes

The project’s [desktop comparison](https://www.rayclay.dev/compare) covers an empty window, a notepad and an analytics app, tested on November 21–22. On Windows 11, its empty-window build ships 922 KiB of RayClay 1.0 application files, versus 94.8 MiB for Electron 43.1.1. Those are **application-file sizes**, not memory usage or totals including external runtimes.

The tests were run by RayClay’s own developer, without independent reproduction. Startup timing also stops when a window appears; on Linux and Windows, RayClay’s window appears before it draws content. These results support investigating its footprint, but do not establish a universal responsiveness advantage.

Adoption has a more immediate constraint: the [v1.0 documentation explicitly lists accessibility and system text-size support as absent](https://github.com/impizulu/rayclay/blob/v1.0/docs/getting-started.md#not-in-v10). Secure storage, notifications, purchases and platform sign-in also require system APIs.

RayClay makes a C application a more approachable option by packaging layout, controls and services together. For teams evaluating a smaller runtime footprint, it provides a concrete framework to test. The decision still turns on the whole application: its accessibility requirements, platform integrations and the cost of maintaining C code alongside the interface.
