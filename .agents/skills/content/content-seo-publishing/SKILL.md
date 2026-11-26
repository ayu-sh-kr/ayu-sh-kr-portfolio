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

## Maintain the Dispatch archive

Keep the blog’s full listing at `/blog/`. For Dispatch, keep page one at `/news/` and give each later page its own canonical URL, starting with `/news/2/`.

- **When publishing a Dispatch article**, complete the article wiring above. Preserve each older article’s `/news/<slug>/` permalink and sitemap entry as its listing moves back. Change an article’s `<lastmod>` only for a substantive update to that article.
- **When the article count changes**, compare the old and new totals using `archivePageCount` in `src/utils/archive-page.utils.ts`. Vite derives numbered archive routes from the length of `newsRoutes`, so keep that list in sync with `newsNotes` and reserve it for article slugs.
- **When a new archive page appears**, add its canonical URL to `public/sitemap.xml` and verify the matching permanent trailing-slash redirect in `vercel.json`. At 15 articles per page, the move from 105 to 106 creates `/news/8/` and needs a redirect from `/news/8`. Keep `public/llms.txt` entries pointed at individual article permalinks.
- **After building**, check the prerendered HTML. Follow the previous last page’s next link to the new page, verify its self-canonical and confirm that each catalog article appears once across the archive listings.

## Verify before delivery

- Check the H1 equals the catalog title, the article source exists, dates/read time make sense, and links and image paths resolve.
- Keep every internal link canonical (`/path/` or `https://www.ayu-sh-kr.com/path/`). `pnpm build:ssg` runs `scripts/check-internal-links.mjs`, which fails on a missing trailing slash, the bare domain, `http://`, or a link with no generated page; `pnpm check:links` reruns it against an existing `dist`.
- Check each route once in all publishing surfaces and parse `vercel.json` and `sitemap.xml`.
- Run `git diff --check` and `npm run build` or the repository's SSG build when a checkout and dependencies are available; inspect generated route output when SSG changes.
- State which checks actually ran. Do not claim a build or deployed page was verified from file inspection alone.
