import {BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
import {blogIndexContent} from "@app/data/blog-content.ts";

/**
 * Presents the blog's low-volume email subscription prompt.
 *
 * This leaf owns only the subscription copy and form markup. Delivery remains
 * the responsibility of the form action, so catalog or filter state never leaks
 * into this reusable footer section.
 *
 * Selector: `blog-subscription`.
 */
@Component({
  selector: "blog-subscription",
  shadow: false,
})
export class BlogSubscriptionComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Renders the email form used at the end of the blog index. */
  render(): string {
    return `
      <section class="blog-subscribe" aria-label="${blogIndexContent.subscription.ariaLabel}">
        <div class="blog-container blog-subscribe-inner">
          <div><p class="blog-subscribe-title">${blogIndexContent.subscription.title}</p><p class="blog-subscribe-copy">${blogIndexContent.subscription.copy}</p></div>
          <form action="${blogIndexContent.subscription.formAction}" method="post" enctype="text/plain" class="blog-subscribe-form">
            <label class="sr-only" for="blog-email">${blogIndexContent.subscription.emailLabel}</label>
            <input id="blog-email" name="email" type="email" placeholder="${blogIndexContent.subscription.emailPlaceholder}" autocomplete="email" required />
            <button class="blog-ink-button" type="submit">${blogIndexContent.subscription.submitLabel}</button>
          </form>
        </div>
      </section>
    `;
  }
}
