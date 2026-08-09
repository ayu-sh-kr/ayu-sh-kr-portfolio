---
name: scroll-interaction
description: Use when creating or refactoring horizontal decks, carousels, snap scrollers, or drag interactions in this portfolio. Covers mobile-first layout, native touch scrolling, keyboard access, and progress feedback.
---

# Scroll Interaction

- Keep the scroller the primary interaction surface with `overflow-x: auto` and `scroll-snap-type: x mandatory` when slides must settle.
- Give slides a full-width minimum and `scroll-snap-align: start`; keep mobile content compact and readable.
- Preserve vertical page scrolling. Prefer native touch scrolling; if pointer dragging is needed, use `touch-action: pan-y` on the inner scroller and do not prevent default until horizontal intent is clear.
- Make the scroller keyboard reachable with `tabindex="0"`, support `ArrowLeft`/`ArrowRight`, and never trap focus.
- Show restrained progress or slide position when the interaction has multiple states.
- Keep cleanup for pointer capture, observers, animation frames, and listeners in the component's disconnected lifecycle.

Verify touch swipe, desktop pointer behavior, keyboard movement, clean snapping, narrow layouts, and continued vertical page scrolling.
