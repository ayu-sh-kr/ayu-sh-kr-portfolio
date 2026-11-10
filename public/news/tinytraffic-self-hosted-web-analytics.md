# Tiny Traffic puts self-hosted web analytics in one binary

Which pages bring people to your site, and do they click through to anything else? For a personal blog or small product site, those questions may cover most of what you need from analytics. **Tiny Traffic**, introduced by EGOIST, packages that view into a service you can host yourself.

It combines a **Go server, embedded dashboard and DuckDB database** in one executable. You add a script tag to your website; the tracker records pageviews, navigation within single-page apps and outbound clicks. Custom events let you count actions such as newsletter signups.

## From a pageview to the dashboard

The browser sends events to Tiny Traffic’s server, which buffers them and writes a batch to DuckDB every second. DuckDB runs inside the process and stores the data in a local file, so the default setup needs no separate database service.

The dashboard turns those events into visitors, visits, pageviews, sources, devices and goals. For a blog, that gives you a way to see which article attracts readers and whether they follow its links. API keys also let scripts read statistics or send events from a backend.

**Visitor counting uses a daily identifier** derived from a salt, site, IP address and browser user agent. The salt changes at midnight in the site’s timezone; the tracker sets no cookies, and the event record does not retain the raw IP. This is approximate counting: shared networks can group visitors, while network changes can split one visitor into several.

> A daily visitor identifier does not provide a lasting identity for tracking returning readers.

## Start with one file, add a database when needed

The launch image describes ClickHouse as coming soon, but the current repository already documents support and migration from DuckDB. That allows multiple Tiny Traffic processes to share a database; the documented setup targets a single ClickHouse server.

For a small site, the appeal remains the simpler default. You maintain hosting and backups, but can answer those everyday traffic questions with one service and one data file.

## Sources

- [Tiny Traffic repository and deployment documentation](https://github.com/egoist/tinytraffic).
- [Event ingestion and visitor hashing](https://github.com/egoist/tinytraffic/blob/48065b33aea7cf1d957cf364ebb888f3a24c1e2b/internal/ingest/ingest.go), [salt rotation](https://github.com/egoist/tinytraffic/blob/48065b33aea7cf1d957cf364ebb888f3a24c1e2b/internal/ingest/salt.go) and [batched writes](https://github.com/egoist/tinytraffic/blob/48065b33aea7cf1d957cf364ebb888f3a24c1e2b/internal/store/writer.go).
