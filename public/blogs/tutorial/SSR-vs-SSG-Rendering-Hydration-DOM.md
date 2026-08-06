# SSR vs SSG for SEO and AI-built websites

When you compare server-side rendering (`SSR`) with static site generation (`SSG`), you will find that both send `HTML` a browser can read before it runs application `JavaScript`. That shared property is useful, but it does not make them interchangeable. We need to decide when the `HTML` is produced, what information it may depend on, and what work remains when the page reaches the browser.

If you own a website, this decision affects search visibility, sharing previews, analytics coverage, infrastructure cost, and how quickly a visitor can use the page. That matters even more now that an AI website builder can produce a polished page in minutes. A generated design can look complete while its content, routes, metadata, and initial `HTML` remain difficult for search engines to understand.

For your engineering team, rendering sets a boundary between build-time work and request-time work. For the person asking why a new website is not showing up on Google, it explains whether the page exposes useful content before client code runs. Let us work through the concepts without making a framework the starting point.

## The short version

With `SSG`, you create `HTML` ahead of time, usually during a build or content publication step. Your `CDN` can then return the same prepared file to many visitors. It is a strong default when your content changes on a known publishing schedule and the page does not need request-specific data.

With `SSR`, your server creates `HTML` for a request, using the data and conditions available at that moment. It is appropriate when the initial document needs to reflect fresh data, the requested URL, a market, an experiment, or an authenticated visitor. Your server does more work per request, but the response can be current and tailored.

Neither term alone tells you whether a page is interactive. A server-rendered or static page can contain no client-side application at all. If client `JavaScript` takes ownership of rendered interactive components, we call that later step `hydration`.

## Rendering: turning application state into a document

When we render, we turn data and rules into a representation of your user interface. On the web, the first useful representation is often `HTML`:

~~~html
<article>
  <h1>SSR vs SSG</h1>
  <p>Choose when the page needs to become current.</p>
</article>
~~~

The browser parses that response into a Document Object Model (`DOM`), calculates styles, lays out the page, and paints it. Your visitor can read the article before a large `JavaScript` bundle has downloaded. A crawler can also find the heading and body as ordinary document content.

You can render in several places. A traditional server template may merge a record and a template on every request. A static generator may run that same kind of template once for every article at build time. A component-oriented application may render an equivalent component tree on the server. In each case, we are answering the same question: when should this HTML be made?

## SSG: render at build time

With `SSG`, your publishing pipeline fetches or receives content, renders each known route, and writes ready-to-serve assets such as `HTML`, `CSS`, `JavaScript`, images, and feed files. A request for an article normally reaches your `CDN` or static host rather than application code.

For example, a portfolio with twenty case studies can create twenty article documents when a change is published. Every visitor then receives the same version until the next build or regeneration step.

For you, this provides predictable delivery:

- The origin has little or no per-visitor rendering work.
- CDN caching is simple because responses are reusable.
- Failures in a database or CMS do not usually prevent an already-published page from being served.
- The content version is explicit: a visitor sees the version that was built.

What you trade away is freshness. If a product price, availability count, or breaking news item must change immediately, you need a rebuild, targeted regeneration, or some client-side update. Those mechanisms can be effective, but they are still a policy for accepting a period of staleness.

## SSR: render at request time

With `SSR`, a request reaches your application or rendering service. It obtains the data needed for the route, produces the initial `HTML`, and returns it. You can cache the response, but you start from the premise that the page may need to be calculated now.

Consider an account page in your product. The first document may need the signed-in person's name, permissions, current invoices, and the status of an operation. Prebuilding one HTML file cannot safely express all of those combinations. Rendering after the request has identified the visitor can.

SSR does not make every route dynamic by default. You can cache a rendered category page for a minute, serve an anonymous product page from an edge cache, and render only the account area per request. In practice, you will often choose per route or per data dependency, not once for an entire website.

## Build time and runtime are a real compromise

The distinction becomes clearer when the work is placed on a timeline:

| Concern | Static site generation | Server-side rendering |
| --- | --- | --- |
| When HTML is generated | Before visitors arrive | While handling a request |
| Data freshness | As fresh as the latest build or regeneration | As fresh as the request's data source and cache policy |
| Cost pattern | Work concentrated in builds | Work incurred by requests, with caching reducing it |
| Personalisation in initial HTML | Limited to shared variants | Natural when identity and permissions are available |
| Failure dependency | Published files can outlive an origin outage | Render path depends on available services unless a cached response exists |
| Best fit | Stable, public, repeatable content | Fresh, contextual, or user-specific content |

When you choose SSG, you exchange runtime flexibility for delivery simplicity. When you choose SSR, you exchange some delivery simplicity for the ability to make a decision at the time it matters. That is why we often favour SSG for an editorial site, while a signed-in dashboard often needs SSR or a client-rendered data layer after a minimal shell.

## Hydration: making existing HTML interactive

You will often hear `hydration` described as attaching `JavaScript` to server-rendered `HTML`. More precisely, the client runtime rebuilds enough of the interface's expected state to recognise the existing `DOM`, then connects event handlers and reactive updates to it.

Imagine your server returns a product page containing a quantity selector and an Add to cart button. Before hydration, the button is visible and its label is useful, but it may not respond to a click. The browser downloads the relevant JavaScript, creates the client-side representation of that component, checks that its expected output matches the existing nodes, and registers the click behaviour. Your visitor can then update the cart count without replacing the entire document.

Hydration lets you preserve fast, readable initial HTML while enabling rich interaction. It also has a cost: your JavaScript must be transferred, parsed, executed, and kept in memory. If you hydrate an entire page that only has one interactive filter, you can make a simple page more expensive than its interaction deserves.

You can reduce that cost by hydrating only interactive sections, delaying hydration until a control is visible or used, or keeping interactions on the server. The rule is straightforward: send client code only where the browser must own an interaction.

## Why hydration mismatches happen

Your server and browser must agree about the initial `UI`. If the server prints one value but the client calculates another before `hydration`, the runtime may warn, discard nodes, or repair the `DOM`. You may see a flicker, lost input, or a button that is temporarily inconsistent.

Common causes include:

- Rendering the current time, a random value, or a locale-specific date differently on the server and client.
- Reading browser-only storage while generating the first client render.
- Depending on an asynchronous request that returns a different result after the document was sent.
- Rendering content conditionally from viewport size before a browser has measured it.

The safe approach is to make your initial state deterministic, pass it from server to client when needed, and defer browser-only differences until after hydration.

## DOM changes: mount, diff, patch, and update

Once the browser owns an interactive interface, you need a way to reflect state changes in the `DOM`. Let us separate four terms that are often used together.

### Mount

Mounting creates your interface in a DOM location for the first time. A client-rendered application might mount into an empty application container. A hydrated component usually does not create all its nodes again; it adopts the server-created nodes and begins managing them.

### Update

An update begins when state changes: your visitor increments a quantity, a request finishes, or a notification arrives. The system determines what your UI should look like for the new state. Updating does not necessarily mean changing every node.

### Diff

A `diff` compares the previous expected `UI` with the next expected `UI`, or compares the next expected `UI` against server-produced `DOM` during `hydration`. It helps the renderer identify the smallest meaningful set of changes: text that changed, an item that was added, an attribute that must be removed, or a component that no longer belongs.

Different rendering systems use different techniques. Some compare virtual trees, some compile direct update instructions, and some use fine-grained dependency tracking. As you choose among them, keep the shared goal in view: avoid treating a small state change as a reason to recreate the whole page.

### Patch

A `patch` applies the necessary mutation to the real `DOM`. If your cart count changes from 2 to 3, a patch may update one text node. If your list gains an item, it may insert one element in the correct position. If the page structure changes substantially, the patch can be larger.

The lifecycle is therefore:

~~~text
initial state → mount or hydrate → state changes → determine next UI → diff → patch DOM
~~~

When you render repeated lists, keys or stable identifiers matter. They help a renderer preserve the identity of an existing row when neighbouring items change. Without that identity, a renderer may reuse or replace the wrong DOM node, causing focused inputs, animations, or local row state to behave unexpectedly.

## Two illustrative approaches, without making this a framework choice

With a streamlined server-first approach, you may render a page on the server and use small browser enhancements only for specific controls. Your search form can submit to the server, and a date picker can add a modest amount of JavaScript. Most DOM changes are complete page navigations or narrowly scoped updates. This model keeps your client runtime small and works well when the server remains the source of truth.

With a modern component-based approach, you may render the first view on the server, then hydrate a component tree in the browser. Your app can respond immediately to local interaction and patch only the changed nodes, while the server still provides initial HTML and data. This is useful when you need rich filtering, collaborative controls, or an interface where a sequence of client-side actions should feel continuous.

You can engineer either approach well. The first makes the browser responsible for less. The second gives the browser more responsibility and must justify its JavaScript, hydration, and state-management cost. The terminology is less important than the boundary we set: where is each piece of truth calculated, and when is it allowed to change?

## What this means for SEO

Search engines can execute `JavaScript` to varying degrees, but if you rely on it for essential content, you add uncertainty and work. `SSR` and `SSG` give crawlers a complete initial document containing your page title, canonical URL, headings, main text, internal links, and structured data.

For your public article or product category, start with this baseline:

- Put the primary content and meaningful links in the initial HTML.
- Generate accurate title, description, canonical, Open Graph, and structured-data metadata on the server or during the build.
- Keep URLs stable and return appropriate HTTP status codes.
- Avoid hiding essential text behind a browser-only interaction.

This does not mean you must generate every `SEO`-relevant page on every request. `SSG` is often excellent for search because the crawler receives finished `HTML` quickly. `SSR` is useful when your content or metadata must be current at request time. In either case, make indexable information available without waiting for the client application to reconstruct the page.

## Why your AI-generated website is not showing up on Google

An AI-generated website is not automatically excluded from search results. Google states that appropriate use of generative AI is not against its guidelines; the concern is content created mainly to manipulate rankings rather than help people. The same standard applies whether a person, a template, an AI tool, or a combination of them produced the page. What matters is the result: can Google access it, understand it, and find enough value to rank it for a relevant query?

That distinction helps us separate three states that are often described as “SEO not working”:

- **Not discovered:** Google has not found the URL through a sitemap, internal link, or external link.
- **Not indexed:** Google found the URL but did not add it to the searchable index, or a technical directive prevented indexing.
- **Indexed but not ranking:** The page is eligible to appear, but other results better satisfy the search intent or carry stronger evidence and authority.

Before changing your rendering framework, identify which state you are actually dealing with. Search Console's URL Inspection report can show whether Google knows the page, which canonical it selected, and whether crawling or indexing encountered a problem.

### The page looks complete, but the initial HTML is empty

Many instant website builders assemble the visible page in the browser. The server may return a small application shell, then `JavaScript` fetches the content and mounts the page. A person with a modern browser eventually sees the design, but a crawler first receives little more than an empty root element.

Google can render JavaScript, but rendering adds another stage and can expose timing, blocked-resource, or runtime failures. If the main heading, service description, product details, and internal links are absent from the initial response, you have made discovery and interpretation less direct than they need to be.

Check the response itself, not only the Elements panel after the app has run. Use View Source, disable JavaScript, or request the URL with a command-line HTTP client. If the meaningful content is missing, use `SSG` for stable public pages or `SSR` for pages that need request-time data. Hydrate only the interactions that need browser ownership.

### The site repeats generic content instead of answering a search

AI builders are good at producing plausible headings such as “Transform your business” and “Solutions tailored to you.” Those phrases fill a layout, but they do not establish what you provide, who it is for, where it is available, how it works, or why the reader should trust it.

A page needs a clear search purpose. A useful service page can explain scope, constraints, process, location, pricing conditions, evidence, and common questions. A useful article should resolve a specific problem with examples or experience that the reader cannot get from dozens of interchangeable summaries. Editing generated copy is therefore part of SEO work, not a cosmetic pass after launch.

Google's guidance on [creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) is a better standard than trying to make text appear human-written. Show who created the content, how conclusions were reached, and what first-hand evidence supports the page.

### The technical SEO basics were never generated

A website builder may create visible sections without completing the surrounding search contract. Check for:

- A unique, descriptive page title and one clear primary heading.
- A useful meta description that accurately sets expectations for the page.
- A self-referencing canonical URL unless another version is intentionally preferred.
- A `200` response for valid pages and meaningful `404` responses for missing pages.
- No accidental `noindex` directive or `robots.txt` rule blocking important routes.
- A submitted XML sitemap containing canonical, indexable URLs.
- Crawlable internal links using real anchor elements and stable URLs.
- Structured data that matches visible content rather than inventing ratings, authors, or business facts.

These checks do not guarantee rankings. They remove avoidable ambiguity so the search engine can evaluate the content you actually published.

### Every generated page competes for the same query

AI tools can make it inexpensive to create hundreds of location, feature, or industry pages. If those pages repeat the same copy with a few nouns changed, they compete with one another and give a search engine little reason to keep each version indexed.

Create a separate route only when it serves a distinct intent and contains distinct information. Otherwise, consolidate overlapping pages and use internal links to make the site hierarchy clear. Scale is useful when the underlying data or expertise is genuinely different; scale alone is not a search advantage.

### The site is new, so analytics and ranking data are being misread

Publishing a site does not mean every route will be crawled immediately. An analytics visit proves that a browser loaded your page; it does not prove that Google indexed it. Likewise, an indexed URL may receive no impressions because it does not yet match a query strongly enough.

Use Search Console for crawl, index, query, and impression data. Use browser analytics for visitor behaviour after arrival. Give each system a clear job, then compare changes over a meaningful period instead of treating a same-day search as the ranking test.

## An SEO checklist for an AI-built website

If you have launched with an AI website generator and SEO is not working, work through the site in this order:

1. **Verify access.** Confirm that each important URL returns the intended status, is not blocked, and uses the expected canonical.
2. **Inspect the initial document.** Make sure the title, primary content, headings, and internal links exist in the returned `HTML`.
3. **Choose rendering per route.** Prefer `SSG` for stable public content and `SSR` when the initial response needs fresh or contextual data.
4. **Submit the site structure.** Add the sitemap to Search Console and link important pages through crawlable navigation.
5. **Rewrite generated copy around intent.** Replace interchangeable promises with specific answers, evidence, limitations, ownership, and useful examples.
6. **Remove duplicate routes.** Consolidate pages that target the same question without adding distinct value.
7. **Check mobile performance.** Reduce unnecessary client `JavaScript`, image weight, font work, and whole-page hydration.
8. **Add accurate metadata.** Keep titles, descriptions, canonical URLs, Open Graph data, and structured data consistent with visible content.
9. **Measure the correct stage.** Separate discovery, indexing, impressions, clicks, and on-site behaviour before deciding what failed.

For rendering-specific failures, Google's [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) explains how crawling, rendering, and indexing happen. For generated content, its [guidance about generative AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content) makes the boundary clear: automation can assist useful work, but generating many pages without adding value can violate spam policies.

The practical lesson is that an AI builder shortens implementation time; it does not remove publishing responsibility. You still own the page's search intent, factual accuracy, information architecture, rendering behaviour, performance, and evidence.

## What this means for analytics and operations

Your rendering strategy changes what you can observe and when. You can log server-rendered requests before any client script succeeds. You can deliver static pages at high volume from a CDN, but origin request logs alone may not show every view. Client analytics can add interaction detail, but it depends on consent, network availability, blockers, and JavaScript execution.

For reliable measurement, distinguish your server events from your browser events. A server log can record that a document response was issued; it cannot prove a person saw it. A browser event can record that a control was used; you cannot assume it arrives for every visit. Combine them according to the decision you are measuring, and respect your site's consent and privacy obligations.

The operational questions are equally practical: What happens when your content service is slow? Is a cached version acceptable? Which routes need a cold-start budget? How much JavaScript delays interaction on a mid-range device? Your answers will usually be more useful than a blanket preference for SSR or SSG.

## Choosing the right rendering strategy

Choose SSG when your page is public, broadly identical for visitors, and acceptable to serve from the most recently published version. Documentation, marketing pages, portfolio work, and many blogs fit this model well.

Choose SSR when your first document needs request-time data, permissions, or a level of freshness that a build cannot provide. Account pages, availability-sensitive commerce flows, and location-dependent results are common examples.

Use hydration selectively when your page needs browser-owned interaction after it is visible. A static article with a copy button should not need the same client runtime as an interactive workspace. A dashboard with optimistic updates may reasonably need more.

In practice, you can combine all three: static articles, server-rendered account pages, and hydrated components where interaction provides a clear benefit. The right architecture for you makes freshness, performance, failure handling, and ownership explicit for each route.

## A practical rule

Start with the earliest point at which you can correctly produce a page. If the answer is publish time, generate it statically. If it is request time, render it on the server. If an interaction must continue in the browser, hydrate only the part that needs it. That lets you treat SSR and SSG as operational choices, rather than labels attached to a framework.
