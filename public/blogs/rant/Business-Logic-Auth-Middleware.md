# Stop putting business logic in your auth middleware

Authentication middleware is a bouncer. It checks the ticket, attaches an identity, and lets the request continue. It should not decide whether a user can cancel an invoice, redeem a promotion, or change a subscription plan.

## Identity is not permission

Authentication answers “who is this?” Authorization answers “may this identity perform this action on this resource?” The second question usually needs domain state, and domain state belongs close to the use case.

```kotlin
class CancelSubscription(
    private val subscriptions: SubscriptionRepository
) {
    fun execute(actor: Actor, subscriptionId: SubscriptionId) {
        val subscription = subscriptions.require(subscriptionId)
        subscription.cancelledBy(actor)
        subscriptions.save(subscription)
    }
}
```

The controller can map an access decision to HTTP. The use case still owns the rule, so a scheduled job, message consumer, and HTTP request cannot accidentally disagree.

## Keep the boundary boring

Middleware should establish context and reject requests that are plainly unauthenticated. Put business decisions where they can be tested with business fixtures. Your future self will thank you when the next entry point arrives.
