import {Component, DotaPageElement, SEO} from "@ayu-sh-kr/dota-wrap/core";
import {Route} from "@ayu-sh-kr/dota-wrap/router";
@Route({path: "/blog"})
@Component({
  selector: "blog-page",
  shadow: false,
})
export class BlogPage extends DotaPageElement {
  constructor() {
    super();
  }

  get seo(): SEO {
    return {
      title: "The blog — ayush.dev",
      description: "Tutorials, takes, and notes from running production backends solo.",
      keywords: ["Ayush Jaiswal", "Backend Engineering", "Kotlin", "Spring Boot", "AWS", "Redis", "Blog"],
      og: {
        title: "The blog — ayush.dev",
        description: "Tutorials, takes, and notes from running production backends solo.",
      },
    };
  }

  render(): string {
    return `
      <app-header></app-header>
      <blog-view></blog-view>
      <app-footer></app-footer>
    `;
  }
}
