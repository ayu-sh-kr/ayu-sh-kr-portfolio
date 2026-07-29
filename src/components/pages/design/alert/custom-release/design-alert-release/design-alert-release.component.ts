import { BaseElement, BindEvent, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import type { AlertController } from "@app/service/alert.service.ts";
import { designAlertContent } from "@app/data/design-alert-content.ts";

/**
 * Caller-owned alert content used by the `/design/alert` custom specimen.
 *
 * The showcase supplies its {@link AlertController} before this element mounts.
 * This component owns its buttons, while the alert host continues to own the
 * queue, focus trap, and pending exit policy.
 */
@Component({
  selector: "design-alert-release",
  shadow: false,
})
export class DesignAlertReleaseComponent extends BaseElement {
  /** Controller supplied by `Alert.custom`; it is not an HTML attribute. */
  controller: AlertController<string> | null = null;

  /** Creates the caller-owned release view. */
  constructor() {
    super();
  }

  /** Cancels through the shared host so the current custom job resolves consistently. */
  @BindEvent({ event: "click", id: "#design-alert-release-cancel" })
  cancelRelease(): void {
    this.controller?.cancel();
  }

  /** Demonstrates a caller-controlled async action using the shared pending lock. */
  @BindEvent({ event: "click", id: "#design-alert-release-confirm" })
  async releaseDraft(): Promise<void> {
    await this.controller?.run(() => new Promise((resolve) => window.setTimeout(() => resolve("released"), 900)));
  }

  /** Renders the caller-owned body and controls without reimplementing a dialog. */
  render(): string {
    const { custom } = designAlertContent;

    return HTML`
      <section class="design-alert-release" aria-labelledby="design-alert-release-title">
        <p class="type-eyebrow">${custom.eyebrow}</p>
        <h2 id="design-alert-release-title" class="type-section">${custom.title}</h2>
        <p class="type-lede">${custom.body}</p>
        <div class="design-alert-release-actions">
          <button id="design-alert-release-cancel" type="button">${custom.cancel}</button>
          <button id="design-alert-release-confirm" type="button">${custom.confirm}</button>
        </div>
      </section>
    `;
  }
}
