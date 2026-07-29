# Iteration 21 — integrate Nitro as the application backend

## Outcome

Move this Dota Web application from a static Vite site with optional external APIs to a single full-stack application: Vite continues to build the client, while Nitro owns the same-origin server runtime, API routes, server configuration, and deployment preset. No feature endpoint is part of this iteration—the deliverable is the backend foundation that future features can use consistently.

Nitro is the recommended direction because it has an official Vite integration, file-based server routes, portable deployment presets, storage and caching primitives, and a framework-agnostic server boundary. The client remains the existing Dota Web SPA; this is not a migration to Nuxt or a replacement of its component/router system.

```text
Browser
  ├─ /, /blog, /pricing, …  → existing Dota SPA assets and client router
  └─ /api/**                → Nitro route handlers
                                   ├─ domain services
                                   ├─ persistence / providers
                                   ├─ auth and rate limiting
                                   └─ observability
```

## Scope and non-goals

In scope:

- One local development command serving the Dota client and Nitro routes from the same origin.
- One production build/deployment artifact or an explicitly supported host preset.
- A backend directory layout, typed configuration boundary, request/error conventions, and test seam.
- Static assets and SPA deep links continuing to work exactly as they do today.

Out of scope:

- Building any business feature, database schema, authentication flow, or form endpoint.
- Server-side rendering the Dota client.
- Keeping a parallel Vite-only development API after Nitro is introduced.

## Architecture decisions to make first

| Decision | Recommended initial choice | Why it matters |
| --- | --- | --- |
| Server framework | Nitro with its Vite plugin | Keeps the existing client build and gives the app a production server layer. |
| Server root | `server/` | Clear ownership for `api/`, `services/`, `utils/`, `plugins/`, and tests. |
| API prefix | `/api/` | Separates API routing from SPA routes and static assets. |
| First deployment target | Node preset during integration | Simplest way to validate one complete server artifact before optimizing for a serverless host. |
| Existing Vercel setup | Keep static deployment until the Nitro artifact passes acceptance | Prevents an unverified rewrite from breaking existing deep links. |
| Data access | No database dependency in the foundation PR | Lets storage/auth choices follow actual product requirements. |

The deployment target must be confirmed before production rollout. If Vercel remains the host, validate Nitro’s Vercel preset and revise `vercel.json` as part of that deployment work; do not retain the current catch-all rewrite if it steals `/api/**` requests from Nitro.

## Implementation sequence

### 1. Baseline and compatibility spike

Record the current contracts before changing tooling:

- `pnpm dev`, `pnpm build`, and `pnpm preview` behavior.
- Every client route from `src/pages`, including parameterized blog and showcase URLs.
- Vercel rewrites, cache headers, public assets, and generated Dota virtual modules.

Create a small branch/spike that adds the current Nitro package and its official Vite plugin to `vite.config.ts`, configured with `serverDir: "./server"`. The spike succeeds only when Vite HMR, generated Dota components/routes, and a trivial non-business Nitro handler all run in the same dev process. Delete the trivial handler before merging the foundation if no real backend feature is ready.

### 2. Build and serve integration

Define scripts around one source of truth:

- `dev`: Vite development server with Nitro’s Vite integration.
- `build`: typecheck, build client assets, and build the selected Nitro preset.
- `start`: run the generated Nitro server artifact for the Node preset.
- `test:server`: execute server-only unit/integration tests without loading browser components.

During this step, prove all four route classes in production mode: an SPA deep link, a static public asset, an asset emitted by Vite, and a future-reserved `/api/` route. Choose and document how the Vite output is made available to Nitro—do not rely on a development-only proxy or a Vercel rewrite.

### 3. Establish the server module boundary

Create the directory structure without implementing a product endpoint:

```text
server/
├── api/              # file-based HTTP handlers; /api/** only
├── services/         # provider/database orchestration
├── domain/           # framework-independent use cases and types
├── utils/            # parsing, response, and error helpers
├── plugins/          # Nitro startup/runtime hooks
└── tests/            # handler and service tests
```

Rules for future backend work:

- Route handlers translate HTTP concerns only; domain services hold business logic.
- Browser components call only documented same-origin endpoints and never import `server/` modules.
- Runtime configuration is read from Nitro runtime config, not browser-exposed `VITE_*` values. Public values must be explicitly separated from secrets.
- Every API response uses a shared success/error envelope and stable error codes; validation failure must not expose stack traces.
- Keep Dota events client-side. Publish API state through client services/events after requests complete rather than importing server state into a component.

### 4. Cross-cutting production controls

Before the first state-changing endpoint, add the shared controls once:

- Environment validation at server startup; secrets never enter client bundles or logs.
- Structured logging with request IDs and redaction for credentials, tokens, and personal data.
- A central error boundary that maps known domain errors to safe HTTP responses.
- Input validation at the route boundary, body-size limits, and method/content-type policies.
- Rate limiting and abuse protection appropriate to the deployment platform.
- CORS disabled by default for the same-origin app; define a deliberate origin policy only if another client is introduced.
- CSRF protection when cookie-backed authentication or session mutations are introduced.
- Health/readiness endpoint only when the selected host needs it, with no internal configuration disclosure.

### 5. Deployment migration

Deploy a staging environment with the selected Nitro preset before changing production:

1. Build the client and Nitro artifact in CI.
2. Start or deploy the artifact using the target preset.
3. Verify SPA fallback, static assets, cache headers, and `/api/**` precedence.
4. Confirm environment variables are server-only unless intentionally public.
5. Add platform-native logs, error reporting, and rollback instructions.
6. Switch production traffic only after the acceptance checklist passes.

## Acceptance checklist

- [ ] `pnpm dev` provides client HMR and discovers Nitro file-based routes.
- [ ] `pnpm build` produces a deployable client-plus-server result for the chosen preset.
- [ ] A production-mode process serves direct navigation to every existing SPA route.
- [ ] `/api/**` reaches Nitro and never falls through to `index.html`.
- [ ] Existing Vite/Dota plugins still generate components, routes, web types, and event maps.
- [ ] Public assets retain their current cache behavior.
- [ ] Server-only configuration is absent from the generated client output.
- [ ] Server tests cover routing, validation/error mapping, and one deployment smoke path.
- [ ] Vercel configuration is either removed/replaced for the Nitro target or verified not to intercept server routes.

## Future feature workflow

Once this foundation is accepted, each backend feature follows the same vertical slice:

1. Define the domain input/output and failure cases.
2. Add validation and a Nitro route in `server/api/`.
3. Implement the service/provider behind it.
4. Add handler and service tests.
5. Add a small client service that calls the contract.
6. Let the relevant Dota component render loading, success, and error states through its established event/lifecycle patterns.

This keeps the backend extensive enough to grow with the application without pre-committing this iteration to a particular API or data model.
