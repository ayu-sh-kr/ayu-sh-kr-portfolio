---
slug: privacy
title: Privacy Policy
tagline: What I collect, why I collect it, and how to get rid of it.
kind: privacy
version: "1.0"
updated: 2026-07-25
effective: 2026-08-01
applies: ayu-sh-kr.com and client work
contact: akjaiswal2003@gmail.com

switch:
  - { label: Visiting the site, target: visit }
  - { label: Working with me, target: client-data }

summary:
  - I don't sell your data, run ad trackers, or build profiles on you.
  - Site analytics are anonymous and counted in aggregate — no cookies, no cross-site tracking.
  - I only have your email if you wrote to me or subscribed. Unsubscribing removes it.
  - Client project data stays under your contract, lives in your accounts where possible, and is deleted when you ask.
summary_note: This box is a summary, not the policy. The sections below are what actually applies.

related:
  - { title: Terms & Conditions, href: /legal/terms, blurb: "Using the site, and the ground rules for working together." }
  - { title: Work with me, href: /pricing, blurb: "What an engagement looks like, and what it costs." }
---

## Who I am {#who scope="Everyone" group="The basics" short="Who I am"}

This site belongs to Ayush Kumar, an independent backend engineer working solo from India. There's no company behind it and no team reading your messages — when you email [akjaiswal2003@gmail.com](mailto:akjaiswal2003@gmail.com), it reaches one person.

For anything that legally needs a named contact — a data request, a complaint, a takedown — use that address. I answer within a few working days.

## What this policy covers {#scope scope="Everyone" group="The basics" short="What this covers"}

Two different relationships, one document. Sections 3–6 are about **visiting this site** — reading the blog, subscribing, sending a message. Sections 7–9 are about **hiring me**, where I end up holding your code, your infrastructure, and sometimes your users' data.

Everything from section 10 onward applies either way. Each section carries a label so you can tell which one you're in.

## When you visit the site {#visit scope="Site visitors" group="As a visitor" short="When you visit"}

The site is static files served from S3 behind CloudFront. Loading a page produces two things: a server log entry and an anonymous analytics event.

| What's recorded | Why | Kept for |
| --- | --- | --- |
| Page path and referrer | To know which posts people actually read | 24 months, aggregated |
| Country and device type | To catch layout problems on real devices | 24 months, aggregated |
| IP address in server logs | Abuse protection and error diagnosis | 30 days, then deleted |

Analytics are cookieless and don't follow you to other sites. I can tell you that a post got 400 reads from twelve countries. I can't tell you that *you* read it.

## Cookies and local storage {#cookies scope="Site visitors" group="As a visitor" short="Cookies"}

There are no advertising, marketing, or cross-site cookies on this site, which is why you've never seen a consent banner here.

The site may store one preference locally in your browser — such as a reduced-motion or theme choice. It never leaves your device, and clearing site data removes it.

## The newsletter {#newsletter scope="Site visitors" group="As a visitor" short="The newsletter"}

Subscribing stores your email address and the date you confirmed it. That's the whole record. I use it to send occasional posts and nothing else — no partner mail, no list sharing, no selling.

Every email has an unsubscribe link that works immediately. Unsubscribing deletes the address rather than parking it on a suppression list, unless you've asked me never to contact you again.

## When you get in touch {#reach scope="Site visitors" group="As a visitor" short="When you get in touch"}

Emails, call bookings, and anything you send while scoping a project sit in my inbox and calendar. I keep them for up to 24 months so I can pick a conversation back up, then delete them.

The estimator on the pricing page runs entirely in your browser. Your selections aren't sent anywhere, stored, or attached to you — the number is calculated on your own device and forgotten when you close the tab.

## Client and project data {#client-data scope="Clients" group="As a client" short="Client & project data"}

Working together means I hold things that matter: repository access, cloud credentials, database schemas, architecture notes, invoices, and whatever you tell me about your business along the way.

- **Access lives in your accounts.** Wherever possible I work in your GitHub organisation and your AWS account under a named user, so you can see what I touch and revoke it in one click.
- **Credentials are never stored in plain text.** They go in a password manager, and I ask you to rotate anything shared over chat or email.
- **Local copies are minimal.** Code stays on an encrypted disk; production data is not copied to my machine unless there's no other way to reproduce a bug, and it's deleted the same day.
- **Invoices and tax records are the exception.** Those I have to keep — see section 11.

When an engagement ends, say the word and I'll remove my access, delete local copies, and confirm in writing what's gone.

## Data I process on your behalf {#processor scope="Clients" group="As a client" short="Data I process for you"}

If I build or operate a system that handles your users' personal data, you are the controller of that data and I act as a processor for you. In plain terms: it's your data and your call. I only touch it to do the job you asked for.

<Aside kind="note">
For any engagement involving personal data at scale, we sign a data processing agreement before I get access. It sets out the instructions I work under, the security expected of me, and what happens at the end. This policy doesn't replace it — the agreement wins wherever the two differ.
</Aside>

If I become aware of a breach affecting your data, I'll tell you without delay and with what I actually know — not a sanitised version a day later.

## Confidentiality and NDAs {#nda scope="Clients" group="As a client" short="Confidentiality"}

Everything you share while we scope or build is confidential by default, whether or not there's a signed NDA. That includes the fact that we're talking at all, if you'd rather it stayed quiet.

I do write publicly about engineering, and I like to reference real work. What I publish is patterns and lessons, never your data, your credentials, or anything that identifies you without permission. The rules for naming a client are in the [Terms & Conditions](/legal/terms#showing).

## Who else touches your data {#processors scope="Everyone" group="For everyone" short="Who else touches it"}

A one-person operation still runs on other people's services. These are the only ones that see anything, and none of them get data for their own purposes.

| Service | What it handles | Where |
| --- | --- | --- |
| AWS | Hosting, storage, logs, client infrastructure | Mumbai (ap-south-1) |
| Analytics provider | Anonymous page counts | EU |
| Email provider | My inbox and the newsletter | EU / US |
| Scheduling tool | Call bookings | EU / US |
| Payment processor | Invoices and transfers | Per provider |

I don't add a new service that touches personal data without a reason, and for client work I'll tell you before I do.

## How long I keep things {#retention scope="Everyone" group="For everyone" short="How long I keep it"}

| Data | Kept for |
| --- | --- |
| Server logs | 30 days |
| Aggregate analytics | 24 months |
| Newsletter address | Until you unsubscribe |
| Emails and enquiries | 24 months from the last reply |
| Client project material | Duration of the engagement, plus 90 days |
| Invoices and tax records | As long as tax law requires |

Financial records are the one category I can't delete on request — keeping them is a legal obligation, not a choice.

## Where your data lives {#transfers scope="Everyone" group="For everyone" short="Where it lives"}

I work from India, so anything I can read is effectively processed here. The services in section 10 store data in the EU, the US, or India depending on the provider.

If you're in the EU or UK and that matters to your compliance story, say so early — client infrastructure can be pinned to a region you choose, and it's much easier to decide that before anything is built.

## Security {#security scope="Everyone" group="For everyone" short="Security"}

Full-disk encryption, a password manager, hardware-backed two-factor authentication on every account that supports it, least-privilege IAM roles, and no shared logins. Access to a client system is scoped to what the work needs and removed when it's done.

<Aside kind="quote">
No one can promise perfect security, and anyone who does is selling something. What I can promise is that you'll hear about a problem from me first.
</Aside>

## Your rights {#rights scope="Everyone" group="For everyone" short="Your rights"}

Wherever you are, you can ask me to:

- Tell you what I hold about you, and where it came from
- Correct anything that's wrong
- Delete it, subject to the tax records in section 11
- Send you a copy in a portable format
- Stop using it for a particular purpose, including any marketing
- Withdraw a consent you gave earlier, without that affecting what happened before

Email [akjaiswal2003@gmail.com](mailto:akjaiswal2003@gmail.com?subject=Privacy%20request) with "Privacy request" in the subject. No form, no account, no fee. I'll confirm within a few days and complete it within 30. If you're unhappy with how I handle it, you can complain to your local data protection authority — and I'd appreciate hearing about it first so I can fix it.

## Children {#children scope="Everyone" group="For everyone" short="Children"}

This site is a professional portfolio meant for adults, and nothing here is directed at children. I don't knowingly collect data from anyone under 18. If you believe a child has sent me personal data, write to me and I'll delete it.

## Changes to this policy {#changes scope="Everyone" group="For everyone" short="Changes"}

When this changes, the version number and date at the top change with it. Minor edits go up quietly; anything that meaningfully affects what I collect or how I use it gets an email to subscribers and a note to active clients before it takes effect.

## Getting in touch about privacy {#contact scope="Everyone" group="For everyone" short="Get in touch"}

One address for all of it — questions, requests, corrections, complaints:

[Email me about privacy](mailto:akjaiswal2003@gmail.com?subject=Privacy%20question){.btn .btn-accent}
