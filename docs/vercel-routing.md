# Vercel routing for the static portfolio

The portfolio is deployed as a static Dota SSG site. `pnpm build` writes the browser bundle and prerendered home page to `dist/`; Vercel deploys that directory directly.

`vercel.json` owns the deployment behavior:

- `buildCommand` runs `pnpm build`.
- `outputDirectory` deploys `dist`.
- the `/assets/(.*)` header keeps fingerprinted bundles cacheable for one year.
- the catch-all rewrite returns `index.html` for client-side routes such as `/pricing` and `/blog/<slug>`.

The rewrite preserves the address in the browser. After the static entry document loads, Dota's client router reads that path and renders the matching page.

```text
Browser requests /pricing
        ↓
Vercel rewrites the request to /index.html
        ↓
Browser loads the static JavaScript and CSS bundles
        ↓
Dota router renders /pricing
```

The root route is prerendered by Dota SSG and served as `dist/index.html`. Additional routes can opt in by declaring `@Route({ ssr: true })`; Dota writes their static HTML during the same build.

This deployment has no server function or same-origin API routes. If the portfolio needs server behavior later, deploy it as a separate backend or add a dedicated Vercel Function with an explicit data-handling policy.
