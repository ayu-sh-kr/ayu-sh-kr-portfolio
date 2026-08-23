import { ApplicationEventService, BaseElement, Component, HostListener, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { html, when } from "@ayu-sh-kr/dota-wrap/rendering";
import { pricingContent } from "@app/data/pricing-content.ts";
import {
  PRICING_START_PROJECT_FILES_EVENT,
  type PricingStartProjectAttachment,
  type PricingStartProjectAttachmentStatus,
  type PricingStartProjectFilesChange,
} from "@app/events/pricing.events.ts";

/**
 * Largest attachment accepted from the native file picker, in bytes.
 *
 * Anything larger is silently dropped during selection rather than rejected
 * after the fact, so the visitor never waits for an upload that would fail
 * server-side validation. Sized at 20 MiB to match the temporary-bucket
 * policy the placeholder upload flow will eventually enforce.
 */
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

/**
 * Largest number of attachments retained at one time.
 *
 * Enforced during selection: once the list holds this many entries, further
 * picks are dropped until the visitor removes one. Kept low so the prepared
 * email and the temporary bucket stay within a single intake's budget.
 */
const MAX_ATTACHMENT_COUNT = 8;

/**
 * Collects, removes, and uploads the optional attachments for the project brief.
 *
 * The component owns the local attachment list and its upload progress; it never
 * reads or changes any other part of the intake. It restores its `files`
 * attribute as the initial list so previously selected attachments survive the
 * shell swapping this component out while the brief is prepared, then publishes
 * {@link PRICING_START_PROJECT_FILES_EVENT} after every change so the shell can
 * keep its retained brief and prepared email current.
 *
 * Flow: the visitor picks files through the native input, each accepted file is
 * shown immediately as a `pending` card while a placeholder upload runs, and the
 * card transitions through `uploading` to `uploaded` (or `error`). Remove buttons
 * delegate to a single delegated click handler, so the list never wires per-item
 * listeners. Upload itself is a two-step placeholder — scoped credential request
 * then direct-to-bucket PUT — until the backend and storage bucket exist.
 *
 * Selector: `pricing-project-file-upload`.
 */
@Component({
  selector: "pricing-project-file-upload",
  shadow: false,
})
export class PricingProjectFileUploadComponent extends BaseElement {
  /**
   * Initial attachments serialised as JSON.
   *
   * Attribute `files`; defaults to an empty list. The shell writes this from its
   * retained brief so a hot reload or component swap restores the visitor's prior
   * selection. The value is parsed once on connect via
   * {@link parseInitialAttachments}, which tolerates malformed JSON by falling
   * back to an empty list rather than throwing. Changing the attribute after
   * connect does not re-seed the list — the component owns it from then on.
   */
  @Property({ name: "files", type: String })
  files = "[]";

  /**
   * Locally owned attachments, including in-progress upload state.
   *
   * This is the single source of truth for the rendered list; every mutation
   * replaces the array reference (never mutates in place) so {@link updateHTML}
   * and {@link publishAttachments} always see a consistent snapshot. Entries
   * carry a `status` of `pending`, `uploading`, `uploaded`, or `error`, plus an
   * optional storage `key` once an upload resolves.
   */
  private attachments: PricingStartProjectAttachment[] = [];

  /**
   * Publisher used to broadcast attachment changes to the shell.
   *
   * Acquired once from the shared {@link ApplicationEventService} and reused for
   * every change, so the shell's retained brief and prepared email stay in sync
   * with the local list without this component holding a direct reference to
   * either.
   */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();

  /**
   * Creates the component with an empty attachment list.
   *
   * The list is not seeded here; it is restored from the `files` attribute in
   * {@link restoreAttachments} once the element is connected and the attribute
   * has been deserialised by the Dota Core property binder.
   */
  constructor() {
    super();
  }

  /**
   * Restores the attachment list carried over from the shell's retained brief.
   *
   * Runs once on connect (the `true` flag makes it a one-shot lifecycle hook).
   * Reading {@link files} here — rather than in the constructor — guarantees the
   * Dota Core property binder has already deserialised the attribute, so a hot
   * reload or component swap brings the visitor's prior selection back before
   * the first paint. After seeding, the component owns the list and no longer
   * reads the attribute.
   */
  @OnEvent("connected", true)
  restoreAttachments(): void {
    this.attachments = this.parseInitialAttachments(this.files);
    this.updateHTML();
  }

  /**
   * Accepts newly chosen files and starts their placeholder upload.
   *
   * Triggered by the native file input's `change` event. The handler ignores
   * changes from any input that is not the project-files picker (guarded by the
   * `data-project-files` dataset key), so a single delegated listener is safe
   * even if other inputs are added to the component later. Files over
   * {@link MAX_ATTACHMENT_BYTES} are dropped silently, and the remaining picks
   * are capped at the slots left before {@link MAX_ATTACHMENT_COUNT} is reached.
   * The input is reset immediately so the same file can be re-selected.
   *
   * Each accepted file is shown as a `pending` card before any network work
   * starts, so the visitor gets instant feedback; the list is republished so the
   * shell's retained brief reflects the new entries, then each file is uploaded
   * independently. Uploads run in parallel and update their own card via
   * {@link setAttachmentStatus} as they resolve.
   *
   * @param event - Change from the native file input.
   */
  @HostListener({ event: "change" })
  addSelectedFiles(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.dataset.projectFiles === undefined) {
      return;
    }

    const availableSlots = Math.max(MAX_ATTACHMENT_COUNT - this.attachments.length, 0);
    const accepted = Array.from(input.files ?? [])
      .filter((file) => file.size <= MAX_ATTACHMENT_BYTES)
      .slice(0, availableSlots);
    input.value = "";
    if (!accepted.length) {
      return;
    }

    const pending = accepted.map((file) => ({ file, attachment: this.createPendingAttachment(file) }));
    this.attachments = [...this.attachments, ...pending.map(({ attachment }) => attachment)];
    this.updateHTML();
    this.publishAttachments();

    pending.forEach(({ file, attachment }) => void this.uploadAttachment(file, attachment.id));
  }

  /**
   * Removes one attachment selected by its remove button.
   *
   * A single delegated `click` listener covers every remove button in the list,
   * so no per-item handlers are wired or torn down as the list changes. The
   * handler climbs to the closest element carrying `data-project-file-remove`
   * and confirms it still belongs to this component before acting, which keeps
   * the listener safe even if the rendered list is replaced mid-click. Removing
   * an in-progress upload simply drops its card; the placeholder upload is left
   * to settle on its own since there is no real request to cancel yet.
   *
   * @param event - Click from anywhere inside the component.
   */
  @HostListener({ event: "click" })
  removeSelectedFile(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-project-file-remove]");
    if (!button || !this.contains(button)) {
      return;
    }

    const id = button.dataset.projectFileRemove;
    this.attachments = this.attachments.filter((attachment) => attachment.id !== id);
    this.updateHTML();
    this.publishAttachments();
  }

  /**
   * Parses the carried-over attribute, discarding anything that is not a usable attachment list.
   *
   * Tolerates both malformed JSON and a valid value that is not an array, returning
   * an empty list in either case so a corrupted attribute can never throw during
   * connect and break the whole intake. The shell is responsible for the shape of
   * each entry; this method only checks the outer container, trusting
   * {@link PricingStartProjectAttachment} to be authored correctly upstream.
   */
  private parseInitialAttachments(serialised: string): PricingStartProjectAttachment[] {
    try {
      const parsed: unknown = JSON.parse(serialised);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Creates the pending record shown immediately, before the placeholder upload resolves.
   *
   * The record carries a fresh `crypto.randomUUID` so remove buttons and status
   * updates can target this exact file even if the visitor selects two files
   * with the same name. `status` starts as `pending` so the card renders before
   * any network work begins; {@link uploadAttachment} flips it to `uploading`
   * once the placeholder handoff starts.
   */
  private createPendingAttachment(file: File): PricingStartProjectAttachment {
    return {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      status: "pending",
    };
  }

  /**
   * Runs one attachment through the temporary-access handoff and marks it uploaded.
   *
   * This is the upload step of the selection flow started by
   * {@link addSelectedFiles}. The card is moved to `uploading` before any await
   * so the visitor sees progress, then the placeholder credential request and
   * direct-to-bucket PUT run in sequence. On success the card is marked
   * `uploaded` and the storage `key` is recorded so the prepared email can later
   * reference the persisted object; on any failure the card is marked `error`
   * and left in place so the visitor can retry by removing and re-selecting.
   *
   * Both steps are placeholders until the backend and storage bucket exist:
   * {@link requestTemporaryUploadAccess} stands in for the scoped-credential
   * request and {@link uploadToTemporaryBucket} stands in for the
   * direct-to-bucket upload it would authorize.
   *
   * @param file - Native file selected by the visitor.
   * @param id   - Identity of the pending attachment record to update as the upload progresses.
   */
  private async uploadAttachment(file: File, id: string): Promise<void> {
    this.setAttachmentStatus(id, "uploading");

    try {
      const access = await this.requestTemporaryUploadAccess(file);
      await this.uploadToTemporaryBucket(file, access);
      this.setAttachmentStatus(id, "uploaded", access.key);
    } catch {
      this.setAttachmentStatus(id, "error");
    }
  }

  /**
   * Placeholder for the backend request that will grant scoped, temporary S3 write access.
   *
   * In the real flow this would ask the backend for a short-lived credential (or
   * a pre-signed PUT URL) scoped to a single object key, so the browser can upload
   * directly to the bucket without the backend handling the file body. Here it
   * returns a synthetic target derived from the file name so
   * {@link uploadToTemporaryBucket} has a stable `key` to record against the
   * attachment. The URL deliberately uses the `.invalid` TLD so the placeholder
   * can never be mistaken for a real endpoint.
   *
   * TODO: replace with a real request once the backend exposes a
   * temporary-credential endpoint.
   *
   * @param file - File awaiting upload; only its name informs the dummy key returned here.
   * @returns Synthetic upload target consumed by {@link uploadToTemporaryBucket}.
   */
  private async requestTemporaryUploadAccess(file: File): Promise<{ url: string; key: string }> {
    return { url: `https://temp-uploads.example.invalid/${encodeURIComponent(file.name)}`, key: `temp/${file.name}` };
  }

  /**
   * Placeholder for the direct-to-bucket upload that the temporary access above would authorize.
   *
   * In the real flow this would PUT `file` to `access.url` using the scoped
   * credential from {@link requestTemporaryUploadAccess}, so the file body never
   * transits the backend. Here it resolves immediately without touching the
   * network; the arguments are voided only to keep the signature honest for the
   * future implementation. Keeping this as a no-op lets the surrounding flow
   * (status transitions, `key` recording, error handling) be exercised end-to-end
   * before storage is wired in.
   *
   * TODO: replace with a real upload to the temporary S3 bucket once storage
   * access is wired in.
   *
   * @param file   - File to send to temporary storage.
   * @param access - Synthetic upload target returned by {@link requestTemporaryUploadAccess}.
   */
  private async uploadToTemporaryBucket(file: File, access: { url: string; key: string }): Promise<void> {
    void file;
    void access;
  }

  /**
   * Updates one attachment's status in place and republishes the current list.
   *
   * Called from {@link uploadAttachment} at each transition (`uploading`,
   * `uploaded`, `error`). The attachment list is replaced with a mapped copy so
   * the rendered snapshot and the published event always agree, then the view is
   * re-rendered and {@link PRICING_START_PROJECT_FILES_EVENT} is fired so the
   * shell's retained brief reflects the new status — including the storage `key`
   * once an upload resolves, which the prepared email needs to reference the
   * persisted object.
   *
   * @param id     - Identity of the attachment record to update.
   * @param status - New status for the attachment.
   * @param key    - Storage key recorded on the attachment once the upload resolves; omitted otherwise.
   */
  private setAttachmentStatus(id: string, status: PricingStartProjectAttachmentStatus, key?: string): void {
    this.attachments = this.attachments.map((attachment) =>
      attachment.id === id ? { ...attachment, status, key: key ?? attachment.key } : attachment);
    this.updateHTML();
    this.publishAttachments();
  }

  /**
   * Publishes the current attachment list so the shell can update its retained brief.
   *
   * Fired after every change — selection, removal, and each status transition —
   * so the shell's retained brief and the prepared email stay in lockstep with
   * the local list. The payload is a shallow copy of {@link attachments} so later
   * mutations in this component can never reach the shell's snapshot by
   * reference. Publishing is async and intentionally not awaited: the shell's
   * update is a side effect of the local render, not a step this component blocks on.
   */
  private publishAttachments(): void {
    void this.publisher.publishAsync({
      name: PRICING_START_PROJECT_FILES_EVENT,
      data: { files: [...this.attachments] } satisfies PricingStartProjectFilesChange,
    });
  }

  /**
   * Formats attachment bytes as the compact label shown beside each selected file.
   *
   * Used only for display, so the thresholds are tuned for readability rather
   * than precision: bytes under a KiB are shown whole, up to a MiB is rounded to
   * the nearest KiB, and anything larger is shown with one decimal place in MiB.
   * The thresholds match the picker's 20 MiB ceiling, so a visitor never sees a
   * unit larger than MB on this surface.
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
   * Resolves the reader-facing label for one attachment's current upload status.
   *
   * Statuses are stored as short codes (`pending`, `uploading`, `uploaded`,
   * `error`) for cheap comparison and stable event payloads; this method maps
   * each code to the authored string in {@link pricingContent} so the rendered
   * card speaks the visitor's language and the labels stay editable in one place.
   */
  private statusLabel(status: PricingStartProjectAttachmentStatus): string {
    return pricingContent.startProject.form.attachmentStatus[status];
  }

  /**
   * Renders the picker and the locally owned list of selected attachments.
   *
   * The picker is a labelled native `<input type="file" multiple>` so the visitor
   * gets the platform file dialog and keyboard access for free. Below it, the
   * current list is rendered into an `aria-live="polite"` region so screen-reader
   * users hear selection and status changes without moving focus. When the list
   * is empty the same region shows the authored "no attachments" prompt, so the
   * live region never goes silent. Each card shows the file name, a
   * human-readable size and status, and a remove button whose `aria-label`
   * includes the file name so the action is unambiguous out of context.
   */
  render() {
    const form = pricingContent.startProject.form;

    return html`
      <label class="pricing-project-file-input">
        ${form.attachmentsLabel} <small>${form.attachmentsHint}</small>
        <input data-project-files type="file" multiple>
        <span>${form.attachmentsPrompt}</span>
      </label>
      ${when(this.attachments.length > 0, html`
        <ul class="pricing-project-files" aria-live="polite">
          ${this.attachments.map((attachment) => html`
            <li class="pricing-project-file ${attachment.status === "error" ? "is-error" : ""}">
              <span class="pricing-project-file-name">${attachment.name}</span>
              <span class="pricing-project-file-meta">${this.formatSize(attachment.size)} · ${this.statusLabel(attachment.status)}</span>
              <button
                class="pricing-project-file-remove"
                type="button"
                data-project-file-remove="${attachment.id}"
                aria-label="${form.removeAttachmentLabel} ${attachment.name}"
              >×</button>
            </li>
          `)}
        </ul>
      `, html`
        <p class="pricing-project-files" aria-live="polite">${form.noAttachments}</p>
      `)}
    `;
  }
}
