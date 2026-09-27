# Microsoft Titan API accepted unsigned JWTs, researcher finds

The login page for Microsoft’s internal Titan analytics service told outsiders they needed a VPN. Its API, however, was reachable separately. Security researcher **Faav** followed that opening to a more serious problem: Titan read the claims in a login token but **never checked its signature**.

A signed JWT is supposed to let an API verify who issued a token and whether its contents were changed. Without that check, fields such as the tenant, application, and user are merely text supplied by the caller. Faav found that Titan checked those fields individually while accepting an unsigned token.

## From a public API to an administrator query

Faav’s automated research tool found the API and its publicly exposed Swagger documentation. Archived configuration helped identify a valid routing value. Requests without a token returned an authorization error, but changing token claims moved the request through different checks. That behavior led Faav to try an unsigned token whose user field was `admin`.

Titan treated `admin` as a local administrator and executed a simple SQL query. Faav then inspected platform metadata and used **bounded one-row samples** to confirm that Bing analytics were reachable. The researcher reported the issue to Microsoft on **September 5**.

## What the 17 trillion figure means

Faav counted active routes and database metadata to estimate **17.3 trillion stored rows** across connected analytics databases. That is a measure of potentially reachable data, including historical, duplicate, or derived rows. It is **not a count of records downloaded**. Faav says the research used metadata and limited samples, with no customer data or personally identifiable information taken.

According to the disclosure timeline, Microsoft locked down the API endpoint on **September 9** and said the report helped it harden its services. The episode is a reminder that a VPN gate on a web page cannot protect a separate API. An API must verify the token’s **signature** before trusting any claim inside it.

Source: [Faav’s original disclosure](https://blog.faav.net/how-i-couldve-accessed-17-trillion-microsoft-records). See also [Microsoft’s token-validation guidance](https://learn.microsoft.com/en-us/entra/identity-platform/access-tokens).
