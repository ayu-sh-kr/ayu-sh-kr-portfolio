# Adoption — layout.css v2.1

Replaces `MERGE-NOTES.md`, which was written against the wrong
environment. Delete that file.

---

## 1. What the earlier notes got wrong

Three assumptions came from the standalone prototype pages, not this
repository. All three are corrected here.

| Assumed | Actually |
|---|---|
| `typography.css` owns `--gutter` and `--measure` | No typography-owned token layer exists |
| Tailwind 2.2.19 via CDN | Tailwind 4 |
| A `ui.css` layer exists to own surfaces | It does not, and should not be created for this |

**Both "open decisions" in the old notes dissolve.** There is no
competing `--gutter`, and no `--measure` duplicating
`--layout-reading-max`. `layout.css` is the sole owner of page geometry.
Nothing needs a human ruling before adoption.

The Tailwind version matters for one thing. The old notes flagged that
v2's `box-sizing: border-box` guard would narrow v1 containers under
content-box, and said Tailwind 2.2's Preflight made it moot. Tailwind 4's
Preflight also sets border-box, so the conclusion holds — but the guard
is now inside `@layer base`, so Preflight and the guard are the same
declaration in the same layer and the question is fully closed.

**Verification still stands.** A fixture using only `.layout-page`,
`.layout-reading` and `.layout-content` computes byte-identical
`max-inline-size`, padding and auto-margins under v1 and v2 at 320, 375,
414, 700, 768, 1024, 1280, 1440 and 1920px.

## 2. What v2.1 adds beyond the geometry you already have

Unchanged: `--layout-page-max`, `--layout-reading-max`,
`--layout-content-max`, `--layout-gutter`, `--layout-section-space`, and
the three container classes.

Added: `--layout-form-max`, the section rhythm scale, the ten-step space
scale, grid classes, radii, z-layers, chrome tokens, and fixed-chrome
classes.

Two things changed shape from the version you reviewed:

- **Cascade layers.** Guards are in `@layer base`, classes in
  `@layer components`. Previously unlayered, which would have beaten
  every Tailwind utility — `max-w-none` on an image and `scroll-mt-0` on
  an anchor would both have silently failed.
- **`tailwind-theme.css`**, new and optional. Bridges breakpoints,
  container measures and radii into Tailwind's `@theme` so `md:` means
  700 rather than 768, and `rounded-lg` means 20px in every file. See §5.

Geometry-only is confirmed and now enforced by the skill: no `.layout-card`,
no `.layout-panel`. Surfaces stay component-owned and consume
`--layout-pad-card` / `--layout-pad-panel` / `--layout-radius-*`.

## 3. Integration — overrides this file replaces

`layout.css` now owns three things that are currently set elsewhere.
Leaving the old declarations in place means the later one wins and the
tokens do nothing.

**a. Body overflow.** `layout.css` sets `html { overflow-x: clip }` in
`@layer base`. Remove the later `body` overflow override.

```bash
grep -rn "overflow-x" src
```

`clip` on `html` beats `hidden` on `body` for this job: `hidden` creates
a scroll container, which silently breaks `position: sticky` on
descendants — including `.layout-rail`. If removing it exposes a
horizontal scrollbar, that is the real bug surfacing; find the track
missing `min-inline-size: 0` rather than restoring the override.

**b. Anchor offsets.** `layout.css` sets
`[id] { scroll-margin-block-start: var(--layout-stick) }`. Remove the
`4rem` overrides.

```bash
grep -rn "scroll-margin\|scroll-mt-" src
```

`4rem` is 64px; `--layout-stick` is `--layout-nav-h + 16`. Those agree
only if the header is exactly 48px. Set `--layout-nav-h` to the real
value and the offset follows automatically.

**c. Header and sticky controls.** Align to the tokens:

| Currently | Change to |
|---|---|
| header height literal | `--layout-nav-h`, set once to the measured height |
| sticky control `top:` literal | `inset-block-start: var(--layout-stick)` |
| header `z-index` | `var(--layout-z-nav)` |
| sticky subnav / rail `z-index` | `var(--layout-z-sticky)` |
| floating pill / toast `z-index` | `var(--layout-z-toast)` |
| fixed bottom chrome | `.layout-pinned-bottom` — adds `env(safe-area-inset-bottom)` |

Measure the header first, in the app, at 320 and 1440 — if it is fluid,
`--layout-nav-h` needs to be a clamp and `--layout-stick` follows without
further change.

## 4. Order of work

1. Import `layout.css` after Tailwind. Nothing should move.
2. Remove the `overflow-x` override. Check 320px for a scrollbar.
3. Set `--layout-nav-h` to the measured header height; remove the `4rem`
   anchor overrides. Click through in-page anchors.
4. Convert header and sticky controls to the chrome and z tokens.
5. Add `tailwind-theme.css`. Run the drift greps in the skill — `xl:`
   and `2xl:` variants become build errors, so that grep must come back
   empty first.
6. Convert page sections to `.layout-section*` one route at a time.

Steps 1–4 are the ones that touch existing pixels. Diff at 320 / 768 /
1440 after each.

## 5. On `tailwind-theme.css`

It is optional, and it is the only part of this drop that changes
Tailwind's own vocabulary. What it does:

- **Breakpoints.** Clears Tailwind's five defaults and defines
  `sm: 520 / md: 700 / lg: 1100`. After this, `xl:` does not exist. This
  is the enforcement mechanism for "there are three breakpoints" — CSS
  cannot otherwise stop someone typing `xl:`.
- **Container measures.** Adds `max-w-form / -reading / -content / -page`.
  The line clearing Tailwind's `max-w-xs … max-w-7xl` scale is left
  commented out; enable it once markup no longer uses those utilities.
- **Radii.** Clears Tailwind's defaults so `rounded-lg` cannot mean 8px
  in one file and 20px in another.

**Spacing needs no bridge.** Tailwind 4 derives spacing from a single
`--spacing` multiplier of 0.25rem, and the ten-step scale is a subset of
those multiples — `--layout-space-5` and `p-6` are both 24px. So Tailwind
spacing utilities are fine at the ten steps and drift everywhere else
(`p-5`, `p-7`, `p-9`, `p-14`, `gap-5`). Nothing enforces that; it is a
review rule and it is in the skill's self-check.

If clearing the breakpoint defaults is too disruptive right now, skip
the whole file — the layout classes work without it. The cost is that
`md:` and the system's 700px step disagree.

## 6. Still open — the `/design/layout` page

The standalone specimen is not portable here: it embeds the prototype
palette and its own type scale, and it is a static HTML file rather than
a route.

Rebuilding it as `/design/layout` against the current semantic theme
needs three things I do not have:

1. **The semantic token names** — background, surface, text, muted text,
   border/hairline, accent, and whatever the light/dark mechanism is
   (`.dark` class, `[data-theme]`, `prefers-color-scheme`).
2. **The type role classes or utilities** the repo uses for display /
   title / body / meta, so the page doesn't reintroduce a second scale.
3. **The route convention** — file location and whether pages are React
   components, and whether `/design/*` routes already exist.

With those, the page renders the container ladder, the space scale, the
rhythm tokens, the grid classes, the radii, and the z-layers as live
specimens in both themes — which is also the fastest way to catch a
token that doesn't exist yet.
