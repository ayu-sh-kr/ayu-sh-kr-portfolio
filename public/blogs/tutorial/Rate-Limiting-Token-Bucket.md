# Rate limiting a real API: token bucket in Spring Boot

Rate limiting is a product boundary as much as an infrastructure feature. A useful limit answers three questions: who is limited, what resource is protected, and what should a caller do after the limit is reached?

## Why token bucket

A token bucket has a capacity and a refill rate. A request spends one token. Bursts are allowed up to the capacity, while sustained traffic is constrained by the refill rate.

That is a better fit for most APIs than a fixed window, whose boundary can accidentally allow twice the intended traffic around the minute mark.

## Keep the decision close to the edge

The request path should be easy to observe and cheap to reject. Put identity extraction and the rate-limit decision near the controller boundary, but keep the bucket implementation independent from Spring MVC.

```kotlin
data class BucketDecision(
    val allowed: Boolean,
    val remaining: Long,
    val retryAfterSeconds: Long?
)
```

The Redis key should contain the dimension being limited, for example `rate:user:{id}:search`. Do not silently mix user, IP, and API-key limits into one counter.

## Return useful headers

When rejecting a request, return `429 Too Many Requests` and a `Retry-After` value. On successful responses, expose a remaining count when it is safe to do so. Callers can then back off instead of retrying in a tight loop.

## What production adds

Test clock behaviour, Redis failures, anonymous traffic, and a hot key. Decide explicitly whether a Redis outage fails open or closed. There is no universal answer: availability-sensitive reads and abuse-sensitive writes often need different policies.
