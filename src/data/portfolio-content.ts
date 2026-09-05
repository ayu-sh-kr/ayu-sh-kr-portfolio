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
    title: `${siteIdentity.fullName} — Tech & Product Builder | Websites, Apps & AI`,
    description:
      "Ayush Kumar Jaiswal designs and builds websites, product dashboards, event forms, Meta app integrations, AI features, and the systems behind them.",
    keywords: [
      "Ayush",
      siteIdentity.name,
      siteIdentity.fullName,
      "Tech Consultant",
      "Product Builder",
      "Website Developer",
      "Dashboard Developer",
      "Event Registration Forms",
      "Meta App Integration",
      "Web Application Developer",
      "Kotlin",
      "Spring Boot",
      "AWS",
      "PostgreSQL",
      "Redis",
      "Freelance Technology Consultant",
    ],
    ogTitle: `${siteIdentity.fullName} (Ayush Kumar) — Tech & Product Builder`,
    ogDescription: "Websites, dashboards, event flows, Meta integrations, AI features, and the technology that makes them work.",
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
    eyebrow: "Web · product · platforms · AI",
    titleBeforeAccent: "Technology that helps ideas",
    accent: "move.",
    summary:
      "I design and build the technology around a real need: brand websites, dashboards, event registration flows, Meta app integrations, AI features, and the platforms behind them.",
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
      title: "End-to-end product systems",
      body: "Ownership of the APIs, data model, deployments, AWS infrastructure, security, and reliability behind a growing dating application.",
      meta: "2 years · product systems · Kotlin · AWS · PostgreSQL · Redis",
    },
    {
      label: "04 · Current work",
      title: "Independent technology work",
      body: "I maintain the Dota web-component libraries and build selected websites, web apps, business tools, integrations, and AI-powered experiences.",
      meta: "Freelance · open source · web & product · IST (UTC+5:30)",
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
      eyebrow: "Product platform",
      title: "Sacrena",
      body: "The product platform for a growing dating application, covering APIs, data, security, deployment, AWS infrastructure, and dependable operations.",
      chips: ["Product platform", "Kotlin", "AWS", "PostgreSQL", "Redis"],
      link: { label: "Discuss a product build", href: "#contact", external: false },
    },
    {
      eyebrow: "Agentic systems",
      title: "Production AI agents",
      body: "Focused agent workflows that connect language models to product capabilities, operational tools, and explicit safeguards.",
      chips: ["Spring AI", "LangChain", "AWS"],
      link: { label: "Ask about selected work", href: "#contact", external: false },
    },
    {
      eyebrow: "Brand & product web",
      title: "Webingo",
      body: "An end-to-end web engagement covering brand presence, product experience, frontend delivery, and the technology that supports it.",
      chips: ["Brand website", "Product", "Web"],
      link: { label: "Visit Webingo", href: "https://webingo-frontend-six.vercel.app/", external: true },
    },
    {
      eyebrow: "Selected engagements",
      title: "Work with me",
      body: "I take on focused technology work: brand websites, dashboards, event forms, Meta app integrations, AI features, and the systems that support them.",
      chips: ["Web & product", "Integrations", "Fixed scope", "Retainer"],
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
      "I deliver lectures, workshops, and mentoring on product engineering, the web platform, cloud systems, and applied AI, grounded in hands-on delivery.",
    proof: [
      { value: "40+", label: "sessions", prefix: "" },
      { value: "1,200+", label: "engineers taught", prefix: "" },
      { value: "9.4", label: "/10", prefix: "rated " },
    ],
    topics: [
      {
        number: "01",
        title: "From idea to working product",
        body: "Turning a business need into a useful website, workflow, dashboard, or application with clear choices about experience and delivery.",
        chips: ["Product delivery", "Web apps", "Systems"],
      },
      {
        number: "02",
        title: "Practical platforms for small teams",
        body: "Choosing and operating the web, cloud, and integration tools that help a team ship without unnecessary complexity.",
        chips: ["AWS", "Integrations", "Operations"],
      },
      {
        number: "03",
        title: "Applied AI and integrations",
        body: "Designing AI features and connected workflows with useful boundaries, practical safeguards, and clear outcomes.",
        chips: ["AI agents", "Meta apps", "APIs"],
      },
      {
        number: "04",
        title: "Building for the web",
        body: "Brand sites, event forms, dashboards, web components, and the decisions that keep web products useful as they grow.",
        chips: ["Websites", "Dashboards", "Web components"],
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
    { name: "Web & brand", items: ["Websites", "Design systems", "Web Components", "TypeScript"] },
    { name: "Product experiences", items: ["Dashboards", "Event forms", "Web apps", "Responsive UI"] },
    { name: "Integrations", items: ["Meta apps", "APIs", "Automations", "Payments & messaging"] },
    { name: "Backend", items: ["Java", "Kotlin", "Spring Boot", "Spring AI"] },
    { name: "Cloud & infra", items: ["EC2", "Lambda", "IAM", "S3", "EventBridge", "SNS / SQS", "ECR", "Docker"] },
    { name: "Data", items: ["PostgreSQL", "Redis caching", "Query performance", "Distributed locks"] },
    { name: "Security", items: ["AuthN / AuthZ", "Tokens & sessions", "Rate limiting"] },
    { name: "AI", items: ["Production agents", "LangChain", "Spring AI"] },
    { name: "Frontend", items: ["Dota", "Nuxt", "Angular", "Vite"] },
  ],
  services: [
    {
      number: "01",
      title: "Websites & brand experiences",
      body: "Distinctive, useful websites that give a brand a clear home and turn attention into action.",
    },
    {
      number: "02",
      title: "Dashboards, forms & web apps",
      body: "Practical internal tools, customer dashboards, event registration flows, and product interfaces built around how people actually work.",
    },
    {
      number: "03",
      title: "Meta apps, AI & integrations",
      body: "Connected experiences that bring Meta platforms, AI capabilities, APIs, and business tools into one usable workflow.",
    },
    {
      number: "04",
      title: "Platforms behind the product",
      body: "APIs, data, cloud infrastructure, security, and operations for technology that needs to work reliably after launch.",
    },
  ],
  contact: {
    eyebrow: "Contact",
    titleBeforeAccent: "Discuss your next",
    accent: "project.",
    body: "Share the context, current constraints, and intended outcome. I will respond with an initial assessment and a practical next step.",
    email: EMAIL.hello,
    emailHref: MAILTO.helloSubject("Technology project inquiry"),
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
            { label: "Webingo", href: "https://webingo-frontend-six.vercel.app/", external: true },
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
      role: "Tech & product builder",
      availability: "open for freelance work",
      clockTimeZone: "Asia/Kolkata",
      clockLocale: "en-IN",
      clockSuffix: " IST",
    },
  },
} as const;

export type PortfolioContent = typeof portfolioContent;
