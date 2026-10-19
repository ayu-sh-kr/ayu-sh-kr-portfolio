# Dota 0.5 upgrade and lazy components benchmark

Upgrading the Dota packages alone moves first paint earlier by hoisting web fonts out of the CSS bundle. Opting into `lazyComponents` is what cuts start-up JavaScript: the Lighthouse mobile score goes from 67 to 89 and LCP from 4.55 s to 2.71 s (route medians).

## Scope and method

Measured 19 October 2026 on three builds of the same content (99 prerendered routes):

| Variant | Commit | Dependencies | Registration |
|---|---|---|---|
| Base | `e1109b0` | Dota Wrap 0.2.3, Dota UI 0.1.3, Dota MD 0.2.1 | Every component eager through `virtual:dota-components` |
| Bump | `c8207ef` | Dota Wrap 0.5.0, Dota UI 0.2.2, Dota MD 0.2.5 | Unchanged |
| Lazy | `4fd5749` | As Bump | `initializeApp({lazyComponents})` with the generated registry and library loaders |

- Each `pnpm build:ssg` output was served by a local static server that matches the Vercel setup: trailing-slash `index.html`, Brotli level 11, immutable `/assets/`.
- Lighthouse 12, mobile form factor, simulated throttling (Slow 4G, 4× CPU), headless Chromium 1194, fresh profile per run. Iconify and analytics hosts were blocked in every variant, because the sandbox has no route to them.
- Six routes × three variants × five runs, interleaved by route and variant. Tables show medians.
- Google Fonts is unreachable from the sandbox, so its requests are modelled by Lighthouse rather than observed. The font-hoisting gain is real in direction; its production size may differ.
- These are lab numbers on a shared host, not field data. Raw runs: [dota-lazy-components.raw.json](dota-lazy-components.raw.json).

## Results across all routes

| Metric | Base | Bump | Lazy |
|---|---:|---:|---:|
| Performance score | 67 | 70 | **89** |
| First Contentful Paint | 3349 ms | 3207 ms | **2581 ms** |
| Largest Contentful Paint | 4553 ms | 4280 ms | **2714 ms** |
| Total Blocking Time | 358 ms | 322 ms | **179 ms** |
| Speed Index | 4811 ms | 4702 ms | **3130 ms** |
| Time to Interactive | 4553 ms | 4280 ms | **3538 ms** |
| JS transferred (whole load) | 241 kB | 245 kB | **194 kB** |
| JS requests | 2 | 2 | 32 |
| Cumulative Layout Shift | 0 | 0 | 0 |

## Per route

| Route | Score (B / Bump / Lazy) | LCP ms | TBT ms | JS kB |
|---|---|---|---|---|
| `/` | 68 / 71 / 90 | 4531 / 4274 / 2707 | 314 / 293 / 174 | 241 / 245 / 150 |
| `/blog/` | 68 / 72 / 89 | 4531 / 4232 / 2714 | 374 / 324 / 201 | 241 / 245 / 151 |
| `/blog/distributed-locks-redis/` | 63 / 67 / 87 | 4713 / 4431 / 2712 | 431 / 447 / 263 | 241 / 245 / 223 |
| `/news/claude-opus-5-5-cost-coding/` | 67 / 70 / 91 | 4670 / 4319 / 2698 | 297 / 297 / 61 | 241 / 245 / 222 |
| `/pricing/` | 62 / 66 / 87 | 4587 / 4282 / 2845 | 467 / 424 / 195 | 241 / 245 / 169 |
| `/showcase/dota-wrap/` | 70 / 73 / 91 | 4440 / 4262 / 2712 | 282 / 268 / 131 | 241 / 245 / 219 |

## What changed

**Bump only.** The entry chunk stays one module (1288 kB → 1308 kB minified), so script cost is unchanged. The gain comes from Dota Wrap 0.5 moving the Google Fonts `@import` from the built CSS into preconnected `<link>`s in each page head, so fonts download alongside the CSS instead of after it. Dota UI 0.2.1 also keeps light-DOM content during SSG: the mobile navigation popover links are now in the static HTML of 94 pages that previously lacked them. Dota UI 0.2 caches icons in storage for seven days, which helps repeat visits; this benchmark measures cold loads only.

**Lazy.** Only `AppComponent` and the page classes stay in the entry (114 kB plus a 173 kB `app-shared` chunk, minified). Each route loads its own component chunks; Dota UI (182 kB) and Dota MD with highlight.js (291 kB + 64 kB) load only where a route renders their tags. On a prerendered page those chunks wait for first paint, which is why FCP and LCP drop together while total main-thread work stays about the same (1.77 s → 1.81 s). Article routes still download Dota MD, so their JS saving is small; the paint and blocking gains hold.

Prerendered output of Lazy matches Bump on every route (same text and custom-element counts), and a browser check found every custom element defined, code highlighting and copy buttons working, and client-side navigation rendering articles. SSG time dropped from 21.9 s to 15–17 s on single samples.

## Remaining work

- Serve icons from the site with `IconsComponent.baseUrl` to drop the Iconify round trip.
- The `/pricing/` hydration-mismatch warning and its TBT predate this change.
