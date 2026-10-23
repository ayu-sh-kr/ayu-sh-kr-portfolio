import "./design-index-reference.component.css";
import {html, TemplateResult} from "@ayu-sh-kr/dota-wrap/rendering";
import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import {
  designContent,
} from "@app/data/design-content.ts";

/**
 * The route map, ownership contract, and shipping floor for `/design`.
 *
 * One full-width door opens each live grammar without nesting its fragment
 * links. Once connected, an intersection observer keeps the wide-screen rail
 * aligned with the section in the reading band; teardown disconnects it when
 * the route unmounts so revisiting the index cannot retain stale nodes.
 *
 * Selector: `design-index-reference`.
 */
@Component({ selector: "design-index-reference", shadow: false })
export class DesignIndexReferenceComponent extends BaseElement {
  /** Observer that drives the section rail only while this route instance is connected. */
  private sectionObserver: IntersectionObserver | null = null;

  /** Creates the static reference element before its scoped lifecycle installs scroll tracking. */
  constructor() {
    super();
  }

  /** Observes every indexed section after Dota has rendered and bound the route's DOM. */
  @OnEvent("connected", true)
  observeSections(): void {
    const links = Array.from(this.querySelectorAll<HTMLAnchorElement>("[data-design-index-nav]"));

    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        const activeSection = entries.find((entry) => entry.isIntersecting)?.target.id;
        if (activeSection) {
          this.updateActiveRailLink(links, activeSection);
        }
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );

    this.querySelectorAll<HTMLElement>("[data-design-index-section]").forEach((section) => {
      this.sectionObserver?.observe(section);
    });
  }

  /** Releases the observer and its route-local element references when Dota removes this page. */
  @OnEvent("disconnected", true)
  stopObservingSections(): void {
    this.sectionObserver?.disconnect();
    this.sectionObserver = null;
  }

  /** Composes standalone grammar, ownership, route, and shipping sections in reading order. */
  render(): TemplateResult {
    return html`
      <div class="design-index-reference layout-page">
        <div class="design-index-reference__shell">
          <design-index-rail></design-index-rail>
          <div class="design-index-reference__content">
            ${designContent.sections.map(
              (section) => html`
                <design-index-grammar-section
                  section-key="${section.id}"
                ></design-index-grammar-section>
              `
            )}
            <design-index-ownership></design-index-ownership>
            <design-index-routes></design-index-routes>
            <design-index-shipping></design-index-shipping>
          </div>
        </div>
      </div>
    `;
  }

  /** Marks the rail link whose fragment matches the latest section in the observer's reading band. */
  private updateActiveRailLink(links: HTMLAnchorElement[], activeSection: string): void {
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${activeSection}`);
    });
  }
}
