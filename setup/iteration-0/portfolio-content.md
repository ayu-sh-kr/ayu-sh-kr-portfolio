# Portfolio Website — Content Guide

Two audiences read this site with different questions in mind:

- **Recruiter:** "Is this person strong at the stack we hire for? Can I forward this profile internally?"
- **Freelance client:** "Can this person build my thing end-to-end, and can I trust them with it?"

Every section below serves both. Write in first person, plain English, no buzzword soup.

---

## 1. Hero (top of page)

**Headline:** who you are in one line.

> **Ayush — Backend Engineer**
> I build and run production backends on the JVM and AWS.

**Sub-line:** the proof + the offer.

> 4 years of experience · Sole engineer behind the backend of a rapidly growing dating app · Available for freelance projects.

**Two buttons:**
- `View my work` (scrolls to projects)
- `Hire me / Contact` (mailto or contact section)

Avoid: "passionate", "ninja", "rockstar", long paragraphs. The hero should be readable in 5 seconds.

---

## 2. Flagship case study: the dating app

This is your strongest asset — lead with it as a story, not a bullet list. Recruiters see ownership; clients see "he can run my whole backend."

Structure it as **Context → What I own → Scale/impact → Stack**:

> **Sole Backend Engineer — [App Name or "a rapidly growing dating app"]**
>
> I own the entire backend and infrastructure: API design, data model, deployments, and security.
>
> - Designed and run the core services in **Kotlin + Spring Boot** on **AWS** (EC2, Lambda, SQS/SNS, S3, ECR)
> - Own the **Postgres** schema and query performance; use **Redis** for caching and distributed locks
> - Built the security layer end to end: authn/authz, token & session management, rate limiting
> - Event-driven flows with SQS/SNS + EventBridge for [matching / notifications / etc.]
> - Containerised everything with **Docker**; deployments via [your actual process]

If you can share numbers (users, requests/day, uptime), add ONE line of numbers — numbers are what get quoted in hiring discussions. If NDA-bound, say "details under NDA, happy to discuss the architecture in a call" — that itself signals professionalism.

---

## 3. Projects (2–4 more, quality over quantity)

Same mini-format for each: **one line what it is → one line your role → stack tags → link (live/GitHub) if possible.**

Strong candidates from your list:

1. **Your web-components frontend framework** — "I built my own set of libraries for building web apps with web components. This site runs on it." Link the repo/docs. This is a standout differentiator; most backend engineers can't show this.
2. **An AI agent project** — pick your best LangChain / Spring AI build. Describe the problem it solves in client language ("an agent that does X for Y"), not framework language.
3. **Webingo** (if presentable) — shows you can carry a product/brand, which clients love.
4. One freelance/client project (anonymised if needed).

Skip anything you can't explain proudly in two sentences.

---

## 4. Skills — grouped, not a tag cloud

Group by what you *do*, so a non-technical client can still parse it:

- **Backend:** Java, Kotlin, Spring Boot, Spring AI
- **Cloud & Infra:** AWS (EC2, Lambda, IAM, S3, EventBridge, SNS, SQS, ECR), Docker
- **Data:** PostgreSQL, Redis (caching, distributed locks)
- **Security:** AuthN/AuthZ, tokens & sessions, rate limiting
- **AI:** Building production AI agents — LangChain, Spring AI
- **Frontend:** Web Components (own framework), Nuxt, some Angular

One honest framing line above it helps: *"Backend-first. I ship full products when a project needs it."* — tells recruiters your depth and clients your breadth.

---

## 5. Services (freelance-facing, small section)

Clients don't buy "Kotlin"; they buy outcomes. Three cards:

1. **Backend & API development** — design, build, and run production APIs.
2. **Cloud infrastructure on AWS** — setup, cost-aware architecture, deployments, security.
3. **AI agents & integrations** — custom agents wired into your product or workflow.

Optionally add: how you work (fixed scope or retainer), typical response time, "1 slot open for [month]".

---

## 6. About (short, human)

3–4 sentences max: 4 years building software, currently the sole backend engineer for a growing consumer app, what you enjoy (e.g., event-driven systems, making infra boring and reliable), where you're based / timezone you work with. Timezone matters a lot for freelance clients — state it explicitly (IST / UTC+5:30, overlap hours you offer).

---

## 7. Contact + footer

- Email (primary), GitHub, LinkedIn. Optional: a Cal.com/Calendly "book a 15-min call" link — dramatically lowers friction for clients.
- Resume PDF download (recruiters will look for this).
- Footer line: "Built with my own web-components framework · Hosted on S3 + CloudFront."

---

## Writing rules for the whole site

- First person, active voice: "I designed", "I run", "I own".
- One idea per sentence. A client should understand every section's first line.
- Concrete beats generic: "rate limiting and session security for a consumer app" beats "security best practices".
- No skill bars/percentages ("Java 90%") — they read as junior.
- Fix spelling everywhere — for a sole-engineer pitch, typos cost trust.
