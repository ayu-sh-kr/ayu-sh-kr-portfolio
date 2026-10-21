# PingCAP breach exposes TiDB Cloud records and SQL editor history

PingCAP, the company behind the TiDB database and its managed TiDB Cloud service, says an intruder used **stolen service-account credentials** to copy internal data and obtain source code. The exposed records included customer information and SQL editor text. Its October 19 [security report](https://www.pingcap.com/trust-hub/security/security-update-october-2026/) says there is **no evidence that data stored in TiDB was affected**.

That distinction matters: a database provider also holds information around the database, from account details to troubleshooting records. Those records can be sensitive even when the stored application data is unaffected.

## Where the access happened

A service account is an identity used by software to access other systems. Stealing its credentials can let an intruder act with that identity's permissions. PingCAP has not explained how the credentials were stolen.

The reported access ran from September 9 to October 7, when PingCAP detected the incident and began disabling credentials. By October 14, it says all identified compromised credentials were invalidated and known access paths blocked. Investigators also found four vulnerabilities, fixed by that date; earlier exploitation remains under review.

## Why SQL editor history matters

SQL is the language used to query a database. A saved query can reveal table names, business logic and values typed into it. For example, a hypothetical query looking up an order by email address could expose that address in its text without exposing the query's returned rows. PingCAP has not published individual queries or established that this example occurred.

Its [Japanese notice, updated October 21](https://pingcap.co.jp/trust-hub/security/security-update-october-2026/), lists account details, SQL execution history and errors, support tickets, customer contacts and contract information. It reports up to approximately **50,000 personal-information records in Japan**, rather than a worldwide customer count. Exposure varies by customer.

## What the API-key findings establish

The English report identifies encrypted API-key values in an exported table. One tested value could not be used directly; whether other usable credentials were exposed remains unresolved.

The Japanese notice describes encrypted public portions of API keys and says private portions were not leaked, so the public portions alone cannot operate TiDB Cloud. These statements have different scopes: the Japanese explanation should not erase the English report's remaining uncertainty.

## What customers should do

PingCAP's Japanese notice asks customers to **rotate TiDB Cloud API keys**, inspect access logs, review organization members and permissions, and watch for phishing. It says PingCAP will not request passwords or access keys by email.

An email mentioning a real project or support issue can look convincing. Verify incident messages through a known channel. The practical response is to review access and replace keys while PingCAP determines each customer's exposure; the absence of evidence of database access does not make copied operational records harmless.
