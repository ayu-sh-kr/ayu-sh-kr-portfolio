# GPT-6.2 Astra and Sol meet Microsoft’s MAI Code 2 and Flash

Writing a regression test for a known bug is a different job from tracing that bug across three services. On November 17, OpenAI and Microsoft both released model pairs that give developers a choice about how much to spend on each kind of work. OpenAI’s **GPT-6.2 Astra and Sol** span coding and broader professional work. Microsoft’s **MAI Code 2 and Code 2 Flash** are tuned for software engineering.

## GPT-6.2 Sol stays close to Astra on repository work

Astra’s name surfaced in usage histories around the end of the [28-day Codex challenge](/news/tibo-codex-challenge-gpt-6-2-astra-fable-5-5/). Two weeks later, Astra and Sol are available in ChatGPT Work, Codex and the API. Astra is built for work that needs more investigation, such as reasoning across a codebase or producing a spreadsheet that follows a supplied template. Sol handles everyday coding, writing and multistep tool use, such as searching the web and working from images. Pro 200 gets Ultrafast for Sol, while Pro 500 gets it for both.

On **FrontierCode 2.0**, which checks whether changes to real repositories meet maintainers’ standards, OpenAI reports that Sol came within **0.5 percentage points** of Astra at about **one-fifth of the cost**, with both at maximum reasoning effort.

On Artificial Analysis’s broader suite, max-effort Astra scored **62** to Sol’s **57**, while Sol averaged **7.9 minutes and $1.01 per task** to Astra’s **10.4 minutes and $4.00**. Standard short-context API rates are $8 input and $40 output per million tokens for Astra, and $2 and $10 for Sol.

## MAI Code 2 Flash makes routine edits cheaper

Microsoft trained both models on the same architecture, with roughly a million tokens of context and image input for tasks like working from a screenshot. Microsoft lists **80 billion active parameters** for Code 2 and **12 billion** for Flash, a measure of how much of the model is used for each token. Code 2 targets cross-file changes and debugging. Flash targets focused edits, code explanations and routine fixes. Both are in GitHub Copilot, with Flash also available on Copilot Free and in limited-access Microsoft Foundry preview.

Microsoft tested both at maximum reasoning effort using the Copilot CLI. The largest gap was on DeepSWE, where patches have to pass hidden tests.

| Benchmark | MAI Code 2 | MAI Code 2 Flash |
| --- | ---: | ---: |
| DeepSWE 1.1 | 73.2% | 59.9% |
| Terminal-Bench 2.1 | 84.6% | 78.3% |
| SWE Atlas | 43.1% | 44.8% |

Microsoft’s headline puts Code 2 at **98% of GPT-6.1 Sol’s performance for 40% of the cost** across four tests. The average includes FrontierCode 1.1 and the cost estimate uses Microsoft’s half-price launch rate. In Copilot, Code 2 lists at **$0.50 input / $2.50 output** per million tokens and Flash at **$0.05 / $0.25**. Both rates double on May 17, 2027.

## What a finished patch costs

A regression test for a bug you already understand gives Flash or Sol a bounded task with a clear check. Tracing that bug across services puts more weight on whether the model can follow the failure and verify its fix. The launch benchmarks cover different tasks and tool setups. To compare all four on your own code, start with the same issue in the same repository and count retries and review time alongside the model bill.

## Sources

- OpenAI details availability, FrontierCode 2.0 results and standard API rates in its [GPT-6.2 release notes](https://openai.com/index/introducing-gpt-6-2-astra-sol/) and [API pricing](https://developers.openai.com/api/docs/pricing).
- Artificial Analysis ran the broader v5.0.1 Intelligence Index and reports task costs and times for [GPT-6.2 Astra](https://artificialanalysis.ai/models/gpt-6-2-astra) and [GPT-6.2 Sol](https://artificialanalysis.ai/models/gpt-6-2-sol).
- Microsoft details the cost comparison and Foundry preview in its [MAI Code 2 release notes](https://microsoft.ai/news/introducing-mai-code-2-and-mai-code-2-flash/) and publishes raw pass rates in the [model card](https://microsoft.ai/pdf/MAI-Code-2-And-MAI-Code-2-Flash-Model-Card.pdf?v=2).
- GitHub lists supported plans and the end of the promotion in its [Copilot changelog](https://github.blog/changelog/2026-11-17-mai-code-2-and-mai-code-2-flash-in-github-copilot/) and [billing documentation](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing).
