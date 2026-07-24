import {Component, DotaPageElement, SEO} from "@ayu-sh-kr/dota-wrap/core";
import {Route} from "@ayu-sh-kr/dota-wrap/router";
import {getShowcaseProject, getShowcaseSlug} from "@app/data/showcase-content.ts";

@Route({path: "/showcase/:slug"})
@Component({
  selector: "showcase-slug-page",
  shadow: false,
})
export class ShowcaseSlugPage extends DotaPageElement {
  constructor() {
    super();
  }

  get seo(): SEO {
    const project = getShowcaseProject(getShowcaseSlug(window.location.pathname));

    return {
      title: project ? `${project.title} — ayush.dev` : "Showcase not found — ayush.dev",
      description: project?.summary ?? "The requested showcase could not be found.",
      keywords: ["Ayush Jaiswal", "Showcase", "Backend Engineering", "Web Components", "AWS"],
      og: {
        title: project?.title ?? "Showcase not found — ayush.dev",
        description: project?.summary ?? "The requested showcase could not be found.",
      },
    };
  }

  render(): string {
    return `
      <app-header></app-header>
      <showcase-view></showcase-view>
      <app-footer></app-footer>
    `;
  }
}
