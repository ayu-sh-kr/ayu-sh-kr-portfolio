import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";

@Route({ path: "/" })
@Component({
  selector: "app-home",
  shadow: false,
})
export class HomePage extends DotaPageElement {
  constructor() {
    super();
  }

  get seo(): SEO {
    return {
      title: "Ayush Jaiswal — Backend Engineer (Kotlin · Spring Boot · AWS)",
      description:
        "Backend engineer with 4 years of experience building and running production systems with Kotlin, Spring Boot, AWS, PostgreSQL, and Redis.",
      keywords: [
        "Ayush Jaiswal",
        "Backend Engineer",
        "Kotlin",
        "Spring Boot",
        "AWS",
        "PostgreSQL",
        "Redis",
        "Freelance Backend Developer",
      ],
      og: {
        title: "Ayush Jaiswal — Backend Engineer",
        description: "Production backends on the JVM and AWS. Open to backend roles and select freelance projects.",
      },
    };
  }

  render(): string {
    return HTML`
      <app-header></app-header>
      <main>
        <portfolio-hero></portfolio-hero>
        <portfolio-journey></portfolio-journey>
        <portfolio-work></portfolio-work>
        <portfolio-skills></portfolio-skills>
        <portfolio-services></portfolio-services>
        <portfolio-contact></portfolio-contact>
        <portfolio-motion-controller></portfolio-motion-controller>
      </main>
      <footer class="px-5 py-8 text-center text-sm text-[var(--muted-color)] sm:px-8">
        Built with my Dota web-component libraries · Designed as a static Vite build
      </footer>
    `;
  }
}
