# Railway breach puts customer environment variable secrets at risk

Railway says an unauthorized party **may have accessed encrypted customer environment variables and obtained the decrypted contents of some of them**. Its October 21 [security disclosure](https://blog.railway.com/p/security-disclosure-wednesday-october-21st) does not yet identify every affected customer or variable. Railway is asking all customers to rotate the secrets they stored there while it investigates.

An environment variable is a setting supplied to an application when it runs. On a hosting platform, it often holds a database password, an API key or a private registry credential. The application needs the usable value to connect to those services. If an intruder gets that value, changing the Railway account password alone will not invalidate the credential at the database or API provider.

## What Railway has confirmed

Railway detected unusual activity in systems that store those variables on October 21. It says its initial review suggests the impact may be limited to a subset of users, but it cannot yet give a customer-specific scope. **Encrypted storage did not rule out exposure:** the company says some decrypted contents may have been obtained. It has not described the entry point or confirmed that every stored secret was read.

Railway believes the activity may be part of attacks on platforms aimed at AI inference providers. That is the company's assessment, not a finding that all affected customers used an AI service. It said it notified those providers to revoke keys proactively.

At the time of the disclosure, Railway had paused deployments during the investigation. Its [status page](https://status.railway.com/incident/QH8L8B3E) is the place to check whether builds have resumed; the pause should not be read as a permanent restriction.

## Replace the credentials where they work

For a database password stored as `DATABASE_URL`, create a replacement credential at the database, put it in Railway, deploy the service that reads it, confirm it connects, then disable the old credential. Repeat the process for API keys and private registry credentials, checking provider logs for requests the application did not make. A replacement value saved in Railway reaches a running service when its configuration is applied through deployment.

Railway's [October 22 follow-up](https://blog.railway.com/p/security-disclosure-recommendation-redeploy-buckets-and-reconnect-github-after-the-credential-reset) says it reset storage-bucket credentials and the GitHub tokens it held. Projects using those integrations need to redeploy against the new bucket credentials and reconnect GitHub. Railway removed private GitHub registry tokens from its services, but says those tokens **still work on GitHub until their owners revoke them**. Customer-managed keys for other services also require attention from their owners.

The practical boundary is the credential's reach: a key with permission to call an AI API can consume credits; a database credential can reach the data its role permits. Rotate each secret at its owner, then look at that owner's logs for misuse. Railway says it will contact customers directly as it establishes who was affected.
