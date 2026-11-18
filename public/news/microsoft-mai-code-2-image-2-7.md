# Microsoft’s MAI Code 2 and Image 2.7 target cheaper everyday work

Editing a product catalog or working through a backlog of bug fixes can mean running a model hundreds of times. Microsoft’s November 17 Ignite releases target that repeated work. **MAI Code 2 and Code 2 Flash** are in GitHub Copilot, while **MAI Image 2.7 and Image 2.7 Flash** bring image generation and editing to Microsoft Foundry.

The image release gives Microsoft a particularly strong result. Image 2.7 topped an independent editing leaderboard at roughly **one-sixth of the listed price** of the OpenAI model just behind it. The coding models make a similar pitch around the cost of everyday software work.

## MAI Image 2.7 leads in image editing

Both **Image 2.7** and **Image 2.7 Flash** can generate an image from a prompt or edit an existing one. You could recolor a product while keeping the rest of the photo intact, update text in a design, or output an asset with a transparent background. Both models are in public preview on Microsoft Foundry. Flash also powers **Canvas** in MAI Labs, where you can select part of an image and revise it in place.

Artificial Analysis’s **AA-Image-Editing v2.1** uses blind preference votes to assign Elo scores. Its launch snapshot put Image 2.7 first and Flash seventh.

| Model | Editing Elo | Listed price per 1,000 images |
| --- | ---: | ---: |
| MAI Image 2.7 | 1,215 | $34.82 |
| GPT Image 2.6 Sunburst (max) | 1,211 | $210.72 |
| MAI Image 2.7 Flash | 1,179 | $10.24 |

The four-point gap between Image 2.7 and Sunburst comes with overlapping 95% confidence intervals. The listed price difference is about sixfold. For generating images from text, the same evaluator ranked Sunburst first and Image 2.7 fourth, making editing the stronger case for Microsoft’s model.

## MAI Code 2 Flash makes routine edits cheaper

Microsoft brought the same standard-and-Flash lineup to coding. At Ignite, Microsoft AI CEO Mustafa Suleyman framed these models around the work developers repeat in GitHub Copilot. Both accept images and have roughly a million tokens of context. Code 2 targets cross-file changes and debugging. Flash uses **12 billion active parameters** to Code 2’s **80 billion** and targets focused edits, explanations and routine fixes. Both are in GitHub Copilot, and Flash is also on Copilot Free and in a limited-access Microsoft Foundry preview.

Microsoft tested both at maximum reasoning effort using the Copilot CLI. The largest gap was on DeepSWE, where patches have to pass hidden tests.

| Benchmark | MAI Code 2 | MAI Code 2 Flash |
| --- | ---: | ---: |
| DeepSWE 1.1 | 73.2% | 59.9% |
| Terminal-Bench 2.1 | 84.6% | 78.3% |
| SWE Atlas | 43.1% | 44.8% |

Across four tests, including FrontierCode 1.1, Microsoft reports Code 2 reached **98% of GPT-6.1 Sol’s score at 40% of the cost** and **96% of Claude Opus 5.5’s score at 5% of the cost**. Over the three tests above, Microsoft reports Flash performed comparably to GPT-6 Luna and Claude Haiku 5.5, at **65% and 20% of their respective costs**.

Those comparisons use Microsoft’s half-price launch rates. Copilot charges **$0.50 input / $2.50 output** per million tokens for Code 2 and **$0.05 / $0.25** for Flash. Both rates double on May 17, 2027. Microsoft also announced **MAI Licensed Weights**, which will let participating companies customize models and run them in their own Azure environments.

## What the lower prices change

For a product team, the appeal is being able to revise a catalog of photos within a smaller budget. For a developer, Flash offers a cheap place to start on fixes that are easy to verify, while Code 2 gives harder patches more capacity.

Microsoft’s case depends on those repeated jobs. The image result has independent preference votes behind it, and the coding price comparisons come from specific benchmark setups and promotional rates. Try the work you actually repeat and count **cost per accepted result**, including retries and the changes a person still has to make.

## Sources

- Microsoft describes image editing, Canvas and Foundry access in its [MAI Image 2.7 launch post](https://microsoft.ai/news/introducing-mai-image-2-7/) and [Foundry model guide](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/use-foundry-models-mai-image).
- Artificial Analysis publishes price, Elo and uncertainty on its [image-editing leaderboard](https://artificialanalysis.ai/image/leaderboard/editing) and reports generation results on its [text-to-image leaderboard](https://artificialanalysis.ai/embed/text-to-image-leaderboard/leaderboard/text-to-image).
- Microsoft details the cost comparison and Foundry preview in its [MAI Code 2 release notes](https://microsoft.ai/news/introducing-mai-code-2-and-mai-code-2-flash/) and publishes raw pass rates in the [model card](https://microsoft.ai/pdf/MAI-Code-2-And-MAI-Code-2-Flash-Model-Card.pdf?v=2).
- Microsoft describes the product strategy and customization program in its [Ignite keynote transcript](https://microsoft.ai/news/microsoft-ignite-2026-mai-keynote/) and [Licensed Weights announcement](https://microsoft.ai/news/introducing-mai-licensed-weights/).
- GitHub lists supported plans and the end of the promotion in its [Copilot changelog](https://github.blog/changelog/2026-11-17-mai-code-2-and-mai-code-2-flash-in-github-copilot/) and [billing documentation](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing).
