import { BaseElement, BindEvent, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { supportContent } from "@app/data/support-content.ts";
import {
  type SupportTicketAttachment,
  supportTicketService,
} from "@app/service/support-ticket/support-ticket.service.ts";

/**
 * Owns the support request form rendered at the end of the support help section.
 *
 * Used as the final child of {@link SupportSectionComponent}. The component owns reveal state,
 * topic choice, local validation, direct attachment uploads, and submission. It waits for selected
 * uploads to settle, sends completed attachment metadata to the backend, and shows confirmation
 * only after the support ticket crosses the durable service boundary.
 *
 * Selector: `support-ticket`.
 */
@Component({ selector: "support-ticket", shadow: false })
export class SupportTicketComponent extends BaseElement {
  /** Aborts native drop-zone listeners so route teardown cannot leave browser handlers attached. */
  private dropController: AbortController | null = null;
  /** Native files kept long enough to render names and associate uploads with the form state. */
  private files: File[] = [];
  /** Maps each native file to the completed attachment metadata included during submission. */
  private attachments = new Map<File, SupportTicketAttachment>();
  /** Lets submission wait for every selected file handoff without serializing independent uploads. */
  private pendingUploads = new Map<File, Promise<void>>();
  /** Controls whether the handoff has revealed the message form and enabled its controls. */
  private ticketOpen = false;
  /** Captures the visitor preference used by the delayed focus and scroll handoff. */
  private reducedMotion = false;

  /** Lets the base element construct the support form before connection wires native listeners. */
  constructor() {
    super();
  }

  /**
   * Capture the motion preference and install file-input and drop-zone listeners after rendering.
   * The abort controller keeps those native listeners tied to this element's connection lifetime.
   */
  @OnEvent("connected", true)
  initializeTicket(): void {
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.dropController = new AbortController();
    this.wireFileDrop();
  }

  /**
   * Release native listeners and transient upload state when the support route disconnects.
   * In-flight storage requests may settle independently, but their metadata cannot survive this form.
   */
  @OnEvent("disconnected", true)
  cleanupTicket(): void {
    this.dropController?.abort();
    this.dropController = null;
    this.files = [];
    this.attachments.clear();
    this.pendingUploads.clear();
    this.ticketOpen = false;
  }

  /**
   * Toggle the quiet handoff and synchronize inert, ARIA, and focus state with the visual panel.
   * Opening waits for the expand transition before scrolling the form into view and focusing name.
   */
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

  /**
   * Keep topic selection exclusive without introducing a separate form control.
   * Clicking the active topic clears it, preserving the form's optional topic contract.
   */
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

  /**
   * Remove the file represented by a rendered chip and discard its completed storage key.
   * The direct upload itself cannot be recalled after signing, so removal only changes local form state.
   */
  private removeFile(button: HTMLButtonElement): void {
    const index = Number(button.dataset.index);
    if (!Number.isInteger(index) || index < 0 || index >= this.files.length) {
      return;
    }

    const [file] = this.files.splice(index, 1);
    if (file) {
      this.attachments.delete(file);
      this.pendingUploads.delete(file);
    }
    this.renderFiles();
  }

  /**
   * Validate required fields, await selected uploads, and send the assembled support request.
   * Submission stops when any selected attachment lacks a completed intake key, preventing the
   * confirmation view from hiding an incomplete request.
   */
  @BindEvent({ event: "submit", id: "#support-ticket" })
  async submitTicket(event: Event): Promise<void> {
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

    const submitError = this.querySelector<HTMLElement>("#support-submit-error");
    if (submitError) {
      submitError.hidden = true;
    }

    await Promise.all(this.pendingUploads.values());
    const topic = this.querySelector<HTMLButtonElement>(".support-topic.is-on")?.dataset.topic ?? null;
    const files = this.files.flatMap((file) => {
      const attachment = this.attachments.get(file);
      return attachment ? [attachment] : [];
    });
    if (files.length !== this.files.length) {
      if (submitError) {
        submitError.hidden = false;
      }
      return;
    }

    try {
      await supportTicketService.submitTicket({
        name: name.value.trim(), email: email.value.trim(), topic,
        message: message.value.trim(), files,
      });
    } catch {
      if (submitError) {
        submitError.hidden = false;
      }
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

  /**
   * Clear contact, topic, attachment, and confirmation state for a fresh request.
   * Resetting the upload-key map prevents a later request from inheriting objects from this one.
   */
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
    this.attachments.clear();
    this.pendingUploads.clear();
    this.renderFiles();
    this.querySelectorAll<HTMLButtonElement>(".support-topic").forEach((topic) => {
      topic.classList.remove("is-on");
      topic.setAttribute("aria-pressed", "false");
    });
    sent.hidden = true;
    fields.hidden = false;
    const submitError = this.querySelector<HTMLElement>("#support-submit-error");
    if (submitError) {
      submitError.hidden = true;
    }
    this.querySelector<HTMLInputElement>("#support-name")?.focus();
  }

  /**
   * Connect the hidden file input to picker, keyboard, drag, and drop interactions.
   * All listeners use the connection-scoped signal so repeated route mounts do not accumulate handlers.
   */
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

  /**
   * Accept files within the authored size and count limits, start their upload handoffs, and repaint.
   * Each accepted file requests a support-scoped URL and then performs a direct PUT through the service.
   */
  private addFiles(list: FileList | null): void {
    if (!list) {
      return;
    }

    Array.from(list).forEach((file) => {
      if (file.size <= supportContent.maxFileBytes && this.files.length < supportContent.maxFiles) {
        this.files.push(file);
        const upload = this.uploadFile(file);
        this.pendingUploads.set(file, upload);
        void upload.finally(() => this.pendingUploads.delete(file));
      }
    });
    this.renderFiles();
  }

  /**
   * Run the support attachment handoff from API authorization through storage upload.
   * A failed request removes the key so an incomplete upload cannot be included in a future payload.
   */
  private async uploadFile(file: File): Promise<void> {
    try {
      const access = await supportTicketService.createUploadUrl(file);
      await supportTicketService.uploadFile(file, access);
      this.attachments.set(file, {
        id: crypto.randomUUID(), name: file.name, size: file.size, status: "uploaded", key: access.key,
      });
    } catch {
      this.attachments.delete(file);
    }
  }

  /**
   * Rebuild the attachment chips from current local files after selection, removal, or reset.
   * Rendering reads state only; network work is started by {@link addFiles} before this repaint.
   */
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

  /**
   * Format file bytes for the compact chip label.
   * Small files stay precise while larger values use readable KiB or MiB units for quick scanning.
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Render the handoff, form controls, attachment surface, and confirmation view.
   * The template remains pure: it reads current state and authored copy while event handlers own
   * focus, validation, uploads, and DOM transitions.
   */
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
                <label for="support-name" class="form-label type-label">${form.nameLabel}</label>
                <input class="form-control input-md input-rounded-md input-bordered" id="support-name" name="name" type="text" autocomplete="name" placeholder="${form.namePlaceholder}" required />
              </div>
              <div class="support-field">
                <label for="support-email" class="form-label type-label">${form.emailLabel} <span class="support-optional">${form.emailLabelSoft}</span></label>
                <input class="form-control input-md input-rounded-md input-bordered" id="support-email" name="email" type="email" autocomplete="email" placeholder="${form.emailPlaceholder}" required />
              </div>
            </div>

            <div class="support-field">
              <label class="form-label type-label">${form.topicLabel}</label>
              <div class="support-topics layout-row layout-row-tight" role="group" aria-label="Topic">
                ${form.topics.map((topic) => `<button type="button" class="form-choice input-sm input-round input-bordered support-topic" data-topic="${topic}" aria-pressed="false">${topic}</button>`).join("")}
              </div>
            </div>

            <div class="support-field">
              <label for="support-message" class="form-label type-label">${form.detailsLabel}</label>
              <textarea class="form-control input-md input-rounded-md input-bordered" id="support-message" name="message" placeholder="${form.detailsPlaceholder}" required></textarea>
            </div>

            <div class="support-field">
              <label class="form-label type-label">${form.dropLabel} <span class="support-optional">${form.dropLabelSoft}</span></label>
              <div class="form-upload input-lg input-rounded-md input-dashed support-drop" id="support-drop" tabindex="0" role="button" aria-label="Add files: drag and drop or press to browse">
                <svg class="support-drop-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 16V4m0 0L8 8m4-4l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                <div class="support-drop-key">${form.dropKey}</div>
                <div class="support-drop-sub">${form.dropConstraint}</div>
                <input class="form-native input-sm input-rounded-md input-bordered" type="file" id="support-file-input" multiple aria-label="Choose files" />
              </div>
              <div class="support-files" id="support-file-list" aria-live="polite"></div>
            </div>

            <div class="support-ticket-foot layout-row layout-row-split">
              <div>
                <p class="support-assure">${form.assure}</p>
                <p class="support-assure" id="support-submit-error" role="alert" hidden>${form.submitError}</p>
              </div>
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
