import type {PageSeoContent} from "@app/data/seo-content.ts";
import {EMAIL, MAILTO} from "@app/data/email-config.ts";

const supportEmail = EMAIL.support;

/** Renders a `+` that the stylesheet rotates to `×` when a mini-FAQ item opens. */
const plus = `<span class="support-plus" aria-hidden="true">+</span>`;

/**
 * Framework-neutral copy for the standalone support page.
 *
 * Keeping the opener, quick-help routes, form labels, and confirmation strings
 * here lets {@link SupportSectionComponent} stay presentation-only and lets the
 * route expose SEO through `toSEO()`. Answer bodies and icons are authored HTML
 * because the section renders them as markup.
 */
export const supportContent = {
  seo: {
    title: "Support — get unstuck fast",
    description:
      "Answers-first support: resolve common outages, how-tos, and billing questions inline, or send a message that reaches a real person.",
    keywords: [
      "Support",
      "Technical support",
      "Outage help",
      "Billing questions",
      "Handover docs",
    ],
    ogTitle: "Support — get unstuck fast",
    ogDescription:
      "Most things move faster than a ticket. Find the answer inline, or a real message reaches a real person.",
  } satisfies PageSeoContent,

  /** The contact address surfaced across answers and the form. */
  email: supportEmail,

  /** Welcoming, answers-first opener; never opens on form fields. */
  opener: {
    eyebrow: "Support",
    titleBeforeAccent: "Stuck on something? Let's",
    titleAccent: "unstick",
    titleAfterAccent: "it.",
    lede: "Most things move faster than a ticket does. Tell me what kind of snag it is — there's a good chance the answer's already here. And if it isn't, a real message reaches a real person.",
    routesLabel: "Quick help",
  },

  /** Live-support expectations shown before visitors enter the answers-first flow. */
  overview: {
    eyebrow: "Support desk",
    titleBeforeAccent: "Get unstuck without",
    titleAccent: "waiting",
    titleAfterAccent: "in a queue.",
    lede: "Start with the common paths below. If they do not solve it, your message lands directly with the person who built it.",
    urgentPrefix: "Something live is broken?", 
    urgentLabel: "Email an urgent report",
    urgentHref: `mailto:${supportEmail}?subject=URGENT%20support%20request`,
    deskHours: "Mon–Fri, 10:00–19:00 IST",
  },

  /** The transparent handoff shown immediately after a support message is sent. */
  nextSteps: [
    { number: "01", title: "It lands", body: "Straight to my inbox with your attachments intact. Nothing gets auto-sorted into a void.", when: "Immediately" },
    { number: "02", title: "I reply, even if I don't know yet", body: "The first reply tells you what I think it is and what I'm checking. Silence isn't a status.", when: "Within a day" },
    { number: "03", title: "We fix or we scope", body: "A bug in my work gets fixed. A new want gets an honest estimate before anyone commits.", when: "1–3 days" },
    { number: "04", title: "It gets written down", body: "Anything non-obvious goes into your handover docs so the next person does not ask twice.", when: "Same week" },
  ],

  /** Searchable reference answers for clients and users of the dota libraries. */
  faqs: [
    { category: "help", categoryLabel: "Getting help", question: "What counts as support, and what counts as new work?", answer: "If something I built stopped doing what we agreed it would do, that's support and it's on me. If it works as specified but you now want it to do something else, that is new work. I'll tell you which bucket yours is in in the first reply." },
    { category: "help", categoryLabel: "Getting help", question: "How fast do you actually reply?", answer: "Median first reply is about four hours during the week. Worst case is one working day. If something is live-affecting, email with <b>URGENT</b> in the subject instead of using the form." },
    { category: "help", categoryLabel: "Getting help", question: "Is support included after a project ends?", answer: "Yes — 30 days of bug-fix support ships with every build. After that, a retainer covers you, or you can send one-off fixes my way and I'll quote them honestly." },
    { category: "help", categoryLabel: "Getting help", question: "Can we get on a call instead of typing?", answer: "Often, yes. Send the message first with a note that a call would help, and I'll reply with a booking link for a 20-minute slot after I have some context." },
    { category: "help", categoryLabel: "Getting help", question: "What do you need from me to move fast?", answer: "What you expected, what happened instead, when it started, and the exact error text. A short screen recording and the environment — staging or production — help even more." },
    { category: "help", categoryLabel: "Getting help", question: "Can someone else on my team write in?", answer: "Anyone on your side can use this page. For anything that touches billing, access, or credentials, I'll loop in whoever signed the engagement before acting." },
    { category: "scope", categoryLabel: "Scope & retainers", question: "Do you offer retainers, and what's in one?", answer: "A retainer covers fixes, small changes, dependency and security updates, monitoring review, and a standing slot to talk through what is next. One month of unused time can carry over; it does not build up indefinitely." },
    { category: "scope", categoryLabel: "Scope & retainers", question: "I need a change, not a fix. What happens?", answer: "Describe the shape of it and I'll come back with an honest estimate and the tradeoffs I see, including a smaller version that gets most of the value. Nothing starts until you agree to a number." },
    { category: "scope", categoryLabel: "Scope & retainers", question: "Will you support code you didn't write?", answer: "Sometimes. It begins with a short paid audit so I can see what I would be signing up for. Then I will say plainly whether I can maintain it and what I would change first." },
    { category: "scope", categoryLabel: "Scope & retainers", question: "What's explicitly not covered?", answer: "Third-party outages I cannot control, changes made by your team, training beyond handover, and anything that needs credentials you have not provided. I can still help find the right thread to pull." },
    { category: "dota", categoryLabel: "dota libraries", question: "Where do I report a bug in a dota library?", answer: "Open a GitHub issue on the relevant repo so the next person can find the answer. Include the library version, browser, and a minimal reproduction. Use the form here only if the report is private." },
    { category: "dota", categoryLabel: "dota libraries", question: "Do you take pull requests?", answer: "Gladly. Open an issue first for anything larger than a typo, keep the diff focused, match the existing style, and add a test when the change touches behaviour." },
    { category: "dota", categoryLabel: "dota libraries", question: "How do versions and breaking changes work?", answer: "Semantic versioning, honestly applied. Breaking changes land in majors with migration notes, and the previous major receives security patches for six months." },
    { category: "dota", categoryLabel: "dota libraries", question: "Which browsers do the libraries support?", answer: "The last two versions of Chrome, Edge, Firefox, and Safari, plus iOS Safari and Chrome on Android. Newer features degrade to working-but-plainer rather than broken." },
    { category: "dota", categoryLabel: "dota libraries", question: "Can I use them commercially?", answer: "Yes — MIT, no attribution required. They are free software with best-effort support; a retainer is the right conversation when you need a predictable response time." },
    { category: "billing", categoryLabel: "Billing & handover", question: "How does invoicing work?", answer: "Invoices come directly from me. Project work is billed against milestones; retainers go out on the first of the month. Terms are 14 days and both bank transfer and card work." },
    { category: "billing", categoryLabel: "Billing & handover", question: "We lost access to the AWS account. Now what?", answer: "The account is yours and is registered to your organisation. Root recovery goes through AWS and the billing contact; if I still hold an IAM role, I can help your admin re-establish access and rotate everything afterwards." },
    { category: "billing", categoryLabel: "Billing & handover", question: "Can you transfer the repository to our org?", answer: "That is the default at handover. You receive the repository, infrastructure definitions, docs, and a walkthrough — there is no lock-in." },
    { category: "security", categoryLabel: "Security & data", question: "I found a security issue. Where do I report it?", answer: `Email <a href="${MAILTO.support}">support@ayu-sh-kr.com</a> rather than opening a public issue. You will get an acknowledgement within 72 hours and honest updates while it is being fixed.` },
    { category: "security", categoryLabel: "Security & data", question: "What happens to what I send through this form?", answer: "It becomes an email to me and nothing else — no ticketing SaaS and no third party in the middle. Attachments are deleted once the thread is closed. Please never send live credentials or customer records." },
    { category: "security", categoryLabel: "Security & data", question: "Can you sign our NDA, DPA, or vendor forms?", answer: "Usually yes, and quickly. Send it with the first message. For security questionnaires, I will be candid about which controls a one-person studio genuinely has." },
  ],

  /** Labels and filter choices for the support reference accordions. */
  faq: {
    eyebrow: "Questions",
    title: "The long answers.",
    body: "Everything clients and library users actually ask, written out once so nobody has to wait on me for it.",
    searchPlaceholder: "Search: invoice, retainer, staging, NDA…",
    searchAriaLabel: "Search questions",
    clearAriaLabel: "Clear search",
    categoryAriaLabel: "Filter by category",
    questionLabel: "questions",
    categories: [
      { value: "all", label: "Everything" },
      { value: "help", label: "Getting help" },
      { value: "scope", label: "Scope & retainers" },
      { value: "dota", label: "dota libraries" },
      { value: "billing", label: "Billing & handover" },
      { value: "security", label: "Security & data" },
    ],
    empty: {
      title: "Nothing here matches that.",
      body: "Which is a perfectly good reason to ask me directly — I'll answer, then add it to this page.",
      actionLabel: "Ask me instead",
    },
  },

  /** Self-serve destinations that resolve common requests before a message is needed. */
  resources: [
    { title: "Your handover docs", body: "In the repo I shipped, under /docs — setup, runbooks, and the why behind the odd decisions.", href: "/support#support" },
    { title: "dota library readmes", body: "API reference, examples, and migration notes for every version on npm.", href: "https://github.com/ayu-sh-kr" },
    { title: "Status & incident history", body: "Whether it is you, me, or AWS — check the current signal before writing an outage report.", href: "https://health.aws.amazon.com/health/status" },
    { title: "Changelog", body: "What shipped, when, and what changed. It often explains ‘it worked yesterday’.", href: "/blog" },
  ],

  /** Redirects new work to the pricing flow without interrupting support triage. */
  startProject: {
    eyebrow: "Starting something new?",
    titleBeforeAccent: "Need to build",
    titleAccent: "something",
    titleAfterAccent: "new?",
    body: "If this is a new product, backend, cloud setup, or AI idea, take the project path. You’ll get a clearer starting point than a blank inbox — and a rough idea is enough to begin.",
    primaryLabel: "Start a project",
    primaryHref: "/pricing#pricing-start-project",
    secondaryLabel: "Email the brief",
    secondaryHref: `mailto:${supportEmail}?subject=Project%20inquiry`,
    note: "Not sure what shape it should take? That is part of the first conversation.",
  },

  /** Quick-help routes: each resolves the common case before pointing at the form. */
  routes: [
    {
      id: "down",
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      label: "Something's down",
      sublabel: "An API, a job, a deploy misbehaving",
      answerTitle: "When something is actually down",
      answerHtml: `<p>If it's live-affecting, don't wait on a form — email
        <a href="mailto:${supportEmail}?subject=Urgent%3A%20something%27s%20down">${supportEmail}</a>
        with <b>URGENT</b> in the subject and I'll treat it as a page. For anything on AWS you can also check the
        raw signal first:</p>
        <div class="support-mini-faq">
          <details><summary>First thing to check ${plus}</summary>
            <p>CloudWatch alarms and the service's health check endpoint. Nine times in ten the alarm already names the failing dependency — grab that line for your message.</p></details>
          <details><summary>Is it me or is it AWS? ${plus}</summary>
            <p>Check the AWS status page for your region before assuming the app. If AWS is degraded, there's a runbook in your handover doc for failing over.</p></details>
        </div>`,
    },
    {
      id: "howto",
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9.5 9a2.5 2.5 0 115 .5c0 1.5-2.5 2-2.5 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/><circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="2"/></svg>`,
      label: "How do I…?",
      sublabel: "Using a thing I built, or configuring it",
      answerTitle: "Using something I built for you",
      answerHtml: `<p>Most "how do I…" answers live in the handover docs I shipped with the project — the same repo, under
        <b>/docs</b>. If it's a dota library question, the readme covers the common cases.</p>
        <div class="support-mini-faq">
          <details><summary>Where are my docs again? ${plus}</summary>
            <p>Root of the repo I handed off, plus an ops handbook if we did a product-partner engagement. Can't find it? That's a valid reason to message me below.</p></details>
          <details><summary>Can you add a feature instead? ${plus}</summary>
            <p>Yep — that's retainer or a focused build, not support. Tell me the shape of it and I'll scope it honestly.</p></details>
        </div>`,
    },
    {
      id: "billing",
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 10h18" stroke="currentColor" stroke-width="2"/></svg>`,
      label: "Billing or access",
      sublabel: "Invoices, handover, account questions",
      answerTitle: "Invoices, access, and handover",
      answerHtml: `<p>Invoices come from me directly and you keep everything — your code, your AWS account, your docs.
        Nothing is held hostage.</p>
        <div class="support-mini-faq">
          <details><summary>I need a past invoice ${plus}</summary>
            <p>Message below with the rough date and I'll resend it same day.</p></details>
          <details><summary>Transferring the account to my team ${plus}</summary>
            <p>Straightforward — I'll walk your admin through IAM handover so there's no lock-in. Flag it below and we'll book 20 minutes.</p></details>
        </div>`,
    },
  ],

  /** Quiet handoff row that reveals or hides the ticket form. */
  handoff: {
    openLabel: "None of these — I need a person",
    closeLabel: "Hide the form",
  },

  /** The ticket form — a conversation, not a queue. */
  form: {
    heading: "Tell me what's going on.",
    sub: "Enough detail to picture it beats a perfect bug report. I'll reply from an actual inbox.",
    chip: "Usually within a day",
    nameLabel: "Your name",
    namePlaceholder: "Ayush's client",
    emailLabel: "Email",
    emailLabelSoft: "— so I can reply",
    emailPlaceholder: "you@company.com",
    topicLabel: "What's it about?",
    topics: ["An outage", "A bug", "A how-to", "Billing", "Something else"],
    detailsLabel: "The details",
    detailsPlaceholder:
      "What you expected, what happened instead, and when it started. Paste any error text — it helps more than you'd think.",
    dropLabel: "Screenshots or logs",
    dropLabelSoft: "— optional, but they speed things up",
    dropKey: "Drop files here, or <b>browse</b>",
    dropConstraint: "Images, logs, or a short screen recording · up to 10&nbsp;MB each",
    assure: "No account needed. I read every one myself — no queue, no bot triage.",
    submit: "Send it over",
  },

  /** Calm confirmation shown after a valid submit; never a dead end. */
  success: {
    heading: "Got it — it's on my desk.",
    sub: "I'll get back to you within a day, usually sooner. Check the inbox you gave me.",
    replyPrefix: "I'll get back to you within a day, usually sooner — at",
    again: "Send another",
  },

  /** Largest attachment kept client-side, in bytes (10 MB). */
  maxFileBytes: 10 * 1024 * 1024,
  /** Maximum number of attachments held before the drop zone stops accepting more. */
  maxFiles: 6,
} as const;

/**
 * Authored content contract for the support route.
 *
 * The page shell and its composed elements consume this inferred shape so copy,
 * destinations, answer markup, and interaction limits stay in one data module.
 */
export type SupportContent = typeof supportContent;
