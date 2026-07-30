import {defineEventHandler, HTTPError, readValidatedBody} from "nitro/h3";

/**
 * Validated JSON contract for the temporary blog subscription endpoint.
 *
 * The browser sends this shape from `blog-subscription`. Validation converts the
 * untrusted request body into this value before the route logs its safe summary.
 */
type SubscriptionRequest = {
  /** Trimmed subscriber email used only to confirm that the form sent a value. */
  email: string;
  /** Stable client location that identifies the blog-index subscription form. */
  source: "blog_index";
};

/**
 * Narrows the parsed JSON request body to the subscription contract.
 *
 * `readValidatedBody` calls this before the route handler receives data. JSON can
 * contain any value at runtime, so the checks remain necessary even though the
 * returned value has the stronger {@link SubscriptionRequest} TypeScript type.
 *
 * @param body - JSON value parsed from the incoming HTTP request.
 * @returns The normalized subscription request when its required fields are valid.
 * @throws HTTPError with status 400 when the payload is missing or malformed.
 */
const parseSubscriptionRequest = (body: unknown): SubscriptionRequest => {
  if (!body || typeof body !== "object") {
    throw new HTTPError({status: 400, statusText: "Bad Request", message: "Subscription request must be an object."});
  }

  const {email, source} = body as Record<string, unknown>;
  if (typeof email !== "string" || !email.trim() || source !== "blog_index") {
    throw new HTTPError({status: 400, statusText: "Bad Request", message: "Subscription request fields are invalid."});
  }

  return {email: email.trim(), source};
};

/**
 * Receives the blog subscription form while the subscription system is still a placeholder.
 *
 * The handler deliberately does not persist data or send email. It confirms that the
 * same-origin client request reaches Nitro, then writes only the stable source and an
 * email-present flag to the server log. Keeping the raw email out of logs makes this
 * safe to retain until a real subscription provider and data-handling policy exist.
 */
export default defineEventHandler(async (event) => {
  const request = await readValidatedBody(event, parseSubscriptionRequest);
  console.info("Subscription request received", {source: request.source, hasEmail: Boolean(request.email)});
  return {accepted: true};
});
