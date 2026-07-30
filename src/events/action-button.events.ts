/**
 * Published by an `action-button` when native form validity passes and the visitor starts work.
 *
 * {@link ActionButtonDispatcher} consumes this request, finds the matching feature handler by
 * `action`, and later publishes {@link ACTION_BUTTON_RESOLVE_EVENT} or
 * {@link ACTION_BUTTON_REJECT_EVENT} for the same `id`.
 */
export const ACTION_BUTTON_TRIGGER_EVENT = "action:trigger" as const;

/** Published by the dispatcher after the registered handler completes before its timeout; only the matching renderer settles. */
export const ACTION_BUTTON_RESOLVE_EVENT = "action:resolve" as const;

/** Published by the dispatcher when a handler throws, no handler is registered, or the 12-second request window expires. */
export const ACTION_BUTTON_REJECT_EVENT = "action:reject" as const;

/** Published by a feature after an availability prerequisite changes so its idle action buttons can recalculate disabled state. */
export const ACTION_BUTTON_REFRESH_EVENT = "action:refresh" as const;

/**
 * The supported visual tones for asynchronous actions.
 *
 * Variants change color treatment only. Geometry and the `idle` → `pending` → terminal state
 * contract stay identical so a tone never changes the meaning of completion or failure.
 */
export type ActionButtonVariant = "accent" | "ink" | "ghost" | "danger";

/**
 * The rendering states consumed only by the reusable action button.
 *
 * A feature does not set this state directly: the dispatcher drives it through application
 * events, and terminal states return to `idle` after their accessible settle window.
 */
export type ActionButtonState = "idle" | "pending" | "success" | "error";

/**
 * Values captured from the action button's closest form when work begins.
 *
 * The UI only transports the values; every registered handler must validate the fields it
 * consumes because payloads are a browser boundary rather than trusted application state.
 */
export type ActionButtonPayload = Record<string, FormDataEntryValue>;

/**
 * Request emitted at the boundary between the generic renderer and feature-owned async work.
 *
 * The button creates this from its configured action, standard host `id`, and current form
 * entries. The dispatcher reads it; feature handlers receive only `payload` after lookup.
 */
export type ActionButtonTrigger = {
  /** Stable handler name, such as `subscription.submit`. */
  action: string;
  /** Unique button identity used to settle only the initiating renderer. */
  id: string;
  /** Form values captured at the interaction boundary; the handler validates them again. */
  payload: ActionButtonPayload;
};

/**
 * Terminal lifecycle message emitted after a named request resolves or rejects.
 *
 * The ID lets every mounted action button receive the shared event while only the initiating
 * renderer changes state.
 */
export type ActionButtonSettlement = {
  /** Unique identifier from the original trigger. */
  id: string;
};

/**
 * Targeted availability refresh sent when a feature-owned prerequisite changes.
 *
 * Supplying a guard name avoids re-rendering unrelated idle action buttons; omitting it is a
 * deliberate broad refresh for a shared prerequisite.
 */
export type ActionButtonRefresh = {
  /** Guard name to refresh; omit to refresh every idle action button. */
  guard?: string;
};
