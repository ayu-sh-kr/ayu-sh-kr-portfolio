# Railway breach puts customer environment variable secrets at risk

Railway has asked all customers to **replace the secrets stored on its platform** after an intruder may have obtained some customer environment variables in decrypted form. Its October 21 [security disclosure](https://blog.railway.com/p/security-disclosure-wednesday-october-21st) warns that the exposed values could include API keys, database passwords and private registry credentials.

The company has not yet identified every affected customer. Meanwhile, a deployment pause complicated the response: customers could revoke old credentials, but could not deploy their applications with the replacements.

An **environment variable** supplies a setting to an application when it starts. For example, a backend may read its database password from one to connect to PostgreSQL. If someone copies that password, changing the Railway account password will not stop them from using it at the database.

## What Railway has disclosed

Railway detected unusual activity in its environment-variable systems on October 21. It says an unauthorized party may have accessed encrypted values and obtained the decrypted contents of some of them. Its initial findings suggest a subset of users was affected; it has not published an affected-account count or explained how the intruder got in.

## How did the intruder reach usable secrets?

Railway believes the attack is part of a campaign aimed at **AI inference providers**, services that run models and return their outputs. That may explain why an attacker wanted the keys. **It does not explain how the attacker reached customer secrets inside Railway.** The disclosure also gives no evidence that the keys were used for model distillation.

Stored secrets can be encrypted and still become exposed through the systems allowed to retrieve them. Applications need usable values when they run. Railway has not said whether the intruder reached such a system, obtained decryption keys or used another route.

Developers in [public discussion](https://www.reddit.com/r/devops/comments/1xc6bbp/railways_security_incident_is_more_serious_than_a/) are asking how the secrets were reached and how far the exposure extends. They also describe the immediate problem with recovery: revoking a password or API key can break a running service while deployments are paused.

Railway still needs to explain **the entry point, which secrets were accessible, when the exposure began and how it closed that access**. Until then, customers have rotation instructions but an incomplete explanation of what failed.

## What stopped working, and what needs attention?

Railway's [status page](https://status.railway.com/incident/QH8L8B3E) tracks the recovery. **As of its October 22, 06:29 UTC update (11:59 a.m. IST)**, the incident was still marked Identified:

| Area | Reported impact | Customer action |
| --- | --- | --- |
| Builds and deployments | Paused across all regions; restored for **Pro and Enterprise** by this update. Hobby, Free and Trial were still awaiting restoration. | Check the live status page before attempting a deployment. |
| Pre-deploy commands | Enterprise deployments had stalled at stages such as “Running pre-deploy command”; Railway reported normal progress at 06:12 UTC. | Waiting deployments were resuming automatically; no action was required for that stall. |
| Dashboard, API, CLI and support site | Earlier updates reported outages or limited access. OAuth-session invalidation also signed users out. | Sign in again if needed; check current availability separately from build recovery. |
| Railway Public API tokens | **All Railway API tokens were invalidated.** Existing integrations using them stop authenticating. | Create replacement tokens in Railway and update the integrations. |

Railway's [recovery guides](https://status.railway.com/incident/QH8L8B3E) cover the following credentials and connections. Customers should check the ones they stored or used on Railway; the company has not said that every listed integration was compromised.

| Secret or connection | What to replace or check |
| --- | --- |
| PostgreSQL, MySQL, MongoDB and Redis | Rotate database credentials, update dependent services and external clients, and inspect access or database activity. Follow the guide for the database involved. |
| OpenAI, Anthropic, Grok and OpenRouter | Revoke exposed API keys, create replacements, and inspect usage and billing for unexpected activity. |
| Stripe, AWS and GCP | Replace credentials stored in Railway and review provider activity for unauthorized actions. |
| Railway storage buckets | Railway regenerated the keys. Redeploy services to load them; update manually pasted values and clients outside Railway. |
| GitHub repository connection | Reconnect GitHub and verify repository access and deployment settings. |
| Private GitHub Container Registry tokens | Railway removed its stored copies. **Revoke the old tokens on GitHub**, add replacements in Railway, then redeploy. |

Railway's [bucket and GitHub guide](https://blog.railway.com/p/security-disclosure-recommendation-redeploy-buckets-and-reconnect-github-after-the-credential-reset) explains how to reconnect those services. **Removing a registry token from Railway does not revoke it on GitHub.** Its owner must do that on GitHub before adding a replacement.

## Replace the credentials where they work

For Railway's PostgreSQL template, use **Database → Config → Regenerate** as described in its [PostgreSQL rotation guide](https://blog.railway.com/p/security-disclosure-recommendation-rotate-postgresql-database-credentials). This changes the database password and its service variables together and restarts the database, dropping existing sessions. Redeploy every dependent service and update external clients. Editing only `DATABASE_URL` does not change the password inside the database. For suspected leaks, Railway recommends regenerating first, even if dependent applications remain unavailable until they can redeploy.

A stolen AI API key can run up charges. A database password can expose data if the attacker can reach the database and the account has permission to read it. Recovery therefore extends beyond Railway: replace credentials at the services that issued them, update the applications using them, and check those services' logs for misuse.

Railway says it will contact affected customers directly as the investigation progresses. Customers have been asked to rotate their secrets without waiting for that confirmation.
