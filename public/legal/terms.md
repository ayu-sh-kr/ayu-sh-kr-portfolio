---
slug: terms
title: Terms & Conditions
tagline: The rules for reading this site, and the default rules for working together.
kind: terms
version: "1.0"
updated: 2026-07-25
effective: 2026-08-01
governing_law: India
jurisdiction: Uttar Pradesh
contact: hello@ayush.dev

# The segmented scope switch under the header. Jumps only — never filters.
switch:
  - { label: Using the site, target: use }
  - { label: Hiring me, target: estimates }

# Renders as the tinted "short version" box above section 01.
summary:
  - Read anything here, quote it with credit, don't republish it wholesale as your own.
  - Code in blog posts is free to use and comes with no warranty. Test it before it touches production.
  - Prices and the estimator are honest ballparks, not offers. A signed proposal is the real number.
  - Paid work runs on a signed agreement. It wins over this page wherever the two disagree.
  - When you've paid in full, the work is yours — code, infrastructure, docs.
summary_note: This box is a summary, not the terms. The sections below are what actually applies.

related:
  - { title: Privacy Policy, href: /legal/privacy, blurb: "What I collect, why, and how to get rid of it." }
  - { title: Work with me, href: /pricing, blurb: "What an engagement looks like, and what it costs." }
---

<!--
AUTHORING NOTES — read before editing

Attributes on an h2 use the markdown-it-attrs syntax `{#id key="value"}`:
  #id     the anchor; once published it is permanent
  scope   the audience chip — one of: Site visitors | Clients | Everyone
  group   the TOC group heading; emitted in document order on change
  short   the TOC label

SECTION NUMBERS ARE FROZEN ONCE PUBLISHED. Clauses get cited by number in
emails and proposals, so append new clauses to the end of their group —
never insert in the middle, never reorder.

Voice: every clause states the rule AND its reason. First person. No word
Ayush wouldn't say on a call.
-->

## What you're agreeing to {#agreement scope="Everyone" group="The basics" short="The agreement"}

Using this site means accepting these terms. If you don't, the honest answer is to close the tab — there's nothing here that requires an account or a click-through.

Sections 3–8 cover the site itself. Sections 9–19 are the default terms for paid work. If we sign a proposal, a statement of work, or a client agreement, **that document wins** wherever it differs from this page.

## Who you're dealing with {#who scope="Everyone" group="The basics" short="Who you're dealing with"}

Ayush — an independent backend engineer operating as a sole practitioner from India, reachable at [hello@ayush.dev](mailto:hello@ayush.dev). "I" and "me" mean him; "you" means whoever is reading, or the organisation you're reading on behalf of.

## Using the site {#use scope="Site visitors" group="Using the site" short="Using the site"}

Read it, share it, link to it, print it, feed it to your reader of choice. What I'd ask you not to do:

- Scrape it hard enough to cost me money, or hammer it in a way that degrades it for anyone else
- Try to break into the infrastructure behind it, or test its security without asking first
- Republish whole posts as your own work, with or without an AI in the middle
- Use anything here to imply I endorse you, your product, or your employer

Found a real vulnerability? Email me before you publish and I'll credit you in the fix.

## What's mine, and what you may use {#ip scope="Site visitors" group="Using the site" short="What's mine, what you may use"}

The writing, design, layout, and photography on this site are mine. Quoting a paragraph or two with a link back is welcome and needs no permission. A full repost, a translation, or a commercial reuse needs a short email — I say yes more often than not.

Code snippets in blog posts and case studies are a deliberate exception: use them in anything, commercial or not, with no attribution required. The open-source libraries are governed by the licences in their own repositories, not by this page.

## Posts are opinions, not advice {#opinions scope="Site visitors" group="Using the site" short="Posts are opinions"}

The blog is one engineer's experience, written honestly and sometimes bluntly. It isn't professional, legal, financial, or security advice for your situation, and a post that's right for a system I've run may be wrong for yours.

<Aside kind="quote">
Tutorials are tested on my machines, not yours. Anything you deploy from here is your call and your risk — read it, understand it, then run it.
</Aside>

Opinions expressed are mine alone and not those of any employer or client, past or present.

## Links to other places {#links scope="Site visitors" group="Using the site" short="Links elsewhere"}

I link to documentation, repositories, and other people's writing because it's useful. I don't control any of it, don't vet it continuously, and can't answer for what it says tomorrow. There are no paid links or affiliate arrangements anywhere on this site.

## The newsletter {#newsletter scope="Site visitors" group="Using the site" short="The newsletter"}

Subscribing is free and cancelling takes one click. I send posts occasionally, never sell or lend the list, and may stop sending altogether if I run out of things worth saying. How the address is stored is covered in the [Privacy Policy](/legal/privacy#newsletter).

## Availability {#availability scope="Site visitors" group="Using the site" short="Availability"}

This is a personal site. It carries no uptime promise, posts can be edited or removed, and URLs may change — though I try hard to keep old links working. Nothing here is guaranteed to still be here next year.

## Estimates are not quotes {#estimates scope="Clients" group="Working with me" short="Estimates aren't quotes"}

The prices and the estimator on the "Work with me" page exist so you can judge whether we're in the same universe before spending time on a call. They're honest ballparks based on past work.

They are not an offer, and nothing on this site creates a contract at a stated price. A real number comes after a conversation, in a written proposal, with the scope it's attached to.

## How an engagement starts {#engagement scope="Clients" group="Working with me" short="How work starts"}

A short call, then a written proposal covering scope, deliverables, timeline, price, and payment schedule. Work begins when you accept the proposal in writing and any deposit clears. Email acceptance is fine — I don't need a courier.

These terms are the backdrop for that proposal. If your organisation has its own contract or MSA, send it early; I'll read it properly rather than sign it blind.

## Scope and changes {#scope-changes scope="Clients" group="Working with me" short="Scope and changes"}

The proposal defines what's in scope. Anything outside it isn't refused — it's re-quoted. New requirements get a short written change note with the price and timeline impact, and nothing starts until you agree to it.

Small things stay free. If a request takes ten minutes, I do it and say nothing; I'm not going to invoice you for a config flag.

## Fees, invoices, and taxes {#fees scope="Clients" group="Working with me" short="Fees and invoices"}

- **Fixed-scope work** is billed against milestones set out in the proposal, typically with a deposit before the first line of code.
- **Retainers** are billed monthly in advance, and unused capacity doesn't roll over.
- **Payment terms** are 14 days from invoice unless the proposal says otherwise.
- **Prices exclude** taxes and third-party costs — cloud bills, domains, licences, paid APIs. Those go on your accounts, in your name.
- **Late payment** pauses work after 14 days overdue. I'll always warn you first; I'd rather hear that cash is tight than chase silence.

Bank charges and currency conversion are yours. Applicable Indian taxes are added where required and shown on the invoice.

## What I need from you {#yourside scope="Clients" group="Working with me" short="What I need from you"}

Timely access, timely answers, and one person who can make decisions. Most delayed projects aren't blocked on code; they're blocked on a credential nobody can find or a decision nobody wants to own.

You confirm that anything you hand me — data, designs, third-party code — is yours to hand over. If a project sits idle for more than 30 days waiting on your side, I may release the reserved time and reschedule when you're ready.

## Who owns what {#ownership scope="Clients" group="Working with me" short="Who owns what"}

On full payment, the work is yours. The one thing I keep is the generic tooling I bring to every project — and you get a permanent licence to keep using it inside what I built for you.

| What | Yours or mine |
| --- | --- |
| Code written for your project | Yours, on full payment |
| Infrastructure and accounts | Yours — set up in your name from day one |
| Documentation and ops handbook | Yours |
| My pre-existing libraries and helpers | Mine, licensed to you perpetually and royalty-free |
| Open-source dependencies | Under their own licences, which I'll list |
| Workshop slides and exercises | Mine, licensed to your team for internal use |

Until an invoice is settled, I keep ownership of the work in progress. This has never mattered in practice, and it's in here so neither of us has to invent a rule if it ever does.

## Confidentiality {#confidentiality scope="Clients" group="Working with me" short="Confidentiality"}

Anything you share is confidential by default, NDA or not, and stays that way after the engagement ends. I'll sign your NDA; I don't need you to sign mine. How data is actually handled is set out in the [Privacy Policy](/legal/privacy#nda).

## Speaking engagements {#speaking scope="Clients" group="Working with me" short="Speaking engagements"}

- A booking is confirmed in writing with a date, format, audience, and fee.
- Travel and accommodation for in-person events are billed at cost unless agreed otherwise.
- Cancel more than 21 days out and nothing is owed. Inside 21 days, 50% of the fee covers the reserved time; inside 7 days, the full fee.
- If I have to cancel, you get a full refund and my help finding a replacement speaker.
- Recording is fine and welcome. Slides stay mine, shared under a licence your attendees can keep.

Community meetups and non-profits: ask. Section 12 is written for companies, and I'd rather do the talk than argue about the invoice.

## Cancellation and refunds {#cancellation scope="Clients" group="Working with me" short="Cancellation"}

Either of us can end an engagement with 14 days' written notice. You pay for work completed and accepted up to that point; anything you've paid beyond it comes back to you.

However it ends, you get a handover: the code, access, credentials, and an honest note on what's done, what isn't, and what I'd do next. Retainers can be stopped at the end of any billing month with no penalty.

## Warranty and the fix window {#warranty scope="Clients" group="Working with me" short="Warranty and fixes"}

For 30 days after delivery, I fix defects in what I built at no charge — a defect being the code not doing what the proposal said it would. New features, changed requirements, and problems in systems I didn't build are separate work.

<Aside kind="note">
Software isn't guaranteed bug-free by anyone honest. What's guaranteed is that I'll be there when something surfaces, and that I'll tell you plainly whether it's a defect or a change.
</Aside>

## Showing the work {#showing scope="Clients" group="Working with me" short="Showing the work"}

This portfolio is how I get hired, so unless you tell me otherwise I may name you as a client, describe the problem in general terms, and write about the engineering lessons.

What never appears without your written permission: your source code, credentials, business metrics, user data, screenshots of anything private, or anything an NDA covers. Ask me to stay anonymous — before, during, or years later — and I'll take it down. No negotiation, no explanation needed.

## Liability {#liability scope="Everyone" group="For everyone" short="Liability"}

For site visitors: this site and everything on it is provided as-is, and I'm not liable for what happens when you use code or advice from it.

For clients: my total liability for an engagement is capped at the fees you've paid me for it, and neither of us is liable to the other for indirect or consequential losses such as lost profit or lost data. Nothing here limits liability for fraud, gross negligence, or anything that can't legally be limited.

## Ending things {#termination scope="Everyone" group="For everyone" short="Ending things"}

I can restrict access to the site for anyone abusing it under section 3. Engagements end as described in section 17. Confidentiality, ownership, and liability survive the end of either.

## Governing law {#law scope="Everyone" group="For everyone" short="Governing law"}

These terms are governed by the laws of India, and the courts of Uttar Pradesh have jurisdiction. If a clause turns out to be unenforceable, the rest still stands.

Before anyone reaches for a lawyer, we talk. Almost every dispute in this line of work is a misunderstanding about scope, and a 20-minute call usually settles it.

## Changes to these terms {#changes scope="Everyone" group="For everyone" short="Changes"}

The version and date at the top move when these do. Changes apply to site use from the day they're posted, and to engagements only from the next signed proposal — never retroactively to work already agreed.

## Questions {#questions scope="Everyone" group="For everyone" short="Questions"}

If a clause here is a problem for your situation, say so before we start rather than after. Most of this is negotiable.

[Ask about these terms](mailto:hello@ayush.dev?subject=Question%20about%20your%20terms){.btn .btn-accent}