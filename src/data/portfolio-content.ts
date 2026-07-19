// Portfolio copy lives here so content can change without touching component markup.
export const portfolioContent = {
  nav: {
    logo: "ayush.dev",
    links: [
      { label: "Work", href: "/#work-wrap" },
      { label: "Journey", href: "/#journey-wrap" },
      { label: "Skills", href: "/#skills" },
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
    email: "akjaiswal2003@gmail.com",
    emailHref: "mailto:akjaiswal2003@gmail.com?subject=Backend%20project%20inquiry",
    resumeHref: "mailto:akjaiswal2003@gmail.com?subject=Resume%20request",
    github: "https://github.com/ayu-sh-kr",
    linkedin: "https://linkedin.com/in/ayu-sh-kr",
  },
} as const;

export type PortfolioContent = typeof portfolioContent;
