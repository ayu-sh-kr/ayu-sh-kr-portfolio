import {AfterInit, BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
import {type ApplicationEvent, OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {formatBlogDate, labelForCategory, type BlogCategory, type BlogPost} from "@app/configs/blogs.config.ts";
import {BLOG_INDEX_DATA_EVENT} from "@app/events/blog.events.ts";

const filters: Array<{value: BlogCategory | "all"; label: string; hash: string}> = [
  {value: "all", label: "All", hash: "all"},
  {value: "tutorial", label: "Tutorials", hash: "tutorials"},
  {value: "rant", label: "Rants", hash: "rants"},
  {value: "news", label: "News", hash: "news"},
  {value: "notes", label: "Notes", hash: "notes"},
];

const escapeHtml = (value: string): string =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });

const categoryFromHash = (): BlogCategory | "all" => {
  let value = window.location.hash.replace(/^#\/?/, "");
  try {
    value = decodeURIComponent(value);
  } catch {
    return "all";
  }
  return filters.find((filter) => filter.hash === value || filter.value === value)?.value ?? "all";
};

const renderFilters = (currentFilter: BlogCategory | "all"): string =>
  filters.map((filter) => `
    <button class="blog-pill${currentFilter === filter.value ? " is-active" : ""}" type="button"
            data-blog-filter="${filter.value}" aria-pressed="${currentFilter === filter.value}">
      ${filter.label}
    </button>
  `).join("");

const renderPostRow = (post: BlogPost): string => `
  <a class="blog-row blog-reveal" data-blog-reveal data-blog-row data-blog-category="${post.category}"
     href="/blog/${post.slug}">
    <time class="blog-row-date" datetime="${post.date}">${formatBlogDate(post.date, true)}</time>
    <span class="blog-row-copy">
      <span class="blog-row-title">${escapeHtml(post.header)}</span>
      <span class="blog-row-description">${escapeHtml(post.description)}</span>
    </span>
    <span class="blog-chip">${labelForCategory(post.category)}</span>
    <span class="blog-arrow" aria-hidden="true">→</span>
  </a>
`;

@Component({
  selector: "blog-index",
  shadow: false,
})
export class BlogIndexComponent extends BaseElement {
  private posts: readonly BlogPost[] = [];
  private revealObserver: IntersectionObserver | null = null;
  private motionPreference: MediaQueryList | null = null;
  private frameId: number | null = null;
  private reducedMotion = false;
  private currentFilter: BlogCategory | "all" = categoryFromHash();

  constructor() {
    super();
  }

  @AfterInit()
  afterViewInit(): void {
    this.motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.motionPreference.matches;
    this.motionPreference.addEventListener("change", this.handleMotionPreference);
    window.addEventListener("hashchange", this.handleHashChange);
    window.addEventListener("scroll", this.scheduleScrollRender, {passive: true});
    this.addEventListener("click", this.handleClick);
  }

  disconnectedCallback(): void {
    this.motionPreference?.removeEventListener("change", this.handleMotionPreference);
    window.removeEventListener("hashchange", this.handleHashChange);
    window.removeEventListener("scroll", this.scheduleScrollRender);
    this.removeEventListener("click", this.handleClick);
    this.revealObserver?.disconnect();
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
    super.disconnectedCallback();
  }

  @OnEvent(BLOG_INDEX_DATA_EVENT)
  onBlogData(event: ApplicationEvent<typeof BLOG_INDEX_DATA_EVENT>): void {
    this.posts = event.data.posts;
    this.updateHTML();
    this.applyFilter(this.currentFilter, false);
    this.setupReveals();
    this.scheduleScrollRender();
  }

  private readonly handleMotionPreference = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
    this.setupReveals();
    this.scheduleScrollRender();
  };

  private readonly handleHashChange = (): void => {
    this.currentFilter = categoryFromHash();
    this.applyFilter(this.currentFilter, false);
  };

  private readonly handleClick = (event: Event): void => {
    const filter = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("[data-blog-filter]");
    if (!filter) {
      return;
    }

    event.preventDefault();
    this.currentFilter = filter.dataset.blogFilter as BlogCategory | "all";
    const filterHash = filters.find((item) => item.value === this.currentFilter)?.hash ?? "all";
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/${filterHash}`);
    this.applyFilter(this.currentFilter, true);
  };

  private applyFilter(filter: BlogCategory | "all", animate: boolean): void {
    const rows = Array.from(this.querySelectorAll<HTMLElement>("[data-blog-row]"));
    const visibleRows = rows.filter((row) => filter === "all" || row.dataset.blogCategory === filter);
    const count = this.querySelector<HTMLElement>("[data-blog-count]");
    const empty = this.querySelector<HTMLElement>("[data-blog-empty]");
    const featured = this.querySelector<HTMLElement>("[data-blog-featured]");
    const featuredVisible = Boolean(featured && (filter === "all" || featured.dataset.blogCategory === filter));

    this.querySelectorAll<HTMLElement>("[data-blog-filter]").forEach((button) => {
      const isActive = button.dataset.blogFilter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    rows.forEach((row) => {
      const isVisible = visibleRows.includes(row);
      row.classList.toggle("is-filtered-out", !isVisible);
      row.setAttribute("aria-hidden", String(!isVisible));
      isVisible ? row.removeAttribute("tabindex") : row.setAttribute("tabindex", "-1");
    });

    if (featured) {
      featured.hidden = !featuredVisible;
    }
    if (count) {
      const totalVisible = visibleRows.length + (featuredVisible ? 1 : 0);
      count.textContent = `${totalVisible} ${totalVisible === 1 ? "post" : "posts"}`;
    }
    if (empty) {
      empty.hidden = visibleRows.length > 0 || featuredVisible;
      const category = empty.querySelector("[data-empty-category]");
      if (category) {
        category.textContent = filter === "all" ? "these" : `${filter} posts`;
      }
    }

    if (animate && !this.reducedMotion) {
      visibleRows.forEach((row, index) => {
        row.style.setProperty("--blog-row-delay", `${index * 60}ms`);
        row.classList.remove("is-filter-in");
        requestAnimationFrame(() => row.classList.add("is-filter-in"));
      });
    }
  }

  private readonly scheduleScrollRender = (): void => {
    if (this.frameId !== null) {
      return;
    }
    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      const progressBar = this.querySelector<HTMLElement>("[data-blog-progress]");
      const heroWrap = this.querySelector<HTMLElement>("[data-blog-hero-wrap]");
      const heroInner = this.querySelector<HTMLElement>("[data-blog-hero-inner]");
      if (progressBar) {
        progressBar.style.transform = "scaleX(0)";
      }
      if (!heroWrap || !heroInner || this.reducedMotion) {
        return;
      }
      const travel = Math.max(1, heroWrap.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -heroWrap.getBoundingClientRect().top / travel));
      heroInner.style.opacity = String(Math.max(0, 1 - progress * 1.4));
      heroInner.style.transform = `translate3d(0, ${progress * -40}px, 0) scale(${1 - progress * 0.1})`;
    });
  };

  private setupReveals(): void {
    this.revealObserver?.disconnect();
    const reveals = Array.from(this.querySelectorAll<HTMLElement>("[data-blog-reveal]"));
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

  render(): string {
    if (!this.posts.length) {
      return `<main class="blog-index blog-container"><p class="blog-loading">Loading posts…</p></main>`;
    }

    const featured = this.posts.find((post) => post.featured) ?? this.posts[0];
    const rows = this.posts.filter((post) => post.slug !== featured.slug);
    const visibleCount = this.posts.filter((post) => this.currentFilter === "all" || post.category === this.currentFilter).length;

    return `
      <div class="blog-progress" data-blog-progress aria-hidden="true"></div>
      <main class="blog-index">
        <div class="blog-hero-wrap" data-blog-hero-wrap>
          <section class="blog-hero-stage" aria-labelledby="blog-title">
            <div class="blog-hero-inner" data-blog-hero-inner>
              <p class="blog-eyebrow">The blog</p>
              <h1 id="blog-title" class="blog-display">Tutorials, takes, and the occasional <span>rant.</span></h1>
              <p class="blog-hero-summary">Notes from running a production backend solo — what works, what broke, and what I think about it.</p>
            </div>
          </section>
        </div>
        <div class="blog-filterbar" aria-label="Filter blog posts">
          <div class="blog-container blog-filter-inner">
            <div class="blog-filter-pills">${renderFilters(this.currentFilter)}</div>
            <span class="blog-count" data-blog-count>${visibleCount} ${visibleCount === 1 ? "post" : "posts"}</span>
          </div>
        </div>
        <section class="blog-container blog-featured-section" aria-label="Featured post">
          <a class="blog-featured blog-reveal" data-blog-reveal data-blog-featured data-blog-category="${featured.category}"
             href="/blog/${featured.slug}">
            <div class="blog-meta-row"><span class="blog-chip">${labelForCategory(featured.category)}</span><span>${featured.minutes} min read</span></div>
            <h2>${escapeHtml(featured.header)}</h2>
            <p>${escapeHtml(featured.description)}</p>
            <div class="blog-featured-footer"><time datetime="${featured.date}">${formatBlogDate(featured.date)}</time><span class="blog-read-link">Read <span class="blog-arrow" aria-hidden="true">→</span></span></div>
          </a>
        </section>
        <section class="blog-container blog-list-section" aria-label="All posts">
          <div class="blog-list">${rows.map(renderPostRow).join("")}</div>
          <p class="blog-empty" data-blog-empty hidden>Nothing here yet. The <span data-empty-category>these</span> posts are brewing. <button type="button" data-blog-filter="all">Show everything</button></p>
        </section>
        <section class="blog-subscribe" aria-label="Subscribe">
          <div class="blog-container blog-subscribe-inner">
            <div><p class="blog-subscribe-title">New posts, no noise.</p><p class="blog-subscribe-copy">Occasional emails when something ships.</p></div>
            <form action="mailto:akjaiswal2003@gmail.com" method="post" enctype="text/plain" class="blog-subscribe-form">
              <label class="sr-only" for="blog-email">Email address</label>
              <input id="blog-email" name="email" type="email" placeholder="name@company.com" autocomplete="email" required />
              <button class="blog-ink-button" type="submit">Subscribe</button>
            </form>
          </div>
        </section>
      </main>
    `;
  }
}
