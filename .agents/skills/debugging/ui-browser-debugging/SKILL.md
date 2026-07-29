---
name: ui-browser-debugging
description: Diagnose and fix rendered frontend UI defects using a real local browser and computed-style evidence. Use for visual regressions, overlapping or clipped text, broken flex/grid layouts, unexpected responsive behavior, CSS cascade conflicts, or any issue where source review alone cannot prove the active browser styles.
---

# UI Browser Debugging

Use the browser as the source of truth. Do not report a CSS fix as complete until the issue has been reproduced and its computed styles or screenshot have been verified.

## Evidence-first workflow

1. Locate the component markup, its stylesheet, the application's style entry point, and similarly named selectors with `rg`.
2. Start the local app using its documented development command. Preserve unrelated working-tree changes.
3. Launch Chrome, Chromium, or Microsoft Edge with the DevTools protocol enabled. Use a temporary browser profile and a non-production local URL.
4. Inspect the affected element and its parent with `scripts/inspect-computed-styles.mjs`.
5. Compare computed values with the intended layout. Check `display`, width and inline-size constraints, flex/grid values, `font-size`, `letter-spacing`, `line-height`, `white-space`, `word-break`, `overflow-wrap`, `writing-mode`, `transform`, and `position`.
6. Search for the selector or property producing the unexpected value. Distinguish a direct rule from an inherited property or a layout constraint on an ancestor.
7. Apply the smallest scoped change in the component stylesheet. Prefer a component-parent selector over generic class names. Do not use `!important` unless computed-style evidence shows a necessary override.
8. Reinspect the computed values after HMR or reload, capture a screenshot when visual geometry matters, then run the project's appropriate build or UI tests.

## Local browser access

Find an installed Chromium-based browser before downloading anything. Typical commands include `command -v google-chrome`, `command -v chromium`, and the macOS Edge binary at `/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge`.

Run the browser headlessly against the local route, replacing the executable and route as needed:

```sh
browser_bin="/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
browser_profile="$(mktemp -d)"
"$browser_bin" --headless --disable-gpu --no-first-run --no-default-browser-check \
  --remote-debugging-port=9222 --user-data-dir="$browser_profile" \
  --window-size=1280,900 http://127.0.0.1:5173/target-route
```

In another terminal, inspect the live page:

```sh
node .agents/skills/debugging/ui-browser-debugging/scripts/inspect-computed-styles.mjs \
  --selector ".component-class > span" \
  --page-url "/target-route"
```

Use `--properties` with a comma-separated list to focus the result. The script requires Node with global `fetch` and `WebSocket` support.

For a visual artifact, launch a second disposable browser process with `--screenshot=/tmp/ui-debug.png --window-size=1280,900` and inspect the resulting image. Allow asynchronous app rendering to finish before drawing conclusions.

## CSS diagnosis rules

- Treat a value in the browser as evidence, not an assumption from the source file.
- Check inherited typography whenever text overlaps. A large negative `letter-spacing` inherited from a metric or heading can collapse otherwise correctly sized label text.
- Check selector scope when class names are reused. Generic classes such as `.metric`, `.label`, or `.value` must be constrained by their component parent.
- Check the parent layout before changing child widths: flex shrink, grid tracks, min/max inline sizes, overflow, and transforms can all make text appear broken.
- Keep layout geometry in component styles and use existing project spacing and typography tokens when the project provides them.
- Clean up diagnostic overrides before finishing; leave the minimal rule that directly addresses the observed computed property.

## Completion record

State the observed cause, the exact selector/property changed, the verification method, and the build or test result. Do not claim a visual fix from a successful compilation alone.
