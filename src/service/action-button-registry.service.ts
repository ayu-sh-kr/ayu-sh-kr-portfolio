import type { ActionButtonPayload } from "@app/events/action-button.events.ts";

/**
 * Feature-owned work registered for one named asynchronous action.
 *
 * A route component supplies this while connected. The dispatcher calls it after matching a
 * trigger's `action`; resolving reports success and throwing reports the common error state.
 * It receives untrusted form values and must validate every field it uses.
 *
 * @param payload - Current form values captured by the initiating action button.
 */
export type ActionButtonHandler = (payload: ActionButtonPayload) => Promise<void>;

/**
 * Feature-owned availability check for an idle action button.
 *
 * The renderer evaluates it on the first render and after its feature publishes an action refresh;
 * returning `false` maps directly to the native disabled state.
 */
export type ActionButtonGuard = () => boolean;

/**
 * Keeps action work and availability rules outside the reusable button renderer.
 *
 * Route components register work while connected and remove it while disconnected. The
 * dispatcher and button can therefore coordinate through stable names without either one
 * importing a page-specific component or endpoint.
 */
class ActionButtonRegistry {
  private readonly handlers = new Map<string, ActionButtonHandler>();
  private readonly guards = new Map<string, ActionButtonGuard>();

  /**
   * Registers the only handler for an action name and returns the teardown callback its route must call on disconnect.
   *
   * Duplicate names throw because the dispatcher cannot safely guess which feature should receive a trigger.
   *
   * @param action - Stable action identifier placed on one or more action-button elements.
   * @param handler - Async work that resolves for success and rejects for the shared error state.
   * @returns A cleanup callback that removes this exact action registration.
   * @throws Error when another connected feature already owns the action name.
   */
  registerHandler(action: string, handler: ActionButtonHandler): () => void {
    if (this.handlers.has(action)) {
      throw new Error(`An action handler is already registered for ${action}.`);
    }

    this.handlers.set(action, handler);
    return () => this.handlers.delete(action);
  }

  /**
   * Returns current feature work for the dispatcher without allowing it to know route components.
   *
   * @param action - Trigger action name to resolve.
   * @returns The connected feature handler, or `undefined` so the dispatcher can reject the trigger.
   */
  getHandler(action: string): ActionButtonHandler | undefined {
    return this.handlers.get(action);
  }

  /**
   * Registers one named prerequisite for idle action buttons and returns its route-teardown callback.
   *
   * @param guard - Stable guard name declared by an action-button's `guard` attribute.
   * @param predicate - Current availability check; it should read live feature state rather than cache a value.
   * @returns A cleanup callback that removes this exact guard registration.
   * @throws Error when another connected feature already owns the guard name.
   */
  registerGuard(guard: string, predicate: ActionButtonGuard): () => void {
    if (this.guards.has(guard)) {
      throw new Error(`An action guard is already registered for ${guard}.`);
    }

    this.guards.set(guard, predicate);
    return () => this.guards.delete(guard);
  }

  /**
   * Evaluates an action button's named availability prerequisite at render time.
   *
   * @param guard - Guard name declared by the renderer.
   * @returns `true` only for a registered predicate that currently passes; an unknown name remains safely unavailable.
   */
  passesGuard(guard: string): boolean {
    return this.guards.get(guard)?.() ?? false;
  }
}

/** Shared registry linking connected feature components to the bootstrap-created action dispatcher. */
export const actionButtonRegistry = new ActionButtonRegistry();
