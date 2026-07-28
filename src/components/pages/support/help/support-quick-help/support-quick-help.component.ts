import { BaseElement, BindEvent, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { supportContent } from "@app/data/support-content.ts";

/**
 * Resolves common support requests through one expanded quick-help answer at a time.
 *
 * This is the interactive middle of {@link SupportSectionComponent}. A route click
 * swaps only the answer region rather than re-rendering the cards, which preserves
 * focus and keeps the selection state local. On pointer devices it also adds the
 * card-local highlight; disconnecting aborts those listeners.
 *
 * Selector: `support-quick-help`.
 */
@Component({ selector: "support-quick-help", shadow: false })
export class SupportQuickHelpComponent extends BaseElement {
  /** Abort signal shared by the pointer-light listeners for the currently connected element. */
  private pointerController: AbortController | null = null;
  /** Route id whose inline answer is expanded, or `null` when every answer is closed. */
  private openRoute: string | null = null;

  /** Creates the quick-help element before its cards are rendered. */
  constructor() {
    super();
  }

  /** Adds pointer-relative highlights after the route cards are available in the DOM. */
  @OnEvent("connected", true)
  initializePointerLight(): void {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    this.pointerController = new AbortController();
    this.querySelectorAll<HTMLElement>(".support-route").forEach((route) => {
      route.addEventListener("pointermove", (event) => this.updatePointerLight(route, event), {
        signal: this.pointerController?.signal,
      });
    });
  }

  /** Removes pointer listeners and discards the selected route when the element leaves the page. */
  @OnEvent("disconnected", true)
  cleanupPointerLight(): void {
    this.pointerController?.abort();
    this.pointerController = null;
    this.openRoute = null;
  }

  /** Expands the clicked route's answer, or closes it when the same route is selected again. */
  @BindEvent({ event: "click", id: ".support-route" })
  toggleRoute(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".support-route");
    const answer = this.querySelector<HTMLElement>("#support-answer");
    const answerContent = this.querySelector<HTMLElement>("#support-answer-inner");
    const routeId = button?.dataset.route;
    if (!button || !answer || !answerContent || !routeId) {
      return;
    }

    if (this.openRoute === routeId) {
      button.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      answer.classList.remove("is-open");
      this.openRoute = null;
      return;
    }

    const route = supportContent.routes.find((candidate) => candidate.id === routeId);
    if (!route) {
      return;
    }

    this.querySelectorAll<HTMLButtonElement>(".support-route").forEach((item) => {
      item.classList.toggle("is-open", item === button);
      item.setAttribute("aria-expanded", String(item === button));
    });
    answerContent.innerHTML = `<h3>${route.answerTitle}</h3>${route.answerHtml}`;
    answer.classList.add("is-open");
    this.openRoute = routeId;
  }

  /** Updates the CSS custom properties that position one route card's pointer highlight. */
  private updatePointerLight(route: HTMLElement, event: PointerEvent): void {
    const bounds = route.getBoundingClientRect();
    route.style.setProperty("--mx", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
    route.style.setProperty("--my", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
  }

  /** Returns the route cards and their shared live answer region from authored support content. */
  render(): string {
    const { opener, routes } = supportContent;

    return HTML`
      <div class="support-routes layout-grid-auto-sm layout-grid-tight" role="group" aria-label="${opener.routesLabel}">
        ${routes.map((route) => HTML`
          <button class="support-route" type="button" data-route="${route.id}" aria-expanded="false" aria-controls="support-answer">
            <span class="support-route-icon">${route.icon}</span>
            <span class="support-route-key">${route.label}</span>
            <span class="support-route-sub">${route.sublabel}</span>
            <span class="support-route-chevron" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          </button>
        `).join("")}
      </div>
      <div class="support-answer" id="support-answer" role="region" aria-live="polite">
        <div class="support-answer-inner" id="support-answer-inner"></div>
      </div>
    `;
  }
}
