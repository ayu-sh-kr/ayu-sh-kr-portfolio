# OpenAI, TypeSafe and Cloudflare bring decision models to AI agents

A support ticket arrives. Before an agent writes a reply, software may need to decide whether it is urgent, which team should handle it, or whether the next action needs approval. That small choice can trigger a full language-model response, even when the application only needs one of a few defined answers.

Several companies are now offering models built for that step. OpenAI announced its **Decisions API** at DevDay, TypeSafe AI introduced **Jev**, and Cloudflare has released **Clef** and **Clef-flash** as open-weight models. They share a narrower goal: read a piece of context and return a decision in a format software can use.

## From generated text to a defined choice

A general language model might answer, “This looks urgent because checkout is failing for every customer.” Useful to a person, but an application still has to extract the label and decide what to do if the response is malformed or uncertain.

A decision model instead receives the situation and a question with allowed answers. For example: “Is this urgent?” or “Which team should handle it: billing, technical, or sales?” It returns a yes/no probability or a choice with scores. The surrounding program can then route the ticket, ask a human, or take no action.

That makes decision models a potential fit for **classification, routing, scoring, and guardrails** inside larger AI workflows. They do not replace the model that writes an answer, investigates a problem, or handles an open-ended request. They handle the bounded decision around that work.

## Three launches, one emerging category

**TypeSafe AI introduced Jev on September 15** as its first “System One” model. Jev returns typed decisions and probabilities rather than generated text. TypeSafe says its training approach is designed for calibrated decisions and reports speed and cost advantages on its own evaluations. Those comparisons are company claims, and results depend on the task and evaluation setup.

**OpenAI announced the Decisions API at DevDay on September 29.** It lets developers provide text or image context and ask specific questions whose answers come from a finite set. OpenAI says the API can classify content, route requests, or select an agent’s next action. It entered limited preview; OpenAI’s announcement did not publish comparable latency or benchmark figures.

**Cloudflare released Clef and Clef-flash on October 1** through Workers AI, with model weights under the Apache 2.0 license. Clef is a 27-billion-parameter model aimed at higher-precision decisions; the 9-billion-parameter Clef-flash targets latency-sensitive work. Cloudflare says both follow the System One API, making them compatible with Jev integrations after changing the endpoint and model.

Cloudflare’s launch post reports median latency of 209 milliseconds for Clef and 38.8 milliseconds for Clef-flash, compared with 524.1 milliseconds for Jev across its 43 benchmark runs. It also says Clef led seven of ten decision benchmarks. These are **Cloudflare’s reported results**, not an independent, universal ranking; the benchmark mix and serving setup matter.

## What developers can use them for

Consider an agent that receives a request to refund an order. A decision model could score whether the request matches a refund policy, classify its risk, and choose whether to proceed, ask for more information, or send it to a person. A larger language model can still explain the policy or draft the response after the system has made that routing decision.

The benefit is a smaller, more predictable interface between model output and code. The application can define allowed answers in advance and decide what confidence level is enough for an automatic action. Clef also supports image input, which Cloudflare says can be used for visual classification.

But a fixed output shape does not make a decision correct. A valid “approve” answer can still be wrong. Production code should keep permissions, confidence thresholds, human review, and irreversible side effects under application control. OpenAI’s API is still in limited preview, while Jev and Clef have different access and deployment options.

## A new component for the agent stack

The launches suggest a growing place for models that make **one constrained choice** inside software, alongside the general models that generate and reason. If the task is repetitive and the possible answers are known, developers can now evaluate this dedicated approach against a classifier, rules, or a general LLM.

The useful question is not which model wins every benchmark. It is whether a decision model makes a particular workflow faster or simpler without shifting too much authority away from the code that governs it.

Sources: [OpenAI — DevDay 2026 recap](https://openai.com/index/devday-2026-recap/); [TypeSafe AI — Introducing System One Models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev); [Cloudflare — Introducing Clef](https://blog.cloudflare.com/clef-decision-models/); [Cloudflare — Workers AI changelog](https://developers.cloudflare.com/changelog/post/2026-10-01-clef-workers-ai/).
