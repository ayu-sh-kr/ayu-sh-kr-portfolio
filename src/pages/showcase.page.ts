import { Component, DotaPageElement, HTML, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";

@Route({ path: "/showcase" })
@Component({
  selector: "showcase-page",
  shadow: false,
})
export class ShowcasePage extends DotaPageElement {
  constructor() {
    super();
  }

  get seo(): SEO {
    return {
      title: "Showcase — ayush.dev",
      description: "Selected backend systems, open-source tools, and client work by Ayush Jaiswal.",
      keywords: ["Ayush Jaiswal", "Portfolio", "Backend Engineering", "Open Source", "AWS", "TypeScript"],
      og: {
        title: "Showcase — ayush.dev",
        description: "Selected backend systems, open-source tools, and client work by Ayush Jaiswal.",
      },
    };
  }

  render(): string {
    return HTML`
      <app-header></app-header>
      <showcase-page-content></showcase-page-content>
      <app-footer></app-footer>
    `;
  }
}

