import {
  BaseElement,
  Component,
  HostListener,
  HTML,
} from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";

/** Makes every approved motion verb inspectable in its own bounded stage. */
@Component({ selector: "design-interaction-verbs", shadow: false })
export class DesignInteractionVerbsComponent extends BaseElement {
  /** Timers that remove a play class after each one-shot stage animation completes. */
  private replayTimers: number[] = [];

  /** Creates the verb catalog before a visitor plays an individual specimen. */
  constructor() {
    super();
  }

  /** Clears delayed play-class cleanup when navigation removes the section. */
  @OnEvent("disconnected", true)
  clearReplayTimers(): void {
    this.replayTimers.forEach((timer) => window.clearTimeout(timer));
    this.replayTimers = [];
  }

  /** Plays a selected verb once unless the system or review mode asks for its designed still state. */
  @HostListener({ event: "click" })
  playVerb(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-verb]",
    );
    if (
      !button ||
      document.documentElement.hasAttribute("data-interaction-review") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    button.classList.remove("play");
    window.requestAnimationFrame(() => button.classList.add("play"));
    this.replayTimers.push(
      window.setTimeout(() => button.classList.remove("play"), 720),
    );
  }

  /** Renders the complete approved verb catalog from the route's authored source. */
  render(): string {
    const { verbReference, verbs } = designInteractionContent;

    return HTML`
      <section id="verbs" class="design-interaction-section layout-page layout-section" aria-labelledby="verbs-title">
          <header class="design-interaction-heading layout-stack layout-stack-sm">
            <p class="type-eyebrow">${verbReference.eyebrow}</p>
            <h2 id="verbs-title" class="type-section">${verbReference.title}</h2>
            <p class="type-lede">${verbReference.lede}</p>
          </header>
          <div class="design-interaction-verbs layout-grid-auto-sm">${verbs
            .map(
              (
                verb,
              ) => HTML`<button type="button" class="design-interaction-verb" data-verb="${verb.name}">
              <span class="design-interaction-verb-stage">
                <i>
                </i>
              </span>
              <span>
                <strong>${verb.name}</strong>
                <em>${verb.value}</em>
              </span>
              <small>${verb.description}</small>
            </button>`,
            )
            .join("")}</div>
        </section>`;
  }
}
