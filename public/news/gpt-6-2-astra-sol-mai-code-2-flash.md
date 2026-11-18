# GPT-6.2 Astra and Sol meet Microsoft’s MAI Code 2 and Flash

Writing a regression test for a known bug takes less investigation than tracing that bug across three services. On November 17, OpenAI released **GPT-6.2 Astra and Sol** for coding and broader professional work. Microsoft released **MAI Code 2 and Code 2 Flash**, a pair tuned for software engineering. Both releases give developers a cheaper option for routine work.

## GPT-6.2 Sol stays close to Astra on repository work

Two weeks after Astra’s name appeared in [Codex usage screenshots](/news/tibo-codex-challenge-gpt-6-2-astra-fable-5-5/), both models are available in ChatGPT Work, Codex and the API. Astra targets deeper investigations and work such as building a spreadsheet to a supplied template. Sol covers everyday coding, writing and tool use. Pro 200 gets Ultrafast for Sol, and Pro 500 gets it for both.

On **FrontierCode 2.0**, which tests whether patches meet maintainers’ standards, OpenAI’s launch run put Sol within half a point of Astra at about **one-fifth of the cost per task**. Artificial Analysis found a wider gap in its independent Codex tests. Both models ran at maximum reasoning effort except where marked.

| Benchmark or metric | GPT-6.2 Astra | GPT-6.2 Sol |
| --- | ---: | ---: |
| FrontierCode 2.0 (OpenAI, score / cost per task) | 44.2% / $5.97 | 43.8% / $1.29 |
| Agents’ Last Exam v1.1 (OpenAI, partial-credit score) | 78.3% (xhigh) | 73.0% |
| Coding Agent Index (Artificial Analysis, Codex) | 53 | 49 |
| Intelligence Index v5.0.1 (Artificial Analysis) | 62 | 57 |
| Intelligence Index cost per task | $4.00 | $1.01 |
| Intelligence Index time per task | 10.4 min | 7.9 min |

At standard short-context API rates, a million input and output tokens cost $8 and $40 respectively for Astra, or $2 and $10 for Sol.

## MAI Code 2 Flash makes routine edits cheaper

At Ignite, Microsoft AI CEO Mustafa Suleyman framed the two models around the coding work developers repeat every day. Both accept images and have roughly a million tokens of context. Code 2 targets cross-file changes and debugging. Flash uses **12 billion active parameters** to Code 2’s **80 billion** and targets focused edits, explanations and routine fixes. Both are in GitHub Copilot, and Flash is also on Copilot Free and in a limited-access Microsoft Foundry preview.

Microsoft tested both at maximum reasoning effort using the Copilot CLI. The largest gap was on DeepSWE, where patches have to pass hidden tests.

| Benchmark | MAI Code 2 | MAI Code 2 Flash |
| --- | ---: | ---: |
| DeepSWE 1.1 | 73.2% | 59.9% |
| Terminal-Bench 2.1 | 84.6% | 78.3% |
| SWE Atlas | 43.1% | 44.8% |

Across four tests, including FrontierCode 1.1, Microsoft reports Code 2 reached **98% of GPT-6.1 Sol’s score at 40% of the cost** and **96% of Claude Opus 5.5’s score at 5% of the cost**. Over the three tests above, Microsoft reports Flash performed comparably to GPT-6 Luna and Claude Haiku 5.5, at **65% and 20% of their respective costs**.

Those comparisons use Microsoft’s half-price launch rates. Copilot charges **$0.50 input / $2.50 output** per million tokens for Code 2 and **$0.05 / $0.25** for Flash. Both rates double on May 17, 2027. Microsoft also announced **MAI Licensed Weights**, which will let participating companies customize models and run them in their own Azure environments.

## What a finished patch costs

Writing a test for a known bug gives Flash or Sol a clear target. Tracing that bug across services puts more weight on whether the model can follow the failure and verify its fix. To compare all four, run them on the same issue and count retries and review time alongside the model bill.

## Sources

- OpenAI publishes the FrontierCode 2.0 and Agents’ Last Exam charts in its [GPT-6.2 launch post](https://openai.com/index/introducing-gpt-6-2-astra-sol/) and lists the token rates on its [API pricing page](https://developers.openai.com/api/docs/pricing).
- Artificial Analysis publishes the independent results in its [Coding Agent Index comparison](https://artificialanalysis.ai/agents/coding-agents/comparisons/claude-code-vs-codex) and [OpenAI provider benchmarks](https://artificialanalysis.ai/providers/openai/).
- Microsoft details the cost comparison and Foundry preview in its [MAI Code 2 release notes](https://microsoft.ai/news/introducing-mai-code-2-and-mai-code-2-flash/) and publishes raw pass rates in the [model card](https://microsoft.ai/pdf/MAI-Code-2-And-MAI-Code-2-Flash-Model-Card.pdf?v=2).
- Microsoft describes the product strategy and customization program in its [Ignite keynote transcript](https://microsoft.ai/news/microsoft-ignite-2026-mai-keynote/) and [Licensed Weights announcement](https://microsoft.ai/news/introducing-mai-licensed-weights/).
- GitHub lists supported plans and the end of the promotion in its [Copilot changelog](https://github.blog/changelog/2026-11-17-mai-code-2-and-mai-code-2-flash-in-github-copilot/) and [billing documentation](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing).
