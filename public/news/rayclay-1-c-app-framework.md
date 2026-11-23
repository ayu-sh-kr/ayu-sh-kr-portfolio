# RayClay 1.0 brings web-style layouts to C apps

A notepad has a familiar layout. The list of notes takes up one side of the window, and the editor fills the space beside it. A web developer might reach for CSS flexbox to describe that relationship. **RayClay 1.0** lets a developer describe it much the same way in C, then build the app for Windows, macOS, Linux, iOS, Android or the browser. The MIT-licensed framework reached [version 1.0 on November 22](https://github.com/impizulu/rayclay/releases/tag/v1.0).

RayClay supplies the pieces around that layout too. It has editable text fields, scrollable lists, menus and file dialogs. An app that syncs its notes can also use its HTTP or WebSocket APIs. The application logic and the code that describes the screen can live together in C, without bundling a JavaScript engine to run the desktop or mobile interface.

## How a C layout becomes a screen

In RayClay, the notepad could declare a row with two children. The sidebar gets a width and the editor gets the remaining space. When the window grows, the editor grows with it. RayClay’s version of the **Clay layout engine** calculates where those elements fit, so the app can describe their relationship without calculating pixel coordinates whenever the window changes size.

Now select a different note. The app records which note is open in a C structure. When RayClay draws the next frame, the layout function reads that state and supplies the selected text to the editor. Stable IDs let RayClay recognize the same controls between frames and track details such as keyboard focus and scroll position. Once the screen settles, the default rendering loop sleeps until something needs its attention again. The project documents this cycle in its [guide to how a frame works](https://github.com/impizulu/rayclay/blob/v1.0/docs/getting-started.md#how-a-frame-works).

The same layout reaches each screen through a different graphics API. RayClay draws its own controls using Metal by default on Apple devices and Direct3D 11 on Windows. For the browser, the C code compiles to WebAssembly, with JavaScript handling integration and WebGL 2 drawing the interface into a canvas. That differs from frameworks such as Whisker, which maps shared UI declarations onto the phone’s own views. See the [RayClay web build](https://github.com/impizulu/rayclay/blob/v1.0/docs/web.md) and [how Whisker renders on mobile](/news/whisker-rust-native-mobile-apps/).

## What the notepad actually ships

The notepad is also one of the apps RayClay’s developer built to compare frameworks. On Windows 11, the RayClay version shipped **1.1 MiB of application files**, compared with **94.8 MiB for Electron 43.1.1**. That measures what the app distributes. It excludes runtimes supplied by the system and says little about how quickly the editor responds while someone types. The project published the workloads, measurements and methodology in its [desktop comparison](https://www.rayclay.dev/compare).

The compact result still takes a full platform build. Although the release offers a single C header, a graphical app also needs the windowing code and bundled dependencies from the source tree. The project provides a CMake build and a [starter template](https://github.com/impizulu/rayclay-template).

For a notepad, the most consequential limit shows up after launch. RayClay can draw the editor and track its keyboard focus, but v1.0 lists accessibility and system text-size support as missing. A team can share the editing interface across six targets and ship a small desktop app. If readers need a screen reader or rely on larger system text, the framework still leaves a central part of that reading experience unresolved. [RayClay’s documented v1.0 limits](https://github.com/impizulu/rayclay/blob/v1.0/docs/getting-started.md#not-in-v10).
