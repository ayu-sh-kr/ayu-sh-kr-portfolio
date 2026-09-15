import {BaseElement, BeforeInit, Component, HTML, Property, String} from "@ayu-sh-kr/dota-wrap/core";

/**
 * Presents a concise, non-blocking message in the normal page flow.
 *
 * `label`, `message`, and optional `supporting` describe the notice. Set
 * `container="content"` to align a full-bleed notice with the shared content
 * column, `offset="header"` when it follows the fixed site header, and
 * `variant="plain"` when a host supplies the surrounding surface. Authored
 * child markup is retained as the optional action area. Set `announce="true"`
 * only for a notice whose content changes while the visitor remains on page.
 *
 * Selector: `app-notice`.
 */
@Component({selector: "app-notice", shadow: false})
export class AppNoticeComponent extends BaseElement {
  @Property({name: "label", type: String})
  label = "";

  @Property({name: "message", type: String})
  message = "";

  @Property({name: "supporting", type: String})
  supporting = "";

  @Property({name: "container", type: String})
  container = "";

  @Property({name: "offset", type: String})
  offset = "";

  @Property({name: "variant", type: String})
  variant = "subtle";

  @Property({name: "live", type: String})
  live = "off";

  @Property({name: "announce", type: String})
  announce = "";

  private actions = "";

  @BeforeInit()
  captureActions(): void {
    this.actions = this.innerHTML.trim();
  }

  render(): string {
    const contentClass = this.container === "content" ? "layout-content" : "";
    const ariaLabel = this.label || "Notice";
    const announcement = this.announce === "true" ? `role="status" aria-live="${this.live}"` : "";

    return HTML`
      <aside class="app-notice" data-notice-surface aria-label="${ariaLabel}" ${announcement}>
        <div class="app-notice__content ${contentClass}">
          <p class="app-notice__label type-label" data-notice-label>${this.label}</p>
          <p class="app-notice__message" data-notice-message>${this.message}</p>
          <p class="app-notice__supporting" data-notice-supporting>${this.supporting}</p>
          ${this.actions ? `<div class="app-notice__actions">${this.actions}</div>` : ""}
        </div>
      </aside>
    `;
  }
}
