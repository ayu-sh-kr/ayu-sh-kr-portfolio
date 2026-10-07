---
name: isometric-illustrations
description: Create or repair compact isometric SVG illustrations for articles and release notes, with consistent depth, functional layouts, clear flow and meaningful animation. Use when an illustration looks flat, scattered, stacked, repetitive or difficult to understand.
---

# Isometric illustrations

## Plan one readable mechanism

- Identify the input, operation and visible result before drawing. Use a different mechanism for each subject: expert routing, media search or trace inspection.
- Place related parts on one compact base. Assign each part a footprint, height and purpose; reserve corridors for connections. Avoid floating cards and arbitrary piles.
- Make the relationship understandable in a still frame. Use short labels, visible evidence and numbered stages; keep explanation in the article.

## Build real depth

- Use one coordinate system for every object, connector and moving element. Keep the ground axes at ±30° and vertical edges vertical; keep parallel edges parallel without vanishing points.
- For an equal-scale isometric **drawing**, project world coordinates with `x = cx + cos(30°) × (u − v)` and `y = cy + sin(30°) × (u + v) − z`. A true isometric projection applies equal foreshortening to all three axes.
- Construct top and two visible side faces from the same corners. Show physical thickness, sockets, rails or a casing where useful; a skewed rectangle alone does not establish volume.
- Place labels on the appropriate plane. Draw rear surfaces before front surfaces and check occlusion at every animation phase; keep essential evidence visible.
- Route connections along the world axes in reserved corridors. Attach them to actual ports or object boundaries; never run them through unrelated components.

## Style and animate with purpose

- Read the app theme and honor the requested palette. For white-and-black illustrations, use a white canvas, resolved app ink, restrained hatching and clear silhouettes. Use color only when it encodes information.
- Show a causal sequence: input travels, operation occurs, result appears. Move the scanner or packet along the same geometry as the visible rail or connector.
- Give phases a shared timeline and a brief readable end state before resetting. Avoid simultaneous pulsing that hides which action causes the next.
- Keep static labels and evidence present. Under `prefers-reduced-motion: reduce`, hide moving overlays and provide a fixed operation indicator where needed.
- Use standalone SVG animation for SVGs embedded through Markdown images; embed styles and colors, since page CSS does not inherit into the image. Avoid scripts.

## Verify before delivery

- Add a responsive `viewBox`, `<title>`, `<desc>`, `role="img"` and `aria-labelledby`; use descriptive Markdown alt text and a root-relative asset URL.
- Validate XML and render the complete image. Inspect margins, text, depth, connections and overlaps at article width and a narrow mobile width.
- Capture input, operation and result phases in a browser. Test the actual `<img>` embedding and reduced-motion mode; a static raster cannot prove animation works.
- Re-render after geometry changes. Run relevant repository checks and preserve unrelated assets.

## Sources

- [Cody Walker: Orthographic Projections & Basic Isometrics](https://technicalillustrators.org/2009/11/tutorial-orthographic-projections-basic-isometrics/) — equal measure, 30° grid, parallel edges and constructing top/side planes.
- [MDN: SVG animateMotion](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateMotion) — movement along a defined path and animation timing.
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) — responding to the reader's motion preference.

Use these sources for projection and browser behavior. Treat the compact layout, causal animation and white-and-black style above as design guidance learned from iteration, not rules attributed to those sources.
