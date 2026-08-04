# Content automation plugin: audit and implementation blueprint

## Decision

The blog and showcase registries can be automated without introducing SSR. The right foundation is a small content compiler with a thin Vite plugin and CLI, not a renderer rewrite and not one generated component per Markdown file.

The compiler should:

1. discover Markdown files in configured content collections;
2. parse and validate frontmatter;
3. derive stable source URLs, routes, groups, ordering, and sitemap entries;
4. generate one typed TypeScript catalog per collection;
5. generate a combined route/catalog module and `public/sitemap.xml`;
6. regenerate during Vite development and fail clearly on invalid content;
7. provide a check command for CI and production builds.

The application should keep control of rendering. A collection chooses a slug component and page chrome from an application-owned registry. An individual Markdown file may select an allowlisted layout variant, but it must not name an arbitrary component.

This gives the repository one standard content pipeline while preserving the meaningful differences between a blog article, a showcase case study, and future collections.

## Scope

### In scope

- Multiple independent Markdown collections.
- Configurable source roots and file patterns.
- Frontmatter schemas, defaults, computed values, and actionable validation errors.
- Stable slug and route generation.
- Directory- and frontmatter-based grouping, including multiple group dimensions.
- Generated, typed collection catalogs for index pages, SEO, next/previous links, and lookups.
- One shared runtime loader for ordinary Markdown collections.
- Collection-specific slug components and controlled per-document layout variants.
- Generated sitemap entries merged with explicitly configured static routes.
- Vite startup, watch, invalidation, and full-reload behavior.
- Deterministic CLI output and CI drift checks.

### Out of scope for the baseline

- SSR, prerendering, or rendering Markdown during the server response.
- Replacing `@ayu-sh-kr/dota-md`.
- Generating a custom component for every Markdown file.
- Inferring visual chrome from Markdown HTML.
- User-authored or remote untrusted Markdown.
- A CMS, full-text search index, RSS/Atom feed, or content API.
- Automatically rewriting links when a published slug changes.

RSS, search, prerendering, and alternate output formats become straightforward follow-on features once the manifest is trustworthy, but they should not expand the first implementation.

## Current-state audit

### Content inventory

| Family | Markdown files | Current metadata authority | Grouping | Route |
| --- | ---: | --- | --- | --- |
| Blog | 7 | `src/configs/blogs.config.ts` | `category`, partly reflected by directories | `/blog/:slug` |
| Showcase | 8 | `src/data/showcase-content.ts`; partial duplicate in frontmatter | `tier` and `kind` fields | `/showcase/:slug` |
| Legal | 2 | Markdown frontmatter plus structured H2 attributes | audience scope and TOC group | fixed privacy and terms routes |

All 15 blog and showcase Markdown files have matching manual catalogue entries, and every configured source path currently exists. No orphaned blog or showcase source was found.

The current manual surface spans 945 lines across the two catalogues, two loaders, two slug pages, two article controllers, and `public/sitemap.xml`. Much of the article code is legitimate UI behavior and will remain; the replaceable part is discovery, metadata lookup, route parsing, loading, and sitemap bookkeeping.

### Confirmed inconsistencies

1. `public/sitemap.xml` omits two configured, indexable pages: `/blog/postgresql-access-control` and `/showcase/indiknots`.
2. Blog metadata exists only in TypeScript, while the Markdown carries a separate H1. The PostgreSQL post already demonstrates title drift between these two sources.
3. Showcase frontmatter duplicates `slug`, `title`, `tagline`, `kind`, `year`, `status`, and `stack`, but the loader discards it. The TypeScript catalogue is the actual runtime authority.
4. Showcase-only catalogue fields—`tier`, `summary`, `metric`, and `visual`—are absent from frontmatter.
5. The blog category `notes` is stored under the directory `others`. Category name and directory name therefore cannot be derived from each other consistently.
6. Blog and showcase have separate loaders with the same fetch, abort, response-check, and text-return behavior. Showcase adds only leading-frontmatter removal.
7. Blog and showcase repeat route-specific slug parsing and catalogue lookup helpers.
8. There are no repository tests or CI checks for duplicate slugs, invalid metadata, missing sources, stale generated data, or sitemap completeness.

### Existing build infrastructure

The repository already uses generation-oriented Vite plugins:

- `virtual:dota-components` and `virtual:dota-routes` come from the Dota preloader;
- the web-types plugin writes editor metadata;
- the event-map plugin writes `src/event-map.d.ts`;
- Nitro participates through its Vite plugin, although the application remains client-rendered.

The project currently uses Vite 7.3.6, TypeScript 5.9, ESM, `moduleResolution: "bundler"`, Node 26 locally, pnpm 11, and `public` as Vite's public directory. A content plugin fits the existing toolchain and does not require a second build system.

## Source-of-truth standard

Markdown frontmatter should become the authority for document metadata. The manually authored root configuration should describe collection behavior, not enumerate content records.

The division should be:

| Concern | Authority |
| --- | --- |
| Title, description, publication state, dates, layout, and collection-specific metadata | Markdown frontmatter |
| Category derived from folder placement | Collection grouping configuration plus relative file path |
| Content root, route pattern, schema, grouping rules, sorting, defaults, chrome choices, sitemap policy | `content.config.ts` |
| Site-wide index copy, support sections, promotional copy, and non-document UI | Existing `src/data/*` modules |
| Generated arrays, lookup maps, route records, and sitemap XML | Compiler output; never hand-edited |
| Markdown-to-HTML behavior and theme | Existing Dota Markdown renderer and application views |

This removes record-by-record duplication without forcing all page families into the same metadata shape.

## Recommended architecture

```text
content.config.ts
       +
public/<collection>/**/*.md
       |
       v
content compiler
  discover -> parse -> validate -> normalize -> sort -> group
       |                                      |
       |                                      +-> sitemap model
       v
src/generated/content/<collection>.generated.ts
src/generated/content/index.generated.ts
src/generated/content/routes.generated.ts
public/sitemap.xml
       |
       v
ContentRegistry -> ContentLoaderService -> configured slug component
                                      -> existing Dota Markdown renderer
```

The compiler must be usable independently of Vite. The Vite plugin and CLI call the same compile function so development, CI, and production cannot disagree.

### Package boundaries

Start as a repository-local module under `tools/content/`, but structure it so it can later move into `@ayu-sh-kr/dota-content`:

```text
content.config.ts
tools/content/
  cli.ts
  compiler.ts
  config.ts
  discovery.ts
  frontmatter.ts
  generator.ts
  sitemap.ts
  types.ts
  vite-plugin.ts
  __tests__/
src/generated/content/
  blog.generated.ts
  showcase.generated.ts
  index.generated.ts
  routes.generated.ts
src/content/
  content-loader.service.ts
  content-registry.ts
  content-chrome.registry.ts
  content-slug.page.ts
```

Extraction into a published package should happen after the portfolio and one second application prove the API. Until then, local development avoids versioning an unproven abstraction while still enforcing clean boundaries.

## Core configuration API

The application should author one root config with any number of collection definitions.

```ts
// content.config.ts
import {z} from "zod";
import {defineCollection, defineContent} from "./tools/content/index.ts";

const blogSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.iso.date(),
  updated: z.iso.date().optional(),
  writer: z.string().min(1),
  featured: z.boolean().default(false),
  minutes: z.number().int().positive().optional(),
  layout: z.enum(["default", "deep-dive"]).default("default"),
  draft: z.boolean().default(false),
});

const showcaseSchema = z.object({
  title: z.string().min(1),
  tagline: z.string().min(1),
  kind: z.enum(["open source", "product", "client work", "backend"]),
  tier: z.enum(["spotlight", "featured", "archive"]),
  year: z.number().int(),
  status: z.enum(["active", "shipped", "archived"]),
  stack: z.array(z.string().min(1)).min(1),
  summary: z.string().min(1),
  visual: z.enum(["workspace", "restaurant", "sacrena", "jalans", "pipeline", "rest"]),
  metric: z.object({value: z.string(), label: z.string()}).optional(),
  layout: z.enum(["default", "visual"]).default("default"),
  draft: z.boolean().default(false),
});

export default defineContent({
  siteUrl: "https://ayu-sh-kr.com",
  publicDir: "public",
  generatedDir: "src/generated/content",
  sitemap: {
    output: "public/sitemap.xml",
    staticRoutes: [
      "/",
      "/blog",
      "/showcase",
      "/pricing",
      "/coffee",
      "/support",
      "/legal/privacy",
      "/legal/terms",
      "/design",
      "/design/typography",
      "/design/color",
      "/design/element",
      "/design/layout",
      "/design/alert",
      "/design/toast",
      "/design/interaction",
    ],
  },
  collections: [
    defineCollection({
      id: "blog",
      root: "public/blogs",
      include: "**/*.md",
      route: "/blog/:slug",
      schema: blogSchema,
      slug: {from: "frontmatter", field: "slug", required: true},
      groups: [
        {
          key: "category",
          from: "directory",
          depth: 0,
          values: ["tutorial", "rant", "news", "notes"],
        },
      ],
      sort: [{field: "date", direction: "desc"}],
      render: {
        pageChrome: "site",
        slugComponent: "blog-article",
        layouts: {
          default: "blog-article",
          "deep-dive": "blog-deep-dive-article",
        },
      },
      computed: {
        minutes: "reading-time",
      },
      publish: {excludeWhen: "draft"},
      sitemap: {lastmod: {fields: ["updated", "date"]}},
    }),
    defineCollection({
      id: "showcase",
      root: "public/showcases",
      include: "**/*.md",
      route: "/showcase/:slug",
      schema: showcaseSchema,
      slug: {from: "frontmatter", field: "slug", required: true},
      groups: [
        {key: "tier", from: "frontmatter", field: "tier"},
        {key: "kind", from: "frontmatter", field: "kind"},
      ],
      sort: [
        {field: "year", direction: "desc"},
        {field: "title", direction: "asc"},
      ],
      render: {
        pageChrome: "site",
        slugComponent: "showcase-view",
        layouts: {
          default: "showcase-view",
          visual: "showcase-visual-view",
        },
      },
      publish: {excludeWhen: "draft"},
      sitemap: {},
    }),
  ],
});
```

The exact schema syntax can evolve, but these responsibilities should remain explicit. Avoid a configuration that guesses routes, groups, or component names from unrelated conventions.

### Why one root config

One root config provides a single site URL, public root, output location, sitemap policy, and duplicate-route check. Collections remain independent values and can be moved to separate `blog.collection.ts` and `showcase.collection.ts` files when the root becomes large.

### Why the generated files are physical TypeScript

Physical generated modules are recommended over a virtual-only catalog because:

- `tsc` runs before `vite build` in this repository;
- TypeScript, editors, tests, and non-Vite tools can resolve them directly;
- generated diffs expose unintended metadata or route changes in review;
- catalogue code does not need a broad handwritten `declare module` contract;
- production builds do not depend on a dev-only virtual-module state.

The generator should write only when bytes change and should not include a generation timestamp. This keeps HMR and Git diffs quiet. Generated files should be committed and begin with a clear `DO NOT EDIT` comment.

A virtual module can still be added later as a convenience export, but it should re-export the physical generated modules rather than become a second source of truth.

## Generated catalog contract

Every generated entry should implement a stable base contract and retain typed collection metadata.

```ts
export type ContentEntry<TMetadata extends object = Record<string, unknown>> = {
  collection: string;
  slug: string;
  route: string;
  source: string;
  relativePath: string;
  groups: Readonly<Record<string, string>>;
  layout: string;
  draft: boolean;
  metadata: Readonly<TMetadata>;
};
```

Example generated blog output:

```ts
// Generated by dota-content. Do not edit.
import type {ContentEntry} from "@app/content/content-registry.ts";

export type BlogMetadata = {
  title: string;
  description: string;
  date: string;
  updated?: string;
  writer: string;
  featured: boolean;
  minutes: number;
  layout: "default" | "deep-dive";
  draft: boolean;
};

export const blogEntries = [
  {
    collection: "blog",
    slug: "postgresql-access-control",
    route: "/blog/postgresql-access-control",
    source: "/blogs/tutorial/Postgres-Access-Control.md",
    relativePath: "tutorial/Postgres-Access-Control.md",
    groups: {category: "tutorial"},
    layout: "default",
    draft: false,
    metadata: {
      title: "PostgreSQL access control: roles and permissions that make sense",
      description: "A practical guide to roles and permissions.",
      date: "2026-08-02",
      writer: "Ayush Kumar",
      featured: false,
      minutes: 12,
      layout: "default",
      draft: false,
    },
  },
] as const satisfies readonly ContentEntry<BlogMetadata>[];

export const blogBySlug = new Map(blogEntries.map((entry) => [entry.slug, entry]));
export const blogGroups = {
  category: {
    tutorial: blogEntries.filter((entry) => entry.groups.category === "tutorial"),
  },
} as const;
```

Generation should also produce a collection index:

```ts
export {blogEntries, blogBySlug, blogGroups} from "./blog.generated.ts";
export {showcaseEntries, showcaseBySlug, showcaseGroups} from "./showcase.generated.ts";
export const contentCollections = {blog: blogEntries, showcase: showcaseEntries};
```

Generated code must contain public URLs and relative source paths only. Absolute workstation paths must never enter client code or sitemap output.

## Slug and route rules

Published slugs should be explicit frontmatter and required by default.

```yaml
---
slug: distributed-locks-redis
---
```

Deriving a slug from a filename is convenient but makes a file rename a public URL change. The compiler may offer `from: "filename"` for internal collections, but the blog and showcase should use explicit slugs.

Validation must reject:

- duplicate slugs within a collection;
- duplicate final routes across all collections and static routes;
- slugs containing `/`, `..`, encoded separators, query text, or hash text;
- empty path segments and malformed percent encoding;
- a route pattern without exactly one `:slug` segment for collection routes;
- a source outside its configured collection root or public directory.

The generated `route` is the canonical input to navigation and sitemap generation. Runtime code should stop rebuilding routes from collection names.

## Grouping strategy

Grouping must be data, not a hard-coded blog feature. A collection may declare zero or more group dimensions.

### Directory grouping

Use this for blogs when folders communicate editorial taxonomy:

```ts
{
  key: "category",
  from: "directory",
  depth: 0,
  values: ["tutorial", "rant", "news", "notes"],
}
```

For a file at `public/blogs/tutorial/Postgres-Access-Control.md`, depth zero produces `tutorial`.

The current `others` directory should be renamed to `notes` during migration. An alias map can support a transition, but keeping a permanent `others -> notes` exception weakens the standard.

### Frontmatter grouping

Use this when grouping is editorial rather than structural:

```ts
{key: "tier", from: "frontmatter", field: "tier"}
{key: "kind", from: "frontmatter", field: "kind"}
```

This fits showcases because a project can be `featured` and `backend` without encoding either fact in its file path.

### Generated access

The compiler should emit both the flat, sorted collection and grouped indexes. UI components can use the flat array for next/previous navigation and the grouped form for filters or landing sections without rescanning on every render.

Group values must be validated against configured values or the collection schema. Unknown values should fail compilation rather than silently create a new navigation category.

## Loading API

The plugin owns build-time discovery. A small runtime service owns browser loading:

```ts
export class ContentLoaderService {
  async load(entry: ContentEntry, signal: AbortSignal): Promise<string> {
    const response = await fetch(encodeURI(entry.source), {
      signal,
      headers: {Accept: "text/markdown,text/plain;q=0.9"},
    });

    if (!response.ok) {
      throw new Error(`Unable to load ${entry.source} (${response.status})`);
    }

    return stripLeadingFrontmatter(await response.text());
  }
}
```

This replaces the duplicated blog and showcase loaders. It retains the current good behavior: explicit `Accept`, abort ownership in the route/controller, an HTTP status check, and no stale-response handling hidden inside the renderer.

`stripLeadingFrontmatter` only removes the leading delimited block. YAML parsing and validation stay in the build process and do not enter the browser bundle.

Legal documents are not the first migration target. Their loaders produce metadata plus structured sections from attributed H2 headings, so they need a runtime adapter beyond simple loading. The future collection API should allow a named application-owned normalizer, but the baseline should not turn arbitrary build functions into client code.

## Slug rendering and custom chrome

There are three separate concerns that should not be collapsed into one `component` option:

1. **Route page** — resolves the generated record and supplies SEO/not-found behavior.
2. **Page chrome** — wraps the document with the application header, footer, or another site shell.
3. **Slug component** — renders the family-specific article experience and Markdown.

### Generic route page

Generate route records, not page classes:

```ts
export const contentRoutes = [
  {path: "/blog/:slug", component: ContentSlugPage},
  {path: "/showcase/:slug", component: ContentSlugPage},
];
```

`main.ts` then composes them with the routes discovered by the existing Dota preloader:

```ts
routes: [...routeConfig, ...contentRoutes, {path: "/offline", component: OfflinePage}],
```

One generic `ContentSlugPage` can resolve the collection from the generated route table, resolve the entry by slug, derive SEO from validated metadata, apply a registered chrome adapter, and mount the selected slug component. This replaces the nearly identical blog and showcase slug page classes.

### Chrome registry

Build configuration should reference stable IDs; the browser owns the implementations:

```ts
registerContentChrome({
  site: ({body}) => `
    <app-header></app-header>
    ${body}
    <app-footer></app-footer>
  `,
  bare: ({body}) => body,
});
```

The collection chooses a default page chrome and slug component. Frontmatter may choose a `layout`, and the collection maps allowed layout values to registered component selectors:

```yaml
---
layout: deep-dive
---
```

```ts
layouts: {
  default: "blog-article",
  "deep-dive": "blog-deep-dive-article",
}
```

This enables custom article chrome without letting Markdown instantiate arbitrary application components. Unknown layout values fail schema validation.

### Migration boundary

The first migration may keep `blog-article` and `showcase-view` as the slug components. They can adopt a shared entry/source event or receive `collection` and `slug` attributes. Their visual headers, TOCs, metrics, callouts, copy controls, next links, and motion remain family-specific.

Do not generate one component for every slug. Every blog post uses the same behavioral component unless its validated `layout` intentionally selects another implementation.

## Sitemap generation

Sitemap generation should build a complete XML model, not patch the existing XML with regular expressions.

Inputs are:

- configured static routes;
- every non-draft generated content route with sitemap enabled;
- an optional metadata field for `lastmod`.

Rules:

- use the configured canonical `siteUrl` for every `<loc>`;
- XML-escape all values;
- emit UTF-8 XML with the standard sitemap namespace;
- use `YYYY-MM-DD` or another W3C datetime for `lastmod`;
- use the content's authored date or updated date, never the generator's current time;
- exclude drafts from public catalogues, route generation, groups, and the sitemap; an explicit development-only API may expose them for previews later;
- exclude collections with sitemap disabled;
- reject duplicate URLs;
- sort output deterministically: static routes in configured order, then collections in configured order and their generated sort order.

The sitemap protocol requires `<urlset>`, its namespace, and one `<loc>` per `<url>`; `lastmod` is optional and describes the page's actual last modification. The baseline format is simple enough to generate without an XML dependency.

`public/sitemap.xml` should become generated and committed. The CLI writes it atomically; CI compares the expected bytes with the file and fails when it is stale. This closes the exact gap found in the current audit.

## Compiler and plugin lifecycle

### Compiler phases

1. Resolve and validate project, public, collection, and output roots.
2. Discover included Markdown files and apply excludes.
3. Read each file as UTF-8 and split leading frontmatter from body.
4. Parse YAML and report syntax errors with file and frontmatter line context.
5. Validate metadata through the collection schema.
6. Derive slug, public source URL, route, groups, layout, and computed fields.
7. Validate cross-entry and cross-collection invariants.
8. Sort entries and build grouped indexes.
9. render deterministic TypeScript modules and sitemap XML in memory.
10. In write mode, atomically replace only changed outputs; in check mode, report drift without writing.

Collect independent validation errors and print them together. Fixing one file at a time through repeated build failures is poor authoring feedback.

### Vite integration

```ts
// vite.config.ts
import dotaContent from "./tools/content/vite-plugin.ts";

export default defineConfig({
  plugins: [
    dotaContent({config: "content.config.ts"}),
    tailwindcss(),
    dotaVitePreloader(/* ... */),
    // existing plugins
  ],
});
```

Place the content plugin before the Dota preloader because it can update generated route and catalogue modules that later plugins may scan or import.

At Vite startup, the plugin compiles once. In development it adds every collection root to Vite's existing server watcher and handles `add`, `change`, and `unlink`. After a successful regeneration it invalidates the generated modules or sends one full reload. A full reload is acceptable for the baseline because a newly added document changes routes, indexes, groups, navigation, and the sitemap together. Fine-grained HMR can follow after correctness is established.

The plugin must ignore its generated directory and sitemap output to avoid regeneration loops.

At production `buildStart`, the plugin should validate content. The normal build script should run the explicit drift check before TypeScript:

```json
{
  "scripts": {
    "content:sync": "tsx tools/content/cli.ts sync",
    "content:check": "tsx tools/content/cli.ts check",
    "dev": "pnpm content:sync && vite",
    "build": "pnpm content:check && tsc && vite build",
    "test": "vitest run"
  }
}
```

The explicit pre-TypeScript step matters because the current build executes `tsc` before Vite hooks run.

## Dependencies

### Required for a repository-local implementation

| Dependency | Placement | Purpose |
| --- | --- | --- |
| `yaml` | dev dependency | Parse full YAML frontmatter, including the current legal-style lists and inline mappings. |
| `zod` | dev dependency initially | Define collection-specific runtime schemas and infer their TypeScript metadata types. |
| `tinyglobby` | dev dependency | Discover include/exclude patterns consistently on all supported Vite Node versions. It already exists transitively but must be declared directly when imported. |
| `tsx` | dev dependency | Run the TypeScript CLI and `content.config.ts` before Vite starts. |
| `vitest` | dev dependency | Test discovery, validation, generation, sitemap output, and plugin invalidation using the existing Vite toolchain. |

`vite` and `typescript` already exist. No browser runtime dependency is needed for generation.

### Not required

- **`chokidar`**: use Vite's existing `server.watcher`; do not create a second watcher.
- **`gray-matter`**: a small delimiter splitter plus `yaml` gives explicit control over parsing and diagnostics.
- **an XML or sitemap package**: the required XML surface is small; implement and test entity escaping and protocol structure locally.
- **a second Markdown renderer**: keep `@ayu-sh-kr/dota-md`.
- **Nitro APIs**: this remains build-time discovery plus browser loading.

### If extracted as a published package

Move `yaml`, `zod`, and `tinyglobby` to package dependencies; keep `vite` as a peer dependency with the initially tested Vite 7 range; keep TypeScript and Vitest as development dependencies. Publish ESM and declarations. Use a Node-oriented TypeScript configuration for the package rather than inheriting the application's DOM/bundler configuration.

The current app runs Node 26, but Vite 7 supports Node 20.19+ and 22.12+. Using `tinyglobby` avoids unnecessarily restricting the plugin to Node 22's stable built-in `fs.glob`.

## Frontmatter migration

### Blog

Add frontmatter to all seven posts. The folder supplies `category`; frontmatter supplies the remaining record metadata.

```yaml
---
slug: distributed-locks-redis
title: Distributed locks in Redis, without the folklore
description: Everyone copies the same SETNX snippet. Here is what actually matters.
date: 2026-07-12
writer: Ayush Kumar
featured: true
layout: default
draft: false
---
```

`minutes` may be computed from body word count with an explicit override for posts where code-heavy content makes the estimate misleading.

Keep or remove the body H1 as a separate editorial migration. For minimum visual change, keep it and add a compiler validation that it matches `title`; the current blog view will continue removing it after render.

Rename `public/blogs/others/` to `public/blogs/notes/` and let generated source URLs update. The public article route remains slug-based and therefore unchanged.

### Showcase

Keep the existing frontmatter and add the TypeScript-only fields:

```yaml
---
slug: dota-workspace
title: dota-workspace
tagline: A monorepo toolchain for building web-component apps.
kind: open source
tier: spotlight
year: 2026
status: active
stack: [TypeScript, Web Components, Vite]
summary: The packages behind this site, shaped into one composable workspace.
visual: workspace
metric: { value: "8", label: "packages, one workspace" }
layout: default
draft: false
---
```

After migration, remove the `showcaseProjects` document records from `src/data/showcase-content.ts` but retain hand-authored index SEO and support copy in a smaller data module.

### Legal

Leave privacy and terms on their current loaders in the baseline. Their existing frontmatter demonstrates that the parser must support arrays and inline objects, but their section model is more specialized than ordinary collection discovery.

A later legal collection can add:

- `routeMode: "fixed"`;
- collection-owned metadata schema;
- a named runtime normalizer for structured H2 attributes;
- legal chrome and TOC adapters;
- `updated` as sitemap `lastmod`.

## File-level implementation plan

### Phase 1: compiler foundation

Add:

- `content.config.ts` with blog and showcase definitions;
- `tools/content/types.ts` for public config, compiler, diagnostic, and generated-entry types;
- `tools/content/frontmatter.ts` for delimiter splitting and YAML parsing;
- `tools/content/discovery.ts` for root validation and glob discovery;
- `tools/content/compiler.ts` for normalization, computed fields, sorting, grouping, and cross-entry checks;
- `tools/content/generator.ts` for stable TypeScript rendering and changed-byte writes;
- `tools/content/sitemap.ts` for the sitemap model and XML output;
- `tools/content/cli.ts` for `sync` and `check`.

Outcome: a command can generate typed catalogs and a complete sitemap without Vite.

### Phase 2: content migration

- Add blog frontmatter to seven files.
- Enrich showcase frontmatter in eight files.
- Rename the `others` blog directory to `notes`.
- Generate and review the first catalog outputs.
- Replace imports of `blogPosts` and `showcaseProjects` with generated equivalents.
- Move showcase index SEO/support copy out of the document-record module if necessary.

Outcome: adding a valid Markdown file is enough to create an indexable catalogue record.

### Phase 3: shared runtime loading

- Add `ContentRegistry` and `ContentLoaderService`.
- Replace `BlogLoaderService` and `ShowcaseLoaderService`.
- Move shared slug resolution to generated route/registry helpers.
- Keep current article components and events while changing their data source.

Outcome: one loading contract serves blog and showcase without changing their visual rendering.

### Phase 4: routes and chrome

- Add `ContentSlugPage` and the chrome/layout registries.
- Generate `contentRoutes`.
- Merge generated routes in `main.ts`.
- Adapt `blog-article` and `showcase-view` to consume a resolved entry.
- Remove `BlogSlugPage` and `ShowcaseSlugPage` after route and SEO parity is verified.
- Add one test layout override to prove custom chrome selection.

Outcome: new collections can declare a route and slug component without another near-duplicate page class.

### Phase 5: Vite integration and hardening

- Add the Vite adapter before the Dota preloader.
- Watch collection roots and handle additions, changes, and deletions.
- Add scripts, tests, and a generated-drift check.
- Update `docs/markdown-pages.md` and README content instructions to make frontmatter-first authoring canonical.
- Remove old manual registry instructions and the now-stale blog-wiring skill assumptions for this repository.

Outcome: development, review, CI, and production use the same compiler contract.

## Validation and test plan

### Compiler unit tests

- discovers nested and flat Markdown sources;
- respects include and exclude patterns;
- parses CRLF, BOM, missing frontmatter, and malformed YAML;
- reports missing and invalid schema fields with source paths;
- rejects duplicate slugs and routes;
- rejects source and output path traversal;
- derives directory and frontmatter groups;
- validates known group and layout values;
- sorts deterministically with explicit tie-breakers;
- computes reading time and honors an override;
- omits drafts from public groups and sitemap according to policy;
- renders identical output twice without changing bytes;
- escapes XML entities and emits correct `lastmod` values;
- detects stale, missing, and unexpectedly modified generated files in check mode.

### Plugin tests

- compiles once at Vite startup;
- watches every collection root;
- regenerates on add, change, and unlink;
- ignores generated outputs;
- preserves the previous valid generated catalog when a new edit is invalid;
- reports an overlay or terminal error with the Markdown filename;
- reloads after a successful correction;
- does not conflict with the Dota component/route preloader.

### Application integration checks

- blog and showcase indexes contain every non-draft generated entry;
- direct slug navigation and browser back/forward work;
- unknown and malformed slugs render not-found SEO and UI;
- next/previous navigation follows generated sort order;
- category and tier filters use generated groups;
- default and overridden chrome render the expected component;
- Markdown loading remains abortable and stale responses cannot win;
- heading hashes, TOCs, custom showcase elements, code copy, and lazy images retain current behavior;
- the built sitemap includes both audit omissions and excludes drafts;
- `pnpm content:check`, `tsc`, tests, and `vite build` pass from a clean checkout.

## Estimated work

| Workstream | Expected change | Estimate |
| --- | --- | ---: |
| Compiler, schemas, generated TypeScript, CLI | 7–9 new implementation files | 2–3 engineering days |
| Frontmatter migration and catalogue replacement | 15 Markdown files plus affected imports | 1.5–2.5 days |
| Shared registry and loader | 3–5 source files; remove two loaders/helpers | 1–1.5 days |
| Generic slug route and chrome/layout registry | 4–7 source files; remove two slug pages | 2–3 days |
| Sitemap generation and drift checks | compiler integration plus scripts | 0.5–1 day |
| Vite watch behavior, tests, and documentation | plugin adapter and test suite | 2–3 days |

A production-grade repository-local baseline is roughly 9–13 engineering days. A discovery-plus-sitemap first slice, while keeping current route and article components, is roughly 3–5 days. Extracting and publishing a reusable package should add 2–4 days for package builds, declarations, compatibility tests, and consumer documentation.

The estimate is driven more by migration, diagnostics, and correctness tests than by filesystem scanning itself.

## Acceptance criteria

The baseline is complete when:

- adding a valid blog or showcase Markdown file updates its typed collection without editing a record array;
- invalid or duplicate metadata stops sync/build with a precise file-and-field diagnostic;
- blog categories and showcase tiers/kinds are generated from configured grouping strategies;
- the source URL, public route, index data, SEO data, and sitemap all come from the same entry;
- a collection selects its slug component and page chrome declaratively;
- an allowlisted per-document layout can change article chrome safely;
- blog and showcase use one shared loader while retaining their existing Markdown UI behavior;
- `public/sitemap.xml` contains every non-draft configured content route and all static routes;
- `content:check` detects any stale generated catalog or sitemap;
- development responds correctly to file addition, edit, rename, and deletion;
- no SSR or additional Markdown renderer is introduced.

## Decisions to lock before implementation

The blueprint recommends the first option in each case:

1. **Generated files committed or ephemeral:** commit them for TypeScript/editor visibility and reviewable route changes.
2. **Metadata authority:** frontmatter, not a sidecar TypeScript record.
3. **Blog group source:** directory name, with `others` renamed to `notes`.
4. **Slug source:** required frontmatter for public collections.
5. **Reading time:** computed with an optional explicit override.
6. **Dev update behavior:** full reload after successful regeneration initially.
7. **Invalid edit behavior:** keep the last valid generated output and show diagnostics; never write a partially valid catalog.
8. **Legal migration:** defer until blog/showcase prove the ordinary collection API.
9. **Packaging:** repository-local first, published package after a second consumer validates the abstraction.

## Research references

- Vite's official [Plugin API](https://vite.dev/guide/api-plugin.html) documents plugin factories, virtual-module conventions, and `handleHotUpdate`.
- Vite's [JavaScript API](https://vite.dev/guide/api-javascript.html) exposes the existing dev-server watcher, which avoids a separate watcher dependency.
- The Vite 7 [migration guide](https://v7.vite.dev/guide/migration.html) defines the Node 20.19+/22.12+ support floor relevant to this repository.
- The official [`yaml` documentation](https://eemeli.org/yaml/) covers YAML parsing and its document diagnostics model.
- The official [Zod documentation](https://zod.dev/) describes runtime schema validation with inferred TypeScript types.
- [`tinyglobby`](https://www.npmjs.com/package/tinyglobby) supplies typed, cross-platform include/exclude discovery and is already present transitively in the lockfile.
- The [Sitemaps protocol](https://www.sitemaps.org/protocol.html) defines required XML structure, URL escaping, and `lastmod` semantics.
- The [Vitest guide](https://vitest.dev/guide/) documents its Vite-integrated test runner, suitable for the compiler and plugin test layers.
