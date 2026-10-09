# Portfolio analytics

UI owners publish typed facts through `publishAnalyticsEvent`. The GA4 listener
is the provider boundary. Existing page, contact, project, section, card-deck,
subscription, and coffee events remain available.

## Added journey measurements

| Event | Parameters | Question it helps answer |
| --- | --- | --- |
| `navigation_click` | `surface`, `destination` | Which header and footer destinations are useful? |
| `news_open` | `slug` | Which Dispatch notes attract interest? |
| `content_progress` | `kind`, `slug`, `percent` | How much of each article or case study reaches the viewport? |
| `form_start` | `form_name` | How many visits include an actual form edit? |
| `form_submit` | `form_name` | How many valid requests are attempted? |
| `form_success` | `form_name` | How often does the backend accept the request? |
| `form_error` | `form_name`, `reason` | Is friction caused by validation, attachments, or requests? |

Forms are `blog_subscription`, `project_brief`, and `support_ticket`.
Subscription success means a verification email was requested successfully,
not that the recipient confirmed the subscription. The existing `subscribe`
event describes the same handoff; do not add its count to `form_success`.

Content milestones are 25, 50, 75, and 100 percent of the rendered Markdown
body reached by the bottom of the viewport. They fire once per milestone per
route visit, wait for loading to finish, and skip hidden tabs. A short article
can emit every milestone on display. A direct jump into the article can emit
all earlier milestones. These measure viewport depth, not reading time.

Form starts fire once per form per route visit on input or change. Native
validation errors are grouped per validation pass. Custom support validation
is reported by its component. Requests and outcomes are counted per attempt,
so retries can produce more submissions than starts. No abandoned-form event
is inferred from closing a tab.

New section visibility markers cover the Dispatch feed and signup, coffee
order, support help, and project brief. Section events use the central viewport
band so sections taller than the screen can be counted. They remain deduplicated
by pathname and section for the application lifetime.

## Reports over time

Register event-scoped custom dimensions for `form_name`, `reason`, `surface`,
`destination`, `kind`, `slug`, `percent`, and `section` if they are not already
defined. Use the exact parameter names. See Google's
[custom dimension instructions](https://support.google.com/analytics/answer/14239696?hl=en).

Create weekly event-count trends, with device category as a breakdown:

- Content: `page_view` and `content_progress`, grouped by public slug and milestone.
- Enquiries: `form_start`, `form_submit`, `form_success`, and `form_error`, grouped by form.
- Payments: existing `coffee_payment_button_clicked`, `coffee_payment_started`,
  and `coffee_payment_success` events.
- Navigation: `navigation_click`, grouped by surface and destination.

Compare like-for-like periods before and after a site change. Watch request
success per submission and error counts alongside total traffic. With the
current cookieless configuration, prefer aggregate counts; stable cross-page
or cross-visit user identity is not guaranteed. Ratios of event counts describe
activity, not a precise unique-person conversion rate. GA4
[funnel explorations](https://support.google.com/analytics/answer/9327974?hl=en)
can supplement these reports where identity continuity is available.

## Privacy and verification

The new tracker never reads field contents. It sends only public content slugs,
authored same-origin navigation paths, bounded categories, and depth milestones.
The application listener strips query strings and fragments from `page_location`.
No new analytics storage or identity is introduced. Google-tag automatic or
enhanced-measurement events are configured separately in the GA4 property;
this code's URL handling applies to application-published events.

Run `npm test`, `npm run lint:imports`, and `npm run build`. After deployment,
verify the new events in the property's Realtime report and configure dimensions
with an account that has property edit access. Property configuration and live
collection are separate from this repository change.
