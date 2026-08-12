import type {PageSeoContent} from "@app/data/seo-content.ts";
import {EMAIL, MAILTO} from "@app/data/email-config.ts";

// Portfolio copy lives here so content can change without touching component markup.
export const siteIdentity = {
  name: "Ayush Kumar",
  fullName: "Ayush Kumar Jaiswal",
  brand: "ayu-sh-kr",
  domain: "ayu-sh-kr.com",
} as const;

export const portfolioContent = {
  seo: {
    title: `${siteIdentity.fullName} (Ayush Kumar) — Backend Engineer (Kotlin · Spring Boot · AWS)`,
    description:
      "Ayush Kumar Jaiswal (Ayush Kumar) is a backend engineer with 4 years of experience building and running production systems with Kotlin, Spring Boot, AWS, PostgreSQL, and Redis.",
    keywords: [
      "Ayush",
      siteIdentity.name,
      siteIdentity.fullName,
      "Backend Engineer",
      "Kotlin",
      "Spring Boot",
      "AWS",
      "PostgreSQL",
      "Redis",
      "Freelance Backend Developer",
    ],
    ogTitle: `${siteIdentity.fullName} (Ayush Kumar) — Backend Engineer`,
    ogDescription: "Backend systems on the JVM and AWS, with end-to-end responsibility for delivery and operations.",
  } satisfies PageSeoContent,
  nav: {
    logo: siteIdentity.brand,
    links: [
      { label: "Showcase", href: "/showcase" },
      { label: "Blog", href: "/blog" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  hero: {
    eyebrow: "Backend engineer · JVM · AWS",
    titleBeforeAccent: "Production backends, built to",
    accent: "last.",
    summary:
      "I design, build, and operate backend systems with Kotlin, Spring Boot, and AWS. My work spans APIs, data, infrastructure, security, and production reliability.",
    primaryCta: { label: "View selected work", href: "#work-wrap" },
    secondaryCta: { label: "Contact me", href: "#contact" },
  },
  error: {
    seo: {
      title: `404 — ${siteIdentity.name}`,
      description: "The requested portfolio page could not be found.",
      keywords: ["404", siteIdentity.name],
      ogTitle: "404 — Page not found",
      ogDescription: "The requested portfolio page could not be found.",
    } satisfies PageSeoContent,
  },
  journey: [
    {
      label: "01 · Education",
      title: "B.Tech in Information Technology",
      body: "A foundation in software engineering, computer systems, and networks, supported by practical application development.",
      meta: "Systems · networks · software fundamentals",
    },
    {
      label: "02 · Indiknot",
      title: "Commercial software delivery",
      body: "A year building software for a retail business, with direct responsibility for requirements, delivery, and day-to-day use.",
      meta: "1 year · business software · production ownership",
    },
    {
      label: "03 · Sacrena",
      title: "End-to-end backend ownership",
      body: "Sole responsibility for the APIs, data model, deployments, AWS infrastructure, security, and reliability of a growing dating application.",
      meta: "2 years · Kotlin · Spring Boot · AWS · PostgreSQL · Redis",
    },
    {
      label: "04 · Current work",
      title: "Open source and independent projects",
      body: "I maintain the Dota web-component libraries and take on selected backend, cloud, and applied AI engagements.",
      meta: "Freelance · open source · IST (UTC+5:30)",
    },
  ],
  work: [
    {
      eyebrow: "Open source · maintainer",
      title: "Dota Wrap",
      body: "A typed toolkit for building applications with native web components. It also provides the foundation for this portfolio.",
      chips: ["Web Components", "TypeScript", "Vite"],
      link: { label: "View the package", href: "https://www.npmjs.com/package/@ayu-sh-kr/dota-wrap", external: true },
    },
    {
      eyebrow: "Production backend",
      title: "Sacrena",
      body: "The backend and AWS infrastructure for a growing dating application, including API design, data, security, deployment, and operations.",
      chips: ["Kotlin", "Spring Boot", "AWS", "PostgreSQL", "Redis"],
      link: { label: "Discuss the architecture", href: "#contact", external: false },
    },
    {
      eyebrow: "Agentic systems",
      title: "Production AI agents",
      body: "Focused agent workflows that connect language models to product capabilities, operational tools, and explicit safeguards.",
      chips: ["Spring AI", "LangChain", "AWS"],
      link: { label: "Ask about selected work", href: "#contact", external: false },
    },
    {
      eyebrow: "Product engineering",
      title: "Webingo",
      body: "An end-to-end product engagement covering backend architecture, frontend delivery, and the supporting visual identity.",
      chips: ["Product", "Backend", "Web"],
      link: { label: "Case details on request", href: "#contact", external: false },
    },
    {
      eyebrow: "Selected engagements",
      title: "Work with me",
      body: "I take on defined backend, AWS infrastructure, and applied AI projects where clear technical ownership is valuable.",
      chips: ["Fixed scope", "Retainer"],
      link: { label: "Discuss an engagement", href: "#contact", external: false },
      cta: true,
    },
  ],
  speaking: {
    eyebrow: "Speaking & teaching",
    headline: {
      before: "Practical engineering, ",
      accent: "clearly explained.",
    },
    summary:
      "I deliver lectures, workshops, and mentoring on backend engineering, cloud infrastructure, and applied AI, grounded in production experience.",
    proof: [
      { value: "40+", label: "sessions", prefix: "" },
      { value: "1,200+", label: "engineers taught", prefix: "" },
      { value: "9.4", label: "/10", prefix: "rated " },
    ],
    topics: [
      {
        number: "01",
        title: "Reliable backend systems",
        body: "API design, data modelling, observability, and failure handling for systems under production load.",
        chips: ["Spring Boot", "Postgres", "Redis"],
      },
      {
        number: "02",
        title: "AWS for small engineering teams",
        body: "A practical approach to selecting, operating, and controlling the cost of essential AWS services without a dedicated platform team.",
        chips: ["Lambda", "SQS · SNS", "EventBridge"],
      },
      {
        number: "03",
        title: "Applied AI in production",
        body: "Designing reliable agent workflows with Spring AI and LangChain, including evaluation, safeguards, and failure modes.",
        chips: ["AI agents", "Spring AI", "LangChain"],
      },
      {
        number: "04",
        title: "Building on the web platform",
        body: "Web components, long-term maintainability, and the design principles behind the Dota libraries.",
        chips: ["Web components", "TypeScript"],
      },
    ],
    invite: {
      eyebrow: "Invite me to speak",
      title: "Talks and workshops for technical audiences",
      body: "Sessions can be adapted for meetups, learning cohorts, and engineering teams, delivered remotely or in person.",
      primaryCta: {
        label: "Invite me to speak",
        href: MAILTO.helloSubject("Speaking invitation"),
      },
      secondaryCta: { label: "See topics & rates", href: "/pricing" },
    },
  },
  skills: [
    { name: "Backend", items: ["Java", "Kotlin", "Spring Boot", "Spring AI"] },
    { name: "Cloud & infra", items: ["EC2", "Lambda", "IAM", "S3", "EventBridge", "SNS / SQS", "ECR", "Docker"] },
    { name: "Data", items: ["PostgreSQL", "Redis caching", "Query performance", "Distributed locks"] },
    { name: "Security", items: ["AuthN / AuthZ", "Tokens & sessions", "Rate limiting"] },
    { name: "AI", items: ["Production agents", "LangChain", "Spring AI"] },
    { name: "Frontend", items: ["Dota", "Web Components", "Nuxt", "Angular"] },
  ],
  services: [
    {
      number: "01",
      title: "Backend & API development",
      body: "Design, build, and ongoing ownership for production APIs and the data behind them.",
    },
    {
      number: "02",
      title: "Cloud infrastructure on AWS",
      body: "Cost-aware infrastructure, containerized deployments, messaging, storage, and security.",
    },
    {
      number: "03",
      title: "AI agents & integrations",
      body: "Useful agent workflows connected to your product, tools, and internal systems.",
    },
  ],
  contact: {
    eyebrow: "Contact",
    titleBeforeAccent: "Discuss your next",
    accent: "project.",
    body: "Share the context, current constraints, and intended outcome. I will respond with an initial assessment and a practical next step.",
    email: EMAIL.hello,
    emailHref: MAILTO.helloSubject("Backend project inquiry"),
    resumeHref: MAILTO.helloSubject("Resume request"),
    github: "https://github.com/ayu-sh-kr",
    linkedin: "https://linkedin.com/in/ayu-sh-kr",
  },
  footer: {
    ghostWord: "fin",
    support: {
      eyebrow: "Colophon",
      titleLead: "Built through consistent practice.",
      titleSoft: "Refined through production work.",
      lede: "Reliable software is the result of sustained attention.",
      bodyBeforeHours: "Design, delivery, maintenance, and operational responsibility each contribute to systems people can rely on. Approximately",
      hoursTarget: 35040,
      bodyAfterHours: "hours of study and practice have shaped how I approach software intended to remain useful after launch.",
    },
    index: {
      externalMarker: "↗",
      groups: [
        {
          number: "01",
          title: "Explore",
          links: [
            { label: "Work", href: "/#work-wrap" },
            { label: "Journey", href: "/#journey-wrap" },
            { label: "Skills", href: "/#skills" },
            { label: "Speaking", href: "/#speaking" },
          ],
        },
        {
          number: "02",
          title: "Work",
          links: [
            { label: "Dota Wrap", href: "https://www.npmjs.com/package/@ayu-sh-kr/dota-wrap", external: true },
            { label: "Sacrena", href: "/#work-wrap" },
            { label: "Webingo", href: "/#work-wrap" },
          ],
        },
        {
          number: "03",
          title: "Engage",
          links: [
            { label: "Pricing", href: "/pricing" },
            { label: "Buy me a coffee", href: "/coffee" },
            { label: "Support", href: "/support" },
            { label: "Contact", href: "/#contact" },
            { label: "Speaking", href: "/#speaking" },
            { label: "Hire me", href: "/pricing" },
          ],
        },
        {
          number: "04",
          title: "Writing",
          links: [
            { label: "Blog", href: "/blog" },
            { label: "Showcase", href: "/showcase" },
          ],
        },
        {
          number: "05",
          title: "Design",
          links: [
            { label: "Layout", href: "/design/layout" },
            { label: "Color", href: "/design/color" },
            { label: "Typography", href: "/design/typography" },
            { label: "Elements", href: "/design/element" },
          ],
        },
        {
          number: "06",
          title: "Elsewhere",
          links: [
            { label: "GitHub", href: "https://github.com/ayu-sh-kr", external: true },
            { label: "LinkedIn", href: "https://linkedin.com/in/ayu-sh-kr", external: true },
            { label: "Email", href: MAILTO.hello, external: true },
          ],
        },
        {
          number: "07",
          title: "Legal",
          links: [
            { label: "Privacy Policy", href: "/legal/privacy" },
            { label: "Terms & Conditions", href: "/legal/terms" },
          ],
        },
      ],
    },
    baseline: {
      copyright: siteIdentity.brand,
      role: "Backend engineer",
      availability: "open for freelance work",
      clockTimeZone: "Asia/Kolkata",
      clockLocale: "en-IN",
      clockSuffix: " IST",
    },
  },
} as const;

export type PortfolioContent = typeof portfolioContent;
