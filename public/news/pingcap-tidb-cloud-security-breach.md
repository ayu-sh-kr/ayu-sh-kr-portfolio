# PingCAP breach exposes TiDB Cloud records and SQL editor history

An intruder stole customer records and source code from **PingCAP's internal systems** using compromised credentials. PingCAP, which develops TiDB and runs the managed TiDB Cloud service, disclosed the breach on October 19. It says investigators have found **no evidence that data stored in TiDB was affected**.

The exposed information included SQL editor history: the commands customers wrote to work with their databases. That creates a separate privacy problem even without evidence of someone reading the databases themselves.

## What was copied?

PingCAP's [Japanese notice, updated October 21](https://pingcap.co.jp/trust-hub/security/security-update-october-2026/), identifies account names and email addresses, organization and project associations, SQL history and errors, support tickets, customer contacts, and contract details. It reports up to approximately **50,000 personal-information records in Japan**. The figure is specific to Japan, and the exposed categories vary by customer.

SQL is the language used to read and change database records. Consider a developer looking up an order by a customer's email address. If that address is typed into the command, a saved copy of the command contains it too. Someone reading that history could learn the address without receiving the query results. This is an illustration of the risk, not a disclosed customer query.

Support conversations and project details can also give a fraudulent email enough context to look familiar. A message about an actual support request is harder to dismiss than an unrelated password-reset email.

## How the intruder got in

According to the [English incident report](https://www.pingcap.com/trust-hub/security/security-update-october-2026/), the intruder used **stolen service-account credentials** between September 9 and October 7. A service account gives software permission to access systems; its credentials let that software identify itself. Stealing them can give someone else the same access.

PingCAP detected the breach on October 7. By October 14, it says the identified compromised credentials and access paths had been disabled. It also removed excessive permissions between cloud projects and fixed four vulnerabilities found during the investigation. The report does not explain how the credentials were stolen or establish whether those vulnerabilities were exploited.

## Could the stolen API keys be used?

API keys are credentials that applications use to authenticate requests to a service. A usable stolen key can let someone make requests with its permissions.

The Japanese notice says the exported API-key data contained encrypted public portions, with private portions not leaked. Those public portions alone cannot operate TiDB Cloud, it says.

The English report is more cautious: one encrypted value tested by investigators did not work directly as an API key, but **whether other usable credentials were exposed remains unresolved**. That single test does not establish that every credential in the stolen material was unusable.

## What customers need to check

PingCAP asks customers to rotate TiDB Cloud API keys, inspect access logs, review organization members and permissions, and watch for phishing. Rotation means replacing an existing key and revoking the old one; applications using it need the replacement.

For teams assessing their exposure, the review should include what they put into SQL commands and support tickets. A working database does not tell them whether copies of those records have left the provider. Unexpected messages about those records should be checked through a known support channel.
