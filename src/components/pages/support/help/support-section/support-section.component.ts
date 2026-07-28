import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { supportContent } from "@app/data/support-content.ts";

/**
 * Answers-first support section: quick-help routes deflect the common case, and a
 * quiet handoff reveals a conversational contact form as the fallback.
 *
 * Routes reuse the estimator pick-card and speaking pointer-light grammar; the form
 * (topic pills, file drop, calm confirmation) is wired directly after connection so
 * field and attachment state survives interaction without a re-render.
 *
 * Submit and file upload are placeholder-only — see {@link SupportSectionComponent.submitTicket}.
 *
 * Selector: `support-section`.
 */
@Component({
  selector: "support-section",
  shadow: false,
})
export class SupportSectionComponent extends BaseElement {
  private controller: AbortController | null = null;
  private revealObserver: IntersectionObserver | null = null;

  /** Route id whose answer is currently unfurled, or `null` when all are closed. */
  private openRoute: string | null = null;
  /** Whether the ticket form is revealed. */
  private ticketOpen = false;
  /** Attachments held client-side until a real upload target is wired. */
  private files: File[] = [];
  /** Honours the visitor's reduced-motion preference for scroll and reveals. */
  private reducedMotion = false;

  constructor() {
    super();
  }

  /** Wires routes, handoff, pills, file drop, and reveals once the markup is live. */
  @OnEvent("connected", true)
  initializeSupport(): void {
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.controller = new AbortController();

    this.wireReveals();
    this.wirePointerLight();
    this.wireRoutes();
    this.wireHandoff();
    this.wireTopics();
    this.wireFileDrop();
    this.wireSubmit();
  }

  /** Disconnects the reveal observer and every listener attached during setup. */
  @OnEvent("disconnected", true)
  cleanupSupport(): void {
    this.controller?.abort();
    this.revealObserver?.disconnect();
    this.controller = null;
    this.revealObserver = null;
    this.openRoute = null;
    this.ticketOpen = false;
    this.files = [];
  }

  /** Reveals `.support-reveal` blocks on scroll with the site's staggered rise. */
  private wireReveals(): void {
    const blocks = Array.from(this.querySelectorAll<HTMLElement>(".support-reveal"));
    if (this.reducedMotion) {
      blocks.forEach((block) => block.classList.add("is-in"));
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          const block = entry.target as HTMLElement;
          block.style.transitionDelay = `${Math.max(0, blocks.indexOf(block)) * 55}ms`;
          block.classList.add("is-in");
          this.revealObserver?.unobserve(block);
        });
      },
      { threshold: 0.12 },
    );
    blocks.forEach((block) => this.revealObserver?.observe(block));
  }

  /** Tracks the pointer so route cards and the drop zone light up under the cursor. */
  private wirePointerLight(): void {
    if (this.reducedMotion) {
      return;
    }
    const signal = this.controller?.signal;
    this.querySelectorAll<HTMLElement>(".support-route, .support-drop").forEach((el) => {
      el.addEventListener(
        "pointermove",
        (event) => {
          const rect = el.getBoundingClientRect();
          el.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
          el.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
        },
        { signal },
      );
    });
  }

  /** Toggles a route's inline answer; only one route stays open at a time. */
  private wireRoutes(): void {
    const answer = this.querySelector<HTMLElement>("#support-answer");
    const inner = this.querySelector<HTMLElement>("#support-answer-inner");
    if (!answer || !inner) {
      return;
    }

    this.querySelectorAll<HTMLButtonElement>(".support-route").forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const id = button.dataset.route ?? "";
          if (this.openRoute === id) {
            button.classList.remove("is-open");
            button.setAttribute("aria-expanded", "false");
            answer.classList.remove("is-open");
            this.openRoute = null;
            return;
          }

          this.querySelectorAll<HTMLButtonElement>(".support-route").forEach((other) => {
            other.classList.remove("is-open");
            other.setAttribute("aria-expanded", "false");
          });

          const route = supportContent.routes.find((candidate) => candidate.id === id);
          if (!route) {
            return;
          }

          button.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
          inner.innerHTML = `<h3>${route.answerTitle}</h3>${route.answerHtml}`;
          answer.classList.add("is-open");
          this.openRoute = id;
        },
        { signal: this.controller?.signal },
      );
    });
  }

  /** Reveals or hides the ticket form and moves focus to its first field. */
  private wireHandoff(): void {
    const trigger = this.querySelector<HTMLButtonElement>("#support-open-ticket");
    const ticket = this.querySelector<HTMLElement>("#support-ticket");
    const label = this.querySelector<HTMLElement>("#support-open-label");
    if (!trigger || !ticket || !label) {
      return;
    }

    trigger.addEventListener(
      "click",
      () => {
        this.ticketOpen = !this.ticketOpen;
        ticket.classList.toggle("is-open", this.ticketOpen);
        ticket.setAttribute("aria-hidden", String(!this.ticketOpen));
        trigger.setAttribute("aria-expanded", String(this.ticketOpen));
        label.textContent = this.ticketOpen
          ? supportContent.handoff.closeLabel
          : supportContent.handoff.openLabel;

        if (!this.ticketOpen) {
          return;
        }
        window.setTimeout(
          () => {
            ticket.scrollIntoView({ behavior: this.reducedMotion ? "auto" : "smooth", block: "nearest" });
            this.querySelector<HTMLInputElement>("#support-name")?.focus();
          },
          this.reducedMotion ? 0 : 260,
        );
      },
      { signal: this.controller?.signal },
    );
  }

  /** Single-select topic pills; clicking the active pill clears the selection. */
  private wireTopics(): void {
    const pills = this.querySelectorAll<HTMLButtonElement>(".support-topic");
    pills.forEach((pill) => {
      pill.addEventListener(
        "click",
        () => {
          const wasOn = pill.classList.contains("is-on");
          pills.forEach((other) => {
            other.classList.remove("is-on");
            other.setAttribute("aria-pressed", "false");
          });
          if (!wasOn) {
            pill.classList.add("is-on");
            pill.setAttribute("aria-pressed", "true");
          }
        },
        { signal: this.controller?.signal },
      );
    });
  }

  /** Wires drag-over feedback, keyboard access, and file chip rendering for the drop zone. */
  private wireFileDrop(): void {
    const drop = this.querySelector<HTMLElement>("#support-drop");
    const input = this.querySelector<HTMLInputElement>("#support-file-input");
    if (!drop || !input) {
      return;
    }
    const signal = this.controller?.signal;

    input.addEventListener("change", () => this.addFiles(input.files), { signal });
    drop.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          input.click();
        }
      },
      { signal },
    );

    (["dragenter", "dragover"] as const).forEach((type) =>
      drop.addEventListener(
        type,
        (event) => {
          event.preventDefault();
          drop.classList.add("is-dragging");
        },
        { signal },
      ),
    );
    (["dragleave", "drop"] as const).forEach((type) =>
      drop.addEventListener(
        type,
        (event) => {
          event.preventDefault();
          if (type === "dragleave" && drop.contains((event as DragEvent).relatedTarget as Node)) {
            return;
          }
          drop.classList.remove("is-dragging");
        },
        { signal },
      ),
    );
    drop.addEventListener("drop", (event) => this.addFiles((event as DragEvent).dataTransfer?.files ?? null), {
      signal,
    });
  }

  /** Adds dropped or chosen files within the size and count caps, then renders chips. */
  private addFiles(list: FileList | null): void {
    if (!list) {
      return;
    }
    for (const file of Array.from(list)) {
      if (file.size <= supportContent.maxFileBytes && this.files.length < supportContent.maxFiles) {
        this.files.push(file);
      }
    }
    this.renderFiles();
  }

  /** Rebuilds the attachment chip list, wiring each remove control. */
  private renderFiles(): void {
    const listEl = this.querySelector<HTMLElement>("#support-file-list");
    if (!listEl) {
      return;
    }

    listEl.innerHTML = this.files
      .map(
        (file, index) => `
          <div class="support-filechip">
            <span class="support-file-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 3v5h5" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8l-5-5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></span>
            <span class="support-file-name">${file.name}</span>
            <span class="support-file-size">${this.formatSize(file.size)}</span>
            <button type="button" class="support-file-remove" data-index="${index}" aria-label="Remove ${file.name}"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
          </div>`,
      )
      .join("");

    listEl.querySelectorAll<HTMLButtonElement>(".support-file-remove").forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          this.files.splice(Number(button.dataset.index), 1);
          this.renderFiles();
        },
        { signal: this.controller?.signal },
      );
    });
  }

  /** Formats a byte count as a compact B / KB / MB label. */
  private formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /** Validates gently, then swaps in the confirmation and wires "Send another". */
  private wireSubmit(): void {
    const form = this.querySelector<HTMLFormElement>("#support-ticket");
    const formInner = this.querySelector<HTMLElement>("#support-ticket-form");
    const sent = this.querySelector<HTMLElement>("#support-sent");
    const again = this.querySelector<HTMLButtonElement>("#support-again");
    if (!form || !formInner || !sent || !again) {
      return;
    }

    form.addEventListener("submit", (event) => this.submitTicket(event, formInner, sent), {
      signal: this.controller?.signal,
    });
    again.addEventListener(
      "click",
      () => {
        form.reset();
        this.files = [];
        this.renderFiles();
        this.querySelectorAll<HTMLButtonElement>(".support-topic").forEach((pill) => {
          pill.classList.remove("is-on");
          pill.setAttribute("aria-pressed", "false");
        });
        sent.style.display = "none";
        formInner.style.display = "block";
        this.querySelector<HTMLInputElement>("#support-name")?.focus();
      },
      { signal: this.controller?.signal },
    );
  }

  /**
   * Placeholder submit: validates client-side and shows the confirmation only.
   *
   * Before shipping, POST the fields (and upload {@link SupportSectionComponent.files})
   * to a real endpoint or fall back to a prefilled `mailto:` using
   * `supportContent.email`; the success state currently fires on validation alone.
   */
  private submitTicket(event: Event, formInner: HTMLElement, sent: HTMLElement): void {
    event.preventDefault();
    const name = this.querySelector<HTMLInputElement>("#support-name");
    const email = this.querySelector<HTMLInputElement>("#support-email");
    const message = this.querySelector<HTMLTextAreaElement>("#support-message");
    if (!name || !email || !message) {
      return;
    }

    const invalid = ([name, email, message] as const).filter(
      (input) => !input.value.trim() || (input.type === "email" && !/.+@.+\..+/.test(input.value)),
    );
    invalid.forEach((input) => {
      const field = input.closest<HTMLElement>(".support-field");
      field?.classList.add("is-invalid");
      window.setTimeout(() => field?.classList.remove("is-invalid"), 1600);
    });

    if (invalid.length > 0) {
      invalid[0].focus();
      return;
    }

    const sub = this.querySelector<HTMLElement>("#support-sent-sub");
    if (sub) {
      sub.textContent = `${supportContent.success.replyPrefix} ${email.value.trim()}.`;
    }
    formInner.style.display = "none";
    sent.style.display = "block";
  }

  /** Returns the support section markup from `supportContent`; behavior is wired after connection. */
  render(): string {
    const { opener, routes, handoff, form, success } = supportContent;

    return HTML`
      <section id="support" class="support-section layout-content layout-section" aria-labelledby="support-title">
        <div class="support-head support-reveal">
          <p class="support-eyebrow">${opener.eyebrow}</p>
          <h2 id="support-title" class="support-section-title">
            ${opener.titleBeforeAccent} <span class="support-accent">${opener.titleAccent}</span> ${opener.titleAfterAccent}
          </h2>
          <p class="support-lede">${opener.lede}</p>
        </div>

        <div class="support-routes support-reveal" role="group" aria-label="${opener.routesLabel}">
          ${routes
            .map(
              (route) => `
              <button class="support-route" type="button" data-route="${route.id}" aria-expanded="false" aria-controls="support-answer">
                <span class="support-route-icon">${route.icon}</span>
                <span class="support-route-key">${route.label}</span>
                <span class="support-route-sub">${route.sublabel}</span>
                <span class="support-route-chevron" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              </button>`,
            )
            .join("")}
        </div>

        <div class="support-answer" id="support-answer" role="region" aria-live="polite">
          <div class="support-answer-inner" id="support-answer-inner"></div>
        </div>

        <div class="support-handoff support-reveal">
          <span class="support-rule" aria-hidden="true"></span>
          <button id="support-open-ticket" type="button" aria-expanded="false" aria-controls="support-ticket">
            <span id="support-open-label">${handoff.openLabel}</span>
            <span class="support-arrow" aria-hidden="true">→</span>
          </button>
          <span class="support-rule" aria-hidden="true"></span>
        </div>

        <form class="support-ticket" id="support-ticket" aria-hidden="true" novalidate>
          <div id="support-ticket-form">
            <div class="support-ticket-head">
              <div>
                <h3>${form.heading}</h3>
                <p>${form.sub}</p>
              </div>
              <span class="support-chip">${form.chip}</span>
            </div>

            <div class="support-grid">
              <div class="support-field">
                <label for="support-name">${form.nameLabel}</label>
                <input id="support-name" name="name" type="text" autocomplete="name" placeholder="${form.namePlaceholder}" required />
              </div>
              <div class="support-field">
                <label for="support-email">${form.emailLabel} <span class="support-optional">${form.emailLabelSoft}</span></label>
                <input id="support-email" name="email" type="email" autocomplete="email" placeholder="${form.emailPlaceholder}" required />
              </div>
            </div>

            <div class="support-field">
              <label>${form.topicLabel}</label>
              <div class="support-topics" role="group" aria-label="Topic">
                ${form.topics
                  .map(
                    (topic) => `<button type="button" class="support-topic" data-topic="${topic}" aria-pressed="false">${topic}</button>`,
                  )
                  .join("")}
              </div>
            </div>

            <div class="support-field">
              <label for="support-message">${form.detailsLabel}</label>
              <textarea id="support-message" name="message" placeholder="${form.detailsPlaceholder}" required></textarea>
            </div>

            <div class="support-field">
              <label>${form.dropLabel} <span class="support-optional">${form.dropLabelSoft}</span></label>
              <div class="support-drop" id="support-drop" tabindex="0" role="button" aria-label="Add files: drag and drop or press to browse">
                <svg class="support-drop-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 16V4m0 0L8 8m4-4l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                <div class="support-drop-key">${form.dropKey}</div>
                <div class="support-drop-sub">${form.dropConstraint}</div>
                <input type="file" id="support-file-input" multiple aria-label="Choose files" />
              </div>
              <div class="support-files" id="support-file-list" aria-live="polite"></div>
            </div>

            <div class="support-ticket-foot">
              <p class="support-assure">${form.assure}</p>
              <button type="submit" class="support-submit">${form.submit}</button>
            </div>
          </div>

          <div class="support-sent" id="support-sent" style="display:none">
            <div class="support-tick" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 12l5 5L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <h3>${success.heading}</h3>
            <p id="support-sent-sub">${success.sub}</p>
            <button type="button" class="support-ghost" id="support-again">${success.again}</button>
          </div>
        </form>
      </section>
    `;
  }
}
