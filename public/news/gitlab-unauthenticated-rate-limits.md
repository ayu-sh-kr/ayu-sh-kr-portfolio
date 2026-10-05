# GitLab.com limits unauthenticated requests to 60 per hour from October 19

A scheduled job that clones a public GitLab project every few minutes without a token has probably run unnoticed for years. From **October 19, 2026**, GitLab.com will allow requests that arrive without credentials only **60 times per hour per IP address**. Today's unauthenticated limit is 500 requests per minute.

GitLab announced the change in September as part of a move to rate limits based on subscription tier. The company says it forecasts several times more traffic on its infrastructure in 2026, with much of the growth coming from AI coding agents and automated development tools.

## What changes for each tier

**Unauthenticated traffic and Free accounts move first**, on October 19. An authenticated user on the Free plan gets 5,000 requests per hour, with a burst limit of 100 per minute. Premium and Ultimate accounts receive 15,000 and 25,000 requests per hour, with per-minute limits of 1,250 and 2,000, but their new limits do not take effect until **January 2027**.

The tier only helps when a request carries credentials. Automation that reaches a paid organization's projects without authenticating is still counted as unauthenticated traffic and receives the 60-per-hour limit. The change applies to GitLab.com only; limits on Self-Managed and Dedicated instances remain with whoever operates them.

## Two brownouts before enforcement

GitLab will run two preview windows, which engineers often call brownouts, on **October 7 and October 14 from 15:00 to 19:00 UTC**. During each window, the new limits for Free and unauthenticated traffic are switched on and then switched off again. A job that fails during those hours is likely to fail permanently after October 19.

## Preparing scripts, bots and CI jobs

The first step is to find every script, bot and pipeline that calls GitLab.com without credentials and give it one. GitLab supports personal access tokens, OAuth tokens and CI/CD job tokens; inside GitLab CI, the job token avoids storing a long-lived secret.

Clients should also handle limits deliberately. A request over the limit receives **HTTP 429** with `Retry-After` and `RateLimit-*` headers, so a client should wait for the interval GitLab specifies instead of retrying immediately. Caching responses, batching calls and replacing frequent polling with webhooks reduce the number of requests in the first place.

> A job that worked for years without a token has been relying on a limit that will no longer exist.

For that forgotten clone job, the fix is small: add a token, respect `Retry-After`, and check its logs after the October 7 window. The brownouts provide a scheduled opportunity to find the failure before it becomes an outage.

Sources: [GitLab — Rate limits on GitLab.com are changing](https://about.gitlab.com/blog/rate-limit-change-2026/) · [GitLab Docs — GitLab.com rate limits](https://docs.gitlab.com/user/gitlab_com/rate_limits/) · [DevOps.com — GitLab tightens rate limits as coding agents drive demand](https://devops.com/gitlab-tightens-rate-limits-as-coding-agents-drive-demand/)
