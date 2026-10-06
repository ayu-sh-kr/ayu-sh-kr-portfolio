# Mistral Large 4 ‘Le Chonk’: API preview and open-weight plans

**Mistral has opened a public preview of Mistral Large 4**, nicknamed “Le Chonk.” Developers can try its API through Mistral Studio from October 6, with downloadable weights planned later this month.

The French company is targeting coding, cybersecurity and industrial applications. Its broader pitch is **sovereign AI**: organizations should have more control over where their models run, how they are customized and who controls access to them.

## A trillion parameters, with only part active

Mistral’s announcement rounds the model’s size to one trillion parameters. Its documentation gives the more precise total as **1.05 trillion, with 49 billion active parameters**. Large 4 uses mixture-of-experts, routing work through selected parts of the model rather than activating everything for each token.

In a sparse MoE layer, a router selects experts for each token representation and combines their outputs using routing weights. The simplified illustration follows one token through that process; the selection can change for the next token.

![Isometric mixture-of-experts layer: a token enters a router, two selected experts process it while two remain idle, and a weighted combine step produces the output.](/news/assets/mistral-large-4-le-chonk-preview/mixture-of-experts.svg)

*Illustrative routing only: this shows two of four experts, not Large 4’s exact expert count or routing configuration.*

That helps reduce computation per token. It does not make the complete model small: storing and serving all the weights remains a separate infrastructure requirement. The active count is not the memory footprint of the whole system.

Large 4 accepts multimodal input, including images. Its documented features include tool calling, structured output and document questions, allowing applications to connect it to services and work with more than a plain chat exchange.

## Coding, cyber defense and image understanding

Mistral reports strong performance across software engineering, cybersecurity and professional tasks. It also highlights **visual grounding**, where a model identifies the relevant object or region in an image. That can connect an answer to evidence in a drawing, document or scene.

These are task-specific claims, rather than proof of a universal lead. Mistral notes that some coding evaluations were conducted privately ahead of the public launch of their test harness. The preview gives developers a way to examine how those results translate to their own workloads.

## Open weights give organizations deployment control

The company says Large 4 was trained from scratch on **3,800 NVIDIA Grace Blackwell GPUs** in its European data centers. The public preview runs on that same infrastructure.

The planned weight release would let organizations operate the model under their own deployment and access policies. That fits Mistral’s wider offering of on-premises, private-cloud and hosted options. For a security team or an organization handling proprietary information, the appeal is control over the system alongside its answer quality.

That control brings responsibility for hosting, security and maintenance. Open weights also do not automatically make the training data or every part of the development process public.

## What comes after the preview

Mistral plans to publish more architecture details and evaluations alongside the weights, then use Large 4 as the foundation for specialized and optimized models.

The API preview is available to evaluate now. The downloadable release is the next milestone, when teams can assess both the model’s capabilities and the practical demands of operating it themselves.

Sources: [Mistral’s announcement](https://mistral.ai/news/mistral-large-4/), [Large 4 documentation](https://docs.mistral.ai/models/mistral-large-4-0), and [Mistral’s deployment approach](https://mistral.ai/).
