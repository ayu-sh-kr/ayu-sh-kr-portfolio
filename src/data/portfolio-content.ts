import type {PageSeoContent} from "@app/data/seo-content.ts";
import {EMAIL, MAILTO} from "@app/data/email-config.ts";

// Portfolio copy lives here so content can change without touching component markup.
export const siteIdentity = {
  name: "Ayush Kumar",
  brand: "ayu-sh-kr",
  domain: "ayu-sh-kr.com",
} as const;

export const portfolioContent = {
  seo: {
    title: `${siteIdentity.name} — Backend Engineer (Kotlin · Spring Boot · AWS)`,
    description:
      "Backend engineer with 4 years of experience building and running production systems with Kotlin, Spring Boot, AWS, PostgreSQL, and Redis.",
    keywords: [
      siteIdentity.name,
      "Backend Engineer",
      "Kotlin",
      "Spring Boot",
      "AWS",
      "PostgreSQL",
      "Redis",
      "Freelance Backend Developer",
    ],
    ogTitle: `${siteIdentity.name} — Backend Engineer`,
    ogDescription: "Production backends on the JVM and AWS. Open to backend roles and select freelance projects.",
  } satisfies PageSeoContent,
  nav: {
    logo: siteIdentity.brand,
    links: [
      { label: "Work", href: "/#work-wrap" },
      { label: "Showcase", href: "/showcase" },
      { label: "Journey", href: "/#journey-wrap" },
      { label: "Speaking", href: "/#speaking" },
      { label: "Skills", href: "/#skills" },
      { label: "Pricing", href: "/pricing" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  hero: {
    eyebrow: "Backend engineer · 4 years",
    titleBeforeAccent: "I build backends that just",
    accent: "work.",
    summary:
      "JVM and AWS, end to end. Sole engineer behind the backend of a rapidly growing dating app — and open for freelance projects.",
    primaryCta: { label: "See my work", href: "#work-wrap" },
    secondaryCta: { label: "Get in touch", href: "#contact" },
  },
  offline: {
    seo: {
      title: `Connection status — ${siteIdentity.name}`,
      description: `Connection status and recovery options for the ${siteIdentity.name} portfolio.`,
      keywords: ["Connection status", "Offline page", siteIdentity.name],
      og: {
        title: `Connection status — ${siteIdentity.name}`,
        description: "Connection status and recovery options for the portfolio.",
      },
    },
    nav: {
      ariaLabel: "Offline navigation",
      brand: siteIdentity.brand,
      brandHref: "/",
      offlineStatus: "Offline mode",
      onlineStatus: "Connection active",
    },
    states: {
      offline: {
        glyphLabel: "Searching for a Wi-Fi connection",
        eyebrow: "Connection lost",
        titleLead: "You're",
        titleAccent: "offline.",
        lede: "This page can't reach the server right now. It will load again when your network comes back — I'm already checking.",
        status: "Trying to reconnect…",
        code: "ERR_NETWORK · offline",
        retryLabel: "Try again",
      },
      online: {
        glyphLabel: "Wi-Fi connection is active",
        eyebrow: "Connection restored",
        titleLead: "You're",
        titleAccent: "online.",
        lede: "Your connection is working. Continue to the portfolio whenever you're ready.",
        status: "You're connected.",
        code: "NETWORK · online",
        retryLabel: "Continue to home",
      },
    },
    messages: {
      checking: "Trying to reach the server…",
      stillOffline: "Still no connection. Check your network and try again.",
    },
    scrollContainerLabel: "Connection help",
    actions: {
      homeLabel: "Back to home",
      homeHref: "/",
    },
    troubleshooting: {
      eyebrow: "Get back online",
      title: "Three things to try.",
      tries: [
        {
          title: "Check Wi-Fi or data",
          body: "Toggle it off and on, or switch to a network with a stronger signal.",
          icon: `<svg viewBox="0 0 24 24"><path d="M5 12.5a10 10 0 0 1 14 0M8 16a5.5 5.5 0 0 1 8 0"></path><circle cx="12" cy="19.5" r="1.4"></circle></svg>`,
        },
        {
          title: "Give it a second",
          body: "Moving through a lift, tunnel, or dead spot? The signal usually returns on its own.",
          icon: `<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-1.5 5.5"></path><path d="M20 5v6h-6"></path></svg>`,
        },
        {
          title: "Might be the server",
          body: "If everything else loads fine, it's on my side — and it won't stay down long.",
          icon: `<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="7" rx="1.5"></rect><rect x="4" y="13" width="16" height="7" rx="1.5"></rect><path d="M7.5 7.5h.01M7.5 16.5h.01"></path></svg>`,
        },
      ],
    },
    footer: {
      source: "Served from the portfolio edge",
    },
    lastTry: {
      justNow: "Last tried just now",
      secondsAgo: "Last tried {seconds}s ago",
    },
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
      label: "Chapter 01 · Foundation",
      title: "BTech, Information Technology",
      body: "Where the fundamentals were laid — systems, networks, and a bias for building things that run.",
      meta: "Systems · networks · software fundamentals",
    },
    {
      label: "Chapter 02 · Indiknot",
      title: "First production systems",
      body: "A year at a rug company taught me that software ships to real businesses, not tutorials.",
      meta: "1 year · business software · production ownership",
    },
    {
      label: "Chapter 03 · Sacrena",
      title: "One engineer, one backend",
      body: "I own the APIs, data model, deployments, infrastructure, and security behind a growing dating app — including the unglamorous details that keep it reliable.",
      meta: "2 years · Kotlin · Spring Boot · AWS · PostgreSQL · Redis",
    },
    {
      label: "Chapter 04 · Today",
      title: "Open source and open for work",
      body: "I maintain the Dota web-component libraries and work with clients who need backend, cloud, or AI systems carried from idea to production.",
      meta: "Freelance · open source · IST (UTC+5:30)",
    },
  ],
  work: [
    {
      eyebrow: "Open source · maintainer",
      title: "Dota Wrap",
      body: "My own typed toolkit for building web apps with native web components. This portfolio runs on it.",
      chips: ["Web Components", "TypeScript", "Vite"],
      link: { label: "View the package", href: "https://www.npmjs.com/package/@ayu-sh-kr/dota-wrap", external: true },
    },
    {
      eyebrow: "Production backend",
      title: "Sacrena",
      body: "The core backend and infrastructure of a rapidly growing dating app, designed, built, secured, and operated by one engineer.",
      chips: ["Kotlin", "Spring Boot", "AWS", "PostgreSQL", "Redis"],
      link: { label: "Discuss the architecture", href: "#contact", external: false },
    },
    {
      eyebrow: "Agentic systems",
      title: "Production AI agents",
      body: "Focused agents that connect models to real product workflows, tools, and guardrails instead of stopping at a chat demo.",
      chips: ["Spring AI", "LangChain", "AWS"],
      link: { label: "Ask about selected work", href: "#contact", external: false },
    },
    {
      eyebrow: "Product engineering",
      title: "Webingo",
      body: "A full-product build spanning backend ownership, frontend delivery, and the brand work needed to carry an idea end to end.",
      chips: ["Product", "Backend", "Web"],
      link: { label: "Case details on request", href: "#contact", external: false },
    },
    {
      eyebrow: "Next",
      title: "Your project",
      body: "Need a backend, cost-aware AWS infrastructure, or an AI agent built properly? Let’s define the outcome.",
      chips: ["Fixed scope", "Retainer"],
      link: { label: "Start a conversation", href: "#contact", external: false },
      cta: true,
    },
  ],
  speaking: {
    eyebrow: "Speaking & teaching",
    headline: {
      before: "I make hard systems ",
      accent: "click.",
    },
    summary:
      "Beyond shipping code, I teach it — lectures, workshops, and mentoring on backends, cloud, and AI agents for teams that want to level up fast.",
    proof: [
      { value: "40+", label: "sessions", prefix: "" },
      { value: "1,200+", label: "engineers taught", prefix: "" },
      { value: "9.4", label: "rated /10", prefix: "rated " },
    ],
    topics: [
      {
        number: "01",
        title: "Backends that survive 3am",
        body: "APIs, data models, and failure handling that hold up under real production load — from someone who owns the pager.",
        chips: ["Spring Boot", "Postgres", "Redis"],
      },
      {
        number: "02",
        title: "AWS for solo operators",
        body: "Cloud infrastructure without a platform team — the handful of services that matter and how to run them cheaply and safely.",
        chips: ["Lambda", "SQS · SNS", "EventBridge"],
      },
      {
        number: "03",
        title: "Building AI agents that ship",
        body: "From prompt to production: reliable agentic systems with Spring AI and LangChain, and where they break.",
        chips: ["AI agents", "Spring AI", "LangChain"],
      },
      {
        number: "04",
        title: "The platform is your framework",
        body: "Web components, longevity, and frontend you can still run in five years — the ideas behind the Dota libraries.",
        chips: ["Web components", "TypeScript"],
      },
    ],
    invite: {
      eyebrow: "Invite me to speak",
      title: "Running a meetup, cohort, or team offsite?",
      body: "I put together talks and hands-on workshops tailored to your audience — remote or in person, IST-friendly. Tell me the room and I'll shape the session.",
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
    titleBeforeAccent: "Let’s build something",
    accent: "reliable.",
    body: "Tell me what you’re building, what is stuck, and what a good outcome looks like. I’ll reply with a useful next step.",
    email: EMAIL.hello,
    emailHref: MAILTO.helloSubject("Backend project inquiry"),
    resumeHref: MAILTO.helloSubject("Resume request"),
    github: "https://github.com/ayu-sh-kr",
    linkedin: "https://linkedin.com/in/ayu-sh-kr",
  },
  footer: {
    ghostWord: "fin",
    support: {
      eyebrow: "Colophon · the last page",
      titleLead: "Built one careful hour at a time.",
      titleSoft: "The rest is just showing up.",
      lede: "Good software is mostly patient work.",
      bodyBeforeHours: "The kind that accumulates quietly — design, delivery, maintenance, and the hours between an idea and something people can trust. Around",
      hoursTarget: 35040,
      bodyAfterHours: "hours of small decisions have gone into learning how to build systems that stay useful after launch.",
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
            { label: "Buttons", href: "/design/button" },
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
