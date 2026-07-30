import { ApplicationEventService } from "@ayu-sh-kr/dota-wrap/core";
import { AutoBind, OnEvent, type ApplicationEvent } from "@ayu-sh-kr/dota-wrap/event";
import {
  ACTION_BUTTON_REJECT_EVENT,
  ACTION_BUTTON_RESOLVE_EVENT,
  ACTION_BUTTON_TRIGGER_EVENT,
  type ActionButtonSettlement,
} from "@app/events/action-button.events.ts";
import { actionButtonRegistry } from "@app/service/action-button-registry.service.ts";

/**
 * Runs named action handlers and reports their lifecycle over the application event bus.
 *
 * Created once during application bootstrap after the Dota listener registry is available.
 * It is the only layer that knows the pending timeout and duplicate-request rule. Buttons only
 * render events, while route components only register work in `actionButtonRegistry`; that
 * separation prevents a visual component from becoming a second API client.
 */
@AutoBind()
export class ActionButtonDispatcher {
  /** Emits terminal events after this service has decided the outcome of a registered request. */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();

  /** Unique button IDs currently awaiting handler completion; this makes repeat triggers harmless. */
  private readonly activeButtonIds = new Set<string>();

  /** Maximum time an action may remain pending before the button receives a failure state. */
  private readonly timeoutMs = 12_000;

  /**
   * Dispatches a button trigger to the registered feature handler exactly once per button ID.
   *
   * A duplicate trigger is ignored while the ID is active. A timeout settles first when work
   * outlives the contract, and late completion is then deliberately ignored. Missing handlers
   * reject immediately, making registration mistakes visible to the initiating renderer.
   *
   * @param event - Typed request from an action button, including its handler name, settlement ID, and form values.
   */
  @OnEvent(ACTION_BUTTON_TRIGGER_EVENT)
  async dispatch(event: ApplicationEvent<typeof ACTION_BUTTON_TRIGGER_EVENT>): Promise<void> {
    const { action, id, payload } = event.data;
    if (this.activeButtonIds.has(id)) {
      return;
    }

    const handler = actionButtonRegistry.getHandler(action);
    if (!handler) {
      this.reject(id);
      return;
    }

    this.activeButtonIds.add(id);
    const timeout = window.setTimeout(() => {
      if (this.activeButtonIds.delete(id)) {
        this.reject(id);
      }
    }, this.timeoutMs);

    try {
      await handler(payload);
      if (this.activeButtonIds.delete(id)) {
        this.resolve(id);
      }
    } catch {
      if (this.activeButtonIds.delete(id)) {
        this.reject(id);
      }
    } finally {
      window.clearTimeout(timeout);
    }
  }

  /**
   * Publishes the success settlement after this service wins the active-ID race.
   *
   * @param id - Initiating host ID; mounted buttons use it to decide whether they should settle.
   */
  private resolve(id: string): void {
    void this.publisher.publishAsync({ name: ACTION_BUTTON_RESOLVE_EVENT, data: { id } satisfies ActionButtonSettlement });
  }

  /**
   * Publishes the failure settlement after a handler error, missing registration, or timeout.
   *
   * @param id - Initiating host ID; mounted buttons use it to decide whether they should offer recovery.
   */
  private reject(id: string): void {
    void this.publisher.publishAsync({ name: ACTION_BUTTON_REJECT_EVENT, data: { id } satisfies ActionButtonSettlement });
  }
}
