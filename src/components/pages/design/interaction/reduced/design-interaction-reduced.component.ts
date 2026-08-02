import {
  BaseElement,
  Component,
  HostListener,
  HTML,
} from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";

/** Offers a non-persistent review state that verifies information survives without motion. */
@Component({ selector: "design-interaction-reduced", shadow: false })
export class DesignInteractionReducedComponent extends BaseElement {
  /** Whether the route's explicit reduced-motion review marker is active. */
  private isReviewingReducedMotion = false;

  /** Creates the reduced-motion review control. */
  constructor() {
    super();
  }

  /** Removes the review marker if route navigation disconnects the control while it is active. */
  @OnEvent("disconnected", true)
  clearReviewMarker(): void {
    document.documentElement.removeAttribute("data-interaction-review");
  }

  /** Toggles the review marker; it is intentionally document-local and never persisted. */
  @HostListener({ event: "click" })
  toggleReducedMotionReview(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest("[data-interaction-review]"))
      return;
    this.isReviewingReducedMotion = !this.isReviewingReducedMotion;
    document.documentElement.toggleAttribute(
      "data-interaction-review",
      this.isReviewingReducedMotion,
    );
    this.updateHTML();
  }

  /** Renders the review control and the rule that no-motion states preserve all meaning. */
  render(): string {
    const { reduced } = designInteractionContent;

    return HTML`
      <section id="reduced" class="design-interaction-section layout-page layout-section" aria-labelledby="reduced-title">
        <header class="design-interaction-heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${reduced.eyebrow}</p>
          <h2 id="reduced-title" class="type-section">${reduced.title}</h2>
          <p class="type-lede">${reduced.lede}</p>
        </header>
        <button type="button" class="design-interaction-review" data-interaction-review aria-pressed="${String(this.isReviewingReducedMotion)}">${this.isReviewingReducedMotion ? reduced.activeLabel : reduced.previewLabel}</button>
      </section>`;
  }
}
