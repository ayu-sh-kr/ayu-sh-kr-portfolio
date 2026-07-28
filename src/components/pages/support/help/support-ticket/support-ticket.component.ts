import { BaseElement, BindEvent, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { supportContent } from "@app/data/support-content.ts";

/**
 * Owns the optional support-message flow, from the quiet handoff through confirmation.
 *
 * Used as the final child of {@link SupportSectionComponent}. It keeps form visibility,
 * selected topic, local attachments, validation, and the placeholder success state in
 * one element. A future delivery endpoint belongs in {@link SupportTicketComponent.submitTicket}
 * so the shell and quick-help components remain independent of submission details.
 *
 * Selector: `support-ticket`.
 */
@Component({ selector: "support-ticket", shadow: false })
export class SupportTicketComponent extends BaseElement {
  /** Aborts native drop-zone listeners when this form leaves the support route. */
  private dropController: AbortController | null = null;
  /** Attachments held in the browser until a real submission endpoint is introduced. */
  private files: File[] = [];
  /** Whether the handoff has revealed the message form. */
  private ticketOpen = false;
  /** Whether focus and scrolling should avoid motion after the form is opened. */
  private reducedMotion = false;

  /** Creates the ticket element before its optional form is rendered. */
  constructor() {
    super();
  }

  /** Captures motion preference and wires the native file-input and drag-drop interactions. */
  @OnEvent("connected", true)
  initializeTicket(): void {
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.dropController = new AbortController();
    this.wireFileDrop();
  }

  /** Removes native listeners and attachment state so a disconnected route retains no browser resources. */
  @OnEvent("disconnected", true)
  cleanupTicket(): void {
    this.dropController?.abort();
    this.dropController = null;
    this.files = [];
    this.ticketOpen = false;
  }

  /** Reveals or hides the form, then moves focus to its first field when opening it. */
  @BindEvent({ event: "click", id: "#support-open-ticket" })
  toggleTicket(): void {
    const trigger = this.querySelector<HTMLButtonElement>("#support-open-ticket");
    const ticket = this.querySelector<HTMLFormElement>("#support-ticket");
    const label = this.querySelector<HTMLElement>("#support-open-label");
    if (!trigger || !ticket || !label) {
      return;
    }

    this.ticketOpen = !this.ticketOpen;
    ticket.classList.toggle("is-open", this.ticketOpen);
    ticket.inert = !this.ticketOpen;
    ticket.setAttribute("aria-hidden", String(!this.ticketOpen));
    trigger.setAttribute("aria-expanded", String(this.ticketOpen));
    label.textContent = this.ticketOpen ? supportContent.handoff.closeLabel : supportContent.handoff.openLabel;
    if (!this.ticketOpen) {
      return;
    }

    window.setTimeout(() => {
      ticket.scrollIntoView({ behavior: this.reducedMotion ? "auto" : "smooth", block: "nearest" });
      this.querySelector<HTMLInputElement>("#support-name")?.focus();
    }, this.reducedMotion ? 0 : 260);
  }

  /** Makes one topic active at a time; selecting the active pill again clears it. */
  @BindEvent({ event: "click", id: ".support-topic" })
  toggleTopic(event: MouseEvent): void {
    const topic = (event.target as HTMLElement).closest<HTMLButtonElement>(".support-topic");
    if (!topic) {
      return;
    }

    const wasSelected = topic.classList.contains("is-on");
    this.querySelectorAll<HTMLButtonElement>(".support-topic").forEach((item) => {
      item.classList.toggle("is-on", item === topic && !wasSelected);
      item.setAttribute("aria-pressed", String(item === topic && !wasSelected));
    });
  }

  /** Removes one locally held attachment selected by the button created with its chip. */
  private removeFile(button: HTMLButtonElement): void {
    const index = Number(button.dataset.index);
    if (!Number.isInteger(index) || index < 0 || index >= this.files.length) {
      return;
    }

    this.files.splice(index, 1);
    this.renderFiles();
  }

  /** Validates the local form and swaps in its confirmation without sending data to a server yet. */
  @BindEvent({ event: "submit", id: "#support-ticket" })
  submitTicket(event: Event): void {
    event.preventDefault();
    const name = this.querySelector<HTMLInputElement>("#support-name");
    const email = this.querySelector<HTMLInputElement>("#support-email");
    const message = this.querySelector<HTMLTextAreaElement>("#support-message");
    if (!name || !email || !message) {
      return;
    }

    const invalid = [name, email, message].filter(
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

    const form = this.querySelector<HTMLElement>("#support-ticket-fields");
    const sent = this.querySelector<HTMLElement>("#support-sent");
    const reply = this.querySelector<HTMLElement>("#support-sent-sub");
    if (!form || !sent || !reply) {
      return;
    }

    reply.textContent = `${supportContent.success.replyPrefix} ${email.value.trim()}.`;
    form.hidden = true;
    sent.hidden = false;
  }

  /** Restores the form after confirmation so the visitor can submit a separate support request. */
  @BindEvent({ event: "click", id: "#support-again" })
  resetTicket(): void {
    const form = this.querySelector<HTMLFormElement>("#support-ticket");
    const fields = this.querySelector<HTMLElement>("#support-ticket-fields");
    const sent = this.querySelector<HTMLElement>("#support-sent");
    if (!form || !fields || !sent) {
      return;
    }

    form.reset();
    this.files = [];
    this.renderFiles();
    this.querySelectorAll<HTMLButtonElement>(".support-topic").forEach((topic) => {
      topic.classList.remove("is-on");
      topic.setAttribute("aria-pressed", "false");
    });
    sent.hidden = true;
    fields.hidden = false;
    this.querySelector<HTMLInputElement>("#support-name")?.focus();
  }

  /** Connects file selection, keyboard activation, and drag feedback to the native file input. */
  private wireFileDrop(): void {
    const drop = this.querySelector<HTMLElement>("#support-drop");
    const input = this.querySelector<HTMLInputElement>("#support-file-input");
    if (!drop || !input) {
      return;
    }

    const signal = this.dropController?.signal;
    input.addEventListener("change", () => this.addFiles(input.files), { signal });
    if (!this.reducedMotion) {
      drop.addEventListener("pointermove", (event) => {
        const bounds = drop.getBoundingClientRect();
        drop.style.setProperty("--mx", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
        drop.style.setProperty("--my", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
      }, { signal });
    }
    drop.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        input.click();
      }
    }, { signal });
    (["dragenter", "dragover"] as const).forEach((type) => drop.addEventListener(type, (event) => {
      event.preventDefault();
      drop.classList.add("is-dragging");
    }, { signal }));
    (["dragleave", "drop"] as const).forEach((type) => drop.addEventListener(type, (event) => {
      event.preventDefault();
      if (type === "dragleave" && drop.contains((event as DragEvent).relatedTarget as Node)) {
        return;
      }
      drop.classList.remove("is-dragging");
    }, { signal }));
    drop.addEventListener("drop", (event) => this.addFiles((event as DragEvent).dataTransfer?.files ?? null), { signal });
  }

  /** Adds chosen files that satisfy the authored size and count limits, then refreshes the chip list. */
  private addFiles(list: FileList | null): void {
    if (!list) {
      return;
    }

    Array.from(list).forEach((file) => {
      if (file.size <= supportContent.maxFileBytes && this.files.length < supportContent.maxFiles) {
        this.files.push(file);
      }
    });
    this.renderFiles();
  }

  /** Rebuilds the attachment chips from local state after a file is added, removed, or the form resets. */
  private renderFiles(): void {
    const list = this.querySelector<HTMLElement>("#support-file-list");
    if (!list) {
      return;
    }

    list.innerHTML = this.files.map((file, index) => HTML`
      <div class="support-filechip">
        <span class="support-file-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 3v5h5" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8l-5-5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></span>
        <span class="support-file-name">${file.name}</span>
        <span class="support-file-size">${this.formatSize(file.size)}</span>
        <button type="button" class="support-file-remove" data-index="${index}" aria-label="Remove ${file.name}"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
      </div>
    `).join("");
    list.querySelectorAll<HTMLButtonElement>(".support-file-remove").forEach((button) => {
      button.addEventListener("click", () => this.removeFile(button), { signal: this.dropController?.signal });
    });
  }

  /** Formats attachment bytes as the compact label displayed beside each selected file. */
  private formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /** Returns the optional form, its quiet handoff, and its local-only confirmation state. */
  render(): string {
    const { handoff, form, success } = supportContent;

    return HTML`
      <div class="support-handoff layout-row">
        <span class="support-rule" aria-hidden="true"></span>
        <button id="support-open-ticket" type="button" aria-expanded="false" aria-controls="support-ticket-form-shell">
          <span id="support-open-label">${handoff.openLabel}</span>
          <span class="support-arrow" aria-hidden="true">→</span>
        </button>
        <span class="support-rule" aria-hidden="true"></span>
      </div>

      <form class="support-ticket" id="support-ticket" aria-hidden="true" inert novalidate>
        <div id="support-ticket-form-shell">
          <div id="support-ticket-fields">
            <div class="support-ticket-head">
              <div>
                <h3 class="type-subsection">${form.heading}</h3>
                <p>${form.sub}</p>
              </div>
              <span class="support-chip">${form.chip}</span>
            </div>

            <div class="support-grid">
              <div class="support-field">
                <label for="support-name" class="type-label">${form.nameLabel}</label>
                <input id="support-name" name="name" type="text" autocomplete="name" placeholder="${form.namePlaceholder}" required />
              </div>
              <div class="support-field">
                <label for="support-email" class="type-label">${form.emailLabel} <span class="support-optional">${form.emailLabelSoft}</span></label>
                <input id="support-email" name="email" type="email" autocomplete="email" placeholder="${form.emailPlaceholder}" required />
              </div>
            </div>

            <div class="support-field">
              <label class="type-label">${form.topicLabel}</label>
              <div class="support-topics layout-row layout-row-tight" role="group" aria-label="Topic">
                ${form.topics.map((topic) => `<button type="button" class="support-topic" data-topic="${topic}" aria-pressed="false">${topic}</button>`).join("")}
              </div>
            </div>

            <div class="support-field">
              <label for="support-message" class="type-label">${form.detailsLabel}</label>
              <textarea id="support-message" name="message" placeholder="${form.detailsPlaceholder}" required></textarea>
            </div>

            <div class="support-field">
              <label class="type-label">${form.dropLabel} <span class="support-optional">${form.dropLabelSoft}</span></label>
              <div class="support-drop" id="support-drop" tabindex="0" role="button" aria-label="Add files: drag and drop or press to browse">
                <svg class="support-drop-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 16V4m0 0L8 8m4-4l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                <div class="support-drop-key">${form.dropKey}</div>
                <div class="support-drop-sub">${form.dropConstraint}</div>
                <input type="file" id="support-file-input" multiple aria-label="Choose files" />
              </div>
              <div class="support-files" id="support-file-list" aria-live="polite"></div>
            </div>

            <div class="support-ticket-foot layout-row layout-row-split">
              <p class="support-assure">${form.assure}</p>
              <button type="submit" class="support-submit">${form.submit}</button>
            </div>
          </div>

          <div class="support-sent" id="support-sent" hidden>
            <div class="support-tick" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 12l5 5L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <h3 class="type-subsection">${success.heading}</h3>
            <p id="support-sent-sub">${success.sub}</p>
            <button type="button" class="support-ghost" id="support-again">${success.again}</button>
          </div>
        </div>
      </form>
    `;
  }
}
