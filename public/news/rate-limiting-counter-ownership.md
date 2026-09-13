# Rate limiting belongs at the edge, but the counter belongs to you

CloudFront and an API gateway can reject obvious floods before they consume application capacity. That is exactly where coarse IP, path, and request-rate limits belong.

The trouble starts when the limit depends on what a signed-in person is allowed to do: plan quota, resource ownership, a verified email, or a workflow state. Encoding those rules at the edge duplicates application policy in a place with less context and a different deployment cycle.

## Split the responsibilities

Let the edge absorb anonymous abuse and cap broad traffic shapes. Let the application own the counter whose key includes domain identity and whose result changes a business action. Store that counter somewhere with an atomic increment and an expiry that matches the rule, then return a response that explains which limit was reached.

This is not an argument for moving every throttle into a service. It is an argument for placing each decision where its inputs already live. A gateway can count requests. The application can decide whether the fifth request is permitted. Those are related controls, but they are not the same policy.
