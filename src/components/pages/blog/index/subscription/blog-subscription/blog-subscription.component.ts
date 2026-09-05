import {ApplicationEventService, BaseElement, BindEvent, Component, HTML} from "@ayu-sh-kr/dota-wrap/core";
import {OnEvent} from "@ayu-sh-kr/dota-wrap/event";
import {blogIndexContent} from "@app/data/blog-content.ts";
import {ACTION_BUTTON_REFRESH_EVENT, ACTION_BUTTON_TRIGGER_EVENT, type ActionButtonPayload, type ActionButtonTrigger} from "@app/events/action-button.events.ts";
import {actionButtonRegistry} from "@app/service/action-button-registry.service.ts";
import {SubscriptionService} from "@app/service/subscription.service.ts";
import {publishAnalyticsEvent} from "@app/utils/analytics.utils.ts";

/**
 * Presents the blog's low-volume email subscription prompt.
 *
 * It appears at the end of the blog index and owns only subscription-specific concerns:
 * the browser's email validity and the subscription initiation request.
 *
 * Selector: `blog-subscription`.
 */
@Component({
  selector: "blog-subscription",
  shadow: false,
})
export class BlogSubscriptionComponent extends BaseElement {
  private readonly subscriptionService = new SubscriptionService();

  /**
   * Publishes action-button events for keyboard submits and validity refreshes.
   *
   * The form owns email semantics, while the shared action button owns its
   * pending/success/error presentation; this publisher is the bridge between
   * those two responsibilities.
   */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();

  /**
   * Holds the registry cleanup returned for this form's submit action.
   *
   * Disconnect invokes it before a later blog route can register a new element,
   * preventing an old component instance from handling current submissions.
   */
  private removeHandler: (() => void) | null = null;

  /**
   * Holds the registry cleanup returned for this form's validity guard.
   *
   * The guard is scoped by name, so leaving it registered would let a detached
   * form block or enable another blog subscription form.
   */
  private removeGuard: (() => void) | null = null;

  constructor() {
    super();
  }

  /**
   * Registers the submit handler and browser-validity guard after connection.
   *
   * Registration must happen after the element enters the route so the action
   * registry points at this instance; the final refresh makes the button reflect
   * the mounted input immediately.
   */
  @OnEvent("connected", true)
  onConnected(): void {
    this.removeHandler = actionButtonRegistry.registerHandler("subscription.submit", (payload) => this.initiateSubscription(payload));
    this.removeGuard = actionButtonRegistry.registerGuard("blog-subscription", () => this.isEmailValid());
    this.refreshActionButton();
  }

  /**
   * Releases the action and guard registrations when this route instance leaves.
   *
   * Both cleanup callbacks are cleared after invocation, making repeated
   * disconnect notifications harmless and leaving no stale registry ownership.
   */
  @OnEvent("disconnected", true)
  onDisconnected(): void {
    this.removeHandler?.();
    this.removeHandler = null;
    this.removeGuard?.();
    this.removeGuard = null;
  }

  /**
   * Requests a scoped action-button validity refresh after form input.
   *
   * It publishes only the blog guard name, so other action buttons do not
   * recalculate or change state in response to this field.
   */
  @BindEvent({event: "input", id: ".blog-subscribe-form"})
  refreshActionButton(): void {
    void this.publisher.publishAsync({name: ACTION_BUTTON_REFRESH_EVENT, data: {guard: "blog-subscription"}});
  }

  /**
   * Converts native form submission into the shared action trigger.
   *
   * Native validation runs first; a valid form contributes its `FormData` to the
   * registry action, leaving click behavior and result presentation centralized
   * in `action-button`.
   */
  @BindEvent({event: "submit", id: ".blog-subscribe-form"})
  submitSubscription(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.target instanceof HTMLFormElement
      ? event.target
      : this.querySelector<HTMLFormElement>(".blog-subscribe-form");
    if (!form || !form.reportValidity()) {
      return;
    }

    void this.publisher.publishAsync({
      name: ACTION_BUTTON_TRIGGER_EVENT,
      data: {
        action: "subscription.submit",
        id: "blog-subscription-submit",
        payload: Object.fromEntries(new FormData(form).entries()),
      } satisfies ActionButtonTrigger,
    });
  }

  /**
   * Starts the backend verification flow for the submitted email address.
   *
   * The action-button registry calls this handler after the local browser
   * validity guard passes. A pending response is the successful hand-off to the
   * email verification route; non-2xx responses and unexpected states fail the
   * action-button flow.
   *
   * @param payload - Form values supplied by the registered action.
   * @throws Error when the email is absent or the backend does not return `PENDING`.
   */
  private async initiateSubscription(payload: ActionButtonPayload): Promise<void> {
    if (typeof payload.email !== "string") {
      throw new Error("Subscription email is missing.");
    }

    await this.subscriptionService.initiate(payload.email);
    publishAnalyticsEvent({
      eventName: "subscribe",
      params: {form_name: "blog_subscription"},
    });
  }

  /**
   * Reads the mounted email control's native validity for the registry guard.
   *
   * Returning false when the input is absent keeps a partially mounted form
   * closed to submission until the browser control exists and is valid.
   */
  private isEmailValid(): boolean {
    const email = this.querySelector<HTMLInputElement>("#blog-email");
    return email?.validity.valid ?? false;
  }

  /**
   * Renders the authored subscription prompt and its browser-validatable form.
   *
   * The template exposes the field and action metadata consumed by the shared
   * button; loading and request state are updated by the registry handler rather
   * than by render-time side effects.
   */
  render(): string {
    return HTML`
      <section class="blog-subscribe" aria-label="${blogIndexContent.subscription.ariaLabel}">
        <div class="blog-container blog-subscribe-inner">
          <div><p class="blog-subscribe-title">${blogIndexContent.subscription.title}</p><p class="blog-subscribe-copy">${blogIndexContent.subscription.copy}</p></div>
          <div>
            <form class="blog-subscribe-form">
              <label class="sr-only" for="blog-email">${blogIndexContent.subscription.emailLabel}</label>
              <div class="blog-subscribe-controls">
                <input class="form-control input-md input-round input-bordered" id="blog-email" name="email" type="email" placeholder="${blogIndexContent.subscription.emailPlaceholder}" autocomplete="email" aria-describedby="blog-email-hint" required />
                <action-button id="blog-subscription-submit" action="subscription.submit" guard="blog-subscription" variant="ink" label="${blogIndexContent.subscription.submitLabel}" busy-label="${blogIndexContent.subscription.submittingLabel}" done-label="${blogIndexContent.subscription.successLabel}" fail-label="${blogIndexContent.subscription.errorLabel}"></action-button>
              </div>
              <p id="blog-email-hint" class="blog-subscribe-hint">${blogIndexContent.subscription.emailHint}</p>
            </form>
          </div>
        </div>
      </section>
    `;
  }
}
