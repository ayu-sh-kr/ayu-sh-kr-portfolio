# Vercel routing: from a static SPA fallback to Nitro

This project is still a client-side single-page application (SPA): the browser-side Dota router decides which page component to show for `/blog`, `/pricing`, and so on. What changed is **where Vercel gets the HTML shell for a direct visit to one of those URLs**.

The short answer is:

- The **old** configuration rewrote every non-file page request directly to `index.html`.
- The **current** configuration sends unmatched deep page requests to Nitro's generated server function. That function returns the same kind of SPA HTML shell, while also allowing real server endpoints such as `/api/hello`.

The user-visible result for a deep page route is the same: opening `/blog/some-post` directly loads the app and then the browser-side router renders that page.

## The two configuration files have different jobs

| File | Owner | When it matters | Should we edit it? |
| --- | --- | --- | --- |
| [`vercel.json`](../vercel.json) | This repository | Before and during the Vercel build | Yes, when changing project-level build or Vercel settings. |
| `.vercel/output/config.json` | Nitro build output | After the Vercel-targeted build (`NITRO_PRESET=vercel pnpm build`) | No. It is generated, ignored by Git, and will be replaced on the next Vercel build. Inspect it to understand or debug the deployed route table. |

The root `vercel.json` currently does two things:

1. It runs `NITRO_PRESET=vercel pnpm build`. The environment variable makes the Nitro Vite plugin produce a Vercel deployment instead of the local Node deployment format.
2. It sets a one-year immutable cache header for fingerprinted files below `/assets/`.

It intentionally has **no `rewrites` property** now. Nitro creates the Vercel route table instead.

## How the earlier `index.html` rewrite worked

Before Nitro was introduced, `vercel.json` contained this rule:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

`/(.*)` is a catch-all pattern: it matches `/`, `/pricing`, `/blog/a-post`, and other paths. `destination: "/index.html"` means that Vercel returns the contents of the built SPA entry file for a matching page request.

It is a **rewrite**, not a redirect:

- A redirect tells the browser to navigate somewhere else, so its address bar changes.
- A rewrite keeps the browser's address as `/blog/a-post`, but Vercel obtains the response body from `index.html`.

The browser then downloads the JavaScript referenced by that HTML. The client-side router reads the still-visible URL (`/blog/a-post`) and selects the matching page. This is why a link clicked inside the app and a direct browser visit can render the same client-side route.

In simplified form, the old request looked like this:

```text
Browser asks for /blog/a-post
        ↓
Vercel fallback rewrites the response to /index.html
        ↓
Browser receives the SPA HTML and JavaScript
        ↓
Client-side router reads /blog/a-post and renders the article page
```

The rule was needed for a purely static deployment because a static host does not have an actual `/blog/a-post` file. Without a fallback, a direct visit would look for that file and normally return 404.

Vercel treats a rewrite as internal routing rather than a browser redirect. Its own documentation describes rewrites this way, and recommends framework-native routing when a framework generates its own routing behavior: [Rewrites on Vercel](https://vercel.com/docs/routing/rewrites).

## Why that rule was removed

The project now has Nitro and a server directory. For example, [`server/api/hello.get.ts`](../server/api/hello.get.ts) defines a same-origin API endpoint.

Keeping a handwritten catch-all `index.html` rule would be a poor fit for a server application: it could short-circuit Nitro's generated deployment routing, while API requests and future server routes need to return JSON, cookies, errors, redirects, or generated HTML rather than the SPA shell.

The July 29 change therefore replaced the manual SPA rewrite with this build command:

```json
{
  "buildCommand": "NITRO_PRESET=vercel pnpm build"
}
```

This is not removing the SPA fallback. It moves responsibility for that fallback from a handwritten Vercel rewrite to the Nitro server application.

## What the current generated route table means

After a Vercel-targeted build, Nitro creates `.vercel/output/`. The current `.vercel/output/config.json` contains these routes, shown here with comments added for explanation:

```text
1. /assets/(.*)        → add Cache-Control: public, max-age=31536000, immutable
2. handle: filesystem  → serve a matching file from .vercel/output/static
3. /api/subscription   → route the subscription POST endpoint into Nitro
4. /api/hello          → route the health-check endpoint into Nitro
5. /(.*)               → send every remaining request to /__server
```

Rules are evaluated in order. `handle: "filesystem"` starts the phase that checks static output. Therefore files produced in `.vercel/output/static` win before the final page fallback. Examples include:

| Request | Result |
| --- | --- |
| `/assets/index-<hash>.js` | Cache header is applied, then Vercel serves the JavaScript file from the static output/CDN. |
| `/robots.txt` | Vercel serves the static file. |
| `POST /api/subscription` | Nitro logs the placeholder subscription request and returns `{ "accepted": true }`; it does not store the email address. |
| `/api/hello` | Nitro handles the endpoint and returns its API response. |
| `/pricing` | It is not a static file, so Vercel forwards it to `__server`. |
| `/blog/a-post` | It is not a static file, so Vercel forwards it to `__server`. |

`/__server` is the generated Vercel Function at `.vercel/output/functions/__server.func/`; it is not a URL users should link to. It contains Nitro's route matcher. In this project the generated matcher first recognizes `GET /api/hello`; its final `/**` route returns the SPA renderer template. That template contains the equivalent of the app's HTML shell and references the compiled JavaScript and CSS assets.

The build also emits a static `index.html`, so the root URL `/` is normally satisfied in the filesystem phase. The explanation about `__server` applies to **deep SPA URLs** such as `/pricing` and `/blog/a-post`, for which no matching static file exists.

So a direct page request now follows this path:

```text
Browser asks for /pricing
        ↓
No matching static file exists
        ↓
Vercel sends the request to Nitro's __server function
        ↓
Nitro catch-all returns the SPA HTML shell
        ↓
Browser loads the client bundle; the client-side router renders /pricing
```

The important difference for a deep SPA URL is the middle of the diagram: the HTML is produced by Nitro's server function rather than served directly as a static `index.html` file. The browser still receives an SPA shell and keeps `/pricing` in its address bar.

## SSR: what Nitro can do, and what this project does today

**Current status: this project is not server-side rendering its Dota pages.** It is a client-rendered SPA whose HTML shell happens to be returned by a Nitro Vercel Function for deep links.

This is easy to prove from the current Vercel artifact. A request to `/pricing` returns this empty mount point:

```html
<div id="app">
  <app-root id="app-root"></app-root>
</div>
```

It does **not** contain the pricing heading, cards, or page-specific SEO metadata. Those appear only after the JavaScript bundle runs in the browser. In contrast, `GET /api/hello` is genuinely handled on the server and returns JSON.

### Nitro's SSR capabilities

Nitro is the server and deployment layer; it is not a UI renderer for a particular component framework. Its renderer can do all of the following:

| Capability | Nitro support | Current project |
| --- | --- | --- |
| Serve an SPA HTML template for unmatched routes | Yes; auto-detecting `index.html` is the default Vite behavior. | Yes. This is the current fallback. |
| Produce dynamic HTML on the server | Yes; a custom `renderer` handler can return a `Response`, and the renderer template supports request-aware template expressions. | No custom renderer is configured. |
| Insert framework-rendered HTML into a Vite page | Yes; Nitro replaces `<!--ssr-outlet-->` when Vite provides an `ssr` service/entry. | No SSR service or `<!--ssr-outlet-->` exists. |
| Hydrate rendered component markup in the browser | Depends on the UI framework. Nitro passes through the HTML; the framework must provide matching server rendering and client hydration. | No Dota server-renderer or hydration API is present in this project’s installed Dota Wrap package. |
| Prerender routes to static files during a build | Yes, after the renderer can generate the page HTML. | Not configured. |

The installed Nitro version is `3.0.260610-beta`. Its bundled renderer documentation explicitly describes both SPA serving and Vite SSR outlet support. Its SSR integration is still a Nitro 3 beta feature, so pin and test the version before basing a production migration on it. See [Nitro Renderer](https://nitro.build/docs/renderer) and [Nitro’s Vite SSR example](https://nitro.build/docs/examples/vite-ssr-html).

### Why the current fallback is not SSR

Serving HTML from a server function is not enough to call a page SSR. SSR means that the server has already rendered meaningful, route-specific page content into the HTML response. The distinction is:

```text
Current client-side rendering (CSR)
/pricing → Nitro returns <app-root> → browser runs JS → pricing DOM appears

Actual SSR
/pricing → server renders pricing DOM into HTML → browser can show it immediately → JS hydrates it
```

The current `index.html` has `<app-root>` but no `<!--ssr-outlet-->`, and `vite.config.ts` defines no SSR environment or server rendering entry. That is why Nitro emits a static renderer template and why the deployed function returns the unrendered mount point.

### What a real migration would require

Adding `<!--ssr-outlet-->` alone would not make this Dota application SSR. A correct migration needs all of these pieces:

1. **A server renderer for Dota pages.** It must accept the requested URL and data, then return complete markup for the matching page. The current custom-element code is browser-oriented, and no server rendering API is installed.
2. **A Vite SSR entry and Nitro SSR environment.** That entry supplies the route-specific markup which Nitro inserts into the outlet during an HTTP request.
3. **Hydration or an intentional client takeover.** The browser bundle must hydrate the server markup without duplicating it, replacing it, or running browser-only code on the server. If Dota cannot hydrate, a server-rendered marketing shell plus a client-only interactive island is a different, partial-SSR architecture.
4. **Server-safe routing, data, and SEO.** The server must choose the same route as the client, load blog/showcase data, emit route-specific title/canonical/description tags, and avoid `window`, `document`, `localStorage`, and analytics calls while rendering.
5. **Request-level verification.** A no-JavaScript request to `/pricing` and `/blog/<slug>` must contain visible route content and correct route metadata. Then verify a hydrated browser does not flicker, duplicate content, or issue a second incompatible render.

For this content-heavy portfolio, static prerendering selected public routes could be a lower-complexity first goal once a server renderer exists. It gives HTML to crawlers and no-JavaScript visitors, while APIs and interactive controls remain client-side or server-function based. Do not enable SSR solely by changing `vercel.json`: this is primarily a Dota rendering-and-hydration capability decision, not a Vercel routing switch.

## Mental model: routing happens twice

It helps to separate the two layers instead of treating “routing” as one thing:

| Layer | Owner | Question it answers |
| --- | --- | --- |
| Vercel deployment routing | Vercel + Nitro output | Which static file or server function receives this HTTP request? |
| Nitro server routing | Files under `server/`, plus Nitro's fallback | Is this an API request, a server route, or a request for the SPA shell? |
| Browser SPA routing | Dota route configuration | After the HTML and JavaScript load, which page component should be visible? |

For `/api/hello`, the server-routing answer is “return API data”; the browser SPA router is not involved. For `/pricing`, the server-routing answer is “return the SPA shell”; then the browser router renders the pricing page.

## What to change in future

- Add an API endpoint under `server/api/`; do not add a new catch-all `index.html` rewrite for it.
- Keep page fallback behavior in Nitro unless the deployment architecture intentionally changes back to a static-only site.
- Edit [`vercel.json`](../vercel.json) for project-level Vercel options such as the build command or headers.
- Inspect, but do not manually edit, `.vercel/output/config.json`. Re-run the build to regenerate it.
- When debugging a deployment, verify one example from each class: a fingerprinted asset, a public static file, an API route, and a deep SPA link.

Vercel documents `.vercel/output` as the Build Output API: [Build Output API](https://vercel.com/docs/build-output-api). Its `config.json` documentation describes `routes` and `handle: "filesystem"`: [Build Output Configuration](https://vercel.com/docs/build-output-api/configuration).
