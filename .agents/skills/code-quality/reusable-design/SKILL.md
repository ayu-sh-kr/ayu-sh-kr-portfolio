---
name: reusable-design
description: Use when structuring features in this Dota Web portfolio for reuse — deciding component boundaries, separating concerns, keeping designs simple, and removing duplication. Covers component-driven development, separation of concern, KISS, and DRY as applied to Dota Core custom elements, services, events, data, and design tokens. Part of the code-quality skill group; pair with clean-code and component-lifecycle.
---

# Reusable Design

Reuse comes from good boundaries, not from clever abstraction. Before extracting anything, name the seam you are splitting and the second caller that justifies it. This app is already composed of small custom elements, services, event constants, content models, and design tokens — build with that grain, not against it.

Four principles govern reuse here.

## Component-driven development (CDD)

Build the UI as a tree of small, single-purpose custom elements that compose, following the existing `*-section`, `*-view`, and shell patterns.

- Compose pages from sections; compose sections from elements. `home.page.ts` is the pattern: a page shell hosts `app-header`, section components, `app-footer`. Do not pour a whole screen into one component.
- Give each element one responsibility and a clear public surface: `@Property` attributes in, events out. A card renders one item; a list maps data to cards; a shell arranges them.
- Reuse by embedding the selector (`<dark-mode-button color="purple">`, `<md-view>`, `<dota-icon>`), not by copying markup between components.
- Keep an element's CSS colocated (`<name>/<name>.component.css`) and let the preloader discover it. A component is reusable only if it carries its own presentation and registration.
- Push shared, framework-agnostic building blocks (markdown viewer, icon) toward Dota Core packages; keep portfolio-specific composition in `src/components`.

## Separation of concern (SoC)

Keep each kind of logic in the layer built for it, so a change touches one place.

- **Rendering** stays in `render()` and component CSS. **Data loading** stays in services (`ShowcaseLoaderService.load`, `DocLoaderService`). **Cross-component messaging** goes through `ApplicationEventService`/`@OnEvent` and the event constants in `src/events`. **Content** lives in `src/data`; **visual tokens** in `src/theme.css` and `src/style.css`.
- A component orchestrates; it does not embed fetch logic, frontmatter parsing, or a color system. Inject or call a service instead.
- Do not read raw hex/RGB in a component when a semantic token expresses the role (see the theming skills). Do not scrape headings in the TOC when the renderer already returns structured data (see markdown-rendering).
- Communicate across elements by publishing a documented event with a typed payload, not by reaching into another component's DOM or state.

## KISS — keep it simple

Choose the smallest design that satisfies the requirement, and add structure only when a real second case arrives.

- Use a direct component for one small, trusted view; introduce a service + viewer split only when loading, states, and reuse justify it (the markdown-rendering skill states this tradeoff explicitly).
- Prefer the framework decorator that already expresses the intent (`@BindEvent`, `@WindowListener`, `@Property`) over hand-rolled `addEventListener`/attribute plumbing.
- Do not add configuration options, generic parameters, or "future-proof" indirection for a case that does not exist yet. Solve today's requirement plainly; refactor when the second case appears.
- A simple, slightly repeated shape is better than a premature abstraction that couples unrelated callers. Wait for the pattern to prove itself before unifying (see duplication below).

## No duplication (DRY)

Every meaningful fact should have one home — but only unify things that are the same for the same reason.

- One source of truth per fact: content in `src/data`, event names as exported constants in `src/events`, colors/typography as tokens, the markdown pipeline behind one `MDService`/loader contract. Import these; never re-declare them.
- Extract a shared helper, base, or element once a genuine second caller exists and the logic is identical in intent (the shared `MarkdownLifecycleUtils` is this done right — several markdown views reuse one lifecycle helper).
- When you copy-paste to start a second case, stop and unify the shared part before shipping.
- Do not force-fit incidental duplication: two blocks that merely look alike but change for different reasons should stay separate. False DRY creates the wrong coupling and is harder to undo than repetition.
- Deduplicate the fact, not the syntax: prefer a data-driven `map` over N near-identical markup blocks, a token over a repeated literal, a constant over a repeated string.

## Applying the four together

When adding or reshaping a feature:

1. **CDD** — sketch the element tree first: which shell, which sections, which leaf elements, and their attributes/events.
2. **SoC** — assign each concern to its layer: render vs. service vs. event vs. data vs. token.
3. **KISS** — pick the smallest version that works now; resist speculative options and indirection.
4. **DRY** — give each shared fact one home; unify only real, same-reason duplication and leave incidental repetition alone.

## Review checklist

- Is the feature composed from small single-purpose elements, or is one component doing too much?
- Does each concern (render / load / message / content / style) live in its proper layer?
- Is this the simplest design that meets the actual requirement, with no speculative generality?
- Does every shared fact have exactly one source of truth, and is each abstraction backed by a real second caller?
- Did `npm run build` pass, and did a search confirm no leftover duplicated literals, events, or markup blocks in the touched area?