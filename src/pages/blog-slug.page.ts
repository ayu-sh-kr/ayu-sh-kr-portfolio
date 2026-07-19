import {Component} from "@ayu-sh-kr/dota-wrap/core";
import {Route} from "@ayu-sh-kr/dota-wrap/router";
import {BlogPage} from "@app/pages/blog.page.ts";

/**
 * Dota Router uses a parent route as a prefix fallback only when that route has
 * a child. This sentinel child lets `/blog/<slug>` resolve to BlogPage; the
 * catalog still validates the actual slug and selects the Markdown source.
 */
@Route({path: "/blog/:slug"})
@Component({
  selector: "blog-slug-page",
  shadow: false,
})
export class BlogSlugPage extends BlogPage {}
