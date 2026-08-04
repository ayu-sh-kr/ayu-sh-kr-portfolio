# Markdown pages: audit and authoring reference

This document records the Markdown page system as it exists in the portfolio. It is both an audit of the current content and the practical reference for adding or editing a page.

The audit covers the 17 runtime page sources under `public/`: seven blog posts, eight showcase case studies, and two legal documents. It does not treat `README.md` or files in `docs/` as page content; those are repository documentation and are not loaded by the site’s Markdown views.

For the proposed build-time discovery, generated catalog, configurable slug chrome, and sitemap automation, see [Content automation plugin](content-automation-plugin.md).

## The shared model

All public Markdown is a static asset, fetched by the browser after its route has rendered. The route selects a known source, a loader requests it with an abort signal, and a family-specific Markdown view passes the body to the shared Dota Markdown renderer. The renderer provides the common prose treatment, themed code blocks, generated heading anchors, loading state, hash navigation, and reading progress.

```text
route and metadata catalogue
        -> selected public/*.md source
        -> family loader and normalizer
        -> shared Markdown renderer
        -> family page shell and enhancements
```

This has two authoring consequences:

- A Markdown file is not a route by itself. Blog and showcase files must be registered in their respective TypeScript catalogues.
- Page chrome is deliberately outside Markdown. Titles, metadata rows, navigation, SEO, loading/error states, and progress indicators come from the route and its metadata, not from arbitrary document text.

All three page families use ordinary Markdown for prose: paragraphs, emphasis, links, inline code, headings, lists, tables, fenced code blocks, and images. The content currently demonstrates each of these forms where they fit the subject; it does not impose a quota for any of them.

## What is common and what varies

| Concern | Blogs | Showcases | Legal documents |
| --- | --- | --- | --- |
| Sources | `public/blogs/<directory>/*.md` | `public/showcases/*.md`, with one nested `indiknots/index.md` | `public/legal/privacy.md` and `public/legal/terms.md` |
| Route identity | `src/configs/blogs.config.ts` maps a slug to a source | `src/data/showcase-content.ts` maps a slug to a source | Fixed `/legal/privacy` and `/legal/terms` routes |
| Metadata authority | Blog catalogue | Showcase catalogue | Markdown frontmatter |
| Frontmatter in source | No | Yes, but stripped before rendering | Yes, parsed to build the document shell |
| Body heading pattern | Starts with one H1, then H2/H3 as needed | Starts with an introductory paragraph and H2 sections; no H1 | Starts directly with H2 clauses; no rendered H1 |
| Extra authoring syntax | Standard Markdown | Standard Markdown plus two showcase custom elements | Frontmatter, structured H2 attributes, and optional authoring comments |
| Page-specific rendering | Removes the body H1; adds copy buttons and lazy image loading | Renders a case-study TOC and supports metrics/callouts | Builds scope controls, grouped section navigation, numbered clauses, and legal metadata |

The difference in heading structure is intentional. Blog and showcase headers are rendered by their page shells. A blog H1 remains in the source for a readable standalone document but is removed from the rendered article to prevent a duplicate H1. Showcase pages already carry their title in the page header, so their Markdown body begins with the case-study introduction. Legal pages take their title from frontmatter and begin their rendered content with clauses.

## Blogs

### Files and registration

A post has two required pieces:

1. A catalogue record in `src/configs/blogs.config.ts`.
2. Its Markdown file under `public/blogs/`.

The catalogue is the authority for the public slug, publication date, author, visible header, SEO description, category, source path, reading-time estimate, and featured state. The loader requests the `source` value verbatim and renders the returned Markdown body without frontmatter parsing.

The supported catalogue categories are `tutorial`, `rant`, `news`, and `notes`. Their storage directories are not a strict mirror of those labels: the current `notes` post lives in `public/blogs/others/`. Preserve the explicit `source` path rather than deriving it from a category label.

### Body contract

Use this shape for a new post:

```md
# Standalone article title

An opening that establishes the question, claim, or practical outcome.

## First useful section

Explain the idea with prose, a list, a table, or a fenced code example where it adds evidence.
```

Keep the Markdown H1 aligned with the catalogue `header`. The application removes the first rendered `h1`, so the catalogue title is what visitors and search metadata see on the route. A mismatch is not a rendering failure, but it creates a different standalone-file title and page title. The PostgreSQL article currently shows that the two sources can drift: its Markdown title is more descriptive than the catalogue headline.

Use H2 for the main flow and H3 only when a section needs genuine subdivision. Fenced code blocks receive a copy button and can declare their language (the current posts use `sql`, `kotlin`, `java`, `lua`, and `text`). Images are lazy-loaded after rendering; include meaningful alt text.

When adding a public post, add its article route to `public/sitemap.xml` and use the catalogue date for `lastmod` unless a later substantive edit needs a newer date.

## Showcases

### Files and registration

A case study also has two pieces:

1. A project record in `src/data/showcase-content.ts`.
2. Its Markdown source in `public/showcases/`.

The showcase catalogue is authoritative for the slug, source path, title, tagline, tier, kind, year, status, stack, summary, visual family, article header, navigation, and SEO. `tier` determines where the project appears in the showcase index; it is not a Markdown concern.

Every current showcase source starts with this frontmatter shape:

```yaml
---
slug: project-slug
title: Project title
tagline: A concise description.
kind: open source
year: 2026
status: active
stack: [TypeScript, Web Components, Vite]
---
```

The showcase loader removes this entire block before rendering. It is useful as source-local context, but it does not drive the rendered header or SEO today. Keep it synchronized with the catalogue to avoid misleading maintainers, but change the catalogue when changing the public page data.

### Body contract and enhancements

Start a showcase with a concise orienting paragraph, then use H2 sections to explain decisions and outcomes. The eight existing case studies use this pattern consistently. Most have three or four sections; that is an observed editorial rhythm, not a technical requirement.

Showcase Markdown may use two project-specific custom elements:

```html
<showcase-metrics items="8|packages,1|workspace"></showcase-metrics>

<showcase-aside kind="note">A useful design decision or qualification.</showcase-aside>
```

`showcase-metrics` accepts a comma-separated `items` attribute. Each item is `value|label`; incomplete items are ignored. `showcase-aside` accepts `note`, `warn`, or `quote`, and defaults to `note` for any other value. Its child content is rendered inside the callout, so short inline Markdown is acceptable. Do not introduce arbitrary custom tags without implementing and registering a corresponding component.

The Indiknots case study is the only current showcase with an image and the only source nested in its own directory. Its image uses a root-relative public path:

```md
![Descriptive alternative text](/showcases/indiknots/indiknots-hero.png)
```

Use root-relative paths for public assets and make alt text describe the information the image contributes.

When adding a public showcase, register it in `public/sitemap.xml` as well as the showcase catalogue. `indiknots` is currently registered in the catalogue and available to the application, but its `/showcase/indiknots` URL is absent from the sitemap.

## Legal documents

Legal Markdown is a structured document format, not merely prose with a header. The privacy and terms loaders parse their frontmatter and H2 attributes before sending a cleaned Markdown body to the renderer. They remove frontmatter, HTML comments, heading attributes, and link attributes from the displayed source.

### Frontmatter contract

Both documents require these fields:

```yaml
---
slug: privacy-or-terms
title: Display title
tagline: Reader-facing summary
kind: privacy-or-terms
version: "1.0"
updated: 2026-07-25
effective: 2026-08-01
contact: address@example.com

switch:
  - { label: Visiting the site, target: visit }

summary:
  - A short, plain-language point.
summary_note: This box is a summary, not the full document.

related:
  - { title: Related page, href: /path, blurb: "Why this link matters." }
---
```

Privacy additionally uses `applies`. Terms additionally uses `governing_law` and `jurisdiction`. The loaders parse only the scalar fields and the particular inline-object/list forms shown above. Keep the existing YAML shape: changing it to a multiline object, quoted target, or different nesting can silently produce missing controls or related links.

`switch` controls are jumps to authored section IDs; they do not filter the document. The first switch target becomes the initially selected audience control, so it must name an existing H2 ID.

### Section contract

Every legal clause uses an H2 with four attributes:

```md
## Section title {#stable-id scope="Everyone" group="For everyone" short="TOC label"}
```

- `#stable-id` is the page anchor and target for scope controls. Treat it as permanent once published.
- `scope` is one of `Site visitors`, `Clients`, or `Everyone`.
- `group` creates a grouped navigation heading; ordering follows the document order.
- `short` is the compact navigation label.

The legal view uses this metadata to build its navigational structure and reading progress. The renderer receives only `## Section title`, which is why the attribute syntax does not appear to visitors.

Terms contains authoring comments explaining an additional legal-content rule: published clause numbers should not be reordered or inserted in the middle of a group, because proposals and emails may cite them. Comments are stripped before display, so retain them as instructions for future editors. The legal documents intentionally have no body H1; the page shell renders the title from frontmatter.

## Markdown features: observed use and practical guidance

| Feature | Where it appears | Use it when |
| --- | --- | --- |
| H2/H3 headings | All page families | The reader needs a meaningful navigable section; do not use headings only for visual spacing. |
| Fenced code | Blogs and the event-pipeline showcase | The exact syntax or output is evidence; name the language when known. |
| Tables | Blogs and both legal documents | Comparing fields, permissions, retention, or other repeated values is clearer in rows and columns. |
| Ordered/unordered lists | Blogs and legal documents | Order matters or several independent rules need scanning. |
| Images | Currently Indiknots | The image carries information that prose alone does not; always provide useful alt text. |
| Showcase custom elements | Showcases only | A small number of metrics or a purposeful callout improves the case study. |
| HTML comments | Terms only | Persistent maintainer instructions that must never render. |

Use standard Markdown before raw HTML. The custom elements above are the intentional exception; they are application components with known behavior. Markdown is inserted into a renderer and should be treated as content, not a way to add page layout, scripts, or unreviewed interactive markup.

## Editing and validation checklist

For any Markdown page:

- Confirm the source is under the correct `public/` family directory and that all links and root-relative asset paths resolve.
- Write for the page type: a practical article, a decision-led case study, or a precise legal clause. Do not force every Markdown feature into every page.
- Use heading levels in order and choose stable, readable wording; headings become navigable anchors.
- Check the route in the browser after a change, including a direct URL with a heading hash when the page has navigable sections.

For a blog or showcase:

- Add or update its catalogue entry and verify the `source` exists. The audit found all 15 configured blog/showcase sources present.
- Keep duplicated metadata synchronized: blog H1 with `header`; showcase frontmatter with the showcase catalogue.
- Update `public/sitemap.xml` for an indexable new route. The audit found two current omissions: `/blog/postgresql-access-control` and `/showcase/indiknots` are configured content routes but do not appear in the sitemap.

For a legal page:

- Preserve the current frontmatter field names and list/object layout.
- Keep each `switch.target` and section ID valid and unique.
- Retain legal authoring comments, especially the terms clause-ordering rule.
- Review changed legal text and dates as a legal/content decision, not only a formatting change.

Finally, run `npm run build` after structural or renderer-related changes. A prose-only edit still merits a route-level visual check because Markdown is fetched and enhanced in the browser rather than compiled into the route.
