import { getBlogPostsForIndex } from "@app/configs/blogs.config.ts";
import { getNewsNotes } from "@app/configs/news.config.ts";
import { resolvePagerVariant } from "@app/configs/archive-pagination.config.ts";
import { archivePagePath } from "@app/utils/archive-page.utils.ts";
import { RouterUtils } from "@app/utils/router.utils.ts";
import { openPageFinder } from "./page-finder.ts";
import { bound, summarizePage, type ArchiveEntry, type ArchiveSection, type MountedVisual, type PageSummary, type VisualContext } from "./pager-contract.ts";
import { pagerVisuals } from "./visuals/index.ts";

/** Owns intent, selection and navigation; each visual only paints the temporary gesture surface. */
export class ArchiveSwipe extends HTMLElement {
  private events?: AbortController;
  private entries?: readonly ArchiveEntry[];
  private summaries = new Map<number, PageSummary>();
  private pointer?: { id: number; x: number; y: number; dragging: boolean };
  private session?: { visual: MountedVisual; context: VisualContext };
  private frame = 0;
  private position = 0;
  private depth = 0;
  private suppressClick = false;

  private get current() { return Number(this.dataset.page); }
  private get total() { return Number(this.dataset.total); }
  private get section(): ArchiveSection { return this.dataset.section === "blog" ? "blog" : "news"; }
  private get design() { return pagerVisuals[resolvePagerVariant(this.dataset.variant)]; }
  private get reduced() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  connectedCallback(): void {
    this.events = new AbortController();
    const opts = { signal: this.events.signal };
    this.addEventListener("pointerdown", this.down, opts);
    this.addEventListener("pointermove", this.move, opts);
    this.addEventListener("pointerup", this.up, opts);
    this.addEventListener("pointerleave", event => {
      if (this.pointer?.id === event.pointerId && !this.pointer.dragging) this.pointer = undefined;
    }, opts);
    this.addEventListener("pointercancel", this.cancel, opts);
    this.addEventListener("lostpointercapture", this.cancel, opts);
    this.addEventListener("click", this.tap, opts);
    this.addEventListener("dragstart", e => { if (this.onStrip(e)) e.preventDefault(); }, opts);
  }

  disconnectedCallback(): void {
    this.events?.abort();
    this.pointer = undefined;
    this.clear();
    this.entries = undefined;
    this.summaries.clear();
  }

  private onStrip(event: Event) {
    return event.target instanceof Element && !!event.target.closest(".archive-pager-controls");
  }

  private summary = (page: number): PageSummary => {
    const cached = this.summaries.get(page);
    if (cached) return cached;
    this.entries ??= this.section === "news" ? getNewsNotes() : getBlogPostsForIndex();
    const result = summarizePage(this.entries, page);
    this.summaries.set(page, result);
    return result;
  };

  private navigate = (page: number) => RouterUtils.navigate(archivePagePath(this.section, page));

  private begin(): VisualContext {
    if (this.session) return this.session.context;
    const stage = this.querySelector<HTMLElement>(".pager-stage")!;
    const rect = stage.getBoundingClientRect();
    const slots = Math.min(this.total, window.matchMedia("(max-width: 30rem)").matches ? 3 : this.design.slots);
    const context = { current: this.current, total: this.total, slots, width: rect.width, left: rect.left, summarize: this.summary };
    const surface = document.createElement("div");
    surface.className = "pager-motion";
    surface.setAttribute("aria-hidden", "true");
    stage.append(surface);
    this.session = { context, visual: this.design.mount(surface, context) };
    this.dataset.turning = "";
    return context;
  }

  private paint(position: number, depth: number): void {
    this.position = bound(position, 1, this.total);
    this.depth = depth;
    this.session?.visual.update({ position: this.position, depth: this.reduced ? 0 : depth });
  }

  private down = (e: PointerEvent) => {
    if (!this.onStrip(e) || !e.isPrimary || e.button !== 0 || this.frame) return;
    this.suppressClick = false;
    this.pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, dragging: false };
  };

  private move = (e: PointerEvent) => {
    const p = this.pointer;
    if (!p || p.id !== e.pointerId) return;
    const dx = Math.abs(e.clientX - p.x), dy = Math.abs(e.clientY - p.y);
    if (!p.dragging) {
      if (dy >= 8 && dy >= dx) { this.pointer = undefined; this.suppressClick = true; return; }
      if (dx < 8 || dx <= dy * 1.25) return;
      p.dragging = true;
      this.setPointerCapture(e.pointerId);
    }
    this.paint(this.design.position(this.begin(), p.x, e.clientX), Math.min(1, dx / 30));
  };

  private up = (e: PointerEvent) => {
    const p = this.pointer;
    if (!p || p.id !== e.pointerId) return;
    if (p.dragging) {
      this.move(e);
      this.suppressClick = true;
      this.settle(Math.abs(e.clientX - p.x) < 8 ? this.current : Math.round(this.position));
    }
    this.pointer = undefined;
  };

  private cancel = (e: PointerEvent) => {
    if (e.type === "lostpointercapture" && e.target !== this) return;
    if (this.pointer?.id !== e.pointerId) return;
    this.suppressClick = this.pointer.dragging;
    this.pointer = undefined;
    if (this.session) this.settle(this.current);
  };

  private tap = (e: MouseEvent) => {
    if (!(e.target instanceof Element)) return;
    if (e.target.closest(".pager-bookmark")) {
      this.pointer = undefined;
      this.clear();
      openPageFinder(this, this.current, this.summary, this.navigate, this.events!.signal);
      return;
    }
    if (!this.onStrip(e) || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (this.suppressClick && e.detail) { e.preventDefault(); e.stopPropagation(); return; }
    const link = e.target.closest<HTMLAnchorElement>("a[href]");
    if (!link || this.reduced || e.detail === 0) return;
    e.preventDefault(); e.stopPropagation();
    if (this.frame) return;
    const destination = link.rel === "next" ? this.current + 1 : link.rel === "prev" ? this.current - 1 : Number(link.textContent);
    this.begin();
    this.paint(this.current, 0);
    this.settle(destination, true);
  };

  private settle(page: number, tap = false): void {
    const from = this.position, depth = this.depth, start = performance.now();
    const duration = this.reduced ? 0 : tap ? 320 : 170;
    const tick = (now: number) => {
      const t = duration ? bound((now - start) / duration, 0, 1) : 1;
      this.paint(from + (page - from) * (1 - (1 - t) ** 3), tap ? Math.sin(Math.PI * t) : depth * (1 - t));
      if (t < 1) { this.frame = requestAnimationFrame(tick); return; }
      this.clear();
      if (page !== this.current && this.isConnected) this.navigate(page);
    };
    this.frame = requestAnimationFrame(tick);
  }

  private clear(): void {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.session?.visual.dispose();
    this.session = undefined;
    delete this.dataset.turning;
  }
}
