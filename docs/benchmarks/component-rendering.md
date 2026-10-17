# Component rendering benchmark

The structured templates preserve server DOM and make scalar updates cheaper. They do **not** make initial renderer adoption faster in this Happy DOM benchmark. This is a DOM preservation and update improvement with measurable hydration and HTML-size overhead.

## Scope and method

Measured 17 October 2026: `main` at `fa153d4` versus PR #68 at `e672130`. The candidate includes the template migration; the benchmark harness is identical in both checkouts.

Node 24.19.0 on a shared Linux x86_64 host (AMD EPYC 9V74, 9 visible logical CPUs). Both checkouts use the same dependency tree: Dota Wrap 0.2.3, Core 1.10.0, Rendering 0.1.6, SSR 0.2.3, Happy DOM 20.12.0, Vite 8.2.2, and Vitest 4.1.11.

- Three fresh renderer processes per revision, alternating order. Each component has 3 warm-up mounts and 10 measured mounts per process: 30 measured samples per component per revision. Scalar updates have 20 warm-ups and 200 measured updates per process: 600 measured updates per revision.
- Renderer table uses pooled median milliseconds. Parsing/cloning the initial server document and creating output are outside mount timing; unchanged-update output creation is also excluded. Scalar-update timing includes output creation and commit.
- Mount follows the component-level hydration/fallback choice in `dota-ssr`: structured output adopts marked DOM, legacy strings mount afresh. Component roots are detached; nested custom elements are unregistered. This excludes route handoff, custom-element upgrade/lifecycle work, application startup, network, layout, paint, and browser GC behavior.
- DOM retention is checked after client mount plus one unchanged update. Renderer sessions are disposed between samples. These are Happy DOM measurements, **not Chrome/mobile load, LCP, or INP measurements**.
- Full builds run sequentially, three times per revision, alternating order, with `dist` removed before every sample. Wall time includes TypeScript, Vite, SSG, and the internal-link check. Dependencies are already installed; this is not a cold install/cache benchmark. All six builds generated 97 pages and passed link checks. External Iconify requests failed in the restricted environment in both revisions.

## Renderer results

| Component | Main mount ms | PR mount ms | Main unchanged update ms | PR unchanged update ms | Server elements retained (main → PR) |
|---|---:|---:|---:|---:|---:|
| HomePage | 0.240 | 0.775 | 0.0046 | 0.0064 | 0% → 100% |
| AppHeaderComponent | 0.562 | 1.485 | 0.0068 | 0.0090 | 0% → 100% |
| BlogListComponent | 2.244 | 6.668 | 0.0133 | 0.0191 | 0% → 100% |
| NewsIndexComponent | 7.661 | 46.213 | 0.0261 | 0.0984 | 0% → 100% |
| DesignIndexReferenceComponent | 2.866 | 22.755 | 0.0104 | 0.0365 | 0% → 100% |
| ActionButtonComponent | 0.074 | 0.716 | 0.0014 | 0.0079 | 0% → 100% |

Changing the action button's label: **0.0653 ms → 0.0038 ms** median (94.1% less time). The original button survived **0/600** updates on main and **600/600** updates on the PR. This is a small absolute timing gain; preserving focus and component identity is the more consequential behavior.

Identical legacy strings already produce no-op commits, so unchanged renders are not faster after migration. Structured hydration performs marker discovery and part binding, which costs more than raw HTML parsing here. The benchmark does not measure the nested-component reconnection work avoided by adoption.

## Full builds and output size

| Metric | Main | PR | Change |
|---|---:|---:|---:|
| Full build median | 7.62 s | 8.14 s | +6.7% |
| All 97 HTML files | 4548.20 KiB | 6177.14 KiB | +35.8% |
| HTML gzip, summed per page | 951.68 KiB | 1184.06 KiB | +24.4% |

Full-build wall times:

| Run | Main seconds | PR seconds |
|---|---:|---:|
| 1 | 7.38 | 8.14 |
| 2 | 7.68 | 8.20 |
| 3 | 7.62 | 7.72 |

Durable hydration markers increase HTML size. Gzip uses Python's default compression level, separately for each file; these totals are not the bytes downloaded for a single navigation. JS bundle-size figures are excluded: the SSG output can contain multiple generated entry hashes, so summing the assets directory would not be a valid bundle-size comparison. Three runs on a shared host are descriptive measurements, not a regression threshold or a statistical significance claim.

## Reproduce

Use a dedicated baseline worktree and the same installed dependencies for both revisions. The runner copies its two benchmark files into that worktree, cleans `dist` before each build and writes generated metadata in each checkout, and preserves logs in a temporary directory. It does not install dependencies or remove worktrees.

```sh
git worktree add ../portfolio-render-main-bench fa153d4349357e6fee060324ede24b13593822c3
ln -s "$(pwd)/node_modules" ../portfolio-render-main-bench/node_modules
python scripts/benchmarks/compare.py \
  --baseline ../portfolio-render-main-bench \
  --candidate . \
  --output /tmp/portfolio-rendering-results.json
```

Run from a clean candidate checkout and review generated-file differences after building. The benchmark is opt-in and is excluded from the normal test suite. Raw samples are in [component-rendering.raw.json](./component-rendering.raw.json).
