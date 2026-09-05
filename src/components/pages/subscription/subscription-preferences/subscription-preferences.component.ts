import { BaseElement, BindEvent, Component, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { html, when } from "@ayu-sh-kr/dota-wrap/rendering";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { subscriptionPreferencesContent as content } from "@app/data/subscription-preferences-content.ts";
import { SubscriptionService, type SubscriptionPreference, type SubscriptionPreferenceType } from "@app/service/subscription.service.ts";
import { markSubscriptionNoIndex, readSubscriptionToken } from "@app/utils/subscription-route.utils.ts";

/**
 * UI identifiers for the three preference buttons.
 *
 * The component uses these keys for draft state and maps them through
 * `STREAM_TYPES` only at the service boundary, keeping backend names out of the
 * rendered controls.
 */
type StreamKey = "blog" | "letter" | "other";

/**
 * Visible lifecycle shared by save and replacement-link actions.
 *
 * `pending` disables the active control; terminal states provide feedback until
 * the next edit or action resets the state to `idle`.
 */
type ActionState = "idle" | "pending" | "success" | "error";

/**
 * Render states for the token-linked preference document.
 *
 * Loading is shown before the request resolves, ready owns the editable draft,
 * and invalid owns the recovery form when the token cannot be used.
 */
type PageState = "ready" | "invalid" | "loading";

/**
 * One complete preference snapshot used for saved and draft values.
 *
 * The service produces the initial saved snapshot, while the UI mutates only a
 * cloned draft; this separation lets discard and before-unload checks compare
 * against the last confirmed server state.
 */
interface SubscriptionSnapshot {
  /**
   * Enabled state for each UI stream key before backend-name translation.
   *
   * These booleans drive `aria-pressed` and are compared with the saved record
   * to determine which update requests the service must send.
   */
  streams: Record<StreamKey, boolean>;
  /**
   * Address currently displayed by the delivery field.
   *
   * It may be the confirmed address or the pending address copied into the draft
   * while the user is deciding whether to save.
   */
  email: string;
  /**
   * Backend-reported address that still requires confirmation, or null.
   *
   * This value allows the editor to distinguish an accepted pending address
   * from an unsupported direct address change.
   */
  pendingEmail: string | null;
}

const STREAM_TYPES: Record<StreamKey, SubscriptionPreferenceType> = { blog: "BLOG", letter: "NEWS_LETTER", other: "SHOWCASE" };
const STREAM_KEYS: Record<SubscriptionPreferenceType, StreamKey> = { BLOG: "blog", NEWS_LETTER: "letter", SHOWCASE: "other" };

/**
 * Renders the token-linked newsletter preferences screen and its draft state.
 *
 * The route loads the saved streams once from the token, edits a separate draft,
 * and sends only changed streams on save. Reissue and save feedback reflects
 * the result of their backend requests.
 *
 * Selector: `subscription-preference`.
 */
@Component({ selector: "subscription-preference", shadow: false })
export class SubscriptionPreferenceComponent extends BaseElement {
  private pageState: PageState = "loading";
  private saved: SubscriptionSnapshot = this.createSnapshot();
  private draft: SubscriptionSnapshot = this.createSnapshot();
  private actionState: ActionState = "idle";
  private reissueEmail = "";
  private reissueSent = false;
  private errorMessage = "";
  private token = "";
  private preferences: readonly SubscriptionPreference[] = [];
  private readonly subscriptionService = new SubscriptionService();

  constructor() {
    super();
  }

  /**
   * Loads the token-linked preferences after the component connects.
   *
   * The loading render happens before the request. A successful response becomes
   * the saved snapshot and a cloned draft; missing or failed tokens switch to
   * the recovery view after the service rejects.
   */
  @OnEvent("connected", true)
  async connected(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    this.token = readSubscriptionToken(params);
    markSubscriptionNoIndex();
    this.updateHTML();
    if (!this.token) {
      this.pageState = "invalid";
      this.updateHTML();
      return;
    }

    try {
      const subscriber = await this.subscriptionService.loadPreferences(this.token);
      this.saved = this.createSnapshot(subscriber.email, subscriber.preferences);
      this.draft = this.cloneSnapshot(this.saved);
      this.preferences = subscriber.preferences;
      this.pageState = "ready";
    } catch {
      this.pageState = "invalid";
      this.errorMessage = content.genericError;
    }
    this.updateHTML();
  }

  /**
   * Blocks unload only while the draft contains unsaved stream or address edits.
   *
   * The comparison is against the last saved snapshot, so a clean form leaves
   * browser navigation untouched.
   */
  @WindowListener({ event: "beforeunload" })
  protectUnsavedChanges(event: BeforeUnloadEvent): void {
    if (!this.diff()) return;
    event.preventDefault();
    event.returnValue = "";
  }

  /**
   * Toggles the stream button that received the click.
   *
   * Dataset values are checked against the draft record before indexing, then
   * the changed draft is rendered so its pressed state and dirty summary update.
   */
  @BindEvent({ event: "click", id: "[data-stream]" })
  toggleStream(event: Event): void {
    const key = (event.target as HTMLElement).closest<HTMLElement>("[data-stream]")?.dataset.stream;
    if (!key || !(key in this.draft.streams)) return;
    const stream = key as StreamKey;
    this.draft.streams[stream] = !this.draft.streams[stream];
    this.actionState = "idle";
    this.errorMessage = "";
    this.updateHTML();
  }

  /**
   * Copies the edited delivery address into the draft and clears old feedback.
   *
   * Resetting the action state on input ensures a prior success or failure never
   * describes a newer address.
   */
  @BindEvent({ event: "input", id: "#subscription-email" })
  updateEmail(event: Event): void {
    this.draft.email = (event.target as HTMLInputElement).value.trim();
    this.errorMessage = "";
    this.actionState = "idle";
    this.updateHTML();
  }

  /**
   * Saves only changed streams after checking the address invariant.
   *
   * Each changed UI key is translated to its backend category and updated in
   * parallel; only after all requests resolve does the saved snapshot advance.
   */
  @BindEvent({ event: "click", id: "#save-preferences" })
  savePreferences(): void {
    if (this.actionState === "pending" || !this.diff()) return;
    void this.runAction(async () => {
      if (this.draft.email !== this.saved.email && this.draft.email !== this.saved.pendingEmail) {
        throw new Error("Address changes are not available from this link yet. Nothing was changed.");
      }
      const changedStreams = Object.keys(this.draft.streams).filter((key) => {
        const stream = key as StreamKey;
        return this.draft.streams[stream] !== this.saved.streams[stream];
      }) as StreamKey[];
      await Promise.all(changedStreams.map((stream) => this.subscriptionService.updatePreference(this.token, STREAM_TYPES[stream], this.draft.streams[stream])));
      this.saved = { streams: { ...this.draft.streams }, email: this.saved.email, pendingEmail: null };
      this.draft = this.cloneSnapshot(this.saved);
    });
  }

  /**
   * Replaces the draft with a deep-enough copy of the last saved snapshot.
   *
   * This is the local discard path: it does not contact the service and clears
   * feedback before rendering the restored controls.
   */
  @BindEvent({ event: "click", id: "#discard-preferences" })
  discardChanges(): void {
    this.draft = this.cloneSnapshot(this.saved);
    this.actionState = "idle";
    this.errorMessage = "";
    this.updateHTML();
  }

  /**
   * Starts the replacement-link action when its address passes validation.
   *
   * The backend action keeps the same feedback lifecycle as saving and records
   * the normalized address only after the request succeeds.
   */
  @BindEvent({ event: "click", id: "#reissue-link" })
  sendFreshLink(): void {
    if (!this.isValidEmail() || this.actionState === "pending") return;
    void this.runAction(async () => {
      await this.subscriptionService.initiate(this.reissueEmail.trim());
      this.reissueSent = true;
      this.reissueEmail = this.reissueEmail.trim();
    });
  }

  /**
   * Tracks replacement-link input and clears its previous result.
   *
   * A changed address returns the control to idle so its next submission is not
   * confused with the address that produced the earlier message.
   */
  @BindEvent({ event: "input", id: "#reissue-email" })
  updateReissueEmail(event: Event): void {
    this.reissueEmail = (event.target as HTMLInputElement).value;
    this.reissueSent = false;
    this.actionState = "idle";
    this.errorMessage = "";
    this.updateHTML();
  }

  /**
   * Creates a complete snapshot from the backend email and preference records.
   *
   * Each returned `opted` value maps directly to its matching UI stream. An
   * empty address still falls back to the local recovery address.
   */
  private createSnapshot(email: string | undefined = content.common.defaultEmail, preferences?: readonly SubscriptionPreference[]): SubscriptionSnapshot {
    const selected = new Map(preferences?.map(({ type, opted }) => [type, opted]));
    return {
      streams: {
        blog: selected.get("BLOG") ?? false,
        letter: selected.get("NEWS_LETTER") ?? false,
        other: selected.get("SHOWCASE") ?? false,
      },
      email: email || content.common.defaultEmail,
      pendingEmail: null,
    };
  }

  /**
   * Clones both the stream record and address fields for a new draft.
   *
   * The stream spread is essential: mutating a draft must not silently mutate
   * `saved`, which is the source for discard and unload protection.
   */
  private cloneSnapshot(snapshot: SubscriptionSnapshot): SubscriptionSnapshot {
    return { streams: { ...snapshot.streams }, email: snapshot.pendingEmail || snapshot.email, pendingEmail: snapshot.pendingEmail };
  }

  /**
   * Counts changed stream and address fields in the editable draft.
   *
   * Callers use zero as the clean-state signal and the positive count to explain
   * how much unsaved work will be sent by the save action.
   */
  private diff(): number {
    let changes = Object.keys(this.draft.streams).filter((key) => {
      const stream = key as StreamKey;
      return this.draft.streams[stream] !== this.saved.streams[stream];
    }).length;
    if (this.draft.email !== this.saved.email && this.draft.email !== this.saved.pendingEmail) changes += 1;
    return changes;
  }

  /**
   * Applies the component's lightweight replacement-email check.
   *
   * It is used by both the event guard and invalid-state render so the button's
   * disabled state matches the condition enforced when the action is clicked.
   */
  private isValidEmail(): boolean {
    return /\S+@\S+\.\S+/.test(this.reissueEmail.trim());
  }

  /**
   * Runs an API action and maps its result to visible feedback.
   *
   * The pending state renders before the request begins. Its resolved or
   * rejected result becomes recoverable feedback without any simulated delay.
   */
  private async runAction(onSuccess: () => void | Promise<void>): Promise<void> {
    this.actionState = "pending";
    this.errorMessage = "";
    this.updateHTML();
    try {
      await onSuccess();
      this.actionState = "success";
    } catch (error) {
      this.actionState = "error";
      this.errorMessage = error instanceof Error ? error.message : content.genericError;
    }
    this.updateHTML();
  }

  /**
   * Builds the save control from the current action lifecycle state.
   *
   * Labels and glyphs stay aligned with the shared action vocabulary, and only
   * the pending state disables the control before the next edit resets it.
   */
  private renderActionButton() {
    const labels = { idle: content.ready.saveLabel, pending: content.ready.saveBusy, success: content.ready.saveDone, error: content.ready.saveFail };
    const glyph = this.actionState === "pending"
      ? html`<span class="subscription-spinner" aria-hidden="true"></span>`
      : this.actionState === "success"
        ? html`<span class="subscription-glyph" aria-hidden="true">✓</span>`
        : this.actionState === "error"
          ? html`<span class="subscription-glyph" aria-hidden="true">×</span>`
          : "";
    return this.actionState === "pending"
      ? html`<button class="subscription-act" id="save-preferences" type="button" data-state="${this.actionState}" disabled>${glyph}<span>${labels[this.actionState]}</span></button>`
      : html`<button class="subscription-act" id="save-preferences" type="button" data-state="${this.actionState}">${glyph}<span>${labels[this.actionState]}</span></button>`;
  }

  /**
   * Renders the shared preference page chrome and selects its body state.
   *
   * This method is pure: token loading, service calls, and action timers all
   * happen in handlers, while this method reads only current component state.
   */
  render() {
    const common = content.common;
    const hero = content.hero;
    const body = this.pageState === "ready"
      ? this.renderReady()
      : this.pageState === "invalid"
        ? this.renderInvalid()
        : html`<section class="layout-content layout-section-flush layout-section subscription-section"><div class="subscription-card"><p class="subscription-meta">${content.loading}</p></div></section>`;
    return html`
      <main class="subscription-page">
        <section class="layout-content layout-section-hero subscription-hero">
          <div class="layout-stack-lg layout-measure">
            <p class="type-eyebrow subscription-eyebrow">${common.eyebrow}</p>
            <h1 class="type-display subscription-hero-title">${hero.title}</h1>
            <p class="type-lede subscription-lead">${hero.intro}</p>
          </div>
        </section>
        ${body}
      </main>
    `;
  }

  /**
   * Renders the ready state with editable streams and delivery settings.
   *
   * Dirty-state messaging, save/discard controls, and exits are derived from the
   * saved-versus-draft comparison so the view reflects exactly what can change.
   */
  private renderReady() {
    const ready = content.ready;
    const dirty = this.diff() > 0;
    const anyOn = Object.values(this.draft.streams).some(Boolean);
    const changes = this.diff();
    const responseStreams = this.preferences.map((preference) => {
      const key = STREAM_KEYS[preference.type];
      const stream = ready.streams.find((item) => item.key === key)!;
      return { ...stream, label: preference.type, isOpted: this.draft.streams[key] };
    });
    const streams = responseStreams.map((stream) => html`<button type="button" class="form-choice input-sm input-round input-bordered subscription-opt" data-stream="${stream.key}" aria-pressed="${stream.isOpted}">${stream.label}</button>`);
    const glossary = responseStreams.map((stream) => html`<div><dt>${stream.label}</dt><dd>${stream.meaning}</dd></div>`);
    const exits = ready.exits.map(([label, description, href]) => html`<li><a href="${href}"><span>${label} <span class="subscription-arrow" aria-hidden="true">→</span></span><span>${description}</span></a></li>`);
    const dirtyNote = changes === 1 ? ready.oneChange : `${changes} ${ready.manyChanges}`;
    const confirmationNote = this.saved.pendingEmail && this.draft.email === this.saved.pendingEmail
      ? html`<p class="subscription-fieldnote">${ready.confirmationNote}</p>`
      : "";
    return html`<section class="layout-content layout-section-flush layout-section subscription-section"><div class="subscription-preferences-workspace"><div class="subscription-numbers"><p class="type-label">${ready.sinceLabel}</p><p class="type-price subscription-figure">${ready.since}</p><p class="type-label subscription-number-gap">${ready.sentLabel}</p><p class="type-price subscription-figure">${ready.sent}</p><p class="subscription-meta">${ready.trackingNote}</p></div><div class="subscription-card"><div class="subscription-group"><h2 class="type-subsection">${ready.arrivalsTitle}</h2><p class="subscription-why">${ready.arrivalsIntro}</p><div class="subscription-options" role="group" aria-label="${ready.arrivalsTitle}">${streams}</div><dl class="subscription-glossary">${glossary}</dl></div><div class="subscription-group"><h2 class="type-subsection">${ready.deliveryTitle}</h2><p class="subscription-why">${ready.deliveryIntro}</p><div class="subscription-field-row"><label class="visually-hidden" for="subscription-email">${ready.deliveryLabel}</label><input class="form-control input-md input-rounded-md input-bordered subscription-field" id="subscription-email" type="email" inputmode="email" autocomplete="email" value="${this.draft.email}" /></div>${confirmationNote}</div></div></div>${when(dirty, html`<div class="subscription-saverow"><div class="layout-row">${this.renderActionButton()}<button class="subscription-quiet" id="discard-preferences" type="button">${ready.discardLabel}</button><p class="subscription-dirty" role="status">${dirtyNote}</p></div>${when(!!this.errorMessage, html`<p class="subscription-error" role="alert">${this.errorMessage}</p>`)}${when(dirty && !anyOn, html`<p class="subscription-fieldnote">${ready.allOff} <a href="/subscription/unsubscribe">${ready.leaveLabel}</a> deletes it.</p>`)}</div>`)}<div class="subscription-exits"><ul>${exits}</ul></div></section>`;
  }

  /**
   * Renders recovery content for a missing or rejected token.
   *
   * The replacement form shares the action lifecycle but keeps its own address
   * and success message, allowing the visitor to recover without a valid token.
   */
  private renderInvalid() {
    const invalid = content.invalid;
    const label = this.actionState === "pending" ? invalid.sendBusy : this.actionState === "success" ? invalid.sendDone : this.actionState === "error" ? invalid.sendFail : invalid.sendLabel;
    const glyph = this.actionState === "pending" ? html`<span class="subscription-spinner" aria-hidden="true"></span>` : this.actionState === "success" ? html`<span class="subscription-glyph" aria-hidden="true">✓</span>` : this.actionState === "error" ? html`<span class="subscription-glyph" aria-hidden="true">×</span>` : "";
    const reissueButton = this.actionState === "pending" || !this.isValidEmail()
      ? html`<button class="subscription-act" id="reissue-link" type="button" data-state="${this.actionState}" disabled>${glyph}<span>${label}</span></button>`
      : html`<button class="subscription-act" id="reissue-link" type="button" data-state="${this.actionState}">${glyph}<span>${label}</span></button>`;
    return html`<section class="layout-content layout-section-flush layout-section subscription-section"><div class="subscription-card"><h2 class="type-subsection">${invalid.title}</h2><p class="subscription-meta">${invalid.body}</p><div class="subscription-field-row"><label class="visually-hidden" for="reissue-email">${invalid.emailLabel}</label><input class="form-control input-md input-rounded-md input-bordered subscription-field" id="reissue-email" type="email" inputmode="email" autocomplete="email" placeholder="${invalid.emailPlaceholder}" value="${this.reissueEmail}" />${reissueButton}</div>${when(!!this.errorMessage, html`<p class="subscription-error" role="alert">${this.errorMessage}</p>`)}${when(this.reissueSent, html`<p class="subscription-success" role="status">${invalid.success}</p>`)}</div></section>`;
  }
}
