---
name: code-documentation
description: Use when documenting TypeScript source in this Dota Web portfolio — custom-element components, services/APIs and methods, and shared types. Defines how to write explanatory, maintainer-oriented TSDoc that conveys behavior, context, flow, and usage — descriptive but simple, never one-line filler — staying truthful to the Dota Core/Dota Wrap grammar and feeding the generated custom-elements.json and web-types.json.
---

# Code Documentation

Write documentation for the **maintainer**, not the compiler. Assume the reader is a developer who will change this code six months from now and needs to understand *what it does, why it exists, how it fits the larger flow, and how to use it* — without reverse-engineering the body.

Two rules hold everywhere:

1. **Be explanatory, not a label.** A one-line restatement of the signature (`/** Loads the doc. */`) is not documentation. Explain behavior, the context it runs in, the flow it participates in, and how a caller uses it.
2. **Be simple, not verbose.** Descriptive does not mean long. Use plain language and short sentences. Say the useful thing and stop — no padding, no ceremony, no repeating the type names back.

Descriptive **and** concise is the target. If a sentence does not help the maintainer act or decide, cut it.

Use TSDoc (`/** ... */`) for every component, method (private or public), service, event constant, and type, plus each of a type's properties. Use line comments (`//`) only for a non-obvious *why* inside a body.

## What "explanatory" means here

For any symbol, cover the parts that apply:

- **Behavior** — what it actually does, including the meaningful branches, states, and side effects.
- **Context** — where it sits in the app and what depends on it: which lifecycle phase, which caller, which layer.
- **Flow** — how it connects to the steps before and after it (what triggers it, what it triggers, which event or render it feeds).
- **Usage** — how a maintainer is expected to call or extend it, plus constraints and gotchas.

You rarely need all four in full — pick the ones a maintainer cannot infer from the signature, and write them plainly.

## Three documentation targets

### 1. Component documentation

Applies to `@Component` classes extending `BaseElement` and `@Route`/`DotaPageElement` pages under `src/components/**` and `src/pages/**`.

The class doc comment should explain what the element is for, where it is used, and how it behaves over its lifecycle — not just name it:

```ts
/**
 * Icon button that toggles the document's class-based dark mode.
 *
 * Used in the app header. On click it delegates to `GeneralUtils.toggleDarkMode()`,
 * which flips the `dark` class on `<html>` and persists the choice. The button does
 * not hold theme state itself: it listens for the `themeChange` window event and
 * re-renders so its icon always reflects the current mode, even when some other
 * component triggered the toggle.
 *
 * Selector: `dark-mode-button`.
 */
@Component({ selector: "dark-mode-button", shadow: false })
export class DarkModeButtonComponent extends BaseElement {
  /** Accent color forwarded to `<dota-icon>`. Attribute `color`; defaults to `purple`. */
  @Property({ name: "color", type: String })
  color: string = "purple";
}
```

Cover, in the class comment: purpose and where it is used; the selector; the runtime flow (what happens on the events it handles and what re-renders it); and any work done after connect (data loading in `@OnEvent("connected", true)`) since that is invisible from `render()`. For pages, note the `@Route` path and that SEO comes from `get seo(): SEO`.

Document each `@Property`/`@Param` **on its declaration** — the generators read the member for `web-types.json`. A property line may be short, but it must say the attribute name, accepted values, default, and what changing it does. Do not document Tailwind classes or internal markup node by node.

### 2. API and method documentation

Applies to services (`src/service/**`, `src/utils/**`), the Dota Core surfaces the app calls (`MDService.render`, `ApplicationEventService.publish`), and event constants in `src/events/**`.

**Document every method — private or public.** A private helper still needs its behavior, context, and usage explained; the maintainer editing it later benefits as much as an external caller. Do not skip a method because it is small or private.

A method comment should let someone use or safely change it without reading the body. Explain the flow it belongs to, not only its signature:

```ts
/**
 * Fetches the authored Markdown for one showcase project and returns its body.
 *
 * This is the load step of the showcase flow: the detail view calls it after a
 * route change, then hands the result to the Markdown renderer. Frontmatter (the
 * leading `---` block) is stripped here so downstream rendering never sees metadata.
 *
 * @param project - Showcase whose root-relative `source` under `public/showcases` is fetched.
 * @param signal  - Aborts the request when the view unmounts or the user selects another
 *                  project, so a slow response cannot overwrite newer content.
 * @returns The Markdown body with frontmatter removed.
 * @throws Error when the response is not `ok`; the message carries the HTTP status.
 */
async load(project: ShowcaseProject, signal: AbortSignal): Promise<string> { /* ... */ }
```

For a private helper, keep the same intent — behavior, context, usage — briefly:

```ts
/**
 * Renders the captured Markdown into the view's content class and applies the
 * active theme + accent. Called by the view on connect and again on every
 * `themeChange`, which is why it reads the current theme fresh each time
 * instead of caching it.
 */
private renderThemedContent(contentClass: string): string { /* ... */ }
```

Explain parameters by meaning and constraint (a key must be root-relative), returns by what resolves and when, failure modes (throws/rejects and cancellation via `AbortSignal`), and side effects (network, published events, storage, DOM). When a call publishes an application event, say so, so the data flow is discoverable:

```ts
/** Published with the raw showcase Markdown once loaded; the Markdown view subscribes and renders it. */
export const SHOWCASE_MARKDOWN_SOURCE_EVENT = "showcase:markdown-source";
```

Cross-link related events and payloads with `{@link ...}` so the pub/sub pair is navigable. Document the *contract you depend on* for Dota Core APIs, not Dota Core's internals.

### 3. Type documentation

Applies to interfaces, type aliases, and content models in `src/data/**`, `src/events/**`, and any exported `type`/`interface`.

**The type itself gets an explanatory comment — never a single-line label.** Describe what the type models in the domain, where it is used, and how it flows through the app (who produces it, who consumes it). This is the part a maintainer reads first, so make it carry real understanding.

**Each property gets its own doc comment.** A property line may be a single, plain sentence — but every property is documented, not only the non-obvious ones. State meaning, units/format, source, and any invariant.

```ts
/**
 * A portfolio project shown in the showcase experience.
 *
 * One entry drives three surfaces: the list/grid card, the detail page, and its
 * SEO. `showcaseProjects` is the authored source of truth in `src/data`; the loader
 * reads `source` to fetch Markdown, and the views read the rest for layout. Fields
 * are authored by hand, so the per-field notes below are the contract authors follow.
 */
export interface ShowcaseProject {
  /** Stable URL slug; also the route segment for the detail page. */
  slug: string;
  /** Root-relative URL of the Markdown source under `public/showcases`. */
  source: string;
  /** Layout tier: `spotlight` leads the page, `featured` is prominent, `archive` is compact. */
  tier: ShowcaseProjectTier;
  /** Optional headline stat; omit to hide the metric badge entirely. */
  metric?: { value: string; label: string };
}
```

Prefer a precise type over prose where the type can carry the meaning (a string-literal union documents its own allowed values), then let the property comment explain intent. Keep each doc next to its field so it survives refactors and reaches IDE tooltips.

## Workflow

1. Identify the kind (component, method/API, type) and apply its shape.
2. Read the real behavior first — branches, awaited work, published events, thrown errors, lifecycle timing. Document what is true now.
3. Write the explanatory part (behavior/context/flow/usage), then trim it to the shortest version that still teaches. Descriptive but simple.
4. Put member docs on members (properties, params, fields), and document the type/class header too.
5. Keep every statement falsifiable: if you can't point to the line that makes it true, fix or delete it.
6. After documenting components or properties, run `npm run build` and confirm `custom-elements.json` / `web-types.json` regenerate cleanly.

## Anti-patterns

- A one-line label that only restates the name (`/** The loader. */`, `/** Renders the view. */`).
- Verbosity in the other direction: paragraphs that repeat the signature, narrate obvious control flow, or pad with filler.
- Documenting only public methods and skipping private helpers.
- A single-line comment on a type when it should explain what the type models and how it flows.
- Leaving properties undocumented because they "look obvious."
- A stale comment above changed code — update or remove it in the same edit.