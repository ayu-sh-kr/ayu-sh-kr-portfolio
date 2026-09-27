# Microsoft Titan flaw let a researcher pose as an admin

Microsoft’s Titan analytics website asked visitors to connect through a company VPN. But a separate API—the service behind the website—was reachable from the internet. Researcher **Faav** found that it would accept a made-up login token and let him run database queries as an **administrator**.

The problem was a missing signature check. Titan inspected the identity details inside the token without verifying that a trusted login service had actually issued it.

## How a made-up token became an admin login

A login token, called a **JWT**, carries details about a user and the application they can access. Its digital signature lets a server check that those details are genuine and have not been altered. Reading the details alone proves nothing: someone can write a convincing name on a pass without being entitled to enter.

According to Faav’s report, Titan checked several token fields but skipped that proof. When he put `admin` in its user field, Titan matched the value to its own administrator account. It then allowed a SQL query to run.

This was a failure in **Titan’s token validation**. The application trusted an identity the caller supplied without establishing that the identity was authentic.

## What Faav actually accessed

Faav reports reading **employee account and directory information**, including email addresses and organizational details, and retrieving **two individual Bing analytics records**. Those queries demonstrated access to real information beyond the initial test database.

The much larger **17.3 trillion rows** figure came from database statistics across 17 connected analytics databases. It estimates the stored data potentially within reach, including historical and repeated records. Faav did **not download 17 trillion records**.

He reported the issue on **September 5**. His disclosure says Microsoft locked down the API on **September 9**; Microsoft said the research helped it strengthen its services.

The website’s VPN requirement made Titan look closed to outsiders. The separate API needed its own working authentication checks. Once it accepted an unverified identity, the administrator permissions attached to that identity opened the databases.

Sources: [Faav’s original disclosure](https://blog.faav.net/how-i-couldve-accessed-17-trillion-microsoft-records) and [Microsoft’s token-validation guidance](https://learn.microsoft.com/en-us/entra/identity-platform/access-tokens).
