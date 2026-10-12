# SEO changes: internal linking and the PostgreSQL permissions guide

Branch: `fix/internal-linking-postgres-seo`. Nothing has been deployed.

This report covers two jobs, done in order:

- **Part A** makes every internal URL canonical, adds a check that fails the build on non-canonical links, adds one-hop redirects for the bare domain, and adds related posts plus contextual links.
- **Part B** upgrades `/blog/postgresql-access-control/` with a search-matching troubleshooting layer, and adds `BlogPosting` JSON-LD to every blog post.

Canonical form used everywhere: `https://www.ayu-sh-kr.com/<path>/`. It matches the repository's existing canonical logic (`applyRouteMetadata` in `src/utils/seo.utils.ts` already emitted `https://www.ayu-sh-kr.com/<path>/`), so I did not need to stop and report a conflict.

## Commits

| Commit | Purpose |
| --- | --- |
| `fix: canonicalize internal links and check them at build time` | URL canonicalization and the automated check |
| `fix: redirect the bare domain to canonical www URLs in one hop` | Redirects |
| `add: tag blog posts and rank related posts from shared tags` | Related posts: data model and ranking |
| `add: show related posts below blog articles` | Related posts: component |
| `add: link related blog posts in context` | Contextual links between blog posts |
| `add: link Dispatch notes to evergreen blog posts` | Contextual links from news to blog |
| `fix: scroll to percent-encoded Markdown heading IDs` | Makes jump links to the new error headings work on page load |
| `add: show an updated date for revised blog posts` | Visible "Updated" date, used for `dateModified` |
| `chores: regenerate component metadata for related posts` | Generated `custom-elements.json` / `web-types.json` |
| `fix: keep aspect ratio for blog images with authored dimensions` | Lets diagrams reserve space, so jump links land on target |
| `add: troubleshooting reference for PostgreSQL permission errors` | PostgreSQL content, title and metadata |
| `add: BlogPosting structured data for every blog article` | JSON-LD |
| `chores: document blog tags and canonical internal links` | Guidance updates in `.agents/skills` |

## Part A: URL fixes

### Root cause

Canonical tags and the sitemap already used the trailing-slash `www` form. The links that pointed at those pages did not:

- Navigation, footer, "next article", blog and news lists, showcase cards, "back to" links and the design-system pages all used hand-written paths without a trailing slash (`/blog`, `/blog/${slug}`, `/legal/privacy#cookies`, and so on).
- `public/llms.txt` listed every page on the bare `https://ayu-sh-kr.com/` host, mostly without trailing slashes.
- The legal pages' Markdown front matter and in-body links had no trailing slash.

Every one of those links went through a 308 redirect, and Google indexed the slashless and bare-domain URLs alongside the canonical ones. A crawl of the build before the fix found **1,600 non-canonical internal links across 2,466 checked links**. Most of them came from 13 nav and footer links repeated on each of the roughly 90 generated pages.

### Files changed

- `package.json`
- `public/legal/privacy.md`
- `public/legal/terms.md`
- `public/llms.txt`
- `scripts/check-internal-links.mjs`
- `src/components/pages/blog/article/blog-article/blog-article.component.ts`
- `src/components/pages/blog/index/archive/blog-highlighted-blog/blog-highlighted-blog.component.ts`
- `src/components/pages/blog/index/archive/blog-list/blog-list.component.ts`
- `src/components/pages/news/article/news-article/news-article.component.ts`
- `src/components/pages/news/index/news-index/news-index.component.ts`
- `src/components/pages/showcase/article/showcase-view/showcase-view.component.ts`
- `src/components/pages/showcase/index/archive/showcase-project-row/showcase-project-row.component.ts`
- `src/components/pages/showcase/index/featured/showcase-project-card/showcase-project-card.component.ts`
- `src/components/pages/showcase/index/spotlight/showcase-spotlight/showcase-spotlight.component.ts`
- `src/components/pages/showcase/index/support/showcase-cta/showcase-cta.component.ts`
- `src/components/pages/subscription/subscription-preferences/subscription-preferences.component.ts`
- `src/components/pages/subscription/unsubscribe-flow/unsubscribe-flow.component.ts`
- `src/components/utils/consent-notice/consent-notice.component.ts`
- `src/data/card-decks/about-me-card-deck-content.ts`
- `src/data/card-decks/showcase-card-deck-content.ts`
- `src/data/design-color-content.ts`
- `src/data/design-content.ts`
- `src/data/design-element-content.ts`
- `src/data/design-typography-content.ts`
- `src/data/letter-content.ts`
- `src/data/portfolio-content.ts`
- `src/data/pricing-content.ts`
- `src/data/subscription-preferences-content.ts`
- `src/data/subscription-verify-content.ts`
- `src/data/support-content.ts`
- `src/pages/cards/about-me/about-me-card.page.ts`
- `src/pages/cards/reach-out/reach-out.page.ts`
- `src/pages/cards/showcase/showcase-card.page.ts`
- `test/internal-links.test.ts`

Dynamic blog links now go through one helper, `getBlogPath(slug)` in `src/configs/blogs.config.ts`. The related-posts block, the "next article" link, the blog list and the highlighted post all use it. Static paths were fixed where they are authored, in the content modules and components.

### The automated check

`scripts/check-internal-links.mjs` holds one shared classifier, `classifyHref`, used in two places:

1. **`test/internal-links.test.ts`** (Vitest, runs with `pnpm test`) checks:
   - every link in `public/**/*.md` (inline links, images, reference links, raw `<a>` tags and front-matter `href:` fields), skipping fenced and inline code;
   - every `href`-style string authored in `src/**/*.ts`;
   - absolute site URLs in `public/sitemap.xml`, `public/llms.txt`, `public/robots.txt` and `index.html`.
2. **The post-build crawl.** `pnpm build:ssg` now runs `node scripts/check-internal-links.mjs dist` after the SSG build, and `pnpm check:links` runs it on its own. It checks every `<a href>` in the generated HTML, plus every absolute site URL in HTML, `sitemap.xml` and `llms.txt` (canonical tags, `og:url`, JSON-LD). It also fails on any internal link whose target has no generated page or file.

A link fails when it:

- is a page path without a trailing slash (asset paths with a file extension are exempt);
- uses `ayu-sh-kr.com` without `www`;
- uses `http://` or a protocol-relative `//` URL;
- has no generated document (crawl only).

`vercel.json` runs `pnpm build:ssg`, so a non-canonical link now fails the deployment build. The GitHub workflow runs `pnpm build` without SSG, so in CI the Vitest check is the guard. I did not change the workflow.

**Proof it passes:**

```text
$ pnpm test
 Test Files  25 passed (25)
      Tests  112 passed (112)

$ pnpm build:ssg
√ [dota-ssr] prerendered 93 routes
Internal link check passed: 2538 internal link(s) canonical and resolvable.
```

**Proof it catches regressions:**

- Run against the original source files (stashed), `test/internal-links.test.ts` fails 3 of its tests: Markdown links, authored `href`s, and the text indexes.
- Run against the pre-fix build, the crawl failed with `Internal link check failed: 1600 problem(s) in 2466 checked link(s).`
- An intermediate build caught four more slashless links hidden in the legal pages' front matter, which I then fixed.

### Redirect rules

Hosting config is in the repo (`vercel.json`). The SSG plugin regenerates the extensionless-to-slash redirects for every generated route on each build. These were already present for all pages, including the URLs in Search Console (`/blog/aws-app-config-spring-boot-integration`, `/blog/distributed-locks-redis`, `/legal/terms`, `/legal/privacy`, and the rest).

I added two host rules ahead of the generated rules. The plugin only replaces redirects whose `source` matches a generated route, so these survive rebuilds:

```json
{
  "source": "/:path((?:[^/.]+/)*[^/.]+)",
  "has": [{ "type": "host", "value": "ayu-sh-kr.com" }],
  "destination": "https://www.ayu-sh-kr.com/:path/",
  "permanent": true
},
{
  "source": "/:path*",
  "has": [{ "type": "host", "value": "ayu-sh-kr.com" }],
  "destination": "https://www.ayu-sh-kr.com/:path*",
  "permanent": true
}
```

What each request now does:

- `https://ayu-sh-kr.com/blog/distributed-locks-redis` goes straight to `https://www.ayu-sh-kr.com/blog/distributed-locks-redis/` in one 308.
- Bare-domain asset paths keep their path. Bare-domain URLs that already end in `/` only switch host.
- `https://www.ayu-sh-kr.com/blog/distributed-locks-redis` goes to `.../distributed-locks-redis/` in one 308, through the generated rule.

I checked the pattern matching with `path-to-regexp@6.1.0`, the matcher Vercel uses. It matches extensionless paths, never `.xml`, `.svg` or `.md` files, and the root falls through to the second rule.

**What the repo cannot control, so you need to check it on Vercel:**

1. **The apex domain setting.** If `ayu-sh-kr.com` is set up under *Project → Settings → Domains* as "Redirect to www.ayu-sh-kr.com", Vercel's domain-level redirect runs before `vercel.json`. Bare-domain slashless URLs then take two hops: apex → www, then the slash. For one hop, attach `ayu-sh-kr.com` to the project without a domain-level redirect, so the host rules above handle it. Either way the final URL is canonical.
2. **`http://` → `https://`** is enforced by Vercel's edge and cannot be configured in `vercel.json`. An `http://` URL takes Vercel's HTTPS redirect first, then at most one of the rules above. There are no `http://` links left on the site. Browsers that have seen the domain's HSTS header skip that first hop.

### Sitemap

`public/sitemap.xml` lists 90 URLs, all in canonical `https://www.ayu-sh-kr.com/<path>/` form; the Vitest check enforces this. The crawl confirmed each one has a generated page. The PostgreSQL entry's `<lastmod>` is now `2026-10-12`.

### Local crawl: 404s and redirects

88 unique internal hrefs requested without following redirects: 88 returned 200, with no redirect hops. That is every unique internal link target in the generated HTML, requested against `vite preview` with redirect-following off. The preview server falls back to `index.html` for unknown paths, so the build crawl above is what proves each target has a real page; it reported none missing.

## Part A: Related posts

`BlogPost` in `src/configs/blogs.config.ts` now has a `tags` field (lowercase topic slugs). `getRelatedBlogPosts(post)` ranks other posts by shared tags, then same category, then recency, and returns up to 4. If tags find fewer than 2, it fills from the newest same-category posts. The new `blog-related-posts` component renders the result under the share controls. It is rendered by SSG, so crawlers see the links. Nobody maintains a list by hand. The PostgreSQL post gets two related posts, because only two others share its tags.

| Post | Related posts shown |
| --- | --- |
| `ui-design-trends-skeuomorphism-isometric-glass` | `ssr-vs-ssg-rendering-hydration-dom`, `reinforcement-learning-from-rlhf-to-rlsc` |
| `reinforcement-learning-from-rlhf-to-rlsc` | `telepathy-with-ai`, `open-knowledge-format-okf-vs-rag` |
| `java-native-builds-graalvm-vs-leyden` | `what-is-a-native-build`, `aws-app-config-spring-boot-integration`, `rate-limiting-token-bucket-spring-boot`, `why-use-redis-channels` |
| `what-is-a-native-build` | `java-native-builds-graalvm-vs-leyden`, `ssr-vs-ssg-rendering-hydration-dom` |
| `open-knowledge-format-okf-vs-rag` | `telepathy-with-ai`, `reinforcement-learning-from-rlhf-to-rlsc` |
| `why-use-redis-channels` | `distributed-locks-redis`, `rate-limiting-token-bucket-spring-boot`, `java-native-builds-graalvm-vs-leyden`, `aws-app-config-spring-boot-integration` |
| `telepathy-with-ai` | `reinforcement-learning-from-rlhf-to-rlsc`, `open-knowledge-format-okf-vs-rag` |
| `ssr-vs-ssg-rendering-hydration-dom` | `ui-design-trends-skeuomorphism-isometric-glass`, `what-is-a-native-build` |
| `aws-app-config-spring-boot-integration` | `java-native-builds-graalvm-vs-leyden`, `rate-limiting-token-bucket-spring-boot`, `why-use-redis-channels`, `lambda-pricing-infra-alone` |
| `postgresql-access-control` | `business-logic-auth-middleware`, `distributed-locks-redis` |
| `distributed-locks-redis` | `rate-limiting-token-bucket-spring-boot`, `why-use-redis-channels`, `postgresql-access-control`, `distributed-monolith-extra-invoices` |
| `rate-limiting-token-bucket-spring-boot` | `distributed-locks-redis`, `why-use-redis-channels`, `java-native-builds-graalvm-vs-leyden`, `aws-app-config-spring-boot-integration` |
| `distributed-monolith-extra-invoices` | `business-logic-auth-middleware`, `why-use-redis-channels`, `distributed-locks-redis` |
| `lambda-pricing-infra-alone` | `eventbridge-scheduler-quirks`, `aws-app-config-spring-boot-integration` |
| `eventbridge-scheduler-quirks` | `lambda-pricing-infra-alone`, `aws-app-config-spring-boot-integration` |
| `business-logic-auth-middleware` | `postgresql-access-control`, `distributed-monolith-extra-invoices`, `rate-limiting-token-bucket-spring-boot` |

## Part A: Contextual links added

I read each post before linking and only added links where the target explains the idea at that point. Prose changes are limited to placing the link. In five places I added one short clause or sentence to carry it: the authorization post, the distributed-monolith post, the rate-limiting post, the Kafgres note, and the PostgreSQL post's Kafgres link. In the AppConfig post, "limits" became "rate limits" to carry its link. No links went into headings, code blocks or a post's first sentence, and no page links to itself.

| # | Source page | Target page | Anchor text | Sentence containing the link |
| --- | --- | --- | --- | --- |
| 1 | `/blog/business-logic-auth-middleware/` | `/blog/postgresql-access-control/` | least-privilege Postgres roles | The database can hold the same line one layer lower: **least-privilege Postgres roles** limit what the service's own credentials can read or change, whichever entry point runs. |
| 2 | `/blog/business-logic-auth-middleware/` | `/blog/why-use-redis-channels/` | delivery contract | A failed decision becomes a typed business error; the HTTP adapter maps it to an appropriate response, while a job or consumer handles the same error according to its own **delivery contract**. |
| 3 | `/blog/business-logic-auth-middleware/` | `/blog/distributed-monolith-extra-invoices/` | one large authorization service | The opposite shortcut is putting every policy in **one large authorization service**. |
| 4 | `/blog/distributed-monolith-extra-invoices/` | `/blog/business-logic-auth-middleware/` | authoritative permission check | A service may need an immediate fraud decision or an **authoritative permission check**. |
| 5 | `/blog/distributed-monolith-extra-invoices/` | `/blog/postgresql-access-control/` | PostgreSQL permissions and GRANT | Separate database roles, built with **PostgreSQL permissions and GRANT**, can make that write ownership enforceable rather than a convention. |
| 6 | `/blog/distributed-monolith-extra-invoices/` | `/blog/eventbridge-scheduler-quirks/` | idempotent consumers | When the transition spans services, design for eventual consistency with an outbox, **idempotent consumers**, and a visible recovery process rather than pretending a distributed call chain is one local transaction. |
| 7 | `/blog/distributed-locks-redis/` | `/blog/why-use-redis-channels/` | short-lived, cross-process coordination | Redis is useful when several application instances need **short-lived, cross-process coordination** before or around work that is not naturally a single database transaction. |
| 8 | `/blog/distributed-locks-redis/` | `/blog/rate-limiting-token-bucket-spring-boot/` | token bucket | Rate limiting: use an atomic counter, **token bucket**, or Lua script to decide whether an identity may make another request. |
| 9 | `/blog/distributed-locks-redis/` | `/blog/eventbridge-scheduler-quirks/` | scheduled reconciliation | A **scheduled reconciliation** should have one active run for a tenant and date. |
| 10 | `/blog/rate-limiting-token-bucket-spring-boot/` | `/blog/business-logic-auth-middleware/` | near the controller boundary | Put identity extraction and the rate-limit decision **near the controller boundary**, but keep the bucket implementation independent from Spring MVC. |
| 11 | `/blog/rate-limiting-token-bucket-spring-boot/` | `/blog/distributed-locks-redis/` | Redis distributed lock | A limiter is also not a **Redis distributed lock**: it admits requests over time rather than granting exclusive ownership. |
| 12 | `/blog/eventbridge-scheduler-quirks/` | `/blog/distributed-locks-redis/` | unique constraint or idempotency key | Pass a stable operation identifier in the target input, record the durable state transition under a **unique constraint or idempotency key**, and treat a repeat invocation as a safe no-op or a resume. |
| 13 | `/blog/why-use-redis-channels/` | `/blog/distributed-locks-redis/` | distributed lock | A **distributed lock** can prevent duplicate cache refreshes or coordinate one tenant-specific job. |
| 14 | `/blog/why-use-redis-channels/` | `/blog/rate-limiting-token-bucket-spring-boot/` | Rate limiting | **Rate limiting** is primarily a shared-state problem, not a message-log problem. |
| 15 | `/blog/why-use-redis-channels/` | `/blog/aws-app-config-spring-boot-integration/` | reload configuration | A deployment can tell instances to **reload configuration**. |
| 16 | `/blog/aws-app-config-spring-boot-integration/` | `/blog/rate-limiting-token-bucket-spring-boot/` | rate limits | Feature flags, **rate limits**, cohort assignments, and presentation settings are usually good candidates. |
| 17 | `/blog/aws-app-config-spring-boot-integration/` | `/blog/java-native-builds-graalvm-vs-leyden/` | controlled instance restart | For applications dominated by immutable Kotlin configuration, an atomic snapshot provider or a **controlled instance restart** is often simpler than attempting to make every object rebindable. |
| 18 | `/blog/java-native-builds-graalvm-vs-leyden/` | `/blog/lambda-pricing-infra-alone/` | serverless function | For a **serverless function**, cold start is your latency story. |
| 19 | `/blog/what-is-a-native-build/` | `/blog/java-native-builds-graalvm-vs-leyden/` | Native build tooling for Java | **Native build tooling for Java** handles this by making the invisible visible. |
| 20 | `/blog/what-is-a-native-build/` | `/blog/ssr-vs-ssg-rendering-hydration-dom/` | moving work from run time to build time | It is an ecosystem slowly **moving work from run time to build time**, which is the exact same movement this entire article has been describing, happening at the framework level instead of the compiler level. |
| 21 | `/blog/ssr-vs-ssg-rendering-hydration-dom/` | `/blog/ui-design-trends-skeuomorphism-isometric-glass/` | client-side actions should feel continuous | This is useful when you need rich filtering, collaborative controls, or an interface where a sequence of **client-side actions should feel continuous**. |
| 22 | `/blog/open-knowledge-format-okf-vs-rag/` | `/news/anthropic-contextual-retrieval-rag/` | the right fragment may be missed | Its failure mode is plausible incompleteness: **the right fragment may be missed**, or retrieved fragments may lack the relationship that tells the model how to combine them. |
| 23 | `/blog/open-knowledge-format-okf-vs-rag/` | `/news/pageindex-tree-based-rag-relevance/` | lexical or vector search | Use OKF as the curated graph-shaped layer; index its concepts for **lexical or vector search**; retrieve when the starting point is unknown; follow links when a concept establishes a deliberate path; and query the source of truth when correctness depends on live state. |
| 24 | `/news/kafgres-kafka-broker-postgres-700mbs/` | `/blog/postgresql-access-control/` | least-privilege Postgres roles for an order workflow | Our guide to **least-privilege Postgres roles for an order workflow** commits an order update and its event row in one transaction in plain SQL. |
| 25 | `/news/kafgres-kafka-broker-postgres-700mbs/` | `/blog/why-use-redis-channels/` | a successful acknowledgement and a durable event are different promises | That detail belongs beside the speed result: **a successful acknowledgement and a durable event are different promises**, and applications need to know which they are receiving. |
| 26 | `/news/qorl-postgres-query-optimizer-rl/` | `/blog/reinforcement-learning-from-rlhf-to-rlsc/` | reward that could be checked in the real world | What made it good was retraining on one dedicated task with a **reward that could be checked in the real world**. |
| 27 | `/news/pageindex-tree-based-rag-relevance/` | `/blog/open-knowledge-format-okf-vs-rag/` | sections and cross-references carry useful context | PageIndex is especially suited to long manuals, guides, and policies where **sections and cross-references carry useful context**. |
| 28 | `/news/anthropic-contextual-retrieval-rag/` | `/blog/open-knowledge-format-okf-vs-rag/` | a chunk boundary can separate a rule from the heading that explains it | But **a chunk boundary can separate a rule from the heading that explains it**. |
| 29 | `/news/pyronaut-python-micronaut-graalvm/` | `/blog/what-is-a-native-build/` | lengthy native build | GraalVM supplies the runtime technology, including a deployment option that reuses a native base instead of requiring a **lengthy native build** after every code change. |
| 30 | `/news/pyronaut-python-micronaut-graalvm/` | `/blog/java-native-builds-graalvm-vs-leyden/` | warmed up | Pyronaut offers a JVM option for teams prioritizing peak throughput after the application has **warmed up**. |
| 31 | `/news/gitlab-unauthenticated-rate-limits/` | `/blog/rate-limiting-token-bucket-spring-boot/` | HTTP 429 with Retry-After | A request over the limit receives **HTTP 429 with `Retry-After`** and `RateLimit-*` headers, so a client should wait for the interval GitLab specifies instead of retrying immediately. |
| 32 | `/news/docker-sandbox-kit-aws-lambda-microvms-agent-coding/` | `/blog/lambda-pricing-infra-alone/` | short-lived function invocation | Unlike a **short-lived function invocation**, this gives an agent room to work through a task while separating that work from a developer's laptop and other sessions. |
| 33 | `/news/microsoft-titan-unsigned-jwt-analytics/` | `/blog/business-logic-auth-middleware/` | its own working authentication checks | The separate API needed **its own working authentication checks**. |
| 34 | `/blog/postgresql-access-control/` | `/blog/business-logic-auth-middleware/` | rules for valid payment and shipping transitions | The **rules for valid payment and shipping transitions** belong in application code. |
| 35 | `/blog/postgresql-access-control/` | `/news/kafgres-kafka-broker-postgres-700mbs/` | Kafgres, a Kafka-compatible broker inside PostgreSQL | **Kafgres, a Kafka-compatible broker inside PostgreSQL**, pairs a row with its event the same way. |
| 36 | `/blog/postgresql-access-control/` | `/blog/distributed-locks-redis/` | duplicate-event prevention | Real payment code still needs retries, **duplicate-event prevention** and payment verification. |

The PostgreSQL post also gained in-page jump links from its Quick fixes table to its own new sections. Those are not counted above.

### Incoming links per blog post, before → after

I counted from the generated HTML of the pre-change build and the final build, by distinct source page (blog posts and news notes; the blog index, nav and footer are excluded).

| Blog post | In-body links from other posts (before → after) | Related-posts block (before → after) | "Next article" footer (before → after) | Distinct linking pages (before → after) |
| --- | --- | --- | --- | --- |
| `aws-app-config-spring-boot-integration` | 0 → 1 | 0 → 5 | 1 → 1 | 1 → 6 |
| `business-logic-auth-middleware` | 0 → 4 | 0 → 2 | 1 → 1 | 1 → 5 |
| `distributed-locks-redis` | 0 → 4 | 0 → 4 | 1 → 1 | 1 → 5 |
| `distributed-monolith-extra-invoices` | 0 → 1 | 0 → 2 | 1 → 1 | 1 → 3 |
| `eventbridge-scheduler-quirks` | 0 → 2 | 0 → 1 | 1 → 1 | 1 → 3 |
| `java-native-builds-graalvm-vs-leyden` | 0 → 3 | 0 → 4 | 1 → 1 | 1 → 6 |
| `lambda-pricing-infra-alone` | 0 → 2 | 0 → 2 | 1 → 1 | 1 → 5 |
| `open-knowledge-format-okf-vs-rag` | 0 → 2 | 0 → 2 | 1 → 1 | 1 → 5 |
| `postgresql-access-control` | 0 → 3 | 0 → 2 | 1 → 1 | 1 → 5 |
| `rate-limiting-token-bucket-spring-boot` | 0 → 4 | 0 → 5 | 1 → 1 | 1 → 6 |
| `reinforcement-learning-from-rlhf-to-rlsc` | 1 → 2 | 0 → 3 | 1 → 1 | 2 → 5 |
| `ssr-vs-ssg-rendering-hydration-dom` | 0 → 1 | 0 → 2 | 1 → 1 | 1 → 3 |
| `telepathy-with-ai` | 0 → 0 | 0 → 2 | 1 → 1 | 1 → 3 |
| `ui-design-trends-skeuomorphism-isometric-glass` | 0 → 1 | 0 → 1 | 1 → 1 | 1 → 2 |
| `what-is-a-native-build` | 1 → 2 | 0 → 2 | 1 → 1 | 1 → 3 |
| `why-use-redis-channels` | 1 → 4 | 0 → 5 | 1 → 1 | 2 → 9 |

Notes:

- Every blog post now has at least 2 incoming links from other posts when the related-posts block is counted.
- These posts have fewer than 2 **in-body** incoming links:
  - `telepathy-with-ai` (0): no other post discusses brain–computer interfaces.
  - `aws-app-config-spring-boot-integration`, `distributed-monolith-extra-invoices`, `ssr-vs-ssg-rendering-hydration-dom`, `ui-design-trends-skeuomorphism-isometric-glass` (1 each).

  I did not force links where the target would not help the reader.
- Some posts have fewer than 2 **outgoing** in-body links for the same reason: `telepathy-with-ai`, `ui-design-trends-skeuomorphism-isometric-glass` and `lambda-pricing-infra-alone` have none; `eventbridge-scheduler-quirks`, `ssr-vs-ssg-rendering-hydration-dom` and `java-native-builds-graalvm-vs-leyden` gained one. Their related-posts blocks still link onward.
- `news/postgres-18-skip-scan` does not exist in the repository (it is not in `newsNotes` and has no Markdown file), so it was not linked.

## Part B: PostgreSQL post

### Title, H1 and meta description

| | Old | New |
| --- | --- | --- |
| `<title>` (before ` — ayu-sh-kr.com`) | PostgreSQL Permissions: Build a Role with GRANT and REVOKE | PostgreSQL Permissions: GRANT, REVOKE and Permission Denied Fixes (65 characters) |
| H1 | PostgreSQL Permissions: Build a Role with GRANT and REVOKE | PostgreSQL Permissions: GRANT, REVOKE and Permission Denied Fixes |
| Meta description | Build PostgreSQL permissions one grant at a time: connect, read orders, insert rows, update status and record events, then add default privileges and RLS. | Fix PostgreSQL permission denied errors for tables, sequences, schemas and databases, check existing grants, then build a least-privilege role step by step. (156 characters) |
| Updated date | October 8, 2026 (in-body note only) | `updated: "2026-10-12"`, shown in the article metadata as "Updated October 12, 2026" and in the in-body note; `dateModified` 2026-10-12; sitemap `lastmod` 2026-10-12 |
| Reading time | 18 min | 15 min (about 3,500 words including SQL) |

The slug and URL are unchanged. I set the updated date to today, 2026-10-12. If the deploy happens on a later day, change `updated` in `src/configs/blogs.config.ts`, the in-body "Updated" note and the sitemap `lastmod` together.

### New section outline

After review, the whole post was rewritten for length and flow: about 3,500 words including SQL (2,500 of prose), down from 6,000. The tutorial headings and SQL are unchanged; the prose around them was cut, and the troubleshooting sections were shortened to what the tutorial does not already show. H3s are indented below.

1. **New:** Quick fixes for permission denied errors. An error → fix table with a jump link per row.
2. Start with the shop and the job the role must do
3. Give the checkout role permission to connect
4. Let the connected role find the sales schema
5. Let the role read orders
6. Allow order creation, then supply the generated ID
7. Allow status updates without allowing price changes
8. Extend the same role when the workflow gains an event table
9. Limit the completed workflow to the current tenant
10. Run the complete checkout task with the accumulated permissions
11. Review what the role gained, and remove what it no longer needs
12. **New:** `ERROR:  permission denied for table orders`
    - Zero rows without an error is row-level security
13. **New:** `ERROR:  permission denied for sequence orders_id_seq`
14. **New:** `ERROR:  permission denied for schema sales`
15. **New:** `FATAL:  permission denied for database "shop"`
    - `no pg_hba.conf entry` is an authentication problem
    - `ERROR:  permission denied to create database`
16. **New:** `ERROR:  must be owner of table orders`
17. **New:** New tables are not accessible to the role
18. **New:** How to check existing privileges in PostgreSQL
19. **New:** Least-privilege PostgreSQL role checklist
20. Stop granting when the domain task works (original conclusion, shortened and moved to the end)

Each error section gives the error, the cause and the fix in a few sentences, plus the one trap or version difference worth knowing. Details that did not help a reader fix the error were dropped from the post, though they stay in the test transcript below: the `MAINTAIN` ACL letter, `has_any_column_privilege`, the full `\dp` output, and `pg_write_all_data` with `RETURNING`.

**Heading IDs.** All 12 original heading IDs are unchanged, for example `allow-order-creation%2C-then-supply-the-generated-id`. New headings get IDs from the same Markdown anchor plugin. Error headings keep percent-encoded punctuation, for example `error%3A-permission-denied-for-table-orders`. The site's hash-scroll helper only looked up the decoded hash, so a deep link to such an ID did not scroll on load; that was already true for the two existing `%2C` IDs. The helper now tries the raw hash first. A unit test covers this, and it fails without the fix.

**Error text.** Every error string comes from the test output. `psql` prints two spaces after `ERROR:` and `FATAL:`, and the headings and code blocks keep them. Inside a rendered heading, HTML collapses the double space, so it displays as one.

### Verified findings used in the post

- **Sequence permissions.**
  - `bigserial` defaults call `nextval('sales.orders_id_seq'::regclass)`.
  - With table `INSERT` but no sequence privilege, the insert fails with `ERROR:  permission denied for sequence orders_id_seq`.
  - `USAGE` alone fixes it, and also allows `currval()`. `SELECT` alone does not.
  - `GENERATED ALWAYS AS IDENTITY` and `GENERATED BY DEFAULT AS IDENTITY` inserts succeed with **no** sequence privilege, even though `has_sequence_privilege` returns `false`. Calling `nextval()` directly on the identity sequence is still denied.
  - Identical on 14, 16 and 17.
- **Schema `USAGE` missing.**
  - A schema-qualified query fails with `permission denied for schema sales`.
  - An unqualified query through `search_path` fails with `relation "orders" does not exist`.
  - `CREATE` without `USAGE` still gets the schema error when it names an existing table.
- **Table errors.**
  - `permission denied for table orders` is the same message for `SELECT` and `INSERT`.
  - `GRANT ALL PRIVILEGES ON DATABASE` does not fix it.
  - `INSERT ... RETURNING` needs `SELECT`.
  - `UPDATE ... WHERE` needs `SELECT` on the filtered column; `UPDATE` without `WHERE` does not.
- **Row-level security.** Zero rows with no error when no tenant setting is present. A role with no applicable policy also sees zero rows.
- **The `public` schema.**
  - An ordinary role can `CREATE TABLE public.notes` on 10, 13 and 14, and gets `ERROR:  permission denied for schema public` on 15, 16 and 17.
  - `\dn+ public` shows `=UC/postgres` on 14 and earlier, and `=U/pg_database_owner` from 15.
- **Predefined roles.**
  - `pg_read_all_data` and `pg_write_all_data` exist on 14–17. On 13, `GRANT pg_read_all_data` fails with `role "pg_read_all_data" does not exist`.
  - RLS still applies to their members.
  - A `pg_write_all_data` member can insert into a `bigserial` table but not run `INSERT ... RETURNING`.
- **Error wording.** PostgreSQL 10 says `ERROR:  permission denied for relation secret`; 13 through 17 say `table`.
- **Database errors.**
  - `FATAL:  permission denied for database "shop"` comes with `DETAIL:  User does not have CONNECT privilege.`
  - `no pg_hba.conf entry for host "127.0.0.1", user "checkout_app", database "shop", no encryption` was reproduced by replacing `pg_hba.conf`.
  - New databases grant `CONNECT` and `TEMPORARY` to `PUBLIC`: `has_database_privilege` is true for a fresh role.
- **CREATEDB.** `ERROR:  permission denied to create database`; `ALTER ROLE ... CREATEDB` fixes it.
- **Ownership.**
  - `ERROR:  must be owner of table orders`.
  - Membership in the owning role allows `ALTER TABLE` without `SET ROLE`.
  - `ALTER TABLE ... OWNER TO` works as an administrator; a non-owner gets the same error.
  - `GRANT ... WITH INHERIT TRUE, SET TRUE` is a syntax error on 14 and 15 and works on 16 and 17.
- **Default privileges.**
  - `GRANT ... ON ALL TABLES IN SCHEMA` misses later tables.
  - `ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner` covers tables and sequences that `shop_owner` creates.
  - A table created by a *member* under its own name is not covered.
  - `SET ROLE shop_owner` before `CREATE` fixes that.
  - Without `FOR ROLE`, the defaults apply to the current role's objects.
- **Checking privileges.**
  - `\dp` and `\z` give identical output.
  - PostgreSQL 17 shows `arwdDxtm` (`m` = MAINTAIN), while 14 and 16 show `arwdDxt`.
  - `\du` shows "Member of" in psql 14 and 15. In 16 and later it does not, and `\drg` works instead (it is an invalid command in 14 and 15).
  - `role_table_grants` lists direct grants only, so the login inherits but has no rows of its own.
  - With only column-level `INSERT`, `has_table_privilege(..., 'INSERT')` is false while `has_any_column_privilege` is true.
  - MySQL's `SHOW GRANTS FOR` gives `ERROR:  syntax error at or near "FOR"`.

### Claims dropped or narrowed because they were not verified

- "A member of both the current and new owning role can transfer ownership": this is the documented rule, but I tested only the administrator path. The post now says only that an administrator can transfer ownership.
- "`NOCREATEDB` is the default": not tested, because the role in the test was created with explicit `NOCREATEDB`. The post now says the checkout login was created with `NOCREATEDB`.
- The exact release where "permission denied for relation" became "for table": I tested only 10 and 13, so the post names PostgreSQL 10 and "13 through 17" and does not claim the boundary release.
- Upgraded clusters that keep the pre-15 `public` schema ACL: not tested, not claimed. The post talks about new databases only.
- The full tutorial walkthrough was not re-run on 15; PostgreSQL 15 was used only for the version checks. The tutorial's own SQL is unchanged and needs 16+ for `WITH INHERIT TRUE`, as it already stated.
- No `FAQPage` or `HowTo` markup was added.

### SQL test transcript

Docker images: `postgres:17` (17.11), `postgres:16` (16.15), `postgres:14` (14.24). `postgres:10` (10.21), `postgres:13` (13.23) and `postgres:15` (15.19) were used only for version boundaries.

Every script was run on fresh containers by `run-all.sh`, with each input line echoed above its output (`psql -a`, stderr merged inside the container so ordering is exact). The main suite is identical on 14, 16 and 17 except for the documented version differences.

#### Scripts

<details><summary><code>run.sh</code></summary>

```sh
#!/bin/sh
# usage: run.sh <version> <sql-file> — echoes input and merges stderr inside the container so order is preserved
docker exec -i pg$1 sh -c 'psql -U postgres -X -a 2>&1' < "$2"
```

</details>

<details><summary><code>run-all.sh</code></summary>

```sh
#!/bin/sh
# Recreates one container per PostgreSQL version and runs every test script against it.
# Output: transcript-<version>.txt with each command echoed above its output.
set -u
for v in 14 16 17; do
  docker rm -f pg$v >/dev/null 2>&1
  docker run -d --name pg$v -e POSTGRES_PASSWORD=adminpw postgres:$v >/dev/null
done
for v in 10 13 15; do
  docker rm -f pg$v >/dev/null 2>&1
  docker run -d --name pg$v -e POSTGRES_PASSWORD=adminpw postgres:$v >/dev/null
done
for v in 10 13 14 15 16 17; do
  until docker exec pg$v pg_isready -U postgres -q 2>/dev/null && docker exec pg$v psql -U postgres -tAc 'select 1' >/dev/null 2>&1; do sleep 1; done
done
for v in 14 16 17; do
  out=transcript-$v.txt
  {
    echo "################ postgres:$v — $(docker exec pg$v psql -U postgres -tAc 'select version()')"
    echo; echo "======== 01-setup-and-errors.sql"; ./run.sh $v 01-setup-and-errors.sql
    echo; echo "======== 02-connect.sh"; ./02-connect.sh $v
    echo; echo "======== 03-owner-defaults.sql"; ./run.sh $v 03-owner-defaults.sql
    echo; echo "======== 04-inspect.sql"; ./run.sh $v 04-inspect.sql
    echo; echo "======== 06-predefined.sql"; ./run.sh $v 06-predefined.sql
  } > $out 2>&1
done
for v in 10 13 14 15 16 17; do
  { echo "################ postgres:$v"; ./run.sh $v 05-versions.sql; } > versions-$v.txt 2>&1
done
for v in 14 15 16 17; do
  { echo "################ postgres:$v"; ./run.sh $v 07-extra.sql; } > extra-$v.txt 2>&1
done
```

</details>

<details><summary><code>01-setup-and-errors.sql</code></summary>

```sql
-- Shop/checkout schema from the tutorial, then each "permission denied" case.
SELECT current_setting('server_version_num')::int >= 160000 AS pg16 \gset
SHOW server_version;

CREATE ROLE shop_owner NOLOGIN;
CREATE ROLE shop_checkout NOLOGIN;
CREATE ROLE checkout_app LOGIN PASSWORD 'checkout-pw'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
\if :pg16
GRANT shop_checkout TO checkout_app WITH INHERIT TRUE;
\else
GRANT shop_checkout TO checkout_app;
\endif

CREATE DATABASE shop OWNER shop_owner;
REVOKE CONNECT, TEMPORARY ON DATABASE shop FROM PUBLIC;
\connect shop
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

SET ROLE shop_owner;
CREATE SCHEMA sales AUTHORIZATION shop_owner;
CREATE TABLE sales.orders (
  id bigserial PRIMARY KEY,
  tenant_id uuid NOT NULL,
  customer_name text NOT NULL,
  total numeric(12, 2) NOT NULL CHECK (total >= 0),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'shipped'))
);
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Asha', 1200.00),
  ('22222222-2222-2222-2222-222222222222', 'Ravi', 850.00);
RESET ROLE;

-- [schema] No USAGE on sales: schema-qualified name
SET ROLE checkout_app;
SELECT id, customer_name, total FROM sales.orders;
-- [schema] No USAGE on sales: unqualified name through search_path
SET search_path = sales;
SELECT id, customer_name, total FROM orders;
RESET search_path;
RESET ROLE;

-- [table] USAGE granted, SELECT missing
GRANT USAGE ON SCHEMA sales TO shop_checkout;
SET ROLE checkout_app;
SELECT id, customer_name, total FROM sales.orders;
RESET ROLE;

-- [database] GRANT ALL on the database does not reach tables
GRANT ALL PRIVILEGES ON DATABASE shop TO shop_checkout;
SET ROLE checkout_app;
SELECT id, customer_name, total FROM sales.orders;
RESET ROLE;
REVOKE ALL PRIVILEGES ON DATABASE shop FROM shop_checkout;

-- [table] fix and confirm
GRANT SELECT ON TABLE sales.orders TO shop_checkout;
SELECT has_table_privilege('checkout_app', 'sales.orders', 'SELECT') AS can_read;
SET ROLE checkout_app;
SELECT id, customer_name, total FROM sales.orders ORDER BY id;
-- INSERT still missing
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00);
RESET ROLE;

-- [sequence] bigserial: INSERT granted, sequence USAGE missing
GRANT INSERT (tenant_id, customer_name, total) ON TABLE sales.orders TO shop_checkout;
SET ROLE checkout_app;
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
RESET ROLE;

-- [sequence] what does the column default call?
SELECT column_name, column_default, is_identity
FROM information_schema.columns
WHERE table_schema = 'sales' AND table_name = 'orders' AND column_name = 'id';

-- [sequence] USAGE alone is enough for nextval()
GRANT USAGE ON SEQUENCE sales.orders_id_seq TO shop_checkout;
SET ROLE checkout_app;
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
SELECT currval('sales.orders_id_seq');
RESET ROLE;
REVOKE USAGE ON SEQUENCE sales.orders_id_seq FROM shop_checkout;

-- [sequence] SELECT alone on the sequence does not allow nextval()
GRANT SELECT ON SEQUENCE sales.orders_id_seq TO shop_checkout;
SET ROLE checkout_app;
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Sana', 300.00)
RETURNING id;
RESET ROLE;
REVOKE SELECT ON SEQUENCE sales.orders_id_seq FROM shop_checkout;

-- [sequence] identity column: no sequence grant at all
SET ROLE shop_owner;
CREATE TABLE sales.payments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id bigint NOT NULL,
  amount numeric(12, 2) NOT NULL
);
RESET ROLE;
GRANT SELECT, INSERT ON TABLE sales.payments TO shop_checkout;
SELECT pg_get_serial_sequence('sales.payments', 'id') AS identity_sequence;
SELECT has_sequence_privilege('checkout_app', 'sales.payments_id_seq', 'USAGE') AS has_seq_usage;
SET ROLE checkout_app;
INSERT INTO sales.payments (order_id, amount) VALUES (1, 1200.00) RETURNING id;
-- calling nextval() directly on the identity sequence is still checked
SELECT nextval('sales.payments_id_seq');
RESET ROLE;

-- [sequence] identity column with GENERATED BY DEFAULT
SET ROLE shop_owner;
CREATE TABLE sales.refunds (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  order_id bigint NOT NULL
);
RESET ROLE;
GRANT INSERT ON TABLE sales.refunds TO shop_checkout;
SET ROLE checkout_app;
INSERT INTO sales.refunds (order_id) VALUES (1);
RESET ROLE;

-- [sequence] ALL SEQUENCES IN SCHEMA form
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sales TO shop_checkout;
SELECT has_sequence_privilege('checkout_app', 'sales.orders_id_seq', 'USAGE') AS can_generate_id;
SET ROLE checkout_app;
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
RESET ROLE;

-- [schema] creating objects needs CREATE on the schema
SET ROLE checkout_app;
CREATE TABLE sales.scratch (id int);
RESET ROLE;

-- [owner] DDL needs ownership
SET ROLE checkout_app;
ALTER TABLE sales.orders ADD COLUMN internal_note text;
RESET ROLE;

-- [createdb]
SET ROLE checkout_app;
CREATE DATABASE checkout_scratch;
RESET ROLE;

-- [rls] a policy with no tenant context returns zero rows, not an error
SET ROLE shop_owner;
ALTER TABLE sales.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY checkout_orders ON sales.orders
  FOR ALL TO shop_checkout
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
RESET ROLE;
SET ROLE checkout_app;
SELECT count(*) AS visible_orders FROM sales.orders;
BEGIN;
SET LOCAL app.tenant_id = '11111111-1111-1111-1111-111111111111';
SELECT count(*) AS visible_orders FROM sales.orders;
ROLLBACK;
RESET ROLE;
SELECT relname, relrowsecurity FROM pg_class WHERE oid = 'sales.orders'::regclass;
SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'orders';
```

</details>

<details><summary><code>02-connect.sh</code></summary>

```sh
#!/bin/sh
# Database-level errors: CONNECT, CREATEDB, and pg_hba.conf. Run after 01 on a container named pg$1.
V=$1
run() { echo "\$ $*"; docker exec pg$V sh -c "$* 2>&1"; echo; }
echo "== postgres:$V: checkout_app connects over TCP before CONNECT is granted"
run "PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'SELECT current_user'"
echo "== grant CONNECT to the group role and retry"
run "psql -U postgres -X -d shop -c 'GRANT CONNECT ON DATABASE shop TO shop_checkout'"
run "PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'SELECT current_user, current_database()'"
run "psql -U postgres -X -d shop -c \"SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT') AS can_connect\""
echo "== pg_hba.conf with no matching line for this host/user/database"
run "cp /var/lib/postgresql/data/pg_hba.conf /tmp/pg_hba.backup"
run "printf 'local all all trust\nhost shop shop_owner 10.0.0.0/8 scram-sha-256\n' > /var/lib/postgresql/data/pg_hba.conf && psql -U postgres -X -tAc 'SELECT pg_reload_conf()'"
run "PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'SELECT 1'"
run "cp /tmp/pg_hba.backup /var/lib/postgresql/data/pg_hba.conf && psql -U postgres -X -tAc 'SELECT pg_reload_conf()'"
echo "== CREATEDB attribute"
run "PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'CREATE DATABASE checkout_scratch'"
run "psql -U postgres -X -c 'ALTER ROLE checkout_app CREATEDB'"
run "PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'CREATE DATABASE checkout_scratch'"
run "psql -U postgres -X -c 'DROP DATABASE checkout_scratch' -c 'ALTER ROLE checkout_app NOCREATEDB'"
```

</details>

<details><summary><code>03-owner-defaults.sql</code></summary>

```sql
-- Ownership, membership in the owning role, ALL TABLES IN SCHEMA, and default privileges. Runs after 01 and 02.
SELECT current_setting('server_version_num')::int >= 160000 AS pg16 \gset
\connect shop
CREATE ROLE migrator LOGIN;

-- [schema] CREATE alone does not include USAGE: naming an existing table still fails on the schema
GRANT CREATE ON SCHEMA sales TO migrator;
SET ROLE migrator;
ALTER TABLE sales.orders ADD COLUMN internal_note text;
RESET ROLE;
GRANT USAGE ON SCHEMA sales TO migrator;

-- [owner] a non-owner cannot change the table
SET ROLE migrator;
ALTER TABLE sales.orders ADD COLUMN internal_note text;
RESET ROLE;

-- [owner] membership in the owning role is enough
\if :pg16
GRANT shop_owner TO migrator WITH INHERIT TRUE, SET TRUE;
\else
GRANT shop_owner TO migrator;
\endif
SET ROLE migrator;
ALTER TABLE sales.orders ADD COLUMN internal_note text;
ALTER TABLE sales.orders DROP COLUMN internal_note;
RESET ROLE;

-- [owner] transferring ownership
SET ROLE shop_owner;
CREATE TABLE sales.coupons (code text PRIMARY KEY);
RESET ROLE;
ALTER TABLE sales.coupons OWNER TO migrator;
SELECT tableowner FROM pg_tables WHERE schemaname = 'sales' AND tablename = 'coupons';
ALTER TABLE sales.coupons OWNER TO shop_owner;
SELECT tableowner FROM pg_tables WHERE schemaname = 'sales' AND tablename = 'coupons';
-- a plain member must be able to become the new owner to hand a table over
SET ROLE checkout_app;
ALTER TABLE sales.coupons OWNER TO checkout_app;
RESET ROLE;

-- [all tables] covers only tables that exist when it runs
GRANT SELECT ON ALL TABLES IN SCHEMA sales TO shop_checkout;
SET ROLE shop_owner;
CREATE TABLE sales.shipments (order_id bigint NOT NULL, carrier text);
RESET ROLE;
SET ROLE checkout_app;
SELECT * FROM sales.coupons;
SELECT * FROM sales.shipments;
RESET ROLE;

-- [default privileges] FOR ROLE shop_owner applies to objects shop_owner creates later
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT SELECT ON TABLES TO shop_checkout;
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT USAGE ON SEQUENCES TO shop_checkout;
SET ROLE shop_owner;
CREATE TABLE sales.invoices (id bigserial PRIMARY KEY, order_id bigint NOT NULL);
RESET ROLE;
SET ROLE checkout_app;
SELECT * FROM sales.invoices;
SELECT has_sequence_privilege('sales.invoices_id_seq', 'USAGE') AS can_use_invoice_seq;
RESET ROLE;

-- [default privileges trap] the migration creates the table as itself
SET ROLE migrator;
CREATE TABLE sales.returns (order_id bigint NOT NULL);
RESET ROLE;
SELECT tablename, tableowner FROM pg_tables WHERE schemaname = 'sales' AND tablename IN ('invoices', 'returns') ORDER BY 1;
SET ROLE checkout_app;
SELECT * FROM sales.returns;
RESET ROLE;

-- [default privileges trap] the same migration with SET ROLE shop_owner
SET ROLE migrator;
SET ROLE shop_owner;
CREATE TABLE sales.exchanges (order_id bigint NOT NULL);
RESET ROLE;
SET ROLE checkout_app;
SELECT * FROM sales.exchanges;
RESET ROLE;

-- [default privileges] without FOR ROLE they apply to objects the current role creates
SET ROLE migrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA sales GRANT SELECT ON TABLES TO shop_checkout;
CREATE TABLE sales.migrator_notes (body text);
RESET ROLE;
SET ROLE checkout_app;
SELECT * FROM sales.migrator_notes;
RESET ROLE;

-- [default privileges] inspect them
\ddp
SELECT pg_get_userbyid(d.defaclrole) AS creator, n.nspname AS schema, d.defaclobjtype AS object_type, d.defaclacl
FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace;
```

</details>

<details><summary><code>04-inspect.sql</code></summary>

```sql
-- How to check existing privileges. Runs after 01-03 (orders RLS on, defaults set).
\connect shop
\dp sales.orders
\z sales.order*
\du shop_checkout|checkout_app|shop_owner
\l shop
\dn+ sales

-- direct table grants recorded for a role
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee IN ('shop_checkout', 'checkout_app')
  AND table_schema = 'sales'
ORDER BY grantee, table_name, privilege_type;

-- column grants are listed separately
SELECT grantee, table_name, column_name, privilege_type
FROM information_schema.column_privileges
WHERE grantee = 'shop_checkout' AND table_schema = 'sales' AND table_name = 'orders'
ORDER BY privilege_type, column_name;

-- effective privileges, including those inherited through role membership
SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT') AS can_connect,
       has_schema_privilege('checkout_app', 'sales', 'USAGE') AS can_use_schema,
       has_schema_privilege('checkout_app', 'sales', 'CREATE') AS can_create_in_schema,
       has_table_privilege('checkout_app', 'sales.orders', 'SELECT') AS can_read_orders;

-- everything one role can do on one table
SELECT p.privilege,
       has_table_privilege('checkout_app', 'sales.orders', p.privilege) AS granted
FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) AS p(privilege);

-- column-level grants: table-level INSERT is false, any-column INSERT is true
SELECT has_table_privilege('checkout_app', 'sales.orders', 'INSERT') AS table_insert,
       has_any_column_privilege('checkout_app', 'sales.orders', 'INSERT') AS any_column_insert,
       has_column_privilege('checkout_app', 'sales.orders', 'total', 'INSERT') AS total_insert;

-- MySQL's SHOW GRANTS does not exist in PostgreSQL
SHOW GRANTS FOR checkout_app;

-- membership: which roles checkout_app inherits from
SELECT r.rolname AS member, g.rolname AS member_of
FROM pg_auth_members m
JOIN pg_roles r ON r.oid = m.member
JOIN pg_roles g ON g.oid = m.roleid
WHERE r.rolname = 'checkout_app';
```

</details>

<details><summary><code>05-versions.sql</code></summary>

```sql
-- Version-sensitive behaviour: CREATE on the public schema, predefined data roles, and error wording.
SHOW server_version;
DROP DATABASE IF EXISTS fresh;
DROP ROLE IF EXISTS reporting;
DROP ROLE IF EXISTS app_user;
CREATE DATABASE fresh;
CREATE ROLE app_user LOGIN;
\l fresh
SELECT has_database_privilege('app_user', 'fresh', 'CONNECT') AS app_user_can_connect,
       has_database_privilege('app_user', 'fresh', 'TEMPORARY') AS app_user_can_create_temp;
\connect fresh
\dn+ public
SET ROLE app_user;
CREATE TABLE public.notes (body text);
RESET ROLE;

-- predefined roles that grant read or write on every table
SELECT rolname FROM pg_roles WHERE rolname IN ('pg_read_all_data', 'pg_write_all_data') ORDER BY 1;
CREATE ROLE reporting LOGIN;
GRANT pg_read_all_data TO reporting;

-- error wording for a table the role cannot read
CREATE TABLE secret (id int);
SET ROLE app_user;
SELECT * FROM secret;
RESET ROLE;
```

</details>

<details><summary><code>06-predefined.sql</code></summary>

```sql
-- What pg_read_all_data and pg_write_all_data allow, and whether RLS still applies. Runs after 01-04 in shop.
\connect shop
DROP ROLE IF EXISTS reporting;
DROP ROLE IF EXISTS loader;
CREATE ROLE reporting LOGIN;
CREATE ROLE loader LOGIN;
GRANT CONNECT ON DATABASE shop TO reporting, loader;
GRANT pg_read_all_data TO reporting;
GRANT pg_write_all_data TO loader;
SET ROLE reporting;
SELECT count(*) AS orders_visible_to_reporting FROM sales.orders;
SELECT count(*) AS shipments_visible_to_reporting FROM sales.shipments;
INSERT INTO sales.shipments (order_id) VALUES (1);
RESET ROLE;
SET ROLE loader;
-- RETURNING reads the row, which needs SELECT
INSERT INTO sales.invoices (order_id) VALUES (1) RETURNING id;
-- without RETURNING the write and the bigserial nextval() both succeed
INSERT INTO sales.invoices (order_id) VALUES (1);
SELECT * FROM sales.invoices;
RESET ROLE;
-- 16+: memberships moved from \du to \drg
\drg reporting|loader|checkout_app
```

</details>

<details><summary><code>07-extra.sql</code></summary>

```sql
-- Membership syntax by version, \du vs \drg, and UPDATE ... WHERE needing SELECT. Independent of 01-06.
SHOW server_version;
DROP DATABASE IF EXISTS extra;
DROP ROLE IF EXISTS x_owner;
DROP ROLE IF EXISTS x_migrator;
DROP ROLE IF EXISTS x_writer;
CREATE ROLE x_owner NOLOGIN;
CREATE ROLE x_migrator LOGIN;
CREATE ROLE x_writer LOGIN;
-- 16+ syntax
GRANT x_owner TO x_migrator WITH INHERIT TRUE, SET TRUE;
-- syntax accepted by every tested version
GRANT x_owner TO x_migrator;
\du x_migrator
\drg x_migrator
CREATE DATABASE extra;
\connect extra
CREATE TABLE stock (sku text PRIMARY KEY, qty int NOT NULL);
INSERT INTO stock VALUES ('A', 5);
GRANT UPDATE (qty) ON stock TO x_writer;
SET ROLE x_writer;
-- UPDATE without a WHERE clause needs only UPDATE
UPDATE stock SET qty = 4;
-- a WHERE clause reads sku, which needs SELECT
UPDATE stock SET qty = 3 WHERE sku = 'A';
RESET ROLE;
GRANT SELECT (sku) ON stock TO x_writer;
SET ROLE x_writer;
UPDATE stock SET qty = 3 WHERE sku = 'A';
RESET ROLE;
```

</details>

#### Output

<details><summary>Main suite on <code>postgres:14</code> (scripts 01–04, 06)</summary>

```text
################ postgres:14 — PostgreSQL 14.24 (Debian 14.24-1.pgdg13+2) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit

======== 01-setup-and-errors.sql
-- Shop/checkout schema from the tutorial, then each "permission denied" case.
SELECT current_setting('server_version_num')::int >= 160000 AS pg16 \gset
SHOW server_version;
         server_version          
---------------------------------
 14.24 (Debian 14.24-1.pgdg13+2)
(1 row)

CREATE ROLE shop_owner NOLOGIN;
CREATE ROLE
CREATE ROLE shop_checkout NOLOGIN;
CREATE ROLE
CREATE ROLE checkout_app LOGIN PASSWORD 'checkout-pw'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
CREATE ROLE
\if :pg16
GRANT shop_checkout TO checkout_app WITH INHERIT TRUE;
\else
GRANT shop_checkout TO checkout_app;
GRANT ROLE
\endif
CREATE DATABASE shop OWNER shop_owner;
CREATE DATABASE
REVOKE CONNECT, TEMPORARY ON DATABASE shop FROM PUBLIC;
REVOKE
\connect shop
You are now connected to database "shop" as user "postgres".
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE
SET ROLE shop_owner;
SET
CREATE SCHEMA sales AUTHORIZATION shop_owner;
CREATE SCHEMA
CREATE TABLE sales.orders (
  id bigserial PRIMARY KEY,
  tenant_id uuid NOT NULL,
  customer_name text NOT NULL,
  total numeric(12, 2) NOT NULL CHECK (total >= 0),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'shipped'))
);
CREATE TABLE
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Asha', 1200.00),
  ('22222222-2222-2222-2222-222222222222', 'Ravi', 850.00);
INSERT 0 2
RESET ROLE;
RESET
-- [schema] No USAGE on sales: schema-qualified name
SET ROLE checkout_app;
SET
SELECT id, customer_name, total FROM sales.orders;
ERROR:  permission denied for schema sales
LINE 1: SELECT id, customer_name, total FROM sales.orders;
                                             ^
-- [schema] No USAGE on sales: unqualified name through search_path
SET search_path = sales;
SET
SELECT id, customer_name, total FROM orders;
ERROR:  relation "orders" does not exist
LINE 1: SELECT id, customer_name, total FROM orders;
                                             ^
RESET search_path;
RESET
RESET ROLE;
RESET
-- [table] USAGE granted, SELECT missing
GRANT USAGE ON SCHEMA sales TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
SELECT id, customer_name, total FROM sales.orders;
ERROR:  permission denied for table orders
RESET ROLE;
RESET
-- [database] GRANT ALL on the database does not reach tables
GRANT ALL PRIVILEGES ON DATABASE shop TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
SELECT id, customer_name, total FROM sales.orders;
ERROR:  permission denied for table orders
RESET ROLE;
RESET
REVOKE ALL PRIVILEGES ON DATABASE shop FROM shop_checkout;
REVOKE
-- [table] fix and confirm
GRANT SELECT ON TABLE sales.orders TO shop_checkout;
GRANT
SELECT has_table_privilege('checkout_app', 'sales.orders', 'SELECT') AS can_read;
 can_read 
----------
 t
(1 row)

SET ROLE checkout_app;
SET
SELECT id, customer_name, total FROM sales.orders ORDER BY id;
 id | customer_name |  total  
----+---------------+---------
  1 | Asha          | 1200.00
  2 | Ravi          |  850.00
(2 rows)

-- INSERT still missing
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00);
ERROR:  permission denied for table orders
RESET ROLE;
RESET
-- [sequence] bigserial: INSERT granted, sequence USAGE missing
GRANT INSERT (tenant_id, customer_name, total) ON TABLE sales.orders TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
ERROR:  permission denied for sequence orders_id_seq
RESET ROLE;
RESET
-- [sequence] what does the column default call?
SELECT column_name, column_default, is_identity
FROM information_schema.columns
WHERE table_schema = 'sales' AND table_name = 'orders' AND column_name = 'id';
 column_name |              column_default              | is_identity 
-------------+------------------------------------------+-------------
 id          | nextval('sales.orders_id_seq'::regclass) | NO
(1 row)

-- [sequence] USAGE alone is enough for nextval()
GRANT USAGE ON SEQUENCE sales.orders_id_seq TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
 id | status  
----+---------
  3 | pending
(1 row)

INSERT 0 1
SELECT currval('sales.orders_id_seq');
 currval 
---------
       3
(1 row)

RESET ROLE;
RESET
REVOKE USAGE ON SEQUENCE sales.orders_id_seq FROM shop_checkout;
REVOKE
-- [sequence] SELECT alone on the sequence does not allow nextval()
GRANT SELECT ON SEQUENCE sales.orders_id_seq TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Sana', 300.00)
RETURNING id;
ERROR:  permission denied for sequence orders_id_seq
RESET ROLE;
RESET
REVOKE SELECT ON SEQUENCE sales.orders_id_seq FROM shop_checkout;
REVOKE
-- [sequence] identity column: no sequence grant at all
SET ROLE shop_owner;
SET
CREATE TABLE sales.payments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id bigint NOT NULL,
  amount numeric(12, 2) NOT NULL
);
CREATE TABLE
RESET ROLE;
RESET
GRANT SELECT, INSERT ON TABLE sales.payments TO shop_checkout;
GRANT
SELECT pg_get_serial_sequence('sales.payments', 'id') AS identity_sequence;
   identity_sequence   
-----------------------
 sales.payments_id_seq
(1 row)

SELECT has_sequence_privilege('checkout_app', 'sales.payments_id_seq', 'USAGE') AS has_seq_usage;
 has_seq_usage 
---------------
 f
(1 row)

SET ROLE checkout_app;
SET
INSERT INTO sales.payments (order_id, amount) VALUES (1, 1200.00) RETURNING id;
 id 
----
  1
(1 row)

INSERT 0 1
-- calling nextval() directly on the identity sequence is still checked
SELECT nextval('sales.payments_id_seq');
ERROR:  permission denied for sequence payments_id_seq
RESET ROLE;
RESET
-- [sequence] identity column with GENERATED BY DEFAULT
SET ROLE shop_owner;
SET
CREATE TABLE sales.refunds (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  order_id bigint NOT NULL
);
CREATE TABLE
RESET ROLE;
RESET
GRANT INSERT ON TABLE sales.refunds TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
INSERT INTO sales.refunds (order_id) VALUES (1);
INSERT 0 1
RESET ROLE;
RESET
-- [sequence] ALL SEQUENCES IN SCHEMA form
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sales TO shop_checkout;
GRANT
SELECT has_sequence_privilege('checkout_app', 'sales.orders_id_seq', 'USAGE') AS can_generate_id;
 can_generate_id 
-----------------
 t
(1 row)

SET ROLE checkout_app;
SET
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
 id | status  
----+---------
  4 | pending
(1 row)

INSERT 0 1
RESET ROLE;
RESET
-- [schema] creating objects needs CREATE on the schema
SET ROLE checkout_app;
SET
CREATE TABLE sales.scratch (id int);
ERROR:  permission denied for schema sales
LINE 1: CREATE TABLE sales.scratch (id int);
                     ^
RESET ROLE;
RESET
-- [owner] DDL needs ownership
SET ROLE checkout_app;
SET
ALTER TABLE sales.orders ADD COLUMN internal_note text;
ERROR:  must be owner of table orders
RESET ROLE;
RESET
-- [createdb]
SET ROLE checkout_app;
SET
CREATE DATABASE checkout_scratch;
ERROR:  permission denied to create database
RESET ROLE;
RESET
-- [rls] a policy with no tenant context returns zero rows, not an error
SET ROLE shop_owner;
SET
ALTER TABLE sales.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE
CREATE POLICY checkout_orders ON sales.orders
  FOR ALL TO shop_checkout
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
CREATE POLICY
RESET ROLE;
RESET
SET ROLE checkout_app;
SET
SELECT count(*) AS visible_orders FROM sales.orders;
 visible_orders 
----------------
              0
(1 row)

BEGIN;
BEGIN
SET LOCAL app.tenant_id = '11111111-1111-1111-1111-111111111111';
SET
SELECT count(*) AS visible_orders FROM sales.orders;
 visible_orders 
----------------
              3
(1 row)

ROLLBACK;
ROLLBACK
RESET ROLE;
RESET
SELECT relname, relrowsecurity FROM pg_class WHERE oid = 'sales.orders'::regclass;
 relname | relrowsecurity 
---------+----------------
 orders  | t
(1 row)

SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'orders';
   policyname    |      roles      | cmd 
-----------------+-----------------+-----
 checkout_orders | {shop_checkout} | ALL
(1 row)


======== 02-connect.sh
== postgres:14: checkout_app connects over TCP before CONNECT is granted
$ PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'SELECT current_user'
psql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  permission denied for database "shop"
DETAIL:  User does not have CONNECT privilege.

== grant CONNECT to the group role and retry
$ psql -U postgres -X -d shop -c 'GRANT CONNECT ON DATABASE shop TO shop_checkout'
GRANT

$ PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'SELECT current_user, current_database()'
 current_user | current_database 
--------------+------------------
 checkout_app | shop
(1 row)


$ psql -U postgres -X -d shop -c "SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT') AS can_connect"
 can_connect 
-------------
 t
(1 row)


== pg_hba.conf with no matching line for this host/user/database
$ cp /var/lib/postgresql/data/pg_hba.conf /tmp/pg_hba.backup

$ printf 'local all all trust
host shop shop_owner 10.0.0.0/8 scram-sha-256
' > /var/lib/postgresql/data/pg_hba.conf && psql -U postgres -X -tAc 'SELECT pg_reload_conf()'
t

$ PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'SELECT 1'
psql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  no pg_hba.conf entry for host "127.0.0.1", user "checkout_app", database "shop", no encryption

$ cp /tmp/pg_hba.backup /var/lib/postgresql/data/pg_hba.conf && psql -U postgres -X -tAc 'SELECT pg_reload_conf()'
t

== CREATEDB attribute
$ PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'CREATE DATABASE checkout_scratch'
ERROR:  permission denied to create database

$ psql -U postgres -X -c 'ALTER ROLE checkout_app CREATEDB'
ALTER ROLE

$ PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'CREATE DATABASE checkout_scratch'
CREATE DATABASE

$ psql -U postgres -X -c 'DROP DATABASE checkout_scratch' -c 'ALTER ROLE checkout_app NOCREATEDB'
DROP DATABASE
ALTER ROLE


======== 03-owner-defaults.sql
-- Ownership, membership in the owning role, ALL TABLES IN SCHEMA, and default privileges. Runs after 01 and 02.
SELECT current_setting('server_version_num')::int >= 160000 AS pg16 \gset
\connect shop
You are now connected to database "shop" as user "postgres".
CREATE ROLE migrator LOGIN;
CREATE ROLE
-- [schema] CREATE alone does not include USAGE: naming an existing table still fails on the schema
GRANT CREATE ON SCHEMA sales TO migrator;
GRANT
SET ROLE migrator;
SET
ALTER TABLE sales.orders ADD COLUMN internal_note text;
ERROR:  permission denied for schema sales
RESET ROLE;
RESET
GRANT USAGE ON SCHEMA sales TO migrator;
GRANT
-- [owner] a non-owner cannot change the table
SET ROLE migrator;
SET
ALTER TABLE sales.orders ADD COLUMN internal_note text;
ERROR:  must be owner of table orders
RESET ROLE;
RESET
-- [owner] membership in the owning role is enough
\if :pg16
GRANT shop_owner TO migrator WITH INHERIT TRUE, SET TRUE;
\else
GRANT shop_owner TO migrator;
GRANT ROLE
\endif
SET ROLE migrator;
SET
ALTER TABLE sales.orders ADD COLUMN internal_note text;
ALTER TABLE
ALTER TABLE sales.orders DROP COLUMN internal_note;
ALTER TABLE
RESET ROLE;
RESET
-- [owner] transferring ownership
SET ROLE shop_owner;
SET
CREATE TABLE sales.coupons (code text PRIMARY KEY);
CREATE TABLE
RESET ROLE;
RESET
ALTER TABLE sales.coupons OWNER TO migrator;
ALTER TABLE
SELECT tableowner FROM pg_tables WHERE schemaname = 'sales' AND tablename = 'coupons';
 tableowner 
------------
 migrator
(1 row)

ALTER TABLE sales.coupons OWNER TO shop_owner;
ALTER TABLE
SELECT tableowner FROM pg_tables WHERE schemaname = 'sales' AND tablename = 'coupons';
 tableowner 
------------
 shop_owner
(1 row)

-- a plain member must be able to become the new owner to hand a table over
SET ROLE checkout_app;
SET
ALTER TABLE sales.coupons OWNER TO checkout_app;
ERROR:  must be owner of table coupons
RESET ROLE;
RESET
-- [all tables] covers only tables that exist when it runs
GRANT SELECT ON ALL TABLES IN SCHEMA sales TO shop_checkout;
GRANT
SET ROLE shop_owner;
SET
CREATE TABLE sales.shipments (order_id bigint NOT NULL, carrier text);
CREATE TABLE
RESET ROLE;
RESET
SET ROLE checkout_app;
SET
SELECT * FROM sales.coupons;
 code 
------
(0 rows)

SELECT * FROM sales.shipments;
ERROR:  permission denied for table shipments
RESET ROLE;
RESET
-- [default privileges] FOR ROLE shop_owner applies to objects shop_owner creates later
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT SELECT ON TABLES TO shop_checkout;
ALTER DEFAULT PRIVILEGES
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT USAGE ON SEQUENCES TO shop_checkout;
ALTER DEFAULT PRIVILEGES
SET ROLE shop_owner;
SET
CREATE TABLE sales.invoices (id bigserial PRIMARY KEY, order_id bigint NOT NULL);
CREATE TABLE
RESET ROLE;
RESET
SET ROLE checkout_app;
SET
SELECT * FROM sales.invoices;
 id | order_id 
----+----------
(0 rows)

SELECT has_sequence_privilege('sales.invoices_id_seq', 'USAGE') AS can_use_invoice_seq;
 can_use_invoice_seq 
---------------------
 t
(1 row)

RESET ROLE;
RESET
-- [default privileges trap] the migration creates the table as itself
SET ROLE migrator;
SET
CREATE TABLE sales.returns (order_id bigint NOT NULL);
CREATE TABLE
RESET ROLE;
RESET
SELECT tablename, tableowner FROM pg_tables WHERE schemaname = 'sales' AND tablename IN ('invoices', 'returns') ORDER BY 1;
 tablename | tableowner 
-----------+------------
 invoices  | shop_owner
 returns   | migrator
(2 rows)

SET ROLE checkout_app;
SET
SELECT * FROM sales.returns;
ERROR:  permission denied for table returns
RESET ROLE;
RESET
-- [default privileges trap] the same migration with SET ROLE shop_owner
SET ROLE migrator;
SET
SET ROLE shop_owner;
SET
CREATE TABLE sales.exchanges (order_id bigint NOT NULL);
CREATE TABLE
RESET ROLE;
RESET
SET ROLE checkout_app;
SET
SELECT * FROM sales.exchanges;
 order_id 
----------
(0 rows)

RESET ROLE;
RESET
-- [default privileges] without FOR ROLE they apply to objects the current role creates
SET ROLE migrator;
SET
ALTER DEFAULT PRIVILEGES IN SCHEMA sales GRANT SELECT ON TABLES TO shop_checkout;
ALTER DEFAULT PRIVILEGES
CREATE TABLE sales.migrator_notes (body text);
CREATE TABLE
RESET ROLE;
RESET
SET ROLE checkout_app;
SET
SELECT * FROM sales.migrator_notes;
 body 
------
(0 rows)

RESET ROLE;
RESET
-- [default privileges] inspect them
\ddp
                  Default access privileges
   Owner    | Schema |   Type   |     Access privileges      
------------+--------+----------+----------------------------
 migrator   | sales  | table    | shop_checkout=r/migrator
 shop_owner | sales  | sequence | shop_checkout=U/shop_owner
 shop_owner | sales  | table    | shop_checkout=r/shop_owner
(3 rows)

SELECT pg_get_userbyid(d.defaclrole) AS creator, n.nspname AS schema, d.defaclobjtype AS object_type, d.defaclacl
FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace;
  creator   | schema | object_type |          defaclacl           
------------+--------+-------------+------------------------------
 shop_owner | sales  | r           | {shop_checkout=r/shop_owner}
 shop_owner | sales  | S           | {shop_checkout=U/shop_owner}
 migrator   | sales  | r           | {shop_checkout=r/migrator}
(3 rows)


======== 04-inspect.sql
-- How to check existing privileges. Runs after 01-03 (orders RLS on, defaults set).
\connect shop
You are now connected to database "shop" as user "postgres".
\dp sales.orders
                                                                                  Access privileges
 Schema |  Name  | Type  |       Access privileges       |      Column privileges       |                                          Policies                                           
--------+--------+-------+-------------------------------+------------------------------+---------------------------------------------------------------------------------------------
 sales  | orders | table | shop_owner=arwdDxt/shop_owner+| tenant_id:                  +| checkout_orders:                                                                           +
        |        |       | shop_checkout=r/shop_owner    |   shop_checkout=a/shop_owner+|   (u): (tenant_id = (NULLIF(current_setting('app.tenant_id'::text, true), ''::text))::uuid)+
        |        |       |                               | customer_name:              +|   (c): (tenant_id = (NULLIF(current_setting('app.tenant_id'::text, true), ''::text))::uuid)+
        |        |       |                               |   shop_checkout=a/shop_owner+|   to: shop_checkout
        |        |       |                               | total:                      +| 
        |        |       |                               |   shop_checkout=a/shop_owner | 
(1 row)

\z sales.order*
                                                                                       Access privileges
 Schema |     Name      |   Type   |       Access privileges       |      Column privileges       |                                          Policies                                           
--------+---------------+----------+-------------------------------+------------------------------+---------------------------------------------------------------------------------------------
 sales  | orders        | table    | shop_owner=arwdDxt/shop_owner+| tenant_id:                  +| checkout_orders:                                                                           +
        |               |          | shop_checkout=r/shop_owner    |   shop_checkout=a/shop_owner+|   (u): (tenant_id = (NULLIF(current_setting('app.tenant_id'::text, true), ''::text))::uuid)+
        |               |          |                               | customer_name:              +|   (c): (tenant_id = (NULLIF(current_setting('app.tenant_id'::text, true), ''::text))::uuid)+
        |               |          |                               |   shop_checkout=a/shop_owner+|   to: shop_checkout
        |               |          |                               | total:                      +| 
        |               |          |                               |   shop_checkout=a/shop_owner | 
 sales  | orders_id_seq | sequence | shop_owner=rwU/shop_owner    +|                              | 
        |               |          | shop_checkout=rU/shop_owner   |                              | 
(2 rows)

\du shop_checkout|checkout_app|shop_owner
                 List of roles
   Role name   |  Attributes  |    Member of    
---------------+--------------+-----------------
 checkout_app  |              | {shop_checkout}
 shop_checkout | Cannot login | {}
 shop_owner    | Cannot login | {}

\l shop
                                  List of databases
 Name |   Owner    | Encoding |  Collate   |   Ctype    |     Access privileges      
------+------------+----------+------------+------------+----------------------------
 shop | shop_owner | UTF8     | en_US.utf8 | en_US.utf8 | shop_owner=CTc/shop_owner +
      |            |          |            |            | shop_checkout=c/shop_owner
(1 row)

\dn+ sales
                        List of schemas
 Name  |   Owner    |     Access privileges      | Description 
-------+------------+----------------------------+-------------
 sales | shop_owner | shop_owner=UC/shop_owner  +| 
       |            | shop_checkout=U/shop_owner+| 
       |            | migrator=UC/shop_owner     | 
(1 row)

-- direct table grants recorded for a role
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee IN ('shop_checkout', 'checkout_app')
  AND table_schema = 'sales'
ORDER BY grantee, table_name, privilege_type;
    grantee    | table_schema |   table_name   | privilege_type 
---------------+--------------+----------------+----------------
 shop_checkout | sales        | coupons        | SELECT
 shop_checkout | sales        | exchanges      | SELECT
 shop_checkout | sales        | invoices       | SELECT
 shop_checkout | sales        | migrator_notes | SELECT
 shop_checkout | sales        | orders         | SELECT
 shop_checkout | sales        | payments       | INSERT
 shop_checkout | sales        | payments       | SELECT
 shop_checkout | sales        | refunds        | INSERT
 shop_checkout | sales        | refunds        | SELECT
(9 rows)

-- column grants are listed separately
SELECT grantee, table_name, column_name, privilege_type
FROM information_schema.column_privileges
WHERE grantee = 'shop_checkout' AND table_schema = 'sales' AND table_name = 'orders'
ORDER BY privilege_type, column_name;
    grantee    | table_name |  column_name  | privilege_type 
---------------+------------+---------------+----------------
 shop_checkout | orders     | customer_name | INSERT
 shop_checkout | orders     | tenant_id     | INSERT
 shop_checkout | orders     | total         | INSERT
 shop_checkout | orders     | customer_name | SELECT
 shop_checkout | orders     | id            | SELECT
 shop_checkout | orders     | status        | SELECT
 shop_checkout | orders     | tenant_id     | SELECT
 shop_checkout | orders     | total         | SELECT
(8 rows)

-- effective privileges, including those inherited through role membership
SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT') AS can_connect,
       has_schema_privilege('checkout_app', 'sales', 'USAGE') AS can_use_schema,
       has_schema_privilege('checkout_app', 'sales', 'CREATE') AS can_create_in_schema,
       has_table_privilege('checkout_app', 'sales.orders', 'SELECT') AS can_read_orders;
 can_connect | can_use_schema | can_create_in_schema | can_read_orders 
-------------+----------------+----------------------+-----------------
 t           | t              | f                    | t
(1 row)

-- everything one role can do on one table
SELECT p.privilege,
       has_table_privilege('checkout_app', 'sales.orders', p.privilege) AS granted
FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) AS p(privilege);
 privilege  | granted 
------------+---------
 SELECT     | t
 INSERT     | f
 UPDATE     | f
 DELETE     | f
 TRUNCATE   | f
 REFERENCES | f
 TRIGGER    | f
(7 rows)

-- column-level grants: table-level INSERT is false, any-column INSERT is true
SELECT has_table_privilege('checkout_app', 'sales.orders', 'INSERT') AS table_insert,
       has_any_column_privilege('checkout_app', 'sales.orders', 'INSERT') AS any_column_insert,
       has_column_privilege('checkout_app', 'sales.orders', 'total', 'INSERT') AS total_insert;
 table_insert | any_column_insert | total_insert 
--------------+-------------------+--------------
 f            | t                 | t
(1 row)

-- MySQL's SHOW GRANTS does not exist in PostgreSQL
SHOW GRANTS FOR checkout_app;
ERROR:  syntax error at or near "FOR"
LINE 1: SHOW GRANTS FOR checkout_app;
                    ^
-- membership: which roles checkout_app inherits from
SELECT r.rolname AS member, g.rolname AS member_of
FROM pg_auth_members m
JOIN pg_roles r ON r.oid = m.member
JOIN pg_roles g ON g.oid = m.roleid
WHERE r.rolname = 'checkout_app';
    member    |   member_of   
--------------+---------------
 checkout_app | shop_checkout
(1 row)


======== 06-predefined.sql
-- What pg_read_all_data and pg_write_all_data allow, and whether RLS still applies. Runs after 01-04 in shop.
\connect shop
You are now connected to database "shop" as user "postgres".
DROP ROLE IF EXISTS reporting;
NOTICE:  role "reporting" does not exist, skipping
DROP ROLE
DROP ROLE IF EXISTS loader;
NOTICE:  role "loader" does not exist, skipping
DROP ROLE
CREATE ROLE reporting LOGIN;
CREATE ROLE
CREATE ROLE loader LOGIN;
CREATE ROLE
GRANT CONNECT ON DATABASE shop TO reporting, loader;
GRANT
GRANT pg_read_all_data TO reporting;
GRANT ROLE
GRANT pg_write_all_data TO loader;
GRANT ROLE
SET ROLE reporting;
SET
SELECT count(*) AS orders_visible_to_reporting FROM sales.orders;
 orders_visible_to_reporting 
-----------------------------
                           0
(1 row)

SELECT count(*) AS shipments_visible_to_reporting FROM sales.shipments;
 shipments_visible_to_reporting 
--------------------------------
                              0
(1 row)

INSERT INTO sales.shipments (order_id) VALUES (1);
ERROR:  permission denied for table shipments
RESET ROLE;
RESET
SET ROLE loader;
SET
-- RETURNING reads the row, which needs SELECT
INSERT INTO sales.invoices (order_id) VALUES (1) RETURNING id;
ERROR:  permission denied for table invoices
-- without RETURNING the write and the bigserial nextval() both succeed
INSERT INTO sales.invoices (order_id) VALUES (1);
INSERT 0 1
SELECT * FROM sales.invoices;
ERROR:  permission denied for table invoices
RESET ROLE;
RESET
-- 16+: memberships moved from \du to \drg
\drg reporting|loader|checkout_app
invalid command \drg
```

</details>

<details><summary>Main suite on <code>postgres:16</code> (scripts 01–04, 06)</summary>

```text
################ postgres:16 — PostgreSQL 16.15 (Debian 16.15-1.pgdg13+2) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit

======== 01-setup-and-errors.sql
-- Shop/checkout schema from the tutorial, then each "permission denied" case.
SELECT current_setting('server_version_num')::int >= 160000 AS pg16 \gset
SHOW server_version;
         server_version          
---------------------------------
 16.15 (Debian 16.15-1.pgdg13+2)
(1 row)

CREATE ROLE shop_owner NOLOGIN;
CREATE ROLE
CREATE ROLE shop_checkout NOLOGIN;
CREATE ROLE
CREATE ROLE checkout_app LOGIN PASSWORD 'checkout-pw'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
CREATE ROLE
\if :pg16
GRANT shop_checkout TO checkout_app WITH INHERIT TRUE;
GRANT ROLE
\else
GRANT shop_checkout TO checkout_app;
\endif
CREATE DATABASE shop OWNER shop_owner;
CREATE DATABASE
REVOKE CONNECT, TEMPORARY ON DATABASE shop FROM PUBLIC;
REVOKE
\connect shop
You are now connected to database "shop" as user "postgres".
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE
SET ROLE shop_owner;
SET
CREATE SCHEMA sales AUTHORIZATION shop_owner;
CREATE SCHEMA
CREATE TABLE sales.orders (
  id bigserial PRIMARY KEY,
  tenant_id uuid NOT NULL,
  customer_name text NOT NULL,
  total numeric(12, 2) NOT NULL CHECK (total >= 0),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'shipped'))
);
CREATE TABLE
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Asha', 1200.00),
  ('22222222-2222-2222-2222-222222222222', 'Ravi', 850.00);
INSERT 0 2
RESET ROLE;
RESET
-- [schema] No USAGE on sales: schema-qualified name
SET ROLE checkout_app;
SET
SELECT id, customer_name, total FROM sales.orders;
ERROR:  permission denied for schema sales
LINE 1: SELECT id, customer_name, total FROM sales.orders;
                                             ^
-- [schema] No USAGE on sales: unqualified name through search_path
SET search_path = sales;
SET
SELECT id, customer_name, total FROM orders;
ERROR:  relation "orders" does not exist
LINE 1: SELECT id, customer_name, total FROM orders;
                                             ^
RESET search_path;
RESET
RESET ROLE;
RESET
-- [table] USAGE granted, SELECT missing
GRANT USAGE ON SCHEMA sales TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
SELECT id, customer_name, total FROM sales.orders;
ERROR:  permission denied for table orders
RESET ROLE;
RESET
-- [database] GRANT ALL on the database does not reach tables
GRANT ALL PRIVILEGES ON DATABASE shop TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
SELECT id, customer_name, total FROM sales.orders;
ERROR:  permission denied for table orders
RESET ROLE;
RESET
REVOKE ALL PRIVILEGES ON DATABASE shop FROM shop_checkout;
REVOKE
-- [table] fix and confirm
GRANT SELECT ON TABLE sales.orders TO shop_checkout;
GRANT
SELECT has_table_privilege('checkout_app', 'sales.orders', 'SELECT') AS can_read;
 can_read 
----------
 t
(1 row)

SET ROLE checkout_app;
SET
SELECT id, customer_name, total FROM sales.orders ORDER BY id;
 id | customer_name |  total  
----+---------------+---------
  1 | Asha          | 1200.00
  2 | Ravi          |  850.00
(2 rows)

-- INSERT still missing
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00);
ERROR:  permission denied for table orders
RESET ROLE;
RESET
-- [sequence] bigserial: INSERT granted, sequence USAGE missing
GRANT INSERT (tenant_id, customer_name, total) ON TABLE sales.orders TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
ERROR:  permission denied for sequence orders_id_seq
RESET ROLE;
RESET
-- [sequence] what does the column default call?
SELECT column_name, column_default, is_identity
FROM information_schema.columns
WHERE table_schema = 'sales' AND table_name = 'orders' AND column_name = 'id';
 column_name |              column_default              | is_identity 
-------------+------------------------------------------+-------------
 id          | nextval('sales.orders_id_seq'::regclass) | NO
(1 row)

-- [sequence] USAGE alone is enough for nextval()
GRANT USAGE ON SEQUENCE sales.orders_id_seq TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
 id | status  
----+---------
  3 | pending
(1 row)

INSERT 0 1
SELECT currval('sales.orders_id_seq');
 currval 
---------
       3
(1 row)

RESET ROLE;
RESET
REVOKE USAGE ON SEQUENCE sales.orders_id_seq FROM shop_checkout;
REVOKE
-- [sequence] SELECT alone on the sequence does not allow nextval()
GRANT SELECT ON SEQUENCE sales.orders_id_seq TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Sana', 300.00)
RETURNING id;
ERROR:  permission denied for sequence orders_id_seq
RESET ROLE;
RESET
REVOKE SELECT ON SEQUENCE sales.orders_id_seq FROM shop_checkout;
REVOKE
-- [sequence] identity column: no sequence grant at all
SET ROLE shop_owner;
SET
CREATE TABLE sales.payments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id bigint NOT NULL,
  amount numeric(12, 2) NOT NULL
);
CREATE TABLE
RESET ROLE;
RESET
GRANT SELECT, INSERT ON TABLE sales.payments TO shop_checkout;
GRANT
SELECT pg_get_serial_sequence('sales.payments', 'id') AS identity_sequence;
   identity_sequence   
-----------------------
 sales.payments_id_seq
(1 row)

SELECT has_sequence_privilege('checkout_app', 'sales.payments_id_seq', 'USAGE') AS has_seq_usage;
 has_seq_usage 
---------------
 f
(1 row)

SET ROLE checkout_app;
SET
INSERT INTO sales.payments (order_id, amount) VALUES (1, 1200.00) RETURNING id;
 id 
----
  1
(1 row)

INSERT 0 1
-- calling nextval() directly on the identity sequence is still checked
SELECT nextval('sales.payments_id_seq');
ERROR:  permission denied for sequence payments_id_seq
RESET ROLE;
RESET
-- [sequence] identity column with GENERATED BY DEFAULT
SET ROLE shop_owner;
SET
CREATE TABLE sales.refunds (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  order_id bigint NOT NULL
);
CREATE TABLE
RESET ROLE;
RESET
GRANT INSERT ON TABLE sales.refunds TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
INSERT INTO sales.refunds (order_id) VALUES (1);
INSERT 0 1
RESET ROLE;
RESET
-- [sequence] ALL SEQUENCES IN SCHEMA form
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sales TO shop_checkout;
GRANT
SELECT has_sequence_privilege('checkout_app', 'sales.orders_id_seq', 'USAGE') AS can_generate_id;
 can_generate_id 
-----------------
 t
(1 row)

SET ROLE checkout_app;
SET
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
 id | status  
----+---------
  4 | pending
(1 row)

INSERT 0 1
RESET ROLE;
RESET
-- [schema] creating objects needs CREATE on the schema
SET ROLE checkout_app;
SET
CREATE TABLE sales.scratch (id int);
ERROR:  permission denied for schema sales
LINE 1: CREATE TABLE sales.scratch (id int);
                     ^
RESET ROLE;
RESET
-- [owner] DDL needs ownership
SET ROLE checkout_app;
SET
ALTER TABLE sales.orders ADD COLUMN internal_note text;
ERROR:  must be owner of table orders
RESET ROLE;
RESET
-- [createdb]
SET ROLE checkout_app;
SET
CREATE DATABASE checkout_scratch;
ERROR:  permission denied to create database
RESET ROLE;
RESET
-- [rls] a policy with no tenant context returns zero rows, not an error
SET ROLE shop_owner;
SET
ALTER TABLE sales.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE
CREATE POLICY checkout_orders ON sales.orders
  FOR ALL TO shop_checkout
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
CREATE POLICY
RESET ROLE;
RESET
SET ROLE checkout_app;
SET
SELECT count(*) AS visible_orders FROM sales.orders;
 visible_orders 
----------------
              0
(1 row)

BEGIN;
BEGIN
SET LOCAL app.tenant_id = '11111111-1111-1111-1111-111111111111';
SET
SELECT count(*) AS visible_orders FROM sales.orders;
 visible_orders 
----------------
              3
(1 row)

ROLLBACK;
ROLLBACK
RESET ROLE;
RESET
SELECT relname, relrowsecurity FROM pg_class WHERE oid = 'sales.orders'::regclass;
 relname | relrowsecurity 
---------+----------------
 orders  | t
(1 row)

SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'orders';
   policyname    |      roles      | cmd 
-----------------+-----------------+-----
 checkout_orders | {shop_checkout} | ALL
(1 row)


======== 02-connect.sh
== postgres:16: checkout_app connects over TCP before CONNECT is granted
$ PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'SELECT current_user'
psql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  permission denied for database "shop"
DETAIL:  User does not have CONNECT privilege.

== grant CONNECT to the group role and retry
$ psql -U postgres -X -d shop -c 'GRANT CONNECT ON DATABASE shop TO shop_checkout'
GRANT

$ PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'SELECT current_user, current_database()'
 current_user | current_database 
--------------+------------------
 checkout_app | shop
(1 row)


$ psql -U postgres -X -d shop -c "SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT') AS can_connect"
 can_connect 
-------------
 t
(1 row)


== pg_hba.conf with no matching line for this host/user/database
$ cp /var/lib/postgresql/data/pg_hba.conf /tmp/pg_hba.backup

$ printf 'local all all trust
host shop shop_owner 10.0.0.0/8 scram-sha-256
' > /var/lib/postgresql/data/pg_hba.conf && psql -U postgres -X -tAc 'SELECT pg_reload_conf()'
t

$ PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'SELECT 1'
psql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  no pg_hba.conf entry for host "127.0.0.1", user "checkout_app", database "shop", no encryption

$ cp /tmp/pg_hba.backup /var/lib/postgresql/data/pg_hba.conf && psql -U postgres -X -tAc 'SELECT pg_reload_conf()'
t

== CREATEDB attribute
$ PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'CREATE DATABASE checkout_scratch'
ERROR:  permission denied to create database

$ psql -U postgres -X -c 'ALTER ROLE checkout_app CREATEDB'
ALTER ROLE

$ PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'CREATE DATABASE checkout_scratch'
CREATE DATABASE

$ psql -U postgres -X -c 'DROP DATABASE checkout_scratch' -c 'ALTER ROLE checkout_app NOCREATEDB'
DROP DATABASE
ALTER ROLE


======== 03-owner-defaults.sql
-- Ownership, membership in the owning role, ALL TABLES IN SCHEMA, and default privileges. Runs after 01 and 02.
SELECT current_setting('server_version_num')::int >= 160000 AS pg16 \gset
\connect shop
You are now connected to database "shop" as user "postgres".
CREATE ROLE migrator LOGIN;
CREATE ROLE
-- [schema] CREATE alone does not include USAGE: naming an existing table still fails on the schema
GRANT CREATE ON SCHEMA sales TO migrator;
GRANT
SET ROLE migrator;
SET
ALTER TABLE sales.orders ADD COLUMN internal_note text;
ERROR:  permission denied for schema sales
RESET ROLE;
RESET
GRANT USAGE ON SCHEMA sales TO migrator;
GRANT
-- [owner] a non-owner cannot change the table
SET ROLE migrator;
SET
ALTER TABLE sales.orders ADD COLUMN internal_note text;
ERROR:  must be owner of table orders
RESET ROLE;
RESET
-- [owner] membership in the owning role is enough
\if :pg16
GRANT shop_owner TO migrator WITH INHERIT TRUE, SET TRUE;
GRANT ROLE
\else
GRANT shop_owner TO migrator;
\endif
SET ROLE migrator;
SET
ALTER TABLE sales.orders ADD COLUMN internal_note text;
ALTER TABLE
ALTER TABLE sales.orders DROP COLUMN internal_note;
ALTER TABLE
RESET ROLE;
RESET
-- [owner] transferring ownership
SET ROLE shop_owner;
SET
CREATE TABLE sales.coupons (code text PRIMARY KEY);
CREATE TABLE
RESET ROLE;
RESET
ALTER TABLE sales.coupons OWNER TO migrator;
ALTER TABLE
SELECT tableowner FROM pg_tables WHERE schemaname = 'sales' AND tablename = 'coupons';
 tableowner 
------------
 migrator
(1 row)

ALTER TABLE sales.coupons OWNER TO shop_owner;
ALTER TABLE
SELECT tableowner FROM pg_tables WHERE schemaname = 'sales' AND tablename = 'coupons';
 tableowner 
------------
 shop_owner
(1 row)

-- a plain member must be able to become the new owner to hand a table over
SET ROLE checkout_app;
SET
ALTER TABLE sales.coupons OWNER TO checkout_app;
ERROR:  must be owner of table coupons
RESET ROLE;
RESET
-- [all tables] covers only tables that exist when it runs
GRANT SELECT ON ALL TABLES IN SCHEMA sales TO shop_checkout;
GRANT
SET ROLE shop_owner;
SET
CREATE TABLE sales.shipments (order_id bigint NOT NULL, carrier text);
CREATE TABLE
RESET ROLE;
RESET
SET ROLE checkout_app;
SET
SELECT * FROM sales.coupons;
 code 
------
(0 rows)

SELECT * FROM sales.shipments;
ERROR:  permission denied for table shipments
RESET ROLE;
RESET
-- [default privileges] FOR ROLE shop_owner applies to objects shop_owner creates later
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT SELECT ON TABLES TO shop_checkout;
ALTER DEFAULT PRIVILEGES
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT USAGE ON SEQUENCES TO shop_checkout;
ALTER DEFAULT PRIVILEGES
SET ROLE shop_owner;
SET
CREATE TABLE sales.invoices (id bigserial PRIMARY KEY, order_id bigint NOT NULL);
CREATE TABLE
RESET ROLE;
RESET
SET ROLE checkout_app;
SET
SELECT * FROM sales.invoices;
 id | order_id 
----+----------
(0 rows)

SELECT has_sequence_privilege('sales.invoices_id_seq', 'USAGE') AS can_use_invoice_seq;
 can_use_invoice_seq 
---------------------
 t
(1 row)

RESET ROLE;
RESET
-- [default privileges trap] the migration creates the table as itself
SET ROLE migrator;
SET
CREATE TABLE sales.returns (order_id bigint NOT NULL);
CREATE TABLE
RESET ROLE;
RESET
SELECT tablename, tableowner FROM pg_tables WHERE schemaname = 'sales' AND tablename IN ('invoices', 'returns') ORDER BY 1;
 tablename | tableowner 
-----------+------------
 invoices  | shop_owner
 returns   | migrator
(2 rows)

SET ROLE checkout_app;
SET
SELECT * FROM sales.returns;
ERROR:  permission denied for table returns
RESET ROLE;
RESET
-- [default privileges trap] the same migration with SET ROLE shop_owner
SET ROLE migrator;
SET
SET ROLE shop_owner;
SET
CREATE TABLE sales.exchanges (order_id bigint NOT NULL);
CREATE TABLE
RESET ROLE;
RESET
SET ROLE checkout_app;
SET
SELECT * FROM sales.exchanges;
 order_id 
----------
(0 rows)

RESET ROLE;
RESET
-- [default privileges] without FOR ROLE they apply to objects the current role creates
SET ROLE migrator;
SET
ALTER DEFAULT PRIVILEGES IN SCHEMA sales GRANT SELECT ON TABLES TO shop_checkout;
ALTER DEFAULT PRIVILEGES
CREATE TABLE sales.migrator_notes (body text);
CREATE TABLE
RESET ROLE;
RESET
SET ROLE checkout_app;
SET
SELECT * FROM sales.migrator_notes;
 body 
------
(0 rows)

RESET ROLE;
RESET
-- [default privileges] inspect them
\ddp
                  Default access privileges
   Owner    | Schema |   Type   |     Access privileges      
------------+--------+----------+----------------------------
 migrator   | sales  | table    | shop_checkout=r/migrator
 shop_owner | sales  | sequence | shop_checkout=U/shop_owner
 shop_owner | sales  | table    | shop_checkout=r/shop_owner
(3 rows)

SELECT pg_get_userbyid(d.defaclrole) AS creator, n.nspname AS schema, d.defaclobjtype AS object_type, d.defaclacl
FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace;
  creator   | schema | object_type |          defaclacl           
------------+--------+-------------+------------------------------
 shop_owner | sales  | r           | {shop_checkout=r/shop_owner}
 shop_owner | sales  | S           | {shop_checkout=U/shop_owner}
 migrator   | sales  | r           | {shop_checkout=r/migrator}
(3 rows)


======== 04-inspect.sql
-- How to check existing privileges. Runs after 01-03 (orders RLS on, defaults set).
\connect shop
You are now connected to database "shop" as user "postgres".
\dp sales.orders
                                                                                  Access privileges
 Schema |  Name  | Type  |       Access privileges       |      Column privileges       |                                          Policies                                           
--------+--------+-------+-------------------------------+------------------------------+---------------------------------------------------------------------------------------------
 sales  | orders | table | shop_owner=arwdDxt/shop_owner+| tenant_id:                  +| checkout_orders:                                                                           +
        |        |       | shop_checkout=r/shop_owner    |   shop_checkout=a/shop_owner+|   (u): (tenant_id = (NULLIF(current_setting('app.tenant_id'::text, true), ''::text))::uuid)+
        |        |       |                               | customer_name:              +|   (c): (tenant_id = (NULLIF(current_setting('app.tenant_id'::text, true), ''::text))::uuid)+
        |        |       |                               |   shop_checkout=a/shop_owner+|   to: shop_checkout
        |        |       |                               | total:                      +| 
        |        |       |                               |   shop_checkout=a/shop_owner | 
(1 row)

\z sales.order*
                                                                                       Access privileges
 Schema |     Name      |   Type   |       Access privileges       |      Column privileges       |                                          Policies                                           
--------+---------------+----------+-------------------------------+------------------------------+---------------------------------------------------------------------------------------------
 sales  | orders        | table    | shop_owner=arwdDxt/shop_owner+| tenant_id:                  +| checkout_orders:                                                                           +
        |               |          | shop_checkout=r/shop_owner    |   shop_checkout=a/shop_owner+|   (u): (tenant_id = (NULLIF(current_setting('app.tenant_id'::text, true), ''::text))::uuid)+
        |               |          |                               | customer_name:              +|   (c): (tenant_id = (NULLIF(current_setting('app.tenant_id'::text, true), ''::text))::uuid)+
        |               |          |                               |   shop_checkout=a/shop_owner+|   to: shop_checkout
        |               |          |                               | total:                      +| 
        |               |          |                               |   shop_checkout=a/shop_owner | 
 sales  | orders_id_seq | sequence | shop_owner=rwU/shop_owner    +|                              | 
        |               |          | shop_checkout=rU/shop_owner   |                              | 
(2 rows)

\du shop_checkout|checkout_app|shop_owner
        List of roles
   Role name   |  Attributes  
---------------+--------------
 checkout_app  | 
 shop_checkout | Cannot login
 shop_owner    | Cannot login

\l shop
                                                       List of databases
 Name |   Owner    | Encoding | Locale Provider |  Collate   |   Ctype    | ICU Locale | ICU Rules |     Access privileges      
------+------------+----------+-----------------+------------+------------+------------+-----------+----------------------------
 shop | shop_owner | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           | shop_owner=CTc/shop_owner +
      |            |          |                 |            |            |            |           | shop_checkout=c/shop_owner
(1 row)

\dn+ sales
                        List of schemas
 Name  |   Owner    |     Access privileges      | Description 
-------+------------+----------------------------+-------------
 sales | shop_owner | shop_owner=UC/shop_owner  +| 
       |            | shop_checkout=U/shop_owner+| 
       |            | migrator=UC/shop_owner     | 
(1 row)

-- direct table grants recorded for a role
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee IN ('shop_checkout', 'checkout_app')
  AND table_schema = 'sales'
ORDER BY grantee, table_name, privilege_type;
    grantee    | table_schema |   table_name   | privilege_type 
---------------+--------------+----------------+----------------
 shop_checkout | sales        | coupons        | SELECT
 shop_checkout | sales        | exchanges      | SELECT
 shop_checkout | sales        | invoices       | SELECT
 shop_checkout | sales        | migrator_notes | SELECT
 shop_checkout | sales        | orders         | SELECT
 shop_checkout | sales        | payments       | INSERT
 shop_checkout | sales        | payments       | SELECT
 shop_checkout | sales        | refunds        | INSERT
 shop_checkout | sales        | refunds        | SELECT
(9 rows)

-- column grants are listed separately
SELECT grantee, table_name, column_name, privilege_type
FROM information_schema.column_privileges
WHERE grantee = 'shop_checkout' AND table_schema = 'sales' AND table_name = 'orders'
ORDER BY privilege_type, column_name;
    grantee    | table_name |  column_name  | privilege_type 
---------------+------------+---------------+----------------
 shop_checkout | orders     | customer_name | INSERT
 shop_checkout | orders     | tenant_id     | INSERT
 shop_checkout | orders     | total         | INSERT
 shop_checkout | orders     | customer_name | SELECT
 shop_checkout | orders     | id            | SELECT
 shop_checkout | orders     | status        | SELECT
 shop_checkout | orders     | tenant_id     | SELECT
 shop_checkout | orders     | total         | SELECT
(8 rows)

-- effective privileges, including those inherited through role membership
SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT') AS can_connect,
       has_schema_privilege('checkout_app', 'sales', 'USAGE') AS can_use_schema,
       has_schema_privilege('checkout_app', 'sales', 'CREATE') AS can_create_in_schema,
       has_table_privilege('checkout_app', 'sales.orders', 'SELECT') AS can_read_orders;
 can_connect | can_use_schema | can_create_in_schema | can_read_orders 
-------------+----------------+----------------------+-----------------
 t           | t              | f                    | t
(1 row)

-- everything one role can do on one table
SELECT p.privilege,
       has_table_privilege('checkout_app', 'sales.orders', p.privilege) AS granted
FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) AS p(privilege);
 privilege  | granted 
------------+---------
 SELECT     | t
 INSERT     | f
 UPDATE     | f
 DELETE     | f
 TRUNCATE   | f
 REFERENCES | f
 TRIGGER    | f
(7 rows)

-- column-level grants: table-level INSERT is false, any-column INSERT is true
SELECT has_table_privilege('checkout_app', 'sales.orders', 'INSERT') AS table_insert,
       has_any_column_privilege('checkout_app', 'sales.orders', 'INSERT') AS any_column_insert,
       has_column_privilege('checkout_app', 'sales.orders', 'total', 'INSERT') AS total_insert;
 table_insert | any_column_insert | total_insert 
--------------+-------------------+--------------
 f            | t                 | t
(1 row)

-- MySQL's SHOW GRANTS does not exist in PostgreSQL
SHOW GRANTS FOR checkout_app;
ERROR:  syntax error at or near "FOR"
LINE 1: SHOW GRANTS FOR checkout_app;
                    ^
-- membership: which roles checkout_app inherits from
SELECT r.rolname AS member, g.rolname AS member_of
FROM pg_auth_members m
JOIN pg_roles r ON r.oid = m.member
JOIN pg_roles g ON g.oid = m.roleid
WHERE r.rolname = 'checkout_app';
    member    |   member_of   
--------------+---------------
 checkout_app | shop_checkout
(1 row)


======== 06-predefined.sql
-- What pg_read_all_data and pg_write_all_data allow, and whether RLS still applies. Runs after 01-04 in shop.
\connect shop
You are now connected to database "shop" as user "postgres".
DROP ROLE IF EXISTS reporting;
NOTICE:  role "reporting" does not exist, skipping
DROP ROLE
DROP ROLE IF EXISTS loader;
NOTICE:  role "loader" does not exist, skipping
DROP ROLE
CREATE ROLE reporting LOGIN;
CREATE ROLE
CREATE ROLE loader LOGIN;
CREATE ROLE
GRANT CONNECT ON DATABASE shop TO reporting, loader;
GRANT
GRANT pg_read_all_data TO reporting;
GRANT ROLE
GRANT pg_write_all_data TO loader;
GRANT ROLE
SET ROLE reporting;
SET
SELECT count(*) AS orders_visible_to_reporting FROM sales.orders;
 orders_visible_to_reporting 
-----------------------------
                           0
(1 row)

SELECT count(*) AS shipments_visible_to_reporting FROM sales.shipments;
 shipments_visible_to_reporting 
--------------------------------
                              0
(1 row)

INSERT INTO sales.shipments (order_id) VALUES (1);
ERROR:  permission denied for table shipments
RESET ROLE;
RESET
SET ROLE loader;
SET
-- RETURNING reads the row, which needs SELECT
INSERT INTO sales.invoices (order_id) VALUES (1) RETURNING id;
ERROR:  permission denied for table invoices
-- without RETURNING the write and the bigserial nextval() both succeed
INSERT INTO sales.invoices (order_id) VALUES (1);
INSERT 0 1
SELECT * FROM sales.invoices;
ERROR:  permission denied for table invoices
RESET ROLE;
RESET
-- 16+: memberships moved from \du to \drg
\drg reporting|loader|checkout_app
                    List of role grants
  Role name   |     Member of     |   Options    | Grantor  
--------------+-------------------+--------------+----------
 checkout_app | shop_checkout     | INHERIT, SET | postgres
 loader       | pg_write_all_data | INHERIT, SET | postgres
 reporting    | pg_read_all_data  | INHERIT, SET | postgres
(3 rows)
```

</details>

<details><summary>Main suite on <code>postgres:17</code> (scripts 01–04, 06)</summary>

```text
################ postgres:17 — PostgreSQL 17.11 (Debian 17.11-1.pgdg13+2) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit

======== 01-setup-and-errors.sql
-- Shop/checkout schema from the tutorial, then each "permission denied" case.
SELECT current_setting('server_version_num')::int >= 160000 AS pg16 \gset
SHOW server_version;
         server_version          
---------------------------------
 17.11 (Debian 17.11-1.pgdg13+2)
(1 row)

CREATE ROLE shop_owner NOLOGIN;
CREATE ROLE
CREATE ROLE shop_checkout NOLOGIN;
CREATE ROLE
CREATE ROLE checkout_app LOGIN PASSWORD 'checkout-pw'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
CREATE ROLE
\if :pg16
GRANT shop_checkout TO checkout_app WITH INHERIT TRUE;
GRANT ROLE
\else
GRANT shop_checkout TO checkout_app;
\endif
CREATE DATABASE shop OWNER shop_owner;
CREATE DATABASE
REVOKE CONNECT, TEMPORARY ON DATABASE shop FROM PUBLIC;
REVOKE
\connect shop
You are now connected to database "shop" as user "postgres".
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE
SET ROLE shop_owner;
SET
CREATE SCHEMA sales AUTHORIZATION shop_owner;
CREATE SCHEMA
CREATE TABLE sales.orders (
  id bigserial PRIMARY KEY,
  tenant_id uuid NOT NULL,
  customer_name text NOT NULL,
  total numeric(12, 2) NOT NULL CHECK (total >= 0),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'shipped'))
);
CREATE TABLE
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Asha', 1200.00),
  ('22222222-2222-2222-2222-222222222222', 'Ravi', 850.00);
INSERT 0 2
RESET ROLE;
RESET
-- [schema] No USAGE on sales: schema-qualified name
SET ROLE checkout_app;
SET
SELECT id, customer_name, total FROM sales.orders;
ERROR:  permission denied for schema sales
LINE 1: SELECT id, customer_name, total FROM sales.orders;
                                             ^
-- [schema] No USAGE on sales: unqualified name through search_path
SET search_path = sales;
SET
SELECT id, customer_name, total FROM orders;
ERROR:  relation "orders" does not exist
LINE 1: SELECT id, customer_name, total FROM orders;
                                             ^
RESET search_path;
RESET
RESET ROLE;
RESET
-- [table] USAGE granted, SELECT missing
GRANT USAGE ON SCHEMA sales TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
SELECT id, customer_name, total FROM sales.orders;
ERROR:  permission denied for table orders
RESET ROLE;
RESET
-- [database] GRANT ALL on the database does not reach tables
GRANT ALL PRIVILEGES ON DATABASE shop TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
SELECT id, customer_name, total FROM sales.orders;
ERROR:  permission denied for table orders
RESET ROLE;
RESET
REVOKE ALL PRIVILEGES ON DATABASE shop FROM shop_checkout;
REVOKE
-- [table] fix and confirm
GRANT SELECT ON TABLE sales.orders TO shop_checkout;
GRANT
SELECT has_table_privilege('checkout_app', 'sales.orders', 'SELECT') AS can_read;
 can_read 
----------
 t
(1 row)

SET ROLE checkout_app;
SET
SELECT id, customer_name, total FROM sales.orders ORDER BY id;
 id | customer_name |  total  
----+---------------+---------
  1 | Asha          | 1200.00
  2 | Ravi          |  850.00
(2 rows)

-- INSERT still missing
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00);
ERROR:  permission denied for table orders
RESET ROLE;
RESET
-- [sequence] bigserial: INSERT granted, sequence USAGE missing
GRANT INSERT (tenant_id, customer_name, total) ON TABLE sales.orders TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
ERROR:  permission denied for sequence orders_id_seq
RESET ROLE;
RESET
-- [sequence] what does the column default call?
SELECT column_name, column_default, is_identity
FROM information_schema.columns
WHERE table_schema = 'sales' AND table_name = 'orders' AND column_name = 'id';
 column_name |              column_default              | is_identity 
-------------+------------------------------------------+-------------
 id          | nextval('sales.orders_id_seq'::regclass) | NO
(1 row)

-- [sequence] USAGE alone is enough for nextval()
GRANT USAGE ON SEQUENCE sales.orders_id_seq TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
 id | status  
----+---------
  3 | pending
(1 row)

INSERT 0 1
SELECT currval('sales.orders_id_seq');
 currval 
---------
       3
(1 row)

RESET ROLE;
RESET
REVOKE USAGE ON SEQUENCE sales.orders_id_seq FROM shop_checkout;
REVOKE
-- [sequence] SELECT alone on the sequence does not allow nextval()
GRANT SELECT ON SEQUENCE sales.orders_id_seq TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Sana', 300.00)
RETURNING id;
ERROR:  permission denied for sequence orders_id_seq
RESET ROLE;
RESET
REVOKE SELECT ON SEQUENCE sales.orders_id_seq FROM shop_checkout;
REVOKE
-- [sequence] identity column: no sequence grant at all
SET ROLE shop_owner;
SET
CREATE TABLE sales.payments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id bigint NOT NULL,
  amount numeric(12, 2) NOT NULL
);
CREATE TABLE
RESET ROLE;
RESET
GRANT SELECT, INSERT ON TABLE sales.payments TO shop_checkout;
GRANT
SELECT pg_get_serial_sequence('sales.payments', 'id') AS identity_sequence;
   identity_sequence   
-----------------------
 sales.payments_id_seq
(1 row)

SELECT has_sequence_privilege('checkout_app', 'sales.payments_id_seq', 'USAGE') AS has_seq_usage;
 has_seq_usage 
---------------
 f
(1 row)

SET ROLE checkout_app;
SET
INSERT INTO sales.payments (order_id, amount) VALUES (1, 1200.00) RETURNING id;
 id 
----
  1
(1 row)

INSERT 0 1
-- calling nextval() directly on the identity sequence is still checked
SELECT nextval('sales.payments_id_seq');
ERROR:  permission denied for sequence payments_id_seq
RESET ROLE;
RESET
-- [sequence] identity column with GENERATED BY DEFAULT
SET ROLE shop_owner;
SET
CREATE TABLE sales.refunds (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  order_id bigint NOT NULL
);
CREATE TABLE
RESET ROLE;
RESET
GRANT INSERT ON TABLE sales.refunds TO shop_checkout;
GRANT
SET ROLE checkout_app;
SET
INSERT INTO sales.refunds (order_id) VALUES (1);
INSERT 0 1
RESET ROLE;
RESET
-- [sequence] ALL SEQUENCES IN SCHEMA form
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sales TO shop_checkout;
GRANT
SELECT has_sequence_privilege('checkout_app', 'sales.orders_id_seq', 'USAGE') AS can_generate_id;
 can_generate_id 
-----------------
 t
(1 row)

SET ROLE checkout_app;
SET
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
 id | status  
----+---------
  4 | pending
(1 row)

INSERT 0 1
RESET ROLE;
RESET
-- [schema] creating objects needs CREATE on the schema
SET ROLE checkout_app;
SET
CREATE TABLE sales.scratch (id int);
ERROR:  permission denied for schema sales
LINE 1: CREATE TABLE sales.scratch (id int);
                     ^
RESET ROLE;
RESET
-- [owner] DDL needs ownership
SET ROLE checkout_app;
SET
ALTER TABLE sales.orders ADD COLUMN internal_note text;
ERROR:  must be owner of table orders
RESET ROLE;
RESET
-- [createdb]
SET ROLE checkout_app;
SET
CREATE DATABASE checkout_scratch;
ERROR:  permission denied to create database
RESET ROLE;
RESET
-- [rls] a policy with no tenant context returns zero rows, not an error
SET ROLE shop_owner;
SET
ALTER TABLE sales.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE
CREATE POLICY checkout_orders ON sales.orders
  FOR ALL TO shop_checkout
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
CREATE POLICY
RESET ROLE;
RESET
SET ROLE checkout_app;
SET
SELECT count(*) AS visible_orders FROM sales.orders;
 visible_orders 
----------------
              0
(1 row)

BEGIN;
BEGIN
SET LOCAL app.tenant_id = '11111111-1111-1111-1111-111111111111';
SET
SELECT count(*) AS visible_orders FROM sales.orders;
 visible_orders 
----------------
              3
(1 row)

ROLLBACK;
ROLLBACK
RESET ROLE;
RESET
SELECT relname, relrowsecurity FROM pg_class WHERE oid = 'sales.orders'::regclass;
 relname | relrowsecurity 
---------+----------------
 orders  | t
(1 row)

SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'orders';
   policyname    |      roles      | cmd 
-----------------+-----------------+-----
 checkout_orders | {shop_checkout} | ALL
(1 row)


======== 02-connect.sh
== postgres:17: checkout_app connects over TCP before CONNECT is granted
$ PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'SELECT current_user'
psql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  permission denied for database "shop"
DETAIL:  User does not have CONNECT privilege.

== grant CONNECT to the group role and retry
$ psql -U postgres -X -d shop -c 'GRANT CONNECT ON DATABASE shop TO shop_checkout'
GRANT

$ PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'SELECT current_user, current_database()'
 current_user | current_database 
--------------+------------------
 checkout_app | shop
(1 row)


$ psql -U postgres -X -d shop -c "SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT') AS can_connect"
 can_connect 
-------------
 t
(1 row)


== pg_hba.conf with no matching line for this host/user/database
$ cp /var/lib/postgresql/data/pg_hba.conf /tmp/pg_hba.backup

$ printf 'local all all trust
host shop shop_owner 10.0.0.0/8 scram-sha-256
' > /var/lib/postgresql/data/pg_hba.conf && psql -U postgres -X -tAc 'SELECT pg_reload_conf()'
t

$ PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'SELECT 1'
psql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  no pg_hba.conf entry for host "127.0.0.1", user "checkout_app", database "shop", no encryption

$ cp /tmp/pg_hba.backup /var/lib/postgresql/data/pg_hba.conf && psql -U postgres -X -tAc 'SELECT pg_reload_conf()'
t

== CREATEDB attribute
$ PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'CREATE DATABASE checkout_scratch'
ERROR:  permission denied to create database

$ psql -U postgres -X -c 'ALTER ROLE checkout_app CREATEDB'
ALTER ROLE

$ PGPASSWORD=checkout-pw psql -h 127.0.0.1 -U checkout_app -d shop -X -c 'CREATE DATABASE checkout_scratch'
CREATE DATABASE

$ psql -U postgres -X -c 'DROP DATABASE checkout_scratch' -c 'ALTER ROLE checkout_app NOCREATEDB'
DROP DATABASE
ALTER ROLE


======== 03-owner-defaults.sql
-- Ownership, membership in the owning role, ALL TABLES IN SCHEMA, and default privileges. Runs after 01 and 02.
SELECT current_setting('server_version_num')::int >= 160000 AS pg16 \gset
\connect shop
You are now connected to database "shop" as user "postgres".
CREATE ROLE migrator LOGIN;
CREATE ROLE
-- [schema] CREATE alone does not include USAGE: naming an existing table still fails on the schema
GRANT CREATE ON SCHEMA sales TO migrator;
GRANT
SET ROLE migrator;
SET
ALTER TABLE sales.orders ADD COLUMN internal_note text;
ERROR:  permission denied for schema sales
RESET ROLE;
RESET
GRANT USAGE ON SCHEMA sales TO migrator;
GRANT
-- [owner] a non-owner cannot change the table
SET ROLE migrator;
SET
ALTER TABLE sales.orders ADD COLUMN internal_note text;
ERROR:  must be owner of table orders
RESET ROLE;
RESET
-- [owner] membership in the owning role is enough
\if :pg16
GRANT shop_owner TO migrator WITH INHERIT TRUE, SET TRUE;
GRANT ROLE
\else
GRANT shop_owner TO migrator;
\endif
SET ROLE migrator;
SET
ALTER TABLE sales.orders ADD COLUMN internal_note text;
ALTER TABLE
ALTER TABLE sales.orders DROP COLUMN internal_note;
ALTER TABLE
RESET ROLE;
RESET
-- [owner] transferring ownership
SET ROLE shop_owner;
SET
CREATE TABLE sales.coupons (code text PRIMARY KEY);
CREATE TABLE
RESET ROLE;
RESET
ALTER TABLE sales.coupons OWNER TO migrator;
ALTER TABLE
SELECT tableowner FROM pg_tables WHERE schemaname = 'sales' AND tablename = 'coupons';
 tableowner 
------------
 migrator
(1 row)

ALTER TABLE sales.coupons OWNER TO shop_owner;
ALTER TABLE
SELECT tableowner FROM pg_tables WHERE schemaname = 'sales' AND tablename = 'coupons';
 tableowner 
------------
 shop_owner
(1 row)

-- a plain member must be able to become the new owner to hand a table over
SET ROLE checkout_app;
SET
ALTER TABLE sales.coupons OWNER TO checkout_app;
ERROR:  must be owner of table coupons
RESET ROLE;
RESET
-- [all tables] covers only tables that exist when it runs
GRANT SELECT ON ALL TABLES IN SCHEMA sales TO shop_checkout;
GRANT
SET ROLE shop_owner;
SET
CREATE TABLE sales.shipments (order_id bigint NOT NULL, carrier text);
CREATE TABLE
RESET ROLE;
RESET
SET ROLE checkout_app;
SET
SELECT * FROM sales.coupons;
 code 
------
(0 rows)

SELECT * FROM sales.shipments;
ERROR:  permission denied for table shipments
RESET ROLE;
RESET
-- [default privileges] FOR ROLE shop_owner applies to objects shop_owner creates later
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT SELECT ON TABLES TO shop_checkout;
ALTER DEFAULT PRIVILEGES
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT USAGE ON SEQUENCES TO shop_checkout;
ALTER DEFAULT PRIVILEGES
SET ROLE shop_owner;
SET
CREATE TABLE sales.invoices (id bigserial PRIMARY KEY, order_id bigint NOT NULL);
CREATE TABLE
RESET ROLE;
RESET
SET ROLE checkout_app;
SET
SELECT * FROM sales.invoices;
 id | order_id 
----+----------
(0 rows)

SELECT has_sequence_privilege('sales.invoices_id_seq', 'USAGE') AS can_use_invoice_seq;
 can_use_invoice_seq 
---------------------
 t
(1 row)

RESET ROLE;
RESET
-- [default privileges trap] the migration creates the table as itself
SET ROLE migrator;
SET
CREATE TABLE sales.returns (order_id bigint NOT NULL);
CREATE TABLE
RESET ROLE;
RESET
SELECT tablename, tableowner FROM pg_tables WHERE schemaname = 'sales' AND tablename IN ('invoices', 'returns') ORDER BY 1;
 tablename | tableowner 
-----------+------------
 invoices  | shop_owner
 returns   | migrator
(2 rows)

SET ROLE checkout_app;
SET
SELECT * FROM sales.returns;
ERROR:  permission denied for table returns
RESET ROLE;
RESET
-- [default privileges trap] the same migration with SET ROLE shop_owner
SET ROLE migrator;
SET
SET ROLE shop_owner;
SET
CREATE TABLE sales.exchanges (order_id bigint NOT NULL);
CREATE TABLE
RESET ROLE;
RESET
SET ROLE checkout_app;
SET
SELECT * FROM sales.exchanges;
 order_id 
----------
(0 rows)

RESET ROLE;
RESET
-- [default privileges] without FOR ROLE they apply to objects the current role creates
SET ROLE migrator;
SET
ALTER DEFAULT PRIVILEGES IN SCHEMA sales GRANT SELECT ON TABLES TO shop_checkout;
ALTER DEFAULT PRIVILEGES
CREATE TABLE sales.migrator_notes (body text);
CREATE TABLE
RESET ROLE;
RESET
SET ROLE checkout_app;
SET
SELECT * FROM sales.migrator_notes;
 body 
------
(0 rows)

RESET ROLE;
RESET
-- [default privileges] inspect them
\ddp
                  Default access privileges
   Owner    | Schema |   Type   |     Access privileges      
------------+--------+----------+----------------------------
 migrator   | sales  | table    | shop_checkout=r/migrator
 shop_owner | sales  | sequence | shop_checkout=U/shop_owner
 shop_owner | sales  | table    | shop_checkout=r/shop_owner
(3 rows)

SELECT pg_get_userbyid(d.defaclrole) AS creator, n.nspname AS schema, d.defaclobjtype AS object_type, d.defaclacl
FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace;
  creator   | schema | object_type |          defaclacl           
------------+--------+-------------+------------------------------
 shop_owner | sales  | r           | {shop_checkout=r/shop_owner}
 shop_owner | sales  | S           | {shop_checkout=U/shop_owner}
 migrator   | sales  | r           | {shop_checkout=r/migrator}
(3 rows)


======== 04-inspect.sql
-- How to check existing privileges. Runs after 01-03 (orders RLS on, defaults set).
\connect shop
You are now connected to database "shop" as user "postgres".
\dp sales.orders
                                                                                   Access privileges
 Schema |  Name  | Type  |       Access privileges        |      Column privileges       |                                          Policies                                           
--------+--------+-------+--------------------------------+------------------------------+---------------------------------------------------------------------------------------------
 sales  | orders | table | shop_owner=arwdDxtm/shop_owner+| tenant_id:                  +| checkout_orders:                                                                           +
        |        |       | shop_checkout=r/shop_owner     |   shop_checkout=a/shop_owner+|   (u): (tenant_id = (NULLIF(current_setting('app.tenant_id'::text, true), ''::text))::uuid)+
        |        |       |                                | customer_name:              +|   (c): (tenant_id = (NULLIF(current_setting('app.tenant_id'::text, true), ''::text))::uuid)+
        |        |       |                                |   shop_checkout=a/shop_owner+|   to: shop_checkout
        |        |       |                                | total:                      +| 
        |        |       |                                |   shop_checkout=a/shop_owner | 
(1 row)

\z sales.order*
                                                                                        Access privileges
 Schema |     Name      |   Type   |       Access privileges        |      Column privileges       |                                          Policies                                           
--------+---------------+----------+--------------------------------+------------------------------+---------------------------------------------------------------------------------------------
 sales  | orders        | table    | shop_owner=arwdDxtm/shop_owner+| tenant_id:                  +| checkout_orders:                                                                           +
        |               |          | shop_checkout=r/shop_owner     |   shop_checkout=a/shop_owner+|   (u): (tenant_id = (NULLIF(current_setting('app.tenant_id'::text, true), ''::text))::uuid)+
        |               |          |                                | customer_name:              +|   (c): (tenant_id = (NULLIF(current_setting('app.tenant_id'::text, true), ''::text))::uuid)+
        |               |          |                                |   shop_checkout=a/shop_owner+|   to: shop_checkout
        |               |          |                                | total:                      +| 
        |               |          |                                |   shop_checkout=a/shop_owner | 
 sales  | orders_id_seq | sequence | shop_owner=rwU/shop_owner     +|                              | 
        |               |          | shop_checkout=rU/shop_owner    |                              | 
(2 rows)

\du shop_checkout|checkout_app|shop_owner
        List of roles
   Role name   |  Attributes  
---------------+--------------
 checkout_app  | 
 shop_checkout | Cannot login
 shop_owner    | Cannot login

\l shop
                                                     List of databases
 Name |   Owner    | Encoding | Locale Provider |  Collate   |   Ctype    | Locale | ICU Rules |     Access privileges      
------+------------+----------+-----------------+------------+------------+--------+-----------+----------------------------
 shop | shop_owner | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           | shop_owner=CTc/shop_owner +
      |            |          |                 |            |            |        |           | shop_checkout=c/shop_owner
(1 row)

\dn+ sales
                        List of schemas
 Name  |   Owner    |     Access privileges      | Description 
-------+------------+----------------------------+-------------
 sales | shop_owner | shop_owner=UC/shop_owner  +| 
       |            | shop_checkout=U/shop_owner+| 
       |            | migrator=UC/shop_owner     | 
(1 row)

-- direct table grants recorded for a role
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee IN ('shop_checkout', 'checkout_app')
  AND table_schema = 'sales'
ORDER BY grantee, table_name, privilege_type;
    grantee    | table_schema |   table_name   | privilege_type 
---------------+--------------+----------------+----------------
 shop_checkout | sales        | coupons        | SELECT
 shop_checkout | sales        | exchanges      | SELECT
 shop_checkout | sales        | invoices       | SELECT
 shop_checkout | sales        | migrator_notes | SELECT
 shop_checkout | sales        | orders         | SELECT
 shop_checkout | sales        | payments       | INSERT
 shop_checkout | sales        | payments       | SELECT
 shop_checkout | sales        | refunds        | INSERT
 shop_checkout | sales        | refunds        | SELECT
(9 rows)

-- column grants are listed separately
SELECT grantee, table_name, column_name, privilege_type
FROM information_schema.column_privileges
WHERE grantee = 'shop_checkout' AND table_schema = 'sales' AND table_name = 'orders'
ORDER BY privilege_type, column_name;
    grantee    | table_name |  column_name  | privilege_type 
---------------+------------+---------------+----------------
 shop_checkout | orders     | customer_name | INSERT
 shop_checkout | orders     | tenant_id     | INSERT
 shop_checkout | orders     | total         | INSERT
 shop_checkout | orders     | customer_name | SELECT
 shop_checkout | orders     | id            | SELECT
 shop_checkout | orders     | status        | SELECT
 shop_checkout | orders     | tenant_id     | SELECT
 shop_checkout | orders     | total         | SELECT
(8 rows)

-- effective privileges, including those inherited through role membership
SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT') AS can_connect,
       has_schema_privilege('checkout_app', 'sales', 'USAGE') AS can_use_schema,
       has_schema_privilege('checkout_app', 'sales', 'CREATE') AS can_create_in_schema,
       has_table_privilege('checkout_app', 'sales.orders', 'SELECT') AS can_read_orders;
 can_connect | can_use_schema | can_create_in_schema | can_read_orders 
-------------+----------------+----------------------+-----------------
 t           | t              | f                    | t
(1 row)

-- everything one role can do on one table
SELECT p.privilege,
       has_table_privilege('checkout_app', 'sales.orders', p.privilege) AS granted
FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) AS p(privilege);
 privilege  | granted 
------------+---------
 SELECT     | t
 INSERT     | f
 UPDATE     | f
 DELETE     | f
 TRUNCATE   | f
 REFERENCES | f
 TRIGGER    | f
(7 rows)

-- column-level grants: table-level INSERT is false, any-column INSERT is true
SELECT has_table_privilege('checkout_app', 'sales.orders', 'INSERT') AS table_insert,
       has_any_column_privilege('checkout_app', 'sales.orders', 'INSERT') AS any_column_insert,
       has_column_privilege('checkout_app', 'sales.orders', 'total', 'INSERT') AS total_insert;
 table_insert | any_column_insert | total_insert 
--------------+-------------------+--------------
 f            | t                 | t
(1 row)

-- MySQL's SHOW GRANTS does not exist in PostgreSQL
SHOW GRANTS FOR checkout_app;
ERROR:  syntax error at or near "FOR"
LINE 1: SHOW GRANTS FOR checkout_app;
                    ^
-- membership: which roles checkout_app inherits from
SELECT r.rolname AS member, g.rolname AS member_of
FROM pg_auth_members m
JOIN pg_roles r ON r.oid = m.member
JOIN pg_roles g ON g.oid = m.roleid
WHERE r.rolname = 'checkout_app';
    member    |   member_of   
--------------+---------------
 checkout_app | shop_checkout
(1 row)


======== 06-predefined.sql
-- What pg_read_all_data and pg_write_all_data allow, and whether RLS still applies. Runs after 01-04 in shop.
\connect shop
You are now connected to database "shop" as user "postgres".
DROP ROLE IF EXISTS reporting;
NOTICE:  role "reporting" does not exist, skipping
DROP ROLE
DROP ROLE IF EXISTS loader;
NOTICE:  role "loader" does not exist, skipping
DROP ROLE
CREATE ROLE reporting LOGIN;
CREATE ROLE
CREATE ROLE loader LOGIN;
CREATE ROLE
GRANT CONNECT ON DATABASE shop TO reporting, loader;
GRANT
GRANT pg_read_all_data TO reporting;
GRANT ROLE
GRANT pg_write_all_data TO loader;
GRANT ROLE
SET ROLE reporting;
SET
SELECT count(*) AS orders_visible_to_reporting FROM sales.orders;
 orders_visible_to_reporting 
-----------------------------
                           0
(1 row)

SELECT count(*) AS shipments_visible_to_reporting FROM sales.shipments;
 shipments_visible_to_reporting 
--------------------------------
                              0
(1 row)

INSERT INTO sales.shipments (order_id) VALUES (1);
ERROR:  permission denied for table shipments
RESET ROLE;
RESET
SET ROLE loader;
SET
-- RETURNING reads the row, which needs SELECT
INSERT INTO sales.invoices (order_id) VALUES (1) RETURNING id;
ERROR:  permission denied for table invoices
-- without RETURNING the write and the bigserial nextval() both succeed
INSERT INTO sales.invoices (order_id) VALUES (1);
INSERT 0 1
SELECT * FROM sales.invoices;
ERROR:  permission denied for table invoices
RESET ROLE;
RESET
-- 16+: memberships moved from \du to \drg
\drg reporting|loader|checkout_app
                    List of role grants
  Role name   |     Member of     |   Options    | Grantor  
--------------+-------------------+--------------+----------
 checkout_app | shop_checkout     | INHERIT, SET | postgres
 loader       | pg_write_all_data | INHERIT, SET | postgres
 reporting    | pg_read_all_data  | INHERIT, SET | postgres
(3 rows)
```

</details>

<details><summary>Version checks on <code>postgres:10</code> (script 05)</summary>

```text
################ postgres:10
-- Version-sensitive behaviour: CREATE on the public schema, predefined data roles, and error wording.
SHOW server_version;
         server_version          
---------------------------------
 10.21 (Debian 10.21-1.pgdg90+1)
(1 row)

DROP DATABASE IF EXISTS fresh;
NOTICE:  database "fresh" does not exist, skipping
DROP DATABASE
DROP ROLE IF EXISTS reporting;
NOTICE:  role "reporting" does not exist, skipping
DROP ROLE
DROP ROLE IF EXISTS app_user;
NOTICE:  role "app_user" does not exist, skipping
DROP ROLE
CREATE DATABASE fresh;
CREATE DATABASE
CREATE ROLE app_user LOGIN;
CREATE ROLE
\l fresh
                             List of databases
 Name  |  Owner   | Encoding |  Collate   |   Ctype    | Access privileges 
-------+----------+----------+------------+------------+-------------------
 fresh | postgres | UTF8     | en_US.utf8 | en_US.utf8 | 
(1 row)

SELECT has_database_privilege('app_user', 'fresh', 'CONNECT') AS app_user_can_connect,
       has_database_privilege('app_user', 'fresh', 'TEMPORARY') AS app_user_can_create_temp;
 app_user_can_connect | app_user_can_create_temp 
----------------------+--------------------------
 t                    | t
(1 row)

\connect fresh
You are now connected to database "fresh" as user "postgres".
\dn+ public
                          List of schemas
  Name  |  Owner   |  Access privileges   |      Description       
--------+----------+----------------------+------------------------
 public | postgres | postgres=UC/postgres+| standard public schema
        |          | =UC/postgres         | 
(1 row)

SET ROLE app_user;
SET
CREATE TABLE public.notes (body text);
CREATE TABLE
RESET ROLE;
RESET
-- predefined roles that grant read or write on every table
SELECT rolname FROM pg_roles WHERE rolname IN ('pg_read_all_data', 'pg_write_all_data') ORDER BY 1;
 rolname 
---------
(0 rows)

CREATE ROLE reporting LOGIN;
CREATE ROLE
GRANT pg_read_all_data TO reporting;
ERROR:  role "pg_read_all_data" does not exist
-- error wording for a table the role cannot read
CREATE TABLE secret (id int);
CREATE TABLE
SET ROLE app_user;
SET
SELECT * FROM secret;
ERROR:  permission denied for relation secret
RESET ROLE;
RESET
```

</details>

<details><summary>Version checks on <code>postgres:13</code> (script 05)</summary>

```text
################ postgres:13
-- Version-sensitive behaviour: CREATE on the public schema, predefined data roles, and error wording.
SHOW server_version;
         server_version          
---------------------------------
 13.23 (Debian 13.23-1.pgdg13+1)
(1 row)

DROP DATABASE IF EXISTS fresh;
NOTICE:  database "fresh" does not exist, skipping
DROP DATABASE
DROP ROLE IF EXISTS reporting;
NOTICE:  role "reporting" does not exist, skipping
DROP ROLE
DROP ROLE IF EXISTS app_user;
NOTICE:  role "app_user" does not exist, skipping
DROP ROLE
CREATE DATABASE fresh;
CREATE DATABASE
CREATE ROLE app_user LOGIN;
CREATE ROLE
\l fresh
                             List of databases
 Name  |  Owner   | Encoding |  Collate   |   Ctype    | Access privileges 
-------+----------+----------+------------+------------+-------------------
 fresh | postgres | UTF8     | en_US.utf8 | en_US.utf8 | 
(1 row)

SELECT has_database_privilege('app_user', 'fresh', 'CONNECT') AS app_user_can_connect,
       has_database_privilege('app_user', 'fresh', 'TEMPORARY') AS app_user_can_create_temp;
 app_user_can_connect | app_user_can_create_temp 
----------------------+--------------------------
 t                    | t
(1 row)

\connect fresh
You are now connected to database "fresh" as user "postgres".
\dn+ public
                          List of schemas
  Name  |  Owner   |  Access privileges   |      Description       
--------+----------+----------------------+------------------------
 public | postgres | postgres=UC/postgres+| standard public schema
        |          | =UC/postgres         | 
(1 row)

SET ROLE app_user;
SET
CREATE TABLE public.notes (body text);
CREATE TABLE
RESET ROLE;
RESET
-- predefined roles that grant read or write on every table
SELECT rolname FROM pg_roles WHERE rolname IN ('pg_read_all_data', 'pg_write_all_data') ORDER BY 1;
 rolname 
---------
(0 rows)

CREATE ROLE reporting LOGIN;
CREATE ROLE
GRANT pg_read_all_data TO reporting;
ERROR:  role "pg_read_all_data" does not exist
-- error wording for a table the role cannot read
CREATE TABLE secret (id int);
CREATE TABLE
SET ROLE app_user;
SET
SELECT * FROM secret;
ERROR:  permission denied for table secret
RESET ROLE;
RESET
```

</details>

<details><summary>Version checks on <code>postgres:14</code> (script 05)</summary>

```text
################ postgres:14
-- Version-sensitive behaviour: CREATE on the public schema, predefined data roles, and error wording.
SHOW server_version;
         server_version          
---------------------------------
 14.24 (Debian 14.24-1.pgdg13+2)
(1 row)

DROP DATABASE IF EXISTS fresh;
NOTICE:  database "fresh" does not exist, skipping
DROP DATABASE
DROP ROLE IF EXISTS reporting;
ERROR:  role "reporting" cannot be dropped because some objects depend on it
DETAIL:  privileges for database shop
DROP ROLE IF EXISTS app_user;
NOTICE:  role "app_user" does not exist, skipping
DROP ROLE
CREATE DATABASE fresh;
CREATE DATABASE
CREATE ROLE app_user LOGIN;
CREATE ROLE
\l fresh
                             List of databases
 Name  |  Owner   | Encoding |  Collate   |   Ctype    | Access privileges 
-------+----------+----------+------------+------------+-------------------
 fresh | postgres | UTF8     | en_US.utf8 | en_US.utf8 | 
(1 row)

SELECT has_database_privilege('app_user', 'fresh', 'CONNECT') AS app_user_can_connect,
       has_database_privilege('app_user', 'fresh', 'TEMPORARY') AS app_user_can_create_temp;
 app_user_can_connect | app_user_can_create_temp 
----------------------+--------------------------
 t                    | t
(1 row)

\connect fresh
You are now connected to database "fresh" as user "postgres".
\dn+ public
                          List of schemas
  Name  |  Owner   |  Access privileges   |      Description       
--------+----------+----------------------+------------------------
 public | postgres | postgres=UC/postgres+| standard public schema
        |          | =UC/postgres         | 
(1 row)

SET ROLE app_user;
SET
CREATE TABLE public.notes (body text);
CREATE TABLE
RESET ROLE;
RESET
-- predefined roles that grant read or write on every table
SELECT rolname FROM pg_roles WHERE rolname IN ('pg_read_all_data', 'pg_write_all_data') ORDER BY 1;
      rolname      
-------------------
 pg_read_all_data
 pg_write_all_data
(2 rows)

CREATE ROLE reporting LOGIN;
ERROR:  role "reporting" already exists
GRANT pg_read_all_data TO reporting;
NOTICE:  role "reporting" is already a member of role "pg_read_all_data"
GRANT ROLE
-- error wording for a table the role cannot read
CREATE TABLE secret (id int);
CREATE TABLE
SET ROLE app_user;
SET
SELECT * FROM secret;
ERROR:  permission denied for table secret
RESET ROLE;
RESET
```

</details>

<details><summary>Version checks on <code>postgres:15</code> (script 05)</summary>

```text
################ postgres:15
-- Version-sensitive behaviour: CREATE on the public schema, predefined data roles, and error wording.
SHOW server_version;
         server_version          
---------------------------------
 15.19 (Debian 15.19-1.pgdg13+2)
(1 row)

DROP DATABASE IF EXISTS fresh;
NOTICE:  database "fresh" does not exist, skipping
DROP DATABASE
DROP ROLE IF EXISTS reporting;
NOTICE:  role "reporting" does not exist, skipping
DROP ROLE
DROP ROLE IF EXISTS app_user;
NOTICE:  role "app_user" does not exist, skipping
DROP ROLE
CREATE DATABASE fresh;
CREATE DATABASE
CREATE ROLE app_user LOGIN;
CREATE ROLE
\l fresh
                                            List of databases
 Name  |  Owner   | Encoding |  Collate   |   Ctype    | ICU Locale | Locale Provider | Access privileges 
-------+----------+----------+------------+------------+------------+-----------------+-------------------
 fresh | postgres | UTF8     | en_US.utf8 | en_US.utf8 |            | libc            | 
(1 row)

SELECT has_database_privilege('app_user', 'fresh', 'CONNECT') AS app_user_can_connect,
       has_database_privilege('app_user', 'fresh', 'TEMPORARY') AS app_user_can_create_temp;
 app_user_can_connect | app_user_can_create_temp 
----------------------+--------------------------
 t                    | t
(1 row)

\connect fresh
You are now connected to database "fresh" as user "postgres".
\dn+ public
                                       List of schemas
  Name  |       Owner       |           Access privileges            |      Description       
--------+-------------------+----------------------------------------+------------------------
 public | pg_database_owner | pg_database_owner=UC/pg_database_owner+| standard public schema
        |                   | =U/pg_database_owner                   | 
(1 row)

SET ROLE app_user;
SET
CREATE TABLE public.notes (body text);
ERROR:  permission denied for schema public
LINE 1: CREATE TABLE public.notes (body text);
                     ^
RESET ROLE;
RESET
-- predefined roles that grant read or write on every table
SELECT rolname FROM pg_roles WHERE rolname IN ('pg_read_all_data', 'pg_write_all_data') ORDER BY 1;
      rolname      
-------------------
 pg_read_all_data
 pg_write_all_data
(2 rows)

CREATE ROLE reporting LOGIN;
CREATE ROLE
GRANT pg_read_all_data TO reporting;
GRANT ROLE
-- error wording for a table the role cannot read
CREATE TABLE secret (id int);
CREATE TABLE
SET ROLE app_user;
SET
SELECT * FROM secret;
ERROR:  permission denied for table secret
RESET ROLE;
RESET
```

</details>

<details><summary>Version checks on <code>postgres:16</code> (script 05)</summary>

```text
################ postgres:16
-- Version-sensitive behaviour: CREATE on the public schema, predefined data roles, and error wording.
SHOW server_version;
         server_version          
---------------------------------
 16.15 (Debian 16.15-1.pgdg13+2)
(1 row)

DROP DATABASE IF EXISTS fresh;
NOTICE:  database "fresh" does not exist, skipping
DROP DATABASE
DROP ROLE IF EXISTS reporting;
ERROR:  role "reporting" cannot be dropped because some objects depend on it
DETAIL:  privileges for database shop
DROP ROLE IF EXISTS app_user;
NOTICE:  role "app_user" does not exist, skipping
DROP ROLE
CREATE DATABASE fresh;
CREATE DATABASE
CREATE ROLE app_user LOGIN;
CREATE ROLE
\l fresh
                                                  List of databases
 Name  |  Owner   | Encoding | Locale Provider |  Collate   |   Ctype    | ICU Locale | ICU Rules | Access privileges 
-------+----------+----------+-----------------+------------+------------+------------+-----------+-------------------
 fresh | postgres | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           | 
(1 row)

SELECT has_database_privilege('app_user', 'fresh', 'CONNECT') AS app_user_can_connect,
       has_database_privilege('app_user', 'fresh', 'TEMPORARY') AS app_user_can_create_temp;
 app_user_can_connect | app_user_can_create_temp 
----------------------+--------------------------
 t                    | t
(1 row)

\connect fresh
You are now connected to database "fresh" as user "postgres".
\dn+ public
                                       List of schemas
  Name  |       Owner       |           Access privileges            |      Description       
--------+-------------------+----------------------------------------+------------------------
 public | pg_database_owner | pg_database_owner=UC/pg_database_owner+| standard public schema
        |                   | =U/pg_database_owner                   | 
(1 row)

SET ROLE app_user;
SET
CREATE TABLE public.notes (body text);
ERROR:  permission denied for schema public
LINE 1: CREATE TABLE public.notes (body text);
                     ^
RESET ROLE;
RESET
-- predefined roles that grant read or write on every table
SELECT rolname FROM pg_roles WHERE rolname IN ('pg_read_all_data', 'pg_write_all_data') ORDER BY 1;
      rolname      
-------------------
 pg_read_all_data
 pg_write_all_data
(2 rows)

CREATE ROLE reporting LOGIN;
ERROR:  role "reporting" already exists
GRANT pg_read_all_data TO reporting;
NOTICE:  role "reporting" has already been granted membership in role "pg_read_all_data" by role "postgres"
GRANT ROLE
-- error wording for a table the role cannot read
CREATE TABLE secret (id int);
CREATE TABLE
SET ROLE app_user;
SET
SELECT * FROM secret;
ERROR:  permission denied for table secret
RESET ROLE;
RESET
```

</details>

<details><summary>Version checks on <code>postgres:17</code> (script 05)</summary>

```text
################ postgres:17
-- Version-sensitive behaviour: CREATE on the public schema, predefined data roles, and error wording.
SHOW server_version;
         server_version          
---------------------------------
 17.11 (Debian 17.11-1.pgdg13+2)
(1 row)

DROP DATABASE IF EXISTS fresh;
NOTICE:  database "fresh" does not exist, skipping
DROP DATABASE
DROP ROLE IF EXISTS reporting;
ERROR:  role "reporting" cannot be dropped because some objects depend on it
DETAIL:  privileges for database shop
DROP ROLE IF EXISTS app_user;
NOTICE:  role "app_user" does not exist, skipping
DROP ROLE
CREATE DATABASE fresh;
CREATE DATABASE
CREATE ROLE app_user LOGIN;
CREATE ROLE
\l fresh
                                                List of databases
 Name  |  Owner   | Encoding | Locale Provider |  Collate   |   Ctype    | Locale | ICU Rules | Access privileges 
-------+----------+----------+-----------------+------------+------------+--------+-----------+-------------------
 fresh | postgres | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           | 
(1 row)

SELECT has_database_privilege('app_user', 'fresh', 'CONNECT') AS app_user_can_connect,
       has_database_privilege('app_user', 'fresh', 'TEMPORARY') AS app_user_can_create_temp;
 app_user_can_connect | app_user_can_create_temp 
----------------------+--------------------------
 t                    | t
(1 row)

\connect fresh
You are now connected to database "fresh" as user "postgres".
\dn+ public
                                       List of schemas
  Name  |       Owner       |           Access privileges            |      Description       
--------+-------------------+----------------------------------------+------------------------
 public | pg_database_owner | pg_database_owner=UC/pg_database_owner+| standard public schema
        |                   | =U/pg_database_owner                   | 
(1 row)

SET ROLE app_user;
SET
CREATE TABLE public.notes (body text);
ERROR:  permission denied for schema public
LINE 1: CREATE TABLE public.notes (body text);
                     ^
RESET ROLE;
RESET
-- predefined roles that grant read or write on every table
SELECT rolname FROM pg_roles WHERE rolname IN ('pg_read_all_data', 'pg_write_all_data') ORDER BY 1;
      rolname      
-------------------
 pg_read_all_data
 pg_write_all_data
(2 rows)

CREATE ROLE reporting LOGIN;
ERROR:  role "reporting" already exists
GRANT pg_read_all_data TO reporting;
NOTICE:  role "reporting" has already been granted membership in role "pg_read_all_data" by role "postgres"
GRANT ROLE
-- error wording for a table the role cannot read
CREATE TABLE secret (id int);
CREATE TABLE
SET ROLE app_user;
SET
SELECT * FROM secret;
ERROR:  permission denied for table secret
RESET ROLE;
RESET
```

</details>

<details><summary>Extra checks on <code>postgres:14</code> (script 07)</summary>

```text
################ postgres:14
-- Membership syntax by version, \du vs \drg, and UPDATE ... WHERE needing SELECT. Independent of 01-06.
SHOW server_version;
         server_version          
---------------------------------
 14.24 (Debian 14.24-1.pgdg13+2)
(1 row)

DROP DATABASE IF EXISTS extra;
NOTICE:  database "extra" does not exist, skipping
DROP DATABASE
DROP ROLE IF EXISTS x_owner;
NOTICE:  role "x_owner" does not exist, skipping
DROP ROLE
DROP ROLE IF EXISTS x_migrator;
NOTICE:  role "x_migrator" does not exist, skipping
DROP ROLE
DROP ROLE IF EXISTS x_writer;
NOTICE:  role "x_writer" does not exist, skipping
DROP ROLE
CREATE ROLE x_owner NOLOGIN;
CREATE ROLE
CREATE ROLE x_migrator LOGIN;
CREATE ROLE
CREATE ROLE x_writer LOGIN;
CREATE ROLE
-- 16+ syntax
GRANT x_owner TO x_migrator WITH INHERIT TRUE, SET TRUE;
ERROR:  syntax error at or near "INHERIT"
LINE 1: GRANT x_owner TO x_migrator WITH INHERIT TRUE, SET TRUE;
                                         ^
-- syntax accepted by every tested version
GRANT x_owner TO x_migrator;
GRANT ROLE
\du x_migrator
            List of roles
 Role name  | Attributes | Member of 
------------+------------+-----------
 x_migrator |            | {x_owner}

\drg x_migrator
invalid command \drg
CREATE DATABASE extra;
CREATE DATABASE
\connect extra
You are now connected to database "extra" as user "postgres".
CREATE TABLE stock (sku text PRIMARY KEY, qty int NOT NULL);
CREATE TABLE
INSERT INTO stock VALUES ('A', 5);
INSERT 0 1
GRANT UPDATE (qty) ON stock TO x_writer;
GRANT
SET ROLE x_writer;
SET
-- UPDATE without a WHERE clause needs only UPDATE
UPDATE stock SET qty = 4;
UPDATE 1
-- a WHERE clause reads sku, which needs SELECT
UPDATE stock SET qty = 3 WHERE sku = 'A';
ERROR:  permission denied for table stock
RESET ROLE;
RESET
GRANT SELECT (sku) ON stock TO x_writer;
GRANT
SET ROLE x_writer;
SET
UPDATE stock SET qty = 3 WHERE sku = 'A';
UPDATE 1
RESET ROLE;
RESET
```

</details>

<details><summary>Extra checks on <code>postgres:15</code> (script 07)</summary>

```text
################ postgres:15
-- Membership syntax by version, \du vs \drg, and UPDATE ... WHERE needing SELECT. Independent of 01-06.
SHOW server_version;
         server_version          
---------------------------------
 15.19 (Debian 15.19-1.pgdg13+2)
(1 row)

DROP DATABASE IF EXISTS extra;
NOTICE:  database "extra" does not exist, skipping
DROP DATABASE
DROP ROLE IF EXISTS x_owner;
NOTICE:  role "x_owner" does not exist, skipping
DROP ROLE
DROP ROLE IF EXISTS x_migrator;
NOTICE:  role "x_migrator" does not exist, skipping
DROP ROLE
DROP ROLE IF EXISTS x_writer;
NOTICE:  role "x_writer" does not exist, skipping
DROP ROLE
CREATE ROLE x_owner NOLOGIN;
CREATE ROLE
CREATE ROLE x_migrator LOGIN;
CREATE ROLE
CREATE ROLE x_writer LOGIN;
CREATE ROLE
-- 16+ syntax
GRANT x_owner TO x_migrator WITH INHERIT TRUE, SET TRUE;
ERROR:  syntax error at or near "INHERIT"
LINE 1: GRANT x_owner TO x_migrator WITH INHERIT TRUE, SET TRUE;
                                         ^
-- syntax accepted by every tested version
GRANT x_owner TO x_migrator;
GRANT ROLE
\du x_migrator
            List of roles
 Role name  | Attributes | Member of 
------------+------------+-----------
 x_migrator |            | {x_owner}

\drg x_migrator
invalid command \drg
CREATE DATABASE extra;
CREATE DATABASE
\connect extra
You are now connected to database "extra" as user "postgres".
CREATE TABLE stock (sku text PRIMARY KEY, qty int NOT NULL);
CREATE TABLE
INSERT INTO stock VALUES ('A', 5);
INSERT 0 1
GRANT UPDATE (qty) ON stock TO x_writer;
GRANT
SET ROLE x_writer;
SET
-- UPDATE without a WHERE clause needs only UPDATE
UPDATE stock SET qty = 4;
UPDATE 1
-- a WHERE clause reads sku, which needs SELECT
UPDATE stock SET qty = 3 WHERE sku = 'A';
ERROR:  permission denied for table stock
RESET ROLE;
RESET
GRANT SELECT (sku) ON stock TO x_writer;
GRANT
SET ROLE x_writer;
SET
UPDATE stock SET qty = 3 WHERE sku = 'A';
UPDATE 1
RESET ROLE;
RESET
```

</details>

<details><summary>Extra checks on <code>postgres:16</code> (script 07)</summary>

```text
################ postgres:16
-- Membership syntax by version, \du vs \drg, and UPDATE ... WHERE needing SELECT. Independent of 01-06.
SHOW server_version;
         server_version          
---------------------------------
 16.15 (Debian 16.15-1.pgdg13+2)
(1 row)

DROP DATABASE IF EXISTS extra;
NOTICE:  database "extra" does not exist, skipping
DROP DATABASE
DROP ROLE IF EXISTS x_owner;
NOTICE:  role "x_owner" does not exist, skipping
DROP ROLE
DROP ROLE IF EXISTS x_migrator;
NOTICE:  role "x_migrator" does not exist, skipping
DROP ROLE
DROP ROLE IF EXISTS x_writer;
NOTICE:  role "x_writer" does not exist, skipping
DROP ROLE
CREATE ROLE x_owner NOLOGIN;
CREATE ROLE
CREATE ROLE x_migrator LOGIN;
CREATE ROLE
CREATE ROLE x_writer LOGIN;
CREATE ROLE
-- 16+ syntax
GRANT x_owner TO x_migrator WITH INHERIT TRUE, SET TRUE;
GRANT ROLE
-- syntax accepted by every tested version
GRANT x_owner TO x_migrator;
NOTICE:  role "x_migrator" has already been granted membership in role "x_owner" by role "postgres"
GRANT ROLE
\du x_migrator
      List of roles
 Role name  | Attributes 
------------+------------
 x_migrator | 

\drg x_migrator
               List of role grants
 Role name  | Member of |   Options    | Grantor  
------------+-----------+--------------+----------
 x_migrator | x_owner   | INHERIT, SET | postgres
(1 row)

CREATE DATABASE extra;
CREATE DATABASE
\connect extra
You are now connected to database "extra" as user "postgres".
CREATE TABLE stock (sku text PRIMARY KEY, qty int NOT NULL);
CREATE TABLE
INSERT INTO stock VALUES ('A', 5);
INSERT 0 1
GRANT UPDATE (qty) ON stock TO x_writer;
GRANT
SET ROLE x_writer;
SET
-- UPDATE without a WHERE clause needs only UPDATE
UPDATE stock SET qty = 4;
UPDATE 1
-- a WHERE clause reads sku, which needs SELECT
UPDATE stock SET qty = 3 WHERE sku = 'A';
ERROR:  permission denied for table stock
RESET ROLE;
RESET
GRANT SELECT (sku) ON stock TO x_writer;
GRANT
SET ROLE x_writer;
SET
UPDATE stock SET qty = 3 WHERE sku = 'A';
UPDATE 1
RESET ROLE;
RESET
```

</details>

<details><summary>Extra checks on <code>postgres:17</code> (script 07)</summary>

```text
################ postgres:17
-- Membership syntax by version, \du vs \drg, and UPDATE ... WHERE needing SELECT. Independent of 01-06.
SHOW server_version;
         server_version          
---------------------------------
 17.11 (Debian 17.11-1.pgdg13+2)
(1 row)

DROP DATABASE IF EXISTS extra;
NOTICE:  database "extra" does not exist, skipping
DROP DATABASE
DROP ROLE IF EXISTS x_owner;
NOTICE:  role "x_owner" does not exist, skipping
DROP ROLE
DROP ROLE IF EXISTS x_migrator;
NOTICE:  role "x_migrator" does not exist, skipping
DROP ROLE
DROP ROLE IF EXISTS x_writer;
NOTICE:  role "x_writer" does not exist, skipping
DROP ROLE
CREATE ROLE x_owner NOLOGIN;
CREATE ROLE
CREATE ROLE x_migrator LOGIN;
CREATE ROLE
CREATE ROLE x_writer LOGIN;
CREATE ROLE
-- 16+ syntax
GRANT x_owner TO x_migrator WITH INHERIT TRUE, SET TRUE;
GRANT ROLE
-- syntax accepted by every tested version
GRANT x_owner TO x_migrator;
NOTICE:  role "x_migrator" has already been granted membership in role "x_owner" by role "postgres"
GRANT ROLE
\du x_migrator
      List of roles
 Role name  | Attributes 
------------+------------
 x_migrator | 

\drg x_migrator
               List of role grants
 Role name  | Member of |   Options    | Grantor  
------------+-----------+--------------+----------
 x_migrator | x_owner   | INHERIT, SET | postgres
(1 row)

CREATE DATABASE extra;
CREATE DATABASE
\connect extra
You are now connected to database "extra" as user "postgres".
CREATE TABLE stock (sku text PRIMARY KEY, qty int NOT NULL);
CREATE TABLE
INSERT INTO stock VALUES ('A', 5);
INSERT 0 1
GRANT UPDATE (qty) ON stock TO x_writer;
GRANT
SET ROLE x_writer;
SET
-- UPDATE without a WHERE clause needs only UPDATE
UPDATE stock SET qty = 4;
UPDATE 1
-- a WHERE clause reads sku, which needs SELECT
UPDATE stock SET qty = 3 WHERE sku = 'A';
ERROR:  permission denied for table stock
RESET ROLE;
RESET
GRANT SELECT (sku) ON stock TO x_writer;
GRANT
SET ROLE x_writer;
SET
UPDATE stock SET qty = 3 WHERE sku = 'A';
UPDATE 1
RESET ROLE;
RESET
```

</details>

## Part B: JSON-LD

`applyRouteMetadata`, the global route hook that already wrote the canonical tag, now also writes a `<script id="route-structured-data" type="application/ld+json">` on every `/blog/<slug>/` route and removes it on other routes. It is built from the catalog entry by `toBlogPostingStructuredData`, so all 16 posts get it from the shared template. No cover or Open Graph images exist in the catalog, so `image` is omitted. The site-wide `Person` JSON-LD in `index.html` is untouched.

Sample output for the PostgreSQL post, taken from the built HTML:

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "PostgreSQL Permissions: GRANT, REVOKE and Permission Denied Fixes",
  "description": "Fix PostgreSQL permission denied errors for tables, sequences, schemas and databases, check existing grants, then build a least-privilege role step by step.",
  "author": {
    "@type": "Person",
    "name": "Ayush Kumar Jaiswal",
    "url": "https://www.ayu-sh-kr.com/card/about-me/"
  },
  "datePublished": "2026-08-02",
  "dateModified": "2026-10-12",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.ayu-sh-kr.com/blog/postgresql-access-control/"
  },
  "url": "https://www.ayu-sh-kr.com/blog/postgresql-access-control/",
  "keywords": "PostgreSQL permissions, PostgreSQL permission denied for table, PostgreSQL permission denied for sequence, PostgreSQL permission denied for schema, PostgreSQL GRANT and REVOKE, PostgreSQL check privileges, PostgreSQL default privileges, PostgreSQL least privilege role, PostgreSQL row level security"
}
```

**Validation:**

- `src/utils/seo.utils.test.ts` checks every catalog post for the required and recommended properties:
  - `@context`, `@type`, `headline` (at most 110 characters), `description`;
  - `author` as a Person with `name` and `url`;
  - `datePublished`, and `dateModified` no earlier than `datePublished`;
  - `mainEntityOfPage` set to the canonical URL.

  It also checks that the script is removed on non-article routes.
- I then parsed every built article page. Each has exactly one `BlogPosting`, no required field is missing, the `headline` equals the H1, and the `@id` equals the canonical tag:

```text
OK   aws-app-config-spring-boot-integration missing= [] headline==H1: True dateModified= 2026-08-04
OK   business-logic-auth-middleware missing= [] headline==H1: True dateModified= 2026-05-30
OK   distributed-locks-redis missing= [] headline==H1: True dateModified= 2026-07-12
OK   distributed-monolith-extra-invoices missing= [] headline==H1: True dateModified= 2026-06-21
OK   eventbridge-scheduler-quirks missing= [] headline==H1: True dateModified= 2026-05-18
OK   java-native-builds-graalvm-vs-leyden missing= [] headline==H1: True dateModified= 2026-09-12
OK   lambda-pricing-infra-alone missing= [] headline==H1: True dateModified= 2026-06-10
OK   open-knowledge-format-okf-vs-rag missing= [] headline==H1: True dateModified= 2026-09-02
OK   postgresql-access-control missing= [] headline==H1: True dateModified= 2026-10-12
OK   rate-limiting-token-bucket-spring-boot missing= [] headline==H1: True dateModified= 2026-07-02
OK   reinforcement-learning-from-rlhf-to-rlsc missing= [] headline==H1: True dateModified= 2026-09-21
OK   ssr-vs-ssg-rendering-hydration-dom missing= [] headline==H1: True dateModified= 2026-08-07
OK   telepathy-with-ai missing= [] headline==H1: True dateModified= 2026-08-08
OK   ui-design-trends-skeuomorphism-isometric-glass missing= [] headline==H1: True dateModified= 2026-10-04
OK   what-is-a-native-build missing= [] headline==H1: True dateModified= 2026-09-11
OK   why-use-redis-channels missing= [] headline==H1: True dateModified= 2026-08-12
```

No schema-validation library is installed in the repo, and I did not add one; the check above is a manual comparison against schema.org's `BlogPosting` properties and Google's Article guidance.

## Build, tests and local checks

- `pnpm lint`, `pnpm lint:imports`: pass.
- `pnpm test`: 25 files, 112 tests pass. New tests: internal links, blog catalog and related posts, structured data, hash scroll.
- `pnpm build:ssg`: 93 routes prerendered; internal link check passed (2,538 links).
- **Mobile, 375 px, Chromium through Playwright** on the PostgreSQL page:
  - No horizontal page scroll (`scrollWidth` 375). The first draft overflowed to 439 px because of long inline code; I shortened that code before committing.
  - The tables scroll inside their own box, like the post's existing tables.
  - The related-posts block stacks to one column.
- **Jump links:** all 9 Quick-fixes and in-page links scroll their target heading to 73 px from the top, just under the sticky header, at mobile width. A deep link with a percent-encoded hash also lands at 73 px on load.
  - Before the diagram dimensions were added, the first jump landed about 1,100 px off, because lazy-loaded SVGs without reserved space pushed the target down. The four diagrams now carry `width` and `height`.
- Desktop at 1440 px: the Quick-fixes table and the related-posts grid render as intended.

**Already broken before this change:**

- Clicking any in-page hash link on a blog article throws `Error: An action handler is already registered for subscription.submit.` in the console. The pre-change build does the same. Scrolling still works.
- `getAnalyticsPage` in `src/utils/seo.utils.ts` compares the pathname without a trailing slash (`pathname === "/pricing"`). On canonical URLs (`/pricing/`), the page view is classified as `error`. I did not change it because analytics was out of scope.
- The subscription preference pages link to `/letter/archive`, which has no route. They are client-only pages, so the crawl does not see them.
- `vercel.json` has a redirect `/about` → `/about/`, but no `/about` page is generated.

## Manual follow-ups for Ayush

1. **Redirects on Vercel.**
   - Check how `ayu-sh-kr.com` is attached under *Project → Settings → Domains*. For single-hop bare-domain redirects, attach it to the project without a domain-level redirect, so the new `vercel.json` host rules apply. If you keep the domain-level redirect, URLs still end up canonical, just in two hops.
   - `http://` → `https://` is handled by Vercel automatically.
2. **After deploy, request indexing** in Search Console (URL Inspection → "Request indexing") for:
   - `https://www.ayu-sh-kr.com/blog/postgresql-access-control/`
   - the canonical versions of the split URLs: `/blog/aws-app-config-spring-boot-integration/`, `/blog/distributed-locks-redis/`, `/blog/ssr-vs-ssg-rendering-hydration-dom/`, `/blog/what-is-a-native-build/`, `/blog/eventbridge-scheduler-quirks/`, `/blog/rate-limiting-token-bucket-spring-boot/`, `/legal/terms/`, `/legal/privacy/`.

   Inspecting the old slashless and bare-domain URLs should show the redirect to the canonical URL.
3. **Resubmit the sitemap** (`https://www.ayu-sh-kr.com/sitemap.xml`) in Search Console.
4. **Compare positions after 4–8 weeks** for the PostgreSQL queries:
   - "permission denied for sequence / table / database / relation"
   - "grant privileges", "show grants", "roles best practices"

   Also check that the slashless and bare-domain duplicates drop out of the Pages report.
5. If the deploy date is not 2026-10-12, update the PostgreSQL post's `updated` date, its in-body note and the sitemap `lastmod`.
