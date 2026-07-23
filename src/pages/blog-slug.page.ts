import {Component, DotaPageElement, SEO} from "@ayu-sh-kr/dota-wrap/core";
import {Route} from "@ayu-sh-kr/dota-wrap/router";
import {getBlogPost, getBlogSlug} from "@app/configs/blogs.config.ts";

@Route({path: "/blog/:slug"})
@Component({
  selector: "blog-slug-page",
  shadow: false,
})
export class BlogSlugPage extends DotaPageElement {
  constructor() {
    super();
  }

  get seo(): SEO {
    const post = getBlogPost(getBlogSlug(window.location.pathname));

    return {
      title: post ? `${post.header} — ayush.dev` : "Post not found — ayush.dev",
      description: post?.description ?? "The requested blog post could not be found.",
      keywords: ["Ayush Jaiswal", "Backend Engineering", "Kotlin", "Spring Boot", "AWS", "Redis", "Blog"],
      og: {
        title: post?.header ?? "Post not found — ayush.dev",
        description: post?.description ?? "The requested blog post could not be found.",
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
