/**
 * Shares one-shot, reduced-motion-aware reveals across the static coffee sections.
 *
 * Each coffee section provides its own `[data-coffee-reveal]` targets, while this
 * utility owns their observer and motion-preference lifecycle. That keeps the
 * static components focused on content rather than duplicating observer cleanup.
 */
export class CoffeeRevealLifecycle {
  private motionPreference: MediaQueryList | null = null;
  private revealObserver: IntersectionObserver | null = null;
  private reducedMotion = false;

  /** Creates a reveal lifecycle scoped to one rendered section host. */
  constructor(private readonly host: HTMLElement) {}

  /** Starts observing the host's targets or reveals them immediately when motion is reduced. */
  connect(): void {
    this.motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.motionPreference.matches;
    this.motionPreference.addEventListener("change", this.updateMotionPreference);
    this.refresh();
  }

  /** Rebuilds observation after a re-render inserts new reveal targets. */
  refresh(): void {
    this.revealObserver?.disconnect();
    const targets = Array.from(this.host.querySelectorAll<HTMLElement>("[data-coffee-reveal]"));
    if (this.reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-revealed"));
      return;
    }

    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const target = entry.target as HTMLElement;
        const siblings = Array.from(target.parentElement?.querySelectorAll<HTMLElement>("[data-coffee-reveal]") ?? []);
        target.style.setProperty("--coffee-reveal-delay", `${Math.max(0, siblings.indexOf(target)) * 55}ms`);
        target.classList.add("is-revealed");
        this.revealObserver?.unobserve(target);
      });
    }, { threshold: 0.12 });
    targets.forEach((target) => this.revealObserver?.observe(target));
  }

  /** Removes the observer and motion listener held for the disconnected route. */
  disconnect(): void {
    this.motionPreference?.removeEventListener("change", this.updateMotionPreference);
    this.revealObserver?.disconnect();
    this.motionPreference = null;
    this.revealObserver = null;
  }

  /** Applies a changed operating-system preference to the current target set. */
  private readonly updateMotionPreference = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
    this.refresh();
  };
}
