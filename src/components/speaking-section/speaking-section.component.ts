import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { portfolioContent } from "@app/data/portfolio-content.ts";

type CardInteraction = {
  raf: number | null;
  rx: number;
  ry: number;
  scale: number;
  targetRx: number;
  targetRy: number;
  targetScale: number;
  tick: () => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onPointerDown: () => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
};

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

  @OnEvent("connected", true)
  onConnected(): void {
    this.motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.motionPreference.matches;
    this.motionPreference.addEventListener("change", this.handleMotionPreference);
    this.setupCardInteractions();
  }

  @OnEvent("disconnected", true)
  onDisconnected(): void {
    this.motionPreference?.removeEventListener("change", this.handleMotionPreference);
    this.teardownCardInteractions();
    this.motionPreference = null;
  }

  private readonly handleMotionPreference = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
    this.setupCardInteractions();
  };

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

  render(): string {
    const { speaking } = portfolioContent;

    return HTML`
      <section id="speaking" aria-labelledby="speaking-title">
        <div id="sp-head-wrap">
          <div id="sp-head-stage">
            <div id="sp-head-inner">
              <p class="motion-eyebrow mb-5">${speaking.eyebrow}</p>
              <h2 id="speaking-title" class="sp-lead">
                <span class="sp-fill">${speaking.headline.before}</span><span class="sp-fill sp-fill-accent">${speaking.headline.accent}</span>
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

        <div class="speaking-content mx-auto max-w-7xl px-5 pb-28 pt-8 sm:px-8">
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
              <a class="motion-button motion-button-accent" href="${speaking.invite.primaryCta.href}">${speaking.invite.primaryCta.label}</a>
              <a class="motion-button motion-button-ghost" href="${speaking.invite.secondaryCta.href}">${speaking.invite.secondaryCta.label}</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}
