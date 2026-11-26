# Lemon Squeezy shutdown: dates and Stripe migration

A payment service is easy to overlook while subscriptions keep renewing. **Lemon Squeezy’s closure** turns that background dependency into a project its customers now have to schedule.

On November 16, CEO JR Farr [announced the wind-down](https://www.lemonsqueezy.com/blog/saying-goodbye-to-lemon-squeezy). New store sign-ups have closed, and payment processing ends on **March 31, 2027**. Existing stores can keep taking payments while they prepare.

## Why Lemon Squeezy is shutting down

Stripe [acquired Lemon Squeezy in July 2024](https://www.lemonsqueezy.com/blog/stripe-acquires-lemon-squeezy). Its team went on to build [**Stripe Managed Payments**](https://docs.stripe.com/payments/managed-payments), a merchant-of-record service that handles responsibilities such as transaction taxes, fraud and disputes for digital businesses.

Farr says maintaining both platforms duplicates engineering, security and compliance work. The team is concentrating on Managed Payments. For merchants, however, that consolidation creates a move rather than an automatic continuation of the service they already use.

## Stripe Managed Payments: eligibility and migration dates

Managed Payments does [**not support every country**](https://docs.stripe.com/payments/managed-payments/eligibility) Lemon Squeezy serves. Businesses outside its coverage need another provider. Even eligible merchants must check features: [storefronts and digital fulfilment require separate tools](https://docs.lemonsqueezy.com/migration#review-whats-supported) rather than moving across as equivalent built-in capabilities.

The [migration documentation](https://docs.lemonsqueezy.com/migration) sets out the schedule:

| Date | What changes |
| --- | --- |
| November 16, 2026 | New users and store sign-ups close |
| December 2, 2026 | Managed Payments migration tooling is scheduled to launch |
| Mid-January 2027 | Recommended latest start for migration |
| March 31, 2027 | Transactions stop, including subscription renewals |

Lemon Squeezy says the final deadline will not be extended. It also limits transfers to another provider to **card-paid subscriptions**; merchants should not assume every payment method moves with the customer records.

## Moving subscriptions before the shutdown

For a subscription app, replacing checkout is only part of the move. The practical review should follow a customer through purchase, renewal, cancellation and access to the product, checking that billing events still update the application correctly. Export the records you need before the shutdown and use the migration support process for subscription transfers.

Lemon Squeezy was chosen to remove work from selling online. Its departure adds some of that work back. The priority now is preserving the customer’s next renewal, with a destination that supports both the business’s location and the features it depends on.
