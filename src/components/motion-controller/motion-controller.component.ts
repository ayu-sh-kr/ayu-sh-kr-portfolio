import { AfterInit, BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

@Component({
  selector: "portfolio-motion-controller",
  shadow: false,
})
export class PortfolioMotionControllerComponent extends BaseElement {
  private ticking = false;
  private frameId: number | null = null;
  private revealObserver: IntersectionObserver | null = null;
  private motionPreference: MediaQueryList | null = null;
  private workRail: HTMLElement | null = null;
  private reducedMotion = false;

  constructor() {
    super();
  }

  @AfterInit()
  afterViewInit(): void {
    this.motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.motionPreference.matches;
    this.motionPreference.addEventListener("change", this.handleMotionPreference);
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    window.addEventListener("resize", this.handleResize);
    this.workRail = document.querySelector<HTMLElement>("#work-rail");
    this.workRail?.addEventListener("focusin", this.handleWorkFocus);
    this.setupReveals();
    this.scheduleRender();
  }

  disconnectedCallback(): void {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);
    this.motionPreference?.removeEventListener("change", this.handleMotionPreference);
    this.workRail?.removeEventListener("focusin", this.handleWorkFocus);
    this.revealObserver?.disconnect();
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
    super.disconnectedCallback();
  }

  private readonly handleScroll = (): void => {
    this.scheduleRender();
  };

  private readonly handleResize = (): void => {
    this.scheduleRender();
  };

  private readonly handleMotionPreference = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
    this.setupReveals();
    this.scheduleRender();
  };

  private readonly handleWorkFocus = (event: FocusEvent): void => {
    if (this.reducedMotion) {
      return;
    }

    const card = (event.target as HTMLElement).closest<HTMLElement>(".work-card");
    const workWrap = document.querySelector<HTMLElement>("#work-wrap");
    if (!card || !workWrap || !this.workRail) {
      return;
    }

    const cards = Array.from(this.workRail.querySelectorAll<HTMLElement>(".work-card"));
    const index = cards.indexOf(card);
    const travel = workWrap.offsetHeight - window.innerHeight;
    const progress = cards.length > 1 ? index / (cards.length - 1) : 0;
    const wrapperTop = window.scrollY + workWrap.getBoundingClientRect().top;

    window.scrollTo({ top: wrapperTop + travel * progress, behavior: "auto" });
  };

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

  private progressOf(wrapper: HTMLElement): number {
    const rect = wrapper.getBoundingClientRect();
    const distance = rect.height - window.innerHeight;
    return distance <= 0 ? 0 : clamp(-rect.top / distance, 0, 1);
  }

  private renderAll(): void {
    const nav = document.querySelector<HTMLElement>("#site-nav");
    const navIsScrolled = window.scrollY > 40;

    if (this.reducedMotion) {
      nav?.classList.toggle("is-scrolled", navIsScrolled);
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

    if (!heroWrap || !heroInner || !journeyWrap || !workWrap || !workStage || !workRail) {
      return;
    }

    // Read every layout value before writing styles to avoid layout thrashing.
    const heroProgress = this.progressOf(heroWrap);
    const journeyProgress = this.progressOf(journeyWrap);
    const workProgress = this.progressOf(workWrap);
    const railDistance = Math.max(0, workRail.scrollWidth - workStage.clientWidth);
    const chapterCount = journeyChapters.length;
    const activeChapter = clamp(Math.floor(journeyProgress * chapterCount), 0, chapterCount - 1);

    nav?.classList.toggle("is-scrolled", navIsScrolled);
    heroInner.style.opacity = String(clamp(1 - heroProgress * 1.4, 0, 1));
    heroInner.style.transform = `scale(${1 - heroProgress * 0.12}) translate3d(0, ${heroProgress * -40}px, 0)`;

    const chapterNumber = String(activeChapter + 1).padStart(2, "0");
    if (journeyGhost) journeyGhost.textContent = chapterNumber;
    if (journeyCurrent) journeyCurrent.textContent = chapterNumber;
    if (journeySpine) journeySpine.style.transform = `scaleX(${journeyProgress})`;

    journeyChapters.forEach((chapter, index) => {
      const localProgress = clamp((journeyProgress - index / chapterCount) * chapterCount, 0, 1);
      const fadeIn = clamp(localProgress / 0.25, 0, 1);
      const fadeOut = index === chapterCount - 1 ? 0 : clamp((localProgress - 0.75) / 0.25, 0, 1);
      const opacity = fadeIn - fadeOut;
      const translateY = (1 - fadeIn) * 32 - fadeOut * 32;

      chapter.style.opacity = String(opacity);
      chapter.style.transform = `translate3d(0, ${translateY}px, 0)`;
      chapter.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
    });

    workRail.style.transform = `translate3d(${-workProgress * railDistance}px, 0, 0)`;
  }

  private setupReveals(): void {
    this.revealObserver?.disconnect();
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

  render(): string {
    return "";
  }
}
