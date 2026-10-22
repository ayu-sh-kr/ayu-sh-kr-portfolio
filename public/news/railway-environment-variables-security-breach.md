# Railway breach puts customer environment variable secrets at risk

Railway says an unauthorized party **may have accessed encrypted customer environment variables and obtained the decrypted contents of some of them**. Its October 21 [security disclosure](https://blog.railway.com/p/security-disclosure-wednesday-october-21st) does not yet identify every affected customer or variable. Railway is asking all customers to rotate the secrets they stored there while it investigates.

An environment variable is a setting supplied to an application when it runs. On a hosting platform, it often holds a database password, an API key or a private registry credential. The application needs the usable value to connect to those services. If an intruder gets that value, changing the Railway account password alone will not invalidate the credential at the database or API provider.

## What Railway has confirmed

Railway detected unusual activity in systems that store those variables on October 21. It says its initial review suggests the impact may be limited to a subset of users, but it cannot yet give a customer-specific scope. **Encrypted storage did not rule out exposure:** the company says some decrypted contents may have been obtained. It has not described the entry point or confirmed that every stored secret was read.

## The AI-targeting claim leaves the entry point unexplained

Railway says it believes the intrusion belongs to a wider campaign targeting platforms to compromise **AI inference providers**: services that run models and return their outputs. That describes a suspected target, not how someone entered Railway or obtained usable customer secrets. Its disclosure does not establish that stolen keys were used for model distillation.

**The unresolved security question is how protected variables became accessible in decrypted form.** Railway has not publicly identified the entry point, the permissions abused, or the path used to obtain those values in the disclosure linked above. Encryption at rest alone does not explain the exposure: a hosting platform must also control who or what can retrieve usable secrets. The available disclosure does not establish which control failed.

Railway says it notified upstream AI providers to revoke keys. That response addresses possible downstream misuse; it does not answer how customer credentials were exposed on Railway. The suspected AI target also does not narrow the risk of database passwords, cloud keys or registry tokens stored alongside them.

## What stopped working, and what needs attention?

The [incident status page](https://status.railway.com/incident/QH8L8B3E) records both the platform disruption and recovery steps. **Status snapshot: October 22, 06:29 UTC (11:59 a.m. IST).** The incident remains marked Identified; later updates may change availability.

| Area | Reported impact | Customer action |
| --- | --- | --- |
| Builds and deployments | Paused across all regions; restored for **Pro and Enterprise** by this update. Hobby, Free and Trial were still awaiting restoration. | Check the live status page before attempting a deployment. |
| Pre-deploy commands | Enterprise deployments had stalled at stages such as “Running pre-deploy command”; Railway reported normal progress at 06:12 UTC. | Waiting deployments were resuming automatically; no action was required for that stall. |
| Dashboard, API, CLI and support site | Earlier updates reported outages or limited access. OAuth-session invalidation also signed users out. | Sign in again if needed; check current availability separately from build recovery. |
| Railway Public API tokens | **All Railway API tokens were invalidated.** Existing integrations using them stop authenticating. | Create replacement tokens in Railway and update the integrations. |

Railway also published [recovery guides](https://status.railway.com/incident/QH8L8B3E) for the credentials below. **This is an action checklist, not confirmation that every database or provider account was accessed.**

| Secret or connection | What to replace or check |
| --- | --- |
| PostgreSQL, MySQL, MongoDB and Redis | Rotate database credentials, update dependent services and external clients, and inspect access or database activity. Follow the guide for the database involved. |
| OpenAI, Anthropic, Grok and OpenRouter | Revoke exposed API keys, create replacements, and inspect usage and billing for unexpected activity. |
| Stripe, AWS and GCP | Replace credentials stored in Railway and review provider activity for unauthorized actions. |
| Railway storage buckets | Railway regenerated the keys. Redeploy services to load them; update manually pasted values and clients outside Railway. |
| GitHub repository connection | Reconnect GitHub and verify repository access and deployment settings. |
| Private GitHub Container Registry tokens | Railway removed its stored copies. **Revoke the old tokens on GitHub**, add replacements in Railway, then redeploy. |

The bucket and GitHub actions come from Railway's [credential-reset guide](https://blog.railway.com/p/security-disclosure-recommendation-redeploy-buckets-and-reconnect-github-after-the-credential-reset). A build pause can delay applying replacement secrets to running services; it does not prevent revoking a credential at its provider. Revocation may interrupt the application until its replacement deployment is available.

## Replace the credentials where they work

For Railway's PostgreSQL template, use **Database → Config → Regenerate** as described in its [PostgreSQL rotation guide](https://blog.railway.com/p/security-disclosure-recommendation-rotate-postgresql-database-credentials). This changes the database password and its service variables together and restarts the database, dropping existing sessions. Redeploy every dependent service and update external clients. Editing only `DATABASE_URL` does not change the password inside the database. Railway prioritizes invalidating a suspected leaked credential over avoiding a brief interruption.

The practical boundary is the credential's reach: a key with permission to call an AI API can consume credits; a database credential can reach the data its role permits. Rotate each secret at its owner, then look at that owner's logs for misuse. Railway says it will contact customers directly as it establishes who was affected.
