import {Component, DotaPageElement, SEO} from "@ayu-sh-kr/dota-wrap/core";
import {Route} from "@ayu-sh-kr/dota-wrap/router";
import {getBlogPost, getBlogSlug} from "@app/configs/blogs.config.ts";

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
    const post = getBlogPost(getBlogSlug(window.location.pathname));

    return {
      title: post ? `${post.header} — ayush.dev` : "The blog — ayush.dev",
      description: post?.description ?? "Tutorials, takes, and notes from running production backends solo.",
      keywords: ["Ayush Jaiswal", "Backend Engineering", "Kotlin", "Spring Boot", "AWS", "Redis", "Blog"],
      og: {
        title: post?.header ?? "The blog — ayush.dev",
        description: post?.description ?? "Tutorials, takes, and notes from running production backends solo.",
      },
    };
  }

  render(): string {
    return `
      <app-header></app-header>
      <blog-view></blog-view>
      <footer class="blog-site-footer">Built with Dota web components · Written from production</footer>
    `;
  }
}
