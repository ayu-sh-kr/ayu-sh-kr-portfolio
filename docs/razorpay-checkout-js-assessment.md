# Razorpay Checkout.js assessment

**Decision:** do not replace the current Razorpay Payment Link hand-off with
Checkout.js while the backend contract must remain unchanged. The existing flow
is appropriate for a payment-link checkout; a secure Standard Checkout.js flow
cannot be constructed from its response.

This assessment covers the `/coffee` one-time-support page as it exists on
2026-09-11. It proposes page-only improvements that retain the current backend
and lists the small contract change required should embedded checkout become a
future goal.

## What Checkout.js is

`https://checkout.razorpay.com/v1/checkout.js` is Razorpay's browser library
for its Standard Checkout modal. The page loads the library, builds
`new Razorpay(options)`, then calls `.open()` after the customer selects Pay.
The modal can be branded and supplied with a business name, description, image,
theme, and customer prefill data.

For a proper payment-gateway integration, Razorpay requires a server-created
Order for each payment. The frontend passes that `order_id` and a publishable
Key ID to Checkout.js. On a successful payment, the handler receives a payment
ID, order ID, and signature; the server must validate that signature before any
fulfilment. Razorpay also recommends server-side webhook handling so that a
lost browser callback cannot cause an incorrect payment state.

Sources:

- [Standard Checkout integration steps](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/)
- [Standard Checkout best practices](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/best-practices/)

## Current implementation

The current system deliberately uses a different Razorpay product: **Payment
Links**.

1. `coffee-order-checkout` collects the selected amount, quantity, optional
   display name, and optional note.
2. It calls `POST /buy-coffee/order` through `CoffeeOrderService`.
3. The response contract accepts only `{ id, short_url }`.
4. The page redirects the browser to `short_url`, Razorpay's hosted Payment
   Link checkout.

Relevant files:

| Responsibility | File |
| --- | --- |
| API contract and payment-link request | `src/service/coffee-order/coffee-order.service.ts` |
| Form submit and hosted-link redirect | `src/components/pages/coffee/order/coffee-order-checkout/coffee-order-checkout.component.ts` |
| Support amounts and checkout copy | `src/data/coffee-content.ts` |

Payment Links are designed to open as hosted payment request pages. Razorpay
supports a return redirect through `callback_url` and `callback_method`, but
those are attributes of the **server-side Payment Link creation request**.
They cannot be supplied after the server has returned `short_url`.

Source: [Create a Standard Payment Link](https://razorpay.com/docs/api/payments/payment-links/create-standard/).

## Why Checkout.js cannot be added without a backend change

| Checkout.js requirement | Current client receives | Result |
| --- | --- | --- |
| Razorpay Key ID | Nothing | No supported Checkout.js configuration can be built. A Key *Secret* must never be placed in the browser. |
| Server-created `order_id` | Payment Link `id` and `short_url` | A Payment Link ID is not a Razorpay Order ID and is not interchangeable with one. |
| Server-side signature verification | No verification endpoint exposed by this feature | A browser success callback is not proof of payment and cannot safely trigger fulfilment. |
| Durable confirmation | No client-visible payment status endpoint | Refreshes, closed modals, and connectivity failures leave the page unable to establish payment truth. |

Creating the Razorpay Order directly from this static client is not an option:
the Orders API is server-side and requires the Key Secret. Nor should the
client report a Checkout.js success as a completed contribution. Razorpay
explicitly requires server-side signature verification and recommends webhook
or API status confirmation.

**Therefore, there is no safe Checkout.js implementation that meets the
“do not update backend” constraint.** Loading the script alone would add third-
party JavaScript and complexity without producing a usable checkout.

## Recommended frontend-only payment experience changes

Keep the Payment Link redirect and improve the transition around it. These
changes require no API or backend update.

| Priority | Change | Exact frontend location | Customer benefit |
| --- | --- | --- | --- |
| High | Make the button state explicit: “Preparing secure checkout…”, then “Opening Razorpay…” immediately before redirect. Retain the disabled state until navigation begins. | `coffee-content.ts`; `coffee-order-checkout.component.ts` | Removes uncertainty during the request and prevents duplicate clicks. |
| High | Add an accessible, persistent status message (`role="status"`) below the CTA while the request is pending, with a recovery message on failure. | `coffee-order-checkout.component.ts` and its CSS | Screen-reader and keyboard users receive the same feedback as sighted users. |
| High | On link-creation failure, preserve selected amount, quantity, name, and note; focus the retry action and clearly state that no payment was started. | `coffee-order-checkout.component.ts` | Lets a supporter retry safely without re-entering data. |
| Medium | Add a small “secure checkout opens on Razorpay” trust row beside the CTA, including accepted-method wording only if confirmed in the Razorpay account. | `coffee-content.ts`; checkout component CSS | Sets accurate expectations before leaving the site. |
| Medium | Add `autocomplete="name"` to the name field (already present) and an explicit `maxlength` matching the backend's accepted note/name limits once known. | `coffee-order-checkout.component.ts` | Reduces rejected requests and provides clearer input expectations. |
| Medium | Treat the departure as an external navigation in copy; do not claim an on-site success state after it returns. | `coffee-content.ts` | Avoids implying a payment is verified when the browser cannot prove it. |
| Medium | Ensure mobile layout keeps the total and CTA visible, has a minimum 44px target, and respects reduced motion. | `coffee-order-checkout.component.css` | Makes the hand-off easier to complete on mobile. |

Do **not** open `short_url` in a popup after the asynchronous API request:
most browsers will treat it as no longer user-initiated and may block it. A
same-tab `window.location.assign(link.short_url)` is the reliable frontend-only
handoff and is correctly used today.

## Important verification before production UI work

The page visually labels support amounts as dollars (`$3`, `$5`, `$10`), while
the service comments call its request amount “paise” and sends `price * 100`.
The backend's Payment Link currency is not exposed to this repository. Confirm
the backend's configured currency and the Razorpay account's enabled payment
methods before changing payment copy or displaying method logos. The display
currency, the value sent to `/buy-coffee/order`, and the currency created in
Razorpay must agree.

Also confirm that payment-link creation is idempotent for a duplicate submit or
network retry. The client can prevent ordinary double clicks, but cannot
guarantee that a request was not accepted when its response is lost.

## Future embedded-checkout contract (not part of the no-backend plan)

If an embedded modal is later preferred, replace the payment-link creation
response with a server-created order payload such as:

```ts
interface CoffeeCheckoutSession {
  keyId: string;       // publishable Razorpay Key ID, never the secret
  orderId: string;     // created by the server for this exact amount
  amount: number;      // smallest currency unit; server-authoritative
  currency: string;
  receipt: string;
  name: string;
  description: string;
}
```

The client would then load Checkout.js once, open it with this session, and
POST `{ razorpay_payment_id, razorpay_order_id, razorpay_signature }` to a new
verification endpoint. That endpoint must verify the HMAC using its stored
order ID and Key Secret, persist the result, and fulfil only a verified,
captured payment. Add `payment.captured`, `payment.failed`, and `order.paid`
webhooks as the durable source of truth.

That is a worthwhile separate backend feature, but it is not a drop-in
frontend migration from Payment Links.

## Acceptance checks for the frontend-only iteration

- Payment link creation still calls `POST /buy-coffee/order` exactly once per
  ordinary click and retains its existing request payload.
- A successful response navigates to the returned HTTPS `short_url` in the
  same tab.
- A failed response neither reports payment success nor loses entered form
  values.
- Keyboard-only and screen-reader testing exposes pending and error states.
- Mobile testing confirms the CTA remains usable at 320px width.
- Test-mode Payment Link payments are checked in the Razorpay Dashboard; do
  not use a return page as evidence of completed payment.
