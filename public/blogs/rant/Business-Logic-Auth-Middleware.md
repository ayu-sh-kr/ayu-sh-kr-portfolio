# Keep business rules out of authentication middleware

Authentication middleware should establish who made a request and reject a
request that cannot be authenticated. It should not decide whether that person
may cancel an invoice, redeem a promotion, or change a subscription. Those are
business decisions, and they need the same domain state, tests, and audit trail
as the rest of the use case.

This separation is more than a naming preference. An HTTP request is only one
entry point. The same action may later be initiated by a scheduled job, a
support tool, a message consumer, or an administrative workflow. If the rule
only exists in HTTP middleware, a new entry point can omit it without any
compiler error or failing domain test.

## Authentication, authorization, and policy are different layers

Authentication answers “who is this?” It validates credentials or a session
and produces a trusted actor identity. Authorization answers “may this actor
perform this action on this resource in its current state?” That second
question often depends on ownership, subscription state, tenant membership,
time limits, or a policy that cannot be known at the edge of the request.

The [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
recommends validating permissions on every request and applying least
privilege. That does not require the HTTP filter to hold every rule. It means
every entry point must reach the same authorization decision before the state
changes.

## Put the decision beside the use case

The controller or middleware can adapt an authenticated request into an
`Actor`. The application use case then loads the resource and asks the domain
rule to decide. In a Kotlin service, the shape can remain small:

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

`cancelledBy` is where the service can check tenant, ownership, current status,
and any cancellation window. A failed decision becomes a typed business error;
the HTTP adapter maps it to an appropriate response, while a job or consumer
handles the same error according to its own delivery contract.

## Avoid two common shortcuts

Putting a role check in middleware is useful for coarse access—for example,
requiring an authenticated administrator before an administrative route is
entered. It is not sufficient for resource-level rules. “Has the support role”
does not answer whether this support action is allowed for this tenant, record,
or state transition.

The opposite shortcut is putting every policy in one large authorization
service. Centralisation helps when several use cases share the same policy,
such as tenant membership. It becomes a liability when it turns into a generic
`can(actor, action, resource)` switch statement that must know every domain
state. Keep shared identity and membership checks reusable; keep decisions
that define a resource’s lifecycle with that resource or its application use
case.

## Prove the rule through entry-point tests

The test suite should make the boundary visible. For a protected use case,
cover at least these cases:

- an unauthenticated HTTP request is rejected before the use case runs;
- an authenticated actor without permission receives a denied result;
- a permitted actor can make the transition once under the allowed conditions;
- a scheduled job or message consumer reaches the same policy; and
- the persisted state is unchanged after a denied attempt.

These tests are stronger evidence than a comment in a filter because they
exercise the real business transition. They also make future changes safer: a
new entry point needs to pass an `Actor` and will encounter the same rule.

## Keep the boundary small and observable

Middleware still has an important job. Validate tokens, establish request
context, reject missing or invalid credentials, and emit security-relevant
events without recording sensitive token material. The use case should record
or expose the reason a decision was denied where audit requirements call for
it. Be deliberate about what is returned to a caller so an error message does
not reveal another tenant’s data.

The practical rule is to authenticate at the boundary, authorize before the
state transition, and keep the business decision with the use case that owns
the state. That gives HTTP, jobs, and message consumers one rule to test and
one place to change when the product policy evolves.
