---
name: blog-wiring
description: Register portfolio blog posts and public URLs, and group article assets by blog slug with root-relative links.
---

# Blog Wiring

Work in this portfolio repository. The catalog is `src/configs/blogs.config.ts`.
Do not follow paths into the sibling `dota-workspace` application.

## Files and asset ownership

Use this layout across every blog category:

```text
public/blogs/<folder>/<File-Name>.md
public/blogs/<folder>/assets/<blog-slug>/<asset-name>.svg
```

Use the catalog's exact slug for each asset folder, even when it differs from
the Markdown filename. Group all article-owned images and other assets there,
including posts with one image. Do not create empty asset folders.

Use root-relative public URLs in Markdown:

```md
![Native and managed execution paths](/blogs/tutorial/assets/what-is-a-native-build/native-vs-managed.svg)
```

Link to other pages in their canonical form: root-relative with a trailing
slash, such as `[distributed locks in Redis](/blog/distributed-locks-redis/)`,
or `https://www.ayu-sh-kr.com/<path>/` when an absolute URL is required. Use
descriptive anchor text, never "click here" or a bare URL. Asset paths with a
file extension keep their file name. `test/internal-links.test.ts` and the
post-build crawl in `scripts/check-internal-links.mjs` fail on any other form.

Relative `./assets/` links can resolve against the article route and break.
Never include `public/` in browser URLs. For migrations, establish ownership
from references, check destination collisions, move assets, and update every
consumer. For shared assets, retain one intentional owner and update all
consumers to that path.

## Catalog and public routes

Register each post in `blogPosts` with `slug`, `date`, `writer`, `header`,
`description`, `keywords`, `category`, `tags`, `source`, and `minutes`. Use
`siteIdentity.name` for the author and align the header with the Markdown H1.
Keep YAML frontmatter out of Markdown; metadata belongs in the catalog.

`tags` are lowercase topic slugs that drive the related-posts block below each
article. Reuse existing tags (for example `postgresql`, `redis`, `spring-boot`,
`aws`, `ai`) so posts on the same topic find each other; a new tag shared with
no other post adds nothing. Set the optional `updated` date only after a
substantive revision; it is shown as "Updated" and emitted as `dateModified`.

Current categories are `tutorial`, `rant`, `news`, and `notes`.
The explicit source controls loading; do not derive it from the category.
Existing notes posts use the others folder:

```text
slug: why-use-redis-channels
category: notes
source: /blogs/others/Why-Use-Redis-Channel.md
assets: /blogs/others/assets/why-use-redis-channels/<asset-name>.svg
route: /blog/why-use-redis-channels/
```

For new routes, update `blogRoutes` in `vite.config.ts`, `public/sitemap.xml`,
and `public/llms.txt`. Preserve existing slugs during asset reorganizations.
Do not register API proxy paths as public articles.

## Verification

- Check catalog sources exist and local image URLs resolve from the article
  route to files in public.
- Search all consumers for stale paths after moving assets.
- Confirm grouped assets appear in production output when building.
- Run `git diff --check` and `npm run build` for catalog or build changes.
- For SVG creation or visual repair, use `blog-svg-diagrams` for the project
  theme, Excalidraw-style defaults, accessibility, and rendered validation.
