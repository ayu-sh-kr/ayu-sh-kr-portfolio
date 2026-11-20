/** Enhances the static archive links with a reversible, displacement-driven page turn. */
export class ArchiveSwipe extends HTMLElement {
  private pointer?: {id: number; x: number; y: number; dragging: boolean};
  private overlay?: HTMLElement;
  private target?: HTMLAnchorElement;
  private progress = 0;
  private frame = 0;
  private suppressClick = false;
  private followingLink = false;
  private events?: AbortController;

  connectedCallback(): void {
    this.events = new AbortController();
    const options = {signal: this.events.signal};
    this.addEventListener("pointerdown", this.down, options);
    this.addEventListener("pointermove", this.move, options);
    this.addEventListener("pointerup", this.up, options);
    this.addEventListener("pointercancel", this.cancel, options);
    this.addEventListener("lostpointercapture", this.cancel, options);
    this.addEventListener("click", this.tap, options);
    this.addEventListener("dragstart", event => event.preventDefault(), options);
  }

  disconnectedCallback(): void {
    this.events?.abort();
    this.pointer = undefined;
    this.clear();
  }

  /** Delay capture until horizontal intent is clear, so normal taps and vertical scrolling stay native. */
  private down = (event: PointerEvent): void => {
    if (!event.isPrimary || event.button !== 0 || this.frame) return;
    this.suppressClick = false;
    this.pointer = {id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false};
  };

  private move = (event: PointerEvent): void => {
    const start = this.pointer;
    if (!start || event.pointerId !== start.id) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.dragging) {
      if (Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) {
        this.suppressClick = true;
        this.pointer = undefined;
        return;
      }
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy) * 1.25) return;
      start.dragging = true;
      this.setPointerCapture(event.pointerId);
    }
    const link = this.querySelector<HTMLAnchorElement>(dx < 0 ? 'a[rel="next"]' : 'a[rel="prev"]');
    if (!link) {
      this.clear();
      return;
    }
    this.prepare(link);
    this.paint(Math.min(1, Math.abs(dx) / 104));
  };

  /** Commit after half a turn. Reversing before release unwinds the exact same animation. */
  private up = (event: PointerEvent): void => {
    if (this.pointer?.id !== event.pointerId) return;
    if (this.pointer.dragging) {
      this.move(event);
      this.suppressClick = true;
      this.settle(this.progress >= .5);
    }
    this.pointer = undefined;
  };

  private cancel = (event: PointerEvent): void => {
    // Touch browsers implicitly capture the initial link. Its capture loss bubbles here
    // as capture transfers to the strip after horizontal intent has been established.
    if (event.type === "lostpointercapture" && event.target !== this) return;
    if (this.pointer?.id !== event.pointerId) return;
    this.suppressClick = this.pointer.dragging;
    this.pointer = undefined;
    this.settle(false);
  };

  /** Preserve modified clicks, new tabs and keyboard activation of the original links. */
  private tap = (event: MouseEvent): void => {
    if (this.followingLink || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!link && !this.suppressClick) return;
    if (link && !this.frame && !(this.suppressClick && event.detail) &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();
    event.stopPropagation();
    if (!link || this.frame || (this.suppressClick && event.detail)) return;
    this.prepare(link);
    this.settle(true);
  };

  /** Faces are visual copies. The real links underneath keep their tab order and accessible names. */
  private prepare(link: HTMLAnchorElement): void {
    if (link === this.target) return;
    this.clear();
    const stage = this.querySelector<HTMLElement>(".pager-stage")!;
    const current = Number(this.dataset.page);
    const total = Number(this.dataset.total);
    const target = link.rel === "next" ? current + 1 : link.rel === "prev" ? current - 1 : Number(link.textContent);
    const overlay = document.createElement("div");
    overlay.className = "pager-motion";
    overlay.setAttribute("aria-hidden", "true");
    for (const page of [current, target]) {
      const face = document.createElement("div");
      face.className = "pager-face";
      const start = Math.max(1, Math.min(page - 1, total - 2));
      for (let value = start; value < start + Math.min(total, 3); value++) {
        const label = document.createElement("span");
        label.className = "archive-key";
        if (value === page) label.classList.add("pager-selected");
        label.textContent = String(value);
        face.append(label);
      }
      overlay.append(face);
    }
    overlay.style.setProperty("--radius", `${stage.getBoundingClientRect().width / 2}px`);
    overlay.dataset.direction = target > current ? "1" : "-1";
    stage.append(overlay);
    this.overlay = overlay;
    this.target = link;
    this.dataset.turning = "";
    this.paint(0);
  }

  private paint(progress: number): void {
    this.progress = progress;
    const style = this.overlay?.style;
    if (!style) return;
    const direction = Number(this.overlay!.dataset.direction);
    style.setProperty("--out-angle", `${-direction * 90 * progress}deg`);
    style.setProperty("--in-angle", `${direction * 90 * (1 - progress)}deg`);
    style.setProperty("--p", String(progress));
    style.setProperty("--lift", String(Math.sin(Math.PI * progress)));
  }

  /** Settle from the release position, then follow the original link once. */
  private settle(commit: boolean): void {
    const link = this.target;
    if (!link) return;
    const from = this.progress;
    const to = commit ? 1 : 0;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 115 + 200 * Math.abs(to - from);
    const start = performance.now();
    const tick = (now: number) => {
      const t = duration ? Math.min(1, (now - start) / duration) : 1;
      this.paint(from + (to - from) * (1 - (1 - t) ** 3));
      if (t < 1) {
        this.frame = requestAnimationFrame(tick);
        return;
      }
      this.clear();
      if (commit && link.isConnected) {
        this.followingLink = true;
        try { link.click(); } finally { this.followingLink = false; }
      }
    };
    this.frame = requestAnimationFrame(tick);
  }

  private clear(): void {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.progress = 0;
    this.overlay?.remove();
    this.overlay = undefined;
    this.target = undefined;
    delete this.dataset.turning;
  }
}
