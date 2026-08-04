import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { portfolioContent } from "@app/data/portfolio-content.ts";

/**
 * Mutable spring state and stable pointer handlers for one tilt-enabled topic card.
 *
 * The speaking section stores one instance per card so each card can animate and
 * clean up independently when motion preferences or the component lifecycle change.
 */
type CardInteraction = {
  /** Pending animation frame used to settle the card toward its target transform. */
  raf: number | null;
  /** Current horizontal rotation in degrees. */
  rx: number;
  /** Current vertical rotation in degrees. */
  ry: number;
  /** Current scale applied while the pointer is over or pressing the card. */
  scale: number;
  /** Target horizontal rotation calculated from the pointer position. */
  targetRx: number;
  /** Target vertical rotation calculated from the pointer position. */
  targetRy: number;
  /** Target scale reached by the spring animation. */
  targetScale: number;
  /** Advances the spring and schedules another frame until the card settles. */
  tick: () => void;
  /** Updates pointer-relative CSS variables and rotation targets. */
  onPointerMove: (event: PointerEvent) => void;
  /** Raises the card slightly when the pointer enters it. */
  onPointerEnter: () => void;
  /** Returns the card to its resting transform when the pointer leaves. */
  onPointerLeave: () => void;
  /** Compresses the card while it is pressed. */
  onPointerDown: () => void;
  /** Releases the pressed state and restores the hover scale. */
  onPointerUp: () => void;
  /** Clears the pressed state and returns the card to its resting transform. */
  onPointerCancel: () => void;
};

/**
 * Renders the speaking section and adds pointer tilt to its topic cards.
 *
 * Used on the home page. When connected, it watches the user's reduced-motion
 * preference and attaches stable pointer handlers to `.topic[data-tilt]` cards.
 * A preference change rebuilds those interactions; disconnecting removes the
 * media-query listener, pointer listeners, and pending animation frames.
 *
 * Selector: `portfolio-speaking`.
 */
@Component({
  selector: "portfolio-speaking",
  shadow: false,
})
export class PortfolioSpeakingComponent extends BaseElement {
  private readonly cardInteractions = new Map<HTMLElement, CardInteraction>();
  private motionPreference: MediaQueryList | null = null;
  private reducedMotion = false;

  constructor() {
    super();
  }

  /**
   * Captures the current motion preference and attaches the change listener
   * before creating the topic-card interactions after initial render.
   */
  @OnEvent("connected", true)
  initializeInteractions(): void {
    this.motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.motionPreference.matches;
    this.motionPreference.addEventListener("change", this.updateMotionPreference);
    this.setupCardInteractions();
  }

  /**
   * Removes the media-query and card listeners and cancels any active card
   * springs so a disconnected section leaves no external work behind.
   */
  @OnEvent("disconnected", true)
  cleanupInteractions(): void {
    this.motionPreference?.removeEventListener("change", this.updateMotionPreference);
    this.teardownCardInteractions();
    this.motionPreference = null;
  }

  /**
   * Applies a changed reduced-motion preference and rebuilds card listeners so
   * the section immediately switches between interactive and static behavior.
   */
  private readonly updateMotionPreference = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
    this.setupCardInteractions();
  };

  /**
   * Replaces the current card handlers with tilt interactions for every topic card.
   * Reduced-motion users keep the cards static, so no pointer listeners or frames
   * are created in that mode.
   */
  private setupCardInteractions(): void {
    this.teardownCardInteractions();

    if (this.reducedMotion) {
      return;
    }

    this.querySelectorAll<HTMLElement>(".topic[data-tilt]").forEach((card) => {
      const state: CardInteraction = {
        raf: null,
        rx: 0,
        ry: 0,
        scale: 1,
        targetRx: 0,
        targetRy: 0,
        targetScale: 1,
        tick: () => undefined,
        onPointerMove: () => undefined,
        onPointerEnter: () => undefined,
        onPointerLeave: () => undefined,
        onPointerDown: () => undefined,
        onPointerUp: () => undefined,
        onPointerCancel: () => undefined,
      };

      state.tick = (): void => {
        state.rx += (state.targetRx - state.rx) * 0.12;
        state.ry += (state.targetRy - state.ry) * 0.12;
        state.scale += (state.targetScale - state.scale) * 0.12;
        card.style.transform = `perspective(800px) rotateX(${state.ry}deg) rotateY(${state.rx}deg) translateY(${(state.scale - 1) * -24}px) scale(${state.scale})`;

        const settled =
          Math.abs(state.targetRx - state.rx) < 0.01 &&
          Math.abs(state.targetRy - state.ry) < 0.01 &&
          Math.abs(state.targetScale - state.scale) < 0.001;
        state.raf = settled ? null : requestAnimationFrame(state.tick);
      };

      const spring = (): void => {
        if (state.raf === null) {
          state.raf = requestAnimationFrame(state.tick);
        }
      };

      state.onPointerMove = (event: PointerEvent): void => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);
        state.targetRx = (x - 0.5) * 10;
        state.targetRy = -(y - 0.5) * 10;
        spring();
      };
      state.onPointerEnter = (): void => {
        state.targetScale = 1.02;
        spring();
      };
      state.onPointerLeave = (): void => {
        state.targetRx = 0;
        state.targetRy = 0;
        state.targetScale = 1;
        spring();
      };
      state.onPointerDown = (): void => {
        state.targetScale = 0.97;
        card.classList.add("pressed");
        spring();
      };
      state.onPointerUp = (): void => {
        state.targetScale = 1.02;
        card.classList.remove("pressed");
        spring();
      };
      state.onPointerCancel = (): void => {
        card.classList.remove("pressed");
        state.onPointerLeave();
      };

      card.addEventListener("pointermove", state.onPointerMove);
      card.addEventListener("pointerenter", state.onPointerEnter);
      card.addEventListener("pointerleave", state.onPointerLeave);
      card.addEventListener("pointerdown", state.onPointerDown);
      card.addEventListener("pointerup", state.onPointerUp);
      card.addEventListener("pointercancel", state.onPointerCancel);
      this.cardInteractions.set(card, state);
    });
  }

  /**
   * Removes every pointer handler and pending spring frame created by setup.
   * Called before rebuilding interactions and during disconnect so reconnects do
   * not accumulate listeners or leave transformed cards behind.
   */
  private teardownCardInteractions(): void {
    this.cardInteractions.forEach((state, card) => {
      card.removeEventListener("pointermove", state.onPointerMove);
      card.removeEventListener("pointerenter", state.onPointerEnter);
      card.removeEventListener("pointerleave", state.onPointerLeave);
      card.removeEventListener("pointerdown", state.onPointerDown);
      card.removeEventListener("pointerup", state.onPointerUp);
      card.removeEventListener("pointercancel", state.onPointerCancel);
      card.classList.remove("pressed");
      if (state.raf !== null) {
        cancelAnimationFrame(state.raf);
      }
      card.style.transform = "";
    });
    this.cardInteractions.clear();
  }

  /**
   * Returns the speaking content and topic cards from authored portfolio data.
   * Interaction setup runs after this markup has been inserted during connection.
   */
  render(): string {
    const { speaking } = portfolioContent;

    return HTML`
      <section id="speaking" class="layout-section" aria-labelledby="speaking-title">
        <div id="sp-head-wrap">
          <div id="sp-head-stage">
            <div id="sp-head-inner">
              <p class="motion-eyebrow mb-5">${speaking.eyebrow}</p>
              <h2 id="speaking-title" class="sp-lead">
                <span class="sp-fill">${speaking.headline.before}${speaking.headline.accent}</span>
              </h2>
              <p class="sp-sub">${speaking.summary}</p>
              <p class="sp-proof">
                ${speaking.proof
                  .map((item) => item.prefix
                    ? `<span>${item.prefix}<b>${item.value}</b>${item.label}</span>`
                    : `<span><b>${item.value}</b> ${item.label}</span>`)
                  .join('<span class="sp-proof-separator">/</span>')}
              </p>
            </div>
          </div>
        </div>

        <div class="speaking-content layout-page">
          <div class="sp-topics">
            ${speaking.topics
              .map(
                (topic) => `
                  <a class="topic motion-reveal" href="#contact" data-tilt>
                    <span class="topic-number">${topic.number}</span>
                    <h3>${topic.title}</h3>
                    <p class="text-sm leading-6 text-(--muted-color)">${topic.body}</p>
                    <div class="mt-1 flex flex-wrap gap-2">
                      ${topic.chips.map((chip) => `<span class="motion-chip">${chip}</span>`).join("")}
                    </div>
                    <span class="topic-arrow">Book this talk <span aria-hidden="true">→</span></span>
                  </a>
                `,
              )
              .join("")}
          </div>

          <div class="sp-invite motion-reveal">
            <p class="motion-eyebrow mb-3">${speaking.invite.eyebrow}</p>
            <h3 class="motion-title sp-invite-title">${speaking.invite.title}</h3>
            <p class="mx-auto mt-4 max-w-xl leading-7 text-(--muted-color)">${speaking.invite.body}</p>
            <div class="mt-8 flex flex-wrap justify-center gap-3">
              <a class="app-link app-link--button app-link--accent" href="${speaking.invite.primaryCta.href}">${speaking.invite.primaryCta.label}</a>
              <a class="app-link app-link--button app-link--ghost" href="${speaking.invite.secondaryCta.href}">${speaking.invite.secondaryCta.label}</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}
