# Ayush Kumar Portfolio

Source for [ayu-sh-kr.com](https://ayu-sh-kr.com), Ayush Kumar’s personal portfolio and technical writing site. It brings together selected projects, engineering articles, Dispatch news, service enquiries, and support.

The frontend uses TypeScript and native custom elements through Dota Wrap, with Vite and Tailwind CSS. Public pages are prerendered for deployment, then run in the browser with client-side navigation. Newsletter subscriptions, enquiries, support tickets, and coffee payments connect to a separate backend.

## Getting started

Use Node.js 22.12 or newer and pnpm. Install dependencies and start Vite:

```bash
pnpm install
pnpm dev
```

Open the URL printed in the terminal, usually `http://localhost:5173`. Use `pnpm dev:host` to expose the development server on your local network.

### Backend configuration

The backend is not included in this repository. In development, Vite proxies API paths to `http://localhost:8080` by default. Content pages can be explored without it; API-dependent features need a running backend.

To change the local target or simulated visitor region, create `.env.local`:

```dotenv
VITE_DEV_API_TARGET=http://localhost:8080
VITE_DEV_CLIENT_REGION=IN
```

The proxy adds local region, country, locale, and timezone headers. See [the proxy configuration](src/configs/local-api-proxy.config.ts) for supported paths and region handling.

`VITE_API_BASE_URL` sets the API base URL used by the application. For local proxying, keep API requests on the Vite origin; an external base URL bypasses that proxy. Deployment must supply the appropriate API base URL. Variables prefixed with `VITE_` are exposed to the frontend and must not contain secrets.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm dev:host` | Start development with network access |
| `pnpm lint` | Check TypeScript types without emitting files |
| `pnpm lint:imports` | Run ESLint |
| `pnpm lint:fix` | Apply automatic ESLint fixes |
| `pnpm test` | Run the Vitest suite once |
| `pnpm build` | Type-check and build the client application |
| `pnpm build:ssg` | Type-check, prerender pages, and check internal links |
| `pnpm check:links` | Check internal links in an existing `dist/` build |
| `pnpm preview` | Serve the production build locally |

To preview the deployment build:

```bash
pnpm build:ssg
pnpm preview
```

Build output goes to `dist/`. Dota’s Vite integrations also generate component, route, and event metadata.

## What’s in the site

- **Portfolio and showcase:** career, skills, services, and project case studies.
- **Blog and Dispatch:** technical articles and shorter news briefs, authored in Markdown.
- **Enquiries and support:** pricing estimates, project enquiries, support tickets, and coffee checkout.
- **Newsletter:** subscription, verification, preferences, and unsubscribe flows.
- **Design references:** live examples of the site’s typography, colors, components, and interactions.
- **Shared UI:** responsive navigation, light and dark themes, privacy notice, alerts, and toasts.

## Project structure

```text
src/
  pages/           Route components
  components/      Page sections, design references, and shared UI
  configs/         Content catalogues, Markdown configuration, and integrations
  data/            Authored page copy, SEO metadata, and site configuration
  service/         Content loaders, API flows, analytics, and UI services
  events/          Typed application events
  utils/           Shared routing, SEO, DOM, and lifecycle helpers
  main.ts          Application bootstrap
  theme.css        Theme palette
  style.css        Global styles and semantic tokens
public/
  blogs/           Blog Markdown and article assets
  news/            Dispatch Markdown and assets
  showcases/       Project case studies
  legal/           Privacy policy and terms
  fonts/           Self-hosted fonts and their licences
docs/              Implementation notes and architecture diagrams
scripts/           Build checks and benchmarks
```

The main libraries are `@ayu-sh-kr/dota-wrap` for components and routing, `@ayu-sh-kr/dota-md` for Markdown rendering, and `@ayu-sh-kr/dota-ui` for shared UI utilities. See [package.json](package.json) for dependency versions and scripts.

## Editing content

Keep page copy in the corresponding module under `src/data/`. Article metadata and Markdown live separately:

| Content | Metadata | Markdown |
| --- | --- | --- |
| Blog | [blogs.config.ts](src/configs/blogs.config.ts) | `public/blogs/<category>/` |
| Dispatch | [news.config.ts](src/configs/news.config.ts) | `public/news/` |
| Showcase | [showcase-content.ts](src/data/showcase-content.ts) | `public/showcases/` |
| Legal | Page-owned configuration | `public/legal/` |

When adding a public article, register its metadata and source, add its prerender route in [vite.config.ts](vite.config.ts), and update [sitemap.xml](public/sitemap.xml) and [llms.txt](public/llms.txt). Check canonical URLs and redirects in [vercel.json](vercel.json), then run `pnpm build:ssg` to verify the output and internal links.

See [Markdown pages](docs/markdown-pages.md) for rendering and authoring conventions. Repository-specific publishing guidance lives in [AGENTS.md](AGENTS.md) and the skills it references.

## Deployment

[Vercel configuration](vercel.json) runs `pnpm build:ssg` and publishes `dist/`. The build prerenders configured routes; routing configuration provides canonical redirects and an `index.html` fallback for client-side navigation. See [Vercel routing](docs/vercel-routing.md) for details.

The Vite development proxy does not run in production. Backend connectivity must be configured separately from static hosting.

Site identity and canonical-origin settings live in [portfolio-content.ts](src/data/portfolio-content.ts) and [seo.utils.ts](src/utils/seo.utils.ts). Analytics configuration and the privacy policy should match the deployed environment; see [analytics documentation](docs/analytics.md).

## Further documentation

- [Markdown pages and content authoring](docs/markdown-pages.md)
- [Analytics events and tracking](docs/analytics.md)
- [Pricing and project-enquiry backend contract](docs/pricing-start-project-backend.md)
- [Vercel routing and static delivery](docs/vercel-routing.md)
- [Architecture and interaction diagrams](docs/flows/)

## Licence

This is a source-available project under the [Portfolio Source and Design Licence](LICENSE). It permits studying the source and reusing adapted technical code subject to its terms. It does not permit redistributing the repository as a template or reproducing its distinctive design, content, branding, or creative assets. Third-party assets retain their own licences.
