# Skills

Agent skills for this Dota Web portfolio, grouped by concern. Each leaf folder holds one `SKILL.md` (and an optional `agents/openai.yaml`). All skills speak the same grammar: TypeScript custom elements built on Dota Core / Dota Wrap, discovered by the Vite preloader, styled with Tailwind and semantic tokens.

## framework/
Core conventions for building with Dota.
- **dota-web-components** — components, pages, decorators, properties, events, lifecycle, rendering, and preloader registration.

## theming/
Color, typography, and mode.
- **theme-palette** — literal color families in `src/theme.css`.
- **design-tokens** — semantic color/typography tokens mapped in `src/style.css`.
- **dark-mode** — class-based dark mode, `themeChange`, and persistence.

## content/
Long-form content.
- **markdown-rendering** — the loader → renderer → viewer pipeline.
- **blog-wiring** — placing blog markdown and registering it in `blogs.config.ts`.

## documentation/
Documenting the system.
- **code-documentation** — TSDoc for components, APIs, and types.
- **svg-api-flow-diagrams** — behavior-accurate SVG flow diagrams in `docs/flows`.

## code-quality/
Clean, reusable, maintainable code.
- **component-lifecycle** — lifecycle correctness, event wiring, and cleanup.
- **clean-code** — readable structure, low verbosity, clear naming.
- **reusable-design** — component-driven development, separation of concern, KISS, and DRY.
- **css-formatting** — readable, behavior-preserving stylesheet formatting and compressed-block detection.
