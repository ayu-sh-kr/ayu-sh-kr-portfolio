---
name: content-seo-publishing
description: Optimize and publish this portfolio's blog articles and Dispatch news across catalog SEO, Vite SSG, sitemap.xml, llms.txt, and Vercel redirects. Use when creating, revising, auditing, or fixing content metadata, discoverability, and route wiring.
---

# Content SEO and Publishing

Treat the catalog entry, Markdown file, and public URL as one published unit. Read the current source and metadata before editing. Use [seo-optimization](../seo-optimization/SKILL.md) for title/heading/keyword quality, [blog-wiring](../blog-wiring/SKILL.md) for blog assets, and [portfolio-writing](../portfolio-writing/SKILL.md) when revising prose.

## Identify the surface

| Surface | Markdown | Catalog | Canonical route |
| --- | --- | --- | --- |
| Blog | `public/blogs/<category>/<file>.md` | `src/configs/blogs.config.ts` | `/blog/<slug>/` |
| Dispatch | `public/news/<slug>.md` | `src/configs/news.config.ts` | `/news/<slug>/` |

The Dispatch is a separate news product. Its entries belong in `newsNotes`, not just `blogPosts`. Use the entry’s explicit Markdown path; do not infer it from category. Preserve an existing slug and URL during copy edits unless a migration is explicitly requested.

## SEO review

1. Make the Markdown H1 and catalog `header` (blog) or `title` (news) identical. Name the subject and specific point, using terms people would search for naturally.
2. Write a concrete, distinct `description` or `summary` that tells readers what they will learn. The catalog drives the page's SEO; do not add YAML frontmatter. Check that the opening, H2s, and body fulfill the title's promise.
3. Use a few topic-specific `keywords` supported by the body. Do not pad variants, promise unverified performance, or use a misleading large number for clicks. Attribute claims, link original sources, and state benchmark scope.
4. Set the ISO `date` to publication date, keep the category/kind accurate, and estimate `minutes` from the actual text and complexity. Use the site's author convention for blogs and a source `reference` for sourced news.

## Wire every new route

For a new blog slug, add `/blog/<slug>` to `blogRoutes` in `vite.config.ts`; for a new Dispatch slug, add `/news/<slug>` to `newsRoutes`. Both arrays flow into the Dota SSG `routes` list. Then add:

- A canonical trailing-slash `<loc>` and accurate `<lastmod>` in `public/sitemap.xml`, following the file's existing domain and ordering.
- A descriptive entry in the appropriate section of `public/llms.txt`, linking the canonical article and, where the section convention does so, its Markdown URL.
- A permanent extensionless-to-trailing-slash redirect in `vercel.json`, following its existing redirect order. Keep the catch-all rewrite intact.

The same slug must appear in the catalog, public route, Vite route, sitemap, `llms.txt`, and Vercel redirect. The catalog’s `source` or `document` must resolve to the exact file under `public`. For assets, use root-relative public URLs without `public/` in the browser path. If the content already exists and only its wording changes, update the metadata and `lastmod` when appropriate; do not add duplicate route entries.

## Verify before delivery

- Check the H1 equals the catalog title, the article source exists, dates/read time make sense, and links and image paths resolve.
- Check each route once in all publishing surfaces and parse `vercel.json` and `sitemap.xml`.
- Run `git diff --check` and `npm run build` or the repository's SSG build when a checkout and dependencies are available; inspect generated route output when SSG changes.
- State which checks actually ran. Do not claim a build or deployed page was verified from file inspection alone.
