# GPT-6.2 Astra and Sol arrive after weeks of Codex anticipation

The name **GPT-6.2 Astra** appeared in usage screenshots around the end of the [28-day Codex challenge](/news/tibo-codex-challenge-gpt-6-2-astra-fable-5-5/). Two weeks later, OpenAI’s November 17 release made Astra and **GPT-6.2 Sol** available in ChatGPT Work, Codex and the API. Users waiting for a stronger model now have two options to test.

Astra targets deeper investigations and professional deliverables, such as building a spreadsheet to a supplied template. Sol covers everyday coding, writing and tool use. Their launch results make the choice interesting because Sol comes close to Astra on one repository benchmark while costing much less per attempt.

## How close is Sol on coding?

On **FrontierCode 2.0**, which tests whether patches meet maintainers’ standards, OpenAI’s launch run put Sol within half a point of Astra at about **one-fifth of the cost per task**. Artificial Analysis found a wider gap in its independent Codex tests. The table combines OpenAI’s launch results with independent Artificial Analysis measurements, checked November 18. Both models ran at maximum reasoning effort except where marked.

| Benchmark or metric | GPT-6.2 Astra | GPT-6.2 Sol |
| --- | ---: | ---: |
| FrontierCode 2.0 (OpenAI, score / cost per task) | 44.2% / $5.97 | 43.8% / $1.29 |
| Agents’ Last Exam v1.1 (OpenAI, partial-credit score) | 78.3% (xhigh) | 73.0% |
| Coding Agent Index (Artificial Analysis, Codex) | 53 | 49 |
| Intelligence Index v5.0.1 (Artificial Analysis) | 62 | 57 |
| Intelligence Index cost per task | $4.00 | $1.01 |
| Intelligence Index time per task | 10.4 min | 7.9 min |

At standard short-context API rates, a million input and output tokens cost $8 and $40 respectively for Astra, or $2 and $10 for Sol.

The independent **Coding Agent Index** also gives a reason to test beyond patch generation. Artificial Analysis found Astra level with the previous Astra and Sol three points below GPT-6.1 Sol in Codex at maximum effort. Sol’s decline was driven by a repository question-answering test, where it more often omitted key facts.

## Availability and the cost of finishing

Both models are available to Plus, Pro, Enterprise and Edu users in ChatGPT Work and Codex, with administrator controls for eligible workspaces. Pro 200 gets **Ultrafast for Sol**, and Pro 500 gets it for both models. API users can also choose Ultrafast, which has separate pricing from the standard rates above.

For someone who waited through the challenge, the launch turns anticipation into a concrete decision. Sol is an economical candidate for routine coding, and Astra earns its higher price when deeper investigation improves the result. Compare them on a task you can verify and include the time spent correcting omissions. A cheaper attempt pays off when the completed work needs less intervention.

## Sources

- OpenAI publishes the FrontierCode 2.0 and Agents’ Last Exam charts in its [GPT-6.2 launch post](https://openai.com/index/introducing-gpt-6-2-astra-sol/) and lists the token rates on its [API pricing page](https://developers.openai.com/api/docs/pricing).
- Artificial Analysis publishes the independent results in its [Coding Agent Index comparison](https://artificialanalysis.ai/agents/coding-agents/comparisons/claude-code-vs-codex) and [OpenAI provider benchmarks](https://artificialanalysis.ai/providers/openai/).
- Artificial Analysis explains the change from the previous models in its [GPT-6.2 evaluation report](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol/).
