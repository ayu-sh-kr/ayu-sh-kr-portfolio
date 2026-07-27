/**
 * Owns the shared intersection and reduced-motion behavior for blog reveal targets.
 *
 * The highlighted card and post list both render `[data-blog-reveal]` elements.
 * Keeping the observer here gives those components the same accessibility behavior
 * without making either component know how the other one is rendered.
 */
export class BlogRevealLifecycle {
  private motionPreference: MediaQueryList | null = null;
  private revealObserver: IntersectionObserver | null = null;
  private reducedMotion = false;

  constructor(private readonly host: HTMLElement) {}

  /** Starts motion tracking and reveals the targets already rendered by the host. */
  connect(): void {
    this.motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.motionPreference.matches;
    this.motionPreference.addEventListener("change", this.updateMotionPreference);
    this.refresh();
  }

  /** Rebuilds observation for targets inserted after an event-driven re-render. */
  refresh(): void {
    this.revealObserver?.disconnect();
    const reveals = Array.from(this.host.querySelectorAll<HTMLElement>("[data-blog-reveal]"));
    if (this.reducedMotion || !("IntersectionObserver" in window)) {
      reveals.forEach((element) => element.classList.add("is-revealed"));
      return;
    }

    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const element = entry.target as HTMLElement;
        const siblings = Array.from(element.parentElement?.querySelectorAll<HTMLElement>("[data-blog-reveal]") ?? []);
        element.style.setProperty("--blog-reveal-delay", `${Math.max(0, siblings.indexOf(element)) * 60}ms`);
        element.classList.add("is-revealed");
        this.revealObserver?.unobserve(element);
      });
    }, {threshold: 0.12});
    reveals.forEach((element) => this.revealObserver?.observe(element));
  }

  /** Removes the media listener, observer, and any references held for the host. */
  disconnect(): void {
    this.motionPreference?.removeEventListener("change", this.updateMotionPreference);
    this.revealObserver?.disconnect();
    this.motionPreference = null;
    this.revealObserver = null;
  }

  /** Rebuilds reveals after the operating system motion preference changes. */
  private readonly updateMotionPreference = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
    this.refresh();
  };
}
