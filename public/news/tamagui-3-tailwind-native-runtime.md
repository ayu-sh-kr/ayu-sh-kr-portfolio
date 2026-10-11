# Tamagui 3 launches with Tailwind styling and a C++ native runtime

**Tamagui 3** brings Tailwind-style authoring and more native compilation to its shared React web and React Native UI system. Nate Wienert’s announcement is dated **October 9, 2026**; the stable [v3.0.0 GitHub release](https://github.com/tamagui/tamagui/releases/tag/v3.0.0) followed on October 10.

The aim is to reduce the styling work an app performs while it runs. Consider a settings screen shared between a website and a phone app: the layout stays familiar, but switching to dark mode should not require every styled component to run again.

## Less styling work during rendering

Tamagui describes its optimizing compiler as written in **Rust**. Version 3 expands what it can resolve before an app runs, including conditional styles and known prop spreads. Static layout can be extracted even when a value such as opacity remains dynamic. Web output uses reusable CSS rules; eligible native components flatten to React Native views.

The new **C++ native registry** takes a separate step. It connects eligible views to theme and style state, then applies updates through Fabric, React Native’s rendering system, without re-rendering those React components.

We inspected the [v3.0.0 registry implementation](https://github.com/tamagui/tamagui/blob/v3.0.0/code/core/native-registry/cpp/HybridTamaguiRegistry.cpp): it links views to style tables and commits changed properties into Fabric’s view tree. For the settings screen, that means eligible colours can change through this path while application data still uses React. This was source inspection, not a device performance test.

The registry is an **opt-in beta**, requiring React Native 0.82 or newer, the New Architecture, Nitro Modules and a native rebuild.

## Tailwind syntax, shared across platforms

Importing from `@tamagui/tailwind` enables utility classes. React Strict DOM also provides semantic elements that become browser elements on web and native equivalents on mobile. Regular Tamagui components can remain alongside them.

Tamagui’s flat style props keep a property’s conditions together: `p="4 sm:6"` describes padding at two screen sizes. A Rust language server supplies completions and diagnostics for this syntax.

The [Tailwind documentation](https://tamagui.dev/blog/tailwind-mode) reports this native coverage against Tailwind CSS 4.3.3’s 23,286-class registry, scoring styles actually rendered on iOS with React Native 0.87:

| Library | Native classes covered |
| --- | --- |
| Tamagui Tailwind | 12,674 |
| NativeWind v5 | 12,231 |
| Uniwind | 11,833 |

These are Tamagui’s measurements. Web-only CSS explains much of the uncovered registry; the comparison does not establish a universal speed advantage.

## Open-source kits and the upgrade boundary

[Bento](https://tamagui.dev/bento), its copy-paste UI collection, and [Takeout](https://tamagui.dev/takeout), its React Native starter kit, are now presented as free and open source.

For existing apps, the [upgrade guide](https://tamagui.dev/docs/guides/how-to-upgrade) covers removed APIs and token changes. The settings screen can gain simpler styles first; the native registry needs a separate evaluation. Sharing UI is still the foundation. Tamagui 3 adds ways to perform less work when that UI changes.
