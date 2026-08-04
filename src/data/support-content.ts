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
    title: "Support and project handover",
    description:
      "Support guidance for existing engagements, Dota libraries, project handover, billing, and security reports.",
    keywords: [
      "Support",
      "Technical support",
      "Outage help",
      "Billing questions",
      "Handover docs",
    ],
    ogTitle: "Support and project handover",
    ogDescription:
      "Review common support guidance or send a concise request with the relevant technical context.",
  } satisfies PageSeoContent,

  /** The contact address surfaced across answers and the form. */
  email: supportEmail,

  /** Welcoming, answers-first opener; never opens on form fields. */
  opener: {
    eyebrow: "Support",
    titleBeforeAccent: "Support for",
    titleAccent: "current work.",
    titleAfterAccent: "",
    lede: "Use the guidance below for common project, billing, handover, and Dota library questions. When a request needs review, send the affected system, expected result, observed result, and relevant error details.",
    routesLabel: "Quick help",
  },

  /** Live-support expectations shown before visitors enter the answers-first flow. */
  overview: {
    eyebrow: "Support desk",
    titleBeforeAccent: "Start with the",
    titleAccent: "relevant context.",
    titleAfterAccent: "",
    lede: "Review the common paths below before sending a request. Existing client work is assessed against the agreed scope, handover material, and current operating context.",
    urgentPrefix: "Is a production system affected?",
    urgentLabel: "Report a production incident",
    urgentHref: `mailto:${supportEmail}?subject=URGENT%20support%20request`,
    deskHours: "Messages reviewed in IST (UTC+5:30)",
  },

  /** The transparent handoff shown immediately after a support message is sent. */
  nextSteps: [
    { number: "01", title: "Request received", body: "The request is reviewed with the system, environment, and evidence you provide.", when: "After submission" },
    { number: "02", title: "Initial assessment", body: "The first response identifies the likely next check, any missing context, and whether the matter appears to be support or new scope.", when: "After review" },
    { number: "03", title: "Scope confirmed", body: "Defects and changes are handled under the relevant engagement terms; new work is estimated before it begins.", when: "When needed" },
    { number: "04", title: "Resolution recorded", body: "Where a decision or recovery step is useful for future operation, it can be added to the handover material.", when: "As part of delivery" },
  ],

  /** Searchable reference answers for clients and users of the dota libraries. */
  faqs: [
    { category: "help", categoryLabel: "Getting help", question: "What counts as support, and what counts as new work?", answer: "Support addresses an agreed deliverable that is not behaving as intended. A new capability, changed requirement, or expanded integration is new work. The initial review will identify which applies and what evidence is needed." },
    { category: "help", categoryLabel: "Getting help", question: "How quickly can you reply?", answer: "Response timing depends on current commitments, the information provided, and the urgency of the issue. For a production incident, use the urgent-report address and include the affected service, environment, and time the issue began." },
    { category: "help", categoryLabel: "Getting help", question: "Is support included after a project ends?", answer: "Support terms are defined in the proposal or handover for each engagement. Ongoing maintenance can be arranged through a retainer or separately scoped work when capacity is available." },
    { category: "help", categoryLabel: "Getting help", question: "Can we arrange a call?", answer: "Yes, when written context is not enough to assess the issue. Send the relevant system details first so a call can focus on the decision or investigation required." },
    { category: "help", categoryLabel: "Getting help", question: "What should a support request include?", answer: "Describe the expected result, the observed result, when it began, and the affected environment. Include exact error text, relevant logs, or a short screen recording where they are safe to share." },
    { category: "help", categoryLabel: "Getting help", question: "Can another person on my team contact you?", answer: "Yes. For billing, access, or credential-related changes, the request may need confirmation from the authorised engagement contact before action is taken." },
    { category: "scope", categoryLabel: "Scope & retainers", question: "Do you offer retainers, and what do they cover?", answer: "A retainer reserves agreed engineering capacity for ongoing development, maintenance, and support. The proposal defines the scope, response expectations, and renewal terms for that engagement." },
    { category: "scope", categoryLabel: "Scope & retainers", question: "I need a change, not a fix. What happens?", answer: "Send a concise outline of the change and its intended outcome. The response will identify material constraints and provide an indicative estimate or a smaller phased option before work begins." },
    { category: "scope", categoryLabel: "Scope & retainers", question: "Will you support code you did not write?", answer: "Potentially. A short review is needed to understand the architecture, operating context, dependencies, and risks before maintenance work can be accepted." },
    { category: "scope", categoryLabel: "Scope & retainers", question: "What is not normally covered?", answer: "Third-party outages, changes made outside the agreed delivery, training beyond the handover, and work that requires unavailable access or credentials are assessed separately. The relevant constraint will be stated before further work is proposed." },
    { category: "dota", categoryLabel: "Dota libraries", question: "Where do I report a bug in a Dota library?", answer: "Open an issue in the relevant GitHub repository with the package version, browser, expected result, observed result, and a minimal reproduction. Use the support address only when the report contains private information." },
    { category: "dota", categoryLabel: "Dota libraries", question: "Do you accept pull requests?", answer: "Focused pull requests are welcome. For a substantial change, open an issue first to confirm the problem, intended behaviour, and the appropriate test coverage." },
    { category: "dota", categoryLabel: "Dota libraries", question: "How are versions and breaking changes communicated?", answer: "Review the package release notes and repository documentation before upgrading. When a change affects integration behaviour, the release should describe the migration work required." },
    { category: "dota", categoryLabel: "Dota libraries", question: "Which browsers do the libraries support?", answer: "Check the relevant repository documentation and package release notes for the current browser support policy. Compatibility depends on the package and the web-platform features it uses." },
    { category: "dota", categoryLabel: "Dota libraries", question: "Can I use them commercially?", answer: "Check the licence in the relevant repository or package before adoption. Commercial use and support expectations should be assessed from the published licence and project documentation." },
    { category: "billing", categoryLabel: "Billing & handover", question: "How does invoicing work?", answer: "Project invoices follow the milestones and terms agreed for the engagement. Retainer invoicing, payment method, and due dates are stated in the relevant proposal or invoice." },
    { category: "billing", categoryLabel: "Billing & handover", question: "We lost access to the AWS account. What now?", answer: "Account recovery should begin with the organisation's AWS account owner and billing contact. If an agreed IAM role remains available, support can assist the authorised administrator with recovery and access rotation." },
    { category: "billing", categoryLabel: "Billing & handover", question: "Can the repository be transferred to our organisation?", answer: "Repository access, infrastructure definitions, documentation, and handover steps are agreed as part of delivery. Send the destination organisation and the required access level so the transfer can be planned safely." },
    { category: "security", categoryLabel: "Security & data", question: "I found a security issue. Where do I report it?", answer: `Email <a href="${MAILTO.support}">support@ayu-sh-kr.com</a> rather than opening a public issue. Include enough detail to reproduce or assess the risk, and avoid sending credentials or customer data.` },
    { category: "security", categoryLabel: "Security & data", question: "What happens to what I send through this form?", answer: "Send only the information needed to assess the request. Do not include live credentials, authentication tokens, payment details, or customer records. Use a secure, agreed channel when sensitive material is required." },
    { category: "security", categoryLabel: "Security & data", question: "Can you review our NDA, DPA, or vendor forms?", answer: "Send the document with the relevant context and intended engagement. Any commitments will be reviewed against the actual scope, systems, and operational controls involved." },
  ],

  /** Labels and filter choices for the support reference accordions. */
  faq: {
    eyebrow: "Questions",
    title: "Support details.",
    body: "Guidance for existing clients, project handover, and Dota library users.",
    searchPlaceholder: "Search: invoice, retainer, staging, NDA…",
    searchAriaLabel: "Search questions",
    clearAriaLabel: "Clear search",
    categoryAriaLabel: "Filter by category",
    questionLabel: "questions",
    categories: [
      { value: "all", label: "All" },
      { value: "help", label: "Getting help" },
      { value: "scope", label: "Scope & retainers" },
      { value: "dota", label: "Dota libraries" },
      { value: "billing", label: "Billing & handover" },
      { value: "security", label: "Security & data" },
    ],
    empty: {
      title: "No matching answer.",
      body: "Send a concise support request with the relevant system and context.",
      actionLabel: "Send a support request",
    },
  },

  /** Self-serve destinations that resolve common requests before a message is needed. */
  resources: [
    { title: "Project handover material", body: "Review the repository, deployment notes, and operating guidance supplied for the engagement before requesting support.", href: "/support#support" },
    { title: "Dota library repositories", body: "Read package documentation, examples, and release notes in the relevant public repository.", href: "https://github.com/ayu-sh-kr" },
    { title: "AWS service health", body: "Check the AWS Health Dashboard for the affected Region and service before reporting a possible platform incident.", href: "https://health.aws.amazon.com/health/status" },
    { title: "Engineering writing", body: "Review technical articles and release-related notes that may explain a recent behaviour change.", href: "/blog" },
  ],

  /** Redirects new work to the pricing flow without interrupting support triage. */
  startProject: {
    eyebrow: "New work",
    titleBeforeAccent: "Planning a",
    titleAccent: "new project?",
    titleAfterAccent: "",
    body: "For a new product, backend, AWS environment, or applied AI workflow, use the project enquiry path. A concise outline of the outcome, current constraints, and intended users is enough to begin a practical assessment.",
    primaryLabel: "Discuss a project",
    primaryHref: "/pricing#pricing-start-project",
    secondaryLabel: "Email the brief",
    secondaryHref: `mailto:${supportEmail}?subject=Project%20inquiry`,
    note: "The first discussion can clarify scope, delivery constraints, and the appropriate next step.",
  },

  /** Quick-help routes: each resolves the common case before pointing at the form. */
  routes: [
    {
      id: "down",
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      label: "Production incident",
      sublabel: "An API, job, deployment, or integration is affected",
      answerTitle: "Report a production incident",
      answerHtml: `<p>For a live production issue, email
        <a href="mailto:${supportEmail}?subject=Urgent%3A%20something%27s%20down">${supportEmail}</a>
        with <b>URGENT</b> in the subject. Include the affected service, environment, start time, visible impact, and any relevant error or alarm details.</p>
        <div class="support-mini-faq">
          <details><summary>Include the operating context ${plus}</summary>
            <p>State the environment, affected endpoint or job, expected behaviour, observed behaviour, and the most relevant timestamp. This makes the first investigation more specific.</p></details>
          <details><summary>Check the platform signal ${plus}</summary>
            <p>For AWS-hosted systems, check the AWS Health Dashboard for the relevant Region and service. Record the result alongside application alarms and health checks.</p></details>
        </div>`,
    },
    {
      id: "howto",
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9.5 9a2.5 2.5 0 115 .5c0 1.5-2.5 2-2.5 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/><circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="2"/></svg>`,
      label: "Using or configuring a system",
      sublabel: "Project operation, a handover step, or a Dota library",
      answerTitle: "Find the relevant operating guidance",
      answerHtml: `<p>Start with the handover material, repository documentation, and deployment guidance supplied for the project. For Dota libraries, review the relevant README and release notes before changing an integration.</p>
        <div class="support-mini-faq">
          <details><summary>Cannot find the handover material? ${plus}</summary>
            <p>Send the repository or project name, the environment, and the operation you need to perform. The missing material can then be identified or the request can be scoped.</p></details>
          <details><summary>Need a new capability? ${plus}</summary>
            <p>Describe the intended outcome and the system it affects. New capability work is assessed separately from support so its scope and delivery constraints are explicit.</p></details>
        </div>`,
    },
    {
      id: "billing",
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 10h18" stroke="currentColor" stroke-width="2"/></svg>`,
      label: "Billing, access, or handover",
      sublabel: "Invoices, repository access, AWS accounts, and delivery material",
      answerTitle: "Resolve billing or access safely",
      answerHtml: `<p>Include the project, authorised contact, and the specific invoice, account, repository, or access change required. Access changes may need confirmation from the relevant account owner.</p>
        <div class="support-mini-faq">
          <details><summary>I need a past invoice ${plus}</summary>
            <p>Send the approximate date, project, and billing contact. The invoice request can then be matched to the relevant engagement records.</p></details>
          <details><summary>Transferring an account or repository ${plus}</summary>
            <p>Provide the destination organisation, authorised administrator, and required access level. The handover can then be planned with appropriate ownership and access controls.</p></details>
        </div>`,
    },
  ],

  /** Quiet handoff row that reveals or hides the ticket form. */
  handoff: {
    openLabel: "Send a support request",
    closeLabel: "Hide the form",
  },

  /** The ticket form — a conversation, not a queue. */
  form: {
    heading: "Describe the request.",
    sub: "Include the affected system, environment, expected result, observed result, and relevant evidence. Concise context supports a faster initial assessment.",
    chip: "Reviewed in IST",
    nameLabel: "Your name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    emailLabelSoft: "— so I can reply",
    emailPlaceholder: "you@company.com",
    topicLabel: "What's it about?",
    topics: ["An outage", "A bug", "A how-to", "Billing", "Something else"],
    detailsLabel: "The details",
    detailsPlaceholder:
      "What you expected, what happened instead, when it started, and the affected environment. Include relevant error text where safe to share.",
    dropLabel: "Screenshots or logs",
    dropLabelSoft: "— optional context",
    dropKey: "Drop files here, or <b>browse</b>",
    dropConstraint: "Images, logs, or a short screen recording · up to 10&nbsp;MB each",
    assure: "Do not include credentials, authentication tokens, payment details, or customer records.",
    submit: "Send support request",
  },

  /** Calm confirmation shown after a valid submit; never a dead end. */
  success: {
    heading: "Support request received.",
    sub: "The response will be sent to the email address you provided. Response timing depends on the request and current commitments.",
    replyPrefix: "A response will be sent to",
    again: "Send another request",
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
