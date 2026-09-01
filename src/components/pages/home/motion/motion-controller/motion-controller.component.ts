import {
  BaseElement,
  Component,
  DocumentListener,
  WindowListener,
} from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";

/** Clamps section progress before it is converted into visual transforms or opacity. */
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/**
 * Coordinates scroll-driven motion and viewport reveals across the home page.
 *
 * After connection, the controller observes reduced-motion changes, watches the
 * reveal elements, and schedules one animation-frame render for scroll/resize
 * updates. It also maps focused work cards to their horizontal scroll position.
 * Disconnect cleanup removes observers and cancels pending frames. The component
 * renders no markup; it operates on the sections already composed by the page.
 *
 * Selector: `portfolio-motion-controller`.
 */
@Component({
  selector: "portfolio-motion-controller",
  shadow: false,
})
export class PortfolioMotionControllerComponent extends BaseElement {
  private ticking = false;
  private frameId: number | null = null;
  private revealObserver: IntersectionObserver | null = null;
  private motionPreference: MediaQueryList | null = null;
  private reducedMotion = false;

  constructor() {
    super();
  }

  /**
   * Initializes motion preference tracking, reveal observation, and the first render
   * after the page sections have been inserted by the home-page shell.
   */
  @OnEvent("connected", true)
  initializeMotion(): void {
    this.motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.motionPreference.matches;
    this.motionPreference.addEventListener("change", this.updateMotionPreference);
    this.setupReveals();
    this.scheduleRender();
  }

  /**
   * Stops external motion work so a disconnected page cannot keep mutating the DOM.
   * The internal frame state is reset so a later reconnect can schedule normally.
   */
  @OnEvent("disconnected", true)
  cleanupMotion(): void {
    this.motionPreference?.removeEventListener("change", this.updateMotionPreference);
    this.motionPreference = null;
    this.revealObserver?.disconnect();
    this.revealObserver = null;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
    this.frameId = null;
    this.ticking = false;
  }

  /** Requests the next animation-frame render for scroll and viewport changes. */
  @WindowListener({ event: ["scroll", "resize"] })
  private scheduleRender(): void {
    if (this.ticking) {
      return;
    }

    this.ticking = true;
    this.frameId = requestAnimationFrame(() => {
      this.renderAll();
      this.ticking = false;
      this.frameId = null;
    });
  }

  /** Rebuilds reveal behavior when the user's reduced-motion preference changes. */
  private readonly updateMotionPreference = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
    this.setupReveals();
    this.scheduleRender();
  };

  /**
   * Scrolls a focused work card into the matching horizontal position so keyboard
   * users can follow the same project sequence as pointer users.
   */
  @DocumentListener({ event: "focusin" })
  private scrollToFocusedWorkCard(event: FocusEvent): void {
    if (this.reducedMotion) {
      return;
    }

    const card = (event.target as HTMLElement | null)?.closest<HTMLElement>(".work-card");
    const workWrap = document.querySelector<HTMLElement>("#work-wrap");
    const workRail = document.querySelector<HTMLElement>("#work-rail");
    if (!card || !workWrap || !workRail) {
      return;
    }

    const cards = Array.from(workRail.querySelectorAll<HTMLElement>(".work-card"));
    const index = cards.indexOf(card);
    if (index < 0) {
      return;
    }

    const travel = workWrap.offsetHeight - window.innerHeight;
    const progress = cards.length > 1 ? index / (cards.length - 1) : 0;
    const wrapperTop = window.scrollY + workWrap.getBoundingClientRect().top;

    window.scrollTo({ top: wrapperTop + travel * progress, behavior: "auto" });
  }

  /** Converts a wrapper's viewport position into clamped scroll progress. */
  private progressOf(wrapper: HTMLElement): number {
    const rect = wrapper.getBoundingClientRect();
    const distance = rect.height - window.innerHeight;
    return distance <= 0 ? 0 : clamp(-rect.top / distance, 0, 1);
  }

  /**
   * Reads the current section geometry and applies all scroll-driven transforms.
   * Layout reads are grouped before style writes to keep one animation frame from
   * forcing repeated layout recalculation.
   */
  private renderAll(): void {
    if (this.reducedMotion) {
      return;
    }

    const heroWrap = document.querySelector<HTMLElement>("#hero-wrap");
    const heroInner = document.querySelector<HTMLElement>("#hero-inner");
    const journeyWrap = document.querySelector<HTMLElement>("#journey-wrap");
    const journeyChapters = Array.from(document.querySelectorAll<HTMLElement>(".journey-chapter"));
    const journeyGhost = document.querySelector<HTMLElement>("#journey-ghost");
    const journeyCurrent = document.querySelector<HTMLElement>("#journey-current");
    const journeySpine = document.querySelector<HTMLElement>("#journey-spine-fill");
    const workWrap = document.querySelector<HTMLElement>("#work-wrap");
    const workStage = document.querySelector<HTMLElement>("#work-stage");
    const workRail = document.querySelector<HTMLElement>("#work-rail");
    const speakingHeadWrap = document.querySelector<HTMLElement>("#sp-head-wrap");
    const speakingHeadInner = document.querySelector<HTMLElement>("#sp-head-inner");
    const speakingLead = document.querySelector<HTMLElement>("#speaking-title");
    const speakingFills = Array.from(document.querySelectorAll<HTMLElement>("#speaking-title .sp-fill"));

    if (
      !heroWrap ||
      !heroInner ||
      !journeyWrap ||
      !workWrap ||
      !workStage ||
      !workRail ||
      !speakingHeadWrap ||
      !speakingHeadInner ||
      !speakingLead
    ) {
      return;
    }

    // Read every layout value before writing styles to avoid layout thrashing.
    const heroProgress = this.progressOf(heroWrap);
    const journeyProgress = this.progressOf(journeyWrap);
    const workProgress = this.progressOf(workWrap);
    const speakingProgress = this.progressOf(speakingHeadWrap);
    const railDistance = Math.max(0, workRail.scrollWidth - workStage.clientWidth);
    const chapterCount = journeyChapters.length;
    const activeChapter = clamp(Math.floor(journeyProgress * chapterCount), 0, chapterCount - 1);

    heroInner.style.opacity = String(clamp(1 - heroProgress * 1.4, 0, 1));
    heroInner.style.transform = `scale(${1 - heroProgress * 0.12}) translate3d(0, ${heroProgress * -40}px, 0)`;
    heroWrap.querySelector<HTMLElement>("scroll-hint")?.setAttribute("progress", String(heroProgress));

    const chapterNumber = String(activeChapter + 1).padStart(2, "0");
    if (journeyGhost) journeyGhost.textContent = chapterNumber;
    if (journeyCurrent) journeyCurrent.textContent = chapterNumber;
    if (journeySpine) journeySpine.style.transform = `scaleX(${journeyProgress})`;

    journeyChapters.forEach((chapter, index) => {
      const localProgress = clamp((journeyProgress - index / chapterCount) * chapterCount, 0, 1);
      const fadeIn = clamp(localProgress / 0.18, 0, 1);
      const fadeOut = index === chapterCount - 1 ? 0 : clamp((localProgress - 0.82) / 0.18, 0, 1);
      const opacity = fadeIn - fadeOut;
      const translateY = (1 - fadeIn) * 32 - fadeOut * 32;

      chapter.style.opacity = String(opacity);
      chapter.style.transform = `translate3d(0, ${translateY}px, 0)`;
      chapter.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
    });

    workRail.style.transform = `translate3d(${-workProgress * railDistance}px, 0, 0)`;

    const speakingFillProgress = clamp(speakingProgress / 0.8, 0, 1) * 100;
    const speakingScale = 0.82 + clamp(speakingProgress / 0.8, 0, 1) * 0.18;
    speakingFills.forEach((fill) => fill.style.setProperty("--fill-progress", `${speakingFillProgress}%`));
    speakingLead.style.transform = `scale(${speakingScale})`;
    speakingHeadInner.classList.toggle("lit", speakingProgress > 0.06);
  }

  /**
   * Rebuilds the intersection observer for current `.motion-reveal` elements.
   * Reduced-motion users receive the final visible state immediately instead of
   * waiting for observer callbacks.
   */
  private setupReveals(): void {
    this.revealObserver?.disconnect();
    this.revealObserver = null;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".motion-reveal"));

    if (this.reducedMotion) {
      reveals.forEach((element) => element.classList.add("is-in"));
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const element = entry.target as HTMLElement;
          const siblings = element.parentElement
            ? Array.from(element.parentElement.querySelectorAll<HTMLElement>(".motion-reveal"))
            : [];
          element.style.transitionDelay = `${Math.max(0, siblings.indexOf(element)) * 60}ms`;
          element.classList.add("is-in");
          this.revealObserver?.unobserve(element);
        });
      },
      { threshold: 0.15 },
    );

    reveals.forEach((element) => this.revealObserver?.observe(element));
  }

  /**
   * Leaves the host empty because this controller coordinates markup rendered by
   * the home-page sections rather than owning a visual subtree of its own.
   */
  render(): string {
    return "";
  }
}
