# Tamagui 3: Tailwind styling for React Native and web

**Tamagui 3** updates a toolkit for building the same interface on websites, iPhones and Android phones. It combines reusable controls, such as buttons and menus, with a styling system for colours, spacing and layouts.

The [announcement](https://tamagui.dev/blog/version-three) appeared on **October 9, 2026**, followed by the stable [v3.0.0 release](https://github.com/tamagui/tamagui/releases/tag/v3.0.0) on October 10. Its main changes are Tailwind-style authoring and ways to reduce styling work while an app runs.

> React builds interfaces from reusable components. React Native uses that approach to create mobile interfaces with native controls.

## How the Rust compiler reduces styling work

Imagine a settings screen with a dark-mode switch. Its spacing usually stays fixed, even when its colours change.

Tamagui’s **compiler**, described by the project as written in Rust, prepares more styling before the app runs. A compiler is a tool that transforms source code into output an application can use. Here, it moves predictable styling work into the build step.

On web, that produces reusable CSS rules—the instructions browsers use to style a page. On mobile, it simplifies supported components into native views. Styles that depend on changing app state still keep the processing they need.

## What the C++ native runtime changes

The new **C++ runtime** handles some styling while the mobile app is running. According to the [native runtime documentation](https://tamagui.dev/docs/core/native), it can update supported views through Fabric, React Native’s rendering system, without making their React components render again.

For the settings screen, switching themes can update supported colours directly. This does not remove React from the app or promise that every interaction becomes faster.

> This runtime is an optional beta. It needs React Native 0.82 or newer, Fabric, and Nitro Modules, which connect JavaScript to native code. Enabling it requires rebuilding the mobile app.

## Tailwind styles on web and mobile

**Tailwind** expresses styles through short names: `p-4` adds padding, while `rounded-lg` rounds corners. Tamagui’s `@tamagui/tailwind` package lets developers use this syntax across web and mobile.

React Strict DOM adds another shared layer: familiar elements such as buttons become browser elements on web and native equivalents on phones.

Tamagui’s [coverage comparison](https://tamagui.dev/blog/tailwind-mode) tests how many Tailwind classes produce supported native styles. NativeWind and Uniwind are alternative libraries for using Tailwind syntax in React Native.

| Library | Native classes supported in Tamagui’s test |
| --- | --- |
| Tamagui Tailwind | 12,674 |
| NativeWind v5 | 12,231 |
| Uniwind | 11,833 |

The test uses Tailwind CSS 4.3.3’s 23,286 classes and React Native 0.87 on iOS. Many classes describe browser-only features, so full mobile coverage is not expected. These counts measure style support, not app speed.

## Bento and Takeout become free and open source

[Bento](https://tamagui.dev/bento) provides ready-made interface sections to copy and adapt. [Takeout](https://tamagui.dev/takeout) supplies a starter app. Both are now offered free and open source.

For an existing app, the [upgrade guide](https://tamagui.dev/docs/guides/how-to-upgrade) covers changes to older styling APIs. The practical gain is a shared settings screen with less repeated styling work; the optional native runtime remains a separate decision.
