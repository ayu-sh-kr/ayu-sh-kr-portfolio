# Ayush Kumar Portfolio

The source for [ayu-sh-kr.com](https://ayu-sh-kr.com): a fast, content-driven portfolio for backend engineer Ayush Kumar. It presents selected work, writing, services and pricing, speaking, support, and legal information in a TypeScript single-page application.

The app is built with native web components through [Dota Wrap](https://www.npmjs.com/package/@ayu-sh-kr/dota-wrap), Vite, and Tailwind CSS.

## What is included

- Portfolio, career journey, skills, services, contact, and speaking sections
- Project showcase with filterable project cards and Markdown case studies
- Blog index, category filtering, article pages, and Markdown rendering
- Pricing, estimate, project-start, coffee-support, and support flows
- Light/dark theme preference, offline route, toast and alert primitives, and responsive navigation
- Route-specific SEO metadata, canonical URLs, Open Graph metadata, sitemap, and robots directives
- GA4 event and section tracking behind a typed application-event boundary
- Public Markdown documents for terms and privacy policy

## Technology

| Area | Choice |
| --- | --- |
| Language | TypeScript (strict mode) |
| Build and development server | Vite 8 with Dota Wrap's composed integrations |
| UI model | Native custom elements via Dota Wrap |
| Styling | Tailwind CSS 4 plus shared CSS tokens |
| Markdown | `@ayu-sh-kr/dota-md` with a local theme configuration |
| Component utilities | `@ayu-sh-kr/dota-ui` |
| Package manager | pnpm |
| Hosting configuration | Vercel static deployment |

## Requirements

- Node.js `^20.19.0` or `>=22.12.0` (required by Vite 8)
- pnpm 11 or newer

## Run locally

```bash
pnpm install
pnpm dev
```

Open the URL Vite prints, normally `http://localhost:5173`.

To make the development server available on the local network:

```bash
pnpm dev:host
```

Create a production build and preview it locally:

```bash
pnpm build
pnpm preview
```

`pnpm build` type-checks the application, generates Dota component/route and event metadata, and writes the static site to `dist/`.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Portfolio landing page |
| `/showcase` and `/showcase/:slug` | Project catalogue and Markdown case studies |
| `/blog` and `/blog/:slug` | Writing index and Markdown articles |
| `/pricing` | Services, pricing, estimator, and project enquiry flow |
| `/coffee` | One-time support flow |
| `/support` | Support and project handoff information |
| `/legal/privacy`, `/legal/terms` | Legal Markdown documents |
| `/design` | Design-system overview |
| `/design/typography`, `/design/color`, `/design/element`, `/design/layout`, `/design/alert`, `/design/toast`, `/design/interaction` | Live design-system references |
| `/offline`, `/error` | Connection and error states |

Direct navigation to these client-side routes is rewritten to `index.html` by Vercel, then the browser-side router renders the matching page. See [Vercel routing](docs/vercel-routing.md) for the static request flow.

## Content workflow

Keep authored copy in the corresponding data module under `src/data/`; routes and components should compose that data rather than own content literals.

- Add or edit blog post metadata in [src/configs/blogs.config.ts](src/configs/blogs.config.ts), then add its Markdown source in `public/blogs/<category>/`.
- Add or edit showcase metadata in [src/data/showcase-content.ts](src/data/showcase-content.ts), then add its Markdown source in `public/showcases/`.
- Edit terms and privacy policy in `public/legal/`.
- Update [public/sitemap.xml](public/sitemap.xml) whenever a public, indexable route or article changes.

Markdown is fetched from `public/` at runtime; a missing source file will render the associated article error state.
See [Markdown pages](docs/markdown-pages.md) for the page-family contracts, supported authoring patterns, and the editing checklist.
See [Content automation plugin](docs/content-automation-plugin.md) for the audited plan to generate typed catalogues, routes, grouping, and sitemap entries from Markdown.

## Project layout

```text
src/
  components/      Page sections and shared custom elements
  configs/         Blog catalogue and Markdown theme configuration
  data/            Page copy, SEO, pricing, portfolio, and email content
  events/          Typed application event definitions
  pages/           Route shells
  service/         Markdown loaders, analytics, alerts, and toasts
  utils/           SEO, routing, analytics, DOM, and lifecycle helpers
  main.ts          Application bootstrap and global route hooks
public/
  blogs/           Article Markdown sources
  showcases/       Case-study Markdown sources
  legal/           Privacy and terms Markdown sources
  fonts/           Self-hosted font assets and licences
docs/flows/        Architecture and interaction-flow diagrams
```

## Deployment

For Vercel, `vercel.json` runs the static Dota SSG build, deploys `dist/`, rewrites client-side routes to `index.html`, and caches fingerprinted `/assets/` files for one year. See [Vercel routing](docs/vercel-routing.md) for the request flow.

The deployed domain is encoded in [src/data/portfolio-content.ts](src/data/portfolio-content.ts) and [src/utils/seo.utils.ts](src/utils/seo.utils.ts). Change both the site identity and `SITE_ORIGIN` before deploying a fork to another domain. The root package is named `ayu-sh-kr-portfolio` and remains private, so it is not publishable to npm.

## Static deployment

The portfolio has no server API routes. The article-updates call to action opens the visitor's email client instead of collecting email addresses in the site.

## Analytics and privacy

GA4 is loaded in [index.html](index.html). Components publish typed, privacy-conscious application events; [src/service/analytics-event.listener.ts](src/service/analytics-event.listener.ts) is the only layer that forwards them to Google.

Before deploying, confirm that the privacy policy accurately reflects the chosen analytics and hosting configuration, and update the GA measurement ID when deploying a separate site.

### Emitted GA4 events

The application uses one internal `analytics:track` event to carry typed facts to the Google Analytics listener. That internal event is not sent to GA4 directly. The listener forwards these event names through `gtag("event", ...)` and adds `page_title` and `page_location` to every event:

| Event | Emitted when | Custom parameters |
| --- | --- | --- |
| `page_view` | A route finishes rendering | `page`, `page_path`, optional `slug` |
| `section_view` | A marked section enters the viewport | `section`, `page_path` |
| `contact_click` | A contact or profile destination is selected | `method`, `surface` |
| `cta_click` | A showcase call-to-action is selected | `action`, `surface` |
| `project_open` | A blog article or showcase project is opened | `kind`, `slug`, `surface` |

The current parameter values are intentionally stable identifiers rather than visible copy. Contact methods are `email`, `resume`, `call`, `github`, and `linkedin`; project kinds are `blog` and `showcase`; CTA actions are `conversation` and `pricing`. Section identifiers are declared in [src/events/analytics.events.ts](src/events/analytics.events.ts).

### GA4 registration

These application events do not need to be created in the GA4 interface before the site sends them. Once the Google tag is loaded, GA4 can collect an event sent with `gtag("event", eventName, parameters)`. Use Realtime or DebugView to verify the events after deployment.

Register an event parameter as an event-scoped custom dimension only when it needs to be used in detailed reports, explorations, or audiences. Mark an event as a key event only when it represents an important business outcome, such as a qualified contact action.

See Google’s guides for [setting up GA4 events](https://developers.google.com/analytics/devguides/collection/ga4/events), [event parameters](https://support.google.com/analytics/answer/13675006), [custom dimensions](https://support.google.com/analytics/answer/14239696), and [key events](https://support.google.com/analytics/answer/13128484).

## Project audit — August 2026

The repository currently passes `pnpm build`; `pnpm audit --prod` reports no known production dependency vulnerabilities. The build reports 19 decorated route candidates, with `/offline` added explicitly during bootstrap, and emits a single client JavaScript bundle of about 1.90 MB (540 kB gzip), which still triggers Vite's 500 kB warning.

Items to address before a public deployment:

1. **Privacy-policy alignment:** the policy now describes the deployed Vercel hosting and the standard GA4 tag at an abstract level. Before public deployment, verify the actual GA4 property retention and regional consent requirements against the live configuration.
2. **Initial JavaScript size:** the production entry bundle is about 1.90 MB (540 kB gzip), above Vite's 500 kB warning threshold. Lazy-loading non-core routes such as design references, articles, or pricing flows would reduce first-load cost.
3. **Quality automation:** there are no lint or test scripts. Add a test runner and a lint/format command, then run them in CI alongside `pnpm build`.
The current `public/sitemap.xml` contains 32 URLs, including all eight configured blog posts, all eight showcase projects, the design references, and the public legal and product routes. Recheck it whenever a public route or catalogue entry changes.

## Licence

The repository uses the [Portfolio Source and Design Licence](LICENSE). It allows people to read, study, and reuse adapted technical code, including in their own projects, but it does not allow publishing this repository as-is, selling it as a template, or reusing this project's distinctive UI design, content, branding, illustrations, or other project-specific creative assets. Third-party fonts and assets remain under their own licences.
