# GPT-6.2, Microsoft MAI and Gemini 4 Neon: what changed for developers

Three releases in two days give developers more ways to decide what a task is worth. OpenAI puts a cheaper Sol beside Astra, Microsoft prices for jobs that repeat, and Google’s Neon goes after work that previously called for Carbon. The useful comparison is what it takes to get a result you can ship.

## OpenAI: GPT-6.2 Astra and Sol

OpenAI [released Astra and Sol](https://openai.com/index/introducing-gpt-6-2-astra-sol/) on November 17 for ChatGPT Work, Codex and the API, following weeks of anticipation around the [28-day Codex challenge](/news/tibo-codex-challenge-gpt-6-2-astra-fable-5-5/). Astra is aimed at deeper investigations and professional deliverables; Sol is the cheaper everyday option.

### How close is Sol on coding?

On **FrontierCode 2.0**, which tests whether patches meet maintainers’ standards, OpenAI’s launch run put Sol within half a point of Astra at about **one-fifth of the cost per task**. Artificial Analysis found a wider gap in its independent Codex tests. The launch and independent runs used maximum reasoning effort except where marked.

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

Both models are available on eligible paid plans; Ultrafast has separate plan limits and API prices.

### Where early users had to step in

On a compiler project, **Theo Browne** said Astra kept making the compiler smaller even as it ran slower. When he asked why one computer was slow, he got four paragraphs about the package manager instead of a clear answer. **Max Weinbach** said he had to prompt the GPT-6.2 models to continue after they declared themselves blocked. **Token Gremlin** liked Astra’s 3D output but found its explanations hard to follow on longer tasks.

**Sam Altman** said on November 17 that making the models easier to work with was a priority. The next day, OpenAI’s **Thibault “Tibo” Sottiaux** said last-minute changes might explain some early reviews. **Dan Shipper** said Every tested release candidates through launch and hadn’t heard about those changes. OpenAI’s developer guide recommends telling Astra when to keep going, how to verify it’s done, and what to explain in the final answer.

## Microsoft: MAI Code 2 and Image 2.7

Microsoft introduced **MAI Code 2 and Code 2 Flash** in GitHub Copilot on November 17 at Ignite. **MAI Image 2.7 and Image 2.7 Flash** went into public preview on Microsoft Foundry.

### MAI Image 2.7 leads in image editing

Both image models generate and edit images. Flash also powers **Canvas** in MAI Labs, where you can select and revise just one part of an image.

Artificial Analysis’s **AA-Image-Editing v2.1** uses blind preference votes to assign Elo scores. Its launch snapshot put Image 2.7 first and Flash seventh.

| Model | Editing Elo | Listed price per 1,000 images |
| --- | ---: | ---: |
| MAI Image 2.7 | 1,215 | $34.82 |
| GPT Image 2.6 Sunburst (max) | 1,211 | $210.72 |
| MAI Image 2.7 Flash | 1,179 | $10.24 |

MAI Image 2.7 scored four points above OpenAI’s GPT Image 2.6 Sunburst on editing and cost about one-sixth as much at the listed prices. On the same evaluator’s text-to-image leaderboard, Sunburst ranked first and MAI Image 2.7 ranked fourth.

### MAI Code 2 Flash makes routine edits cheaper

Code 2 targets cross-file changes and debugging. Flash uses **12 billion active parameters** to Code 2’s **80 billion** and targets focused fixes. Both are in Copilot; Flash is also on Copilot Free and in limited Foundry preview. Microsoft ran both at maximum reasoning effort in the Copilot CLI. DeepSWE, which grades patches against hidden tests, showed the largest gap.

| Benchmark | MAI Code 2 | MAI Code 2 Flash |
| --- | ---: | ---: |
| DeepSWE 1.1 | 73.2% | 59.9% |
| Terminal-Bench 2.1 | 84.6% | 78.3% |
| SWE Atlas | 43.1% | 44.8% |

At its introductory Copilot rates, Microsoft reports that Code 2 reached **98% of GPT-6.1 Sol’s score at 40% of its cost** and **96% of Claude Opus 5.5’s score at 5% of its cost** across four tests, including FrontierCode 1.1. Across the three tests in the table, Microsoft reports that Flash scored about as well as GPT-6 Luna and Claude Haiku 5.5, at **65% of Luna’s cost** and **20% of Haiku’s**.

Copilot charges **$0.50 per million input tokens and $2.50 per million output tokens** for Code 2, and **$0.05 input and $0.25 output** for Flash. Microsoft also announced **MAI Licensed Weights**, which will let participating companies customize models and run them in their own Azure environments.

> **Copilot pricing.** The two introductory rates double on May 17, 2027.

## Google: Gemini 4 Neon closes the gap with Carbon

Google [released Gemini 4 Neon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/) on November 18, rolling it out through the Gemini API and AI Studio, Gemini for business, and the Gemini app and Antigravity for Google AI Pro and Ultra subscribers. It lists at **$3 input and $15 output per million tokens**.

> **Carbon pricing.** Carbon normally costs $4 per million input tokens and $20 per million output tokens. Its $2 input and $10 output promotion runs through November 30.

### Where Neon catches Carbon

[Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) found Neon at high effort matched Carbon at high on its Intelligence Index. Raising Neon to extra-high lifted it just one point, to 61, while averaging about 21 minutes and $6.44 per benchmark task versus Carbon’s 36 minutes and $7.76 at standard prices.

[DeepMind’s benchmark table](https://deepmind.google/models/gemini/#performance) puts Neon ahead of the reported Opus 5.5 result on CursorBench’s multi-file coding tasks, but slightly behind Opus on terminal tasks and repository patches.

| Coding benchmark | Gemini 4 Neon | Claude Opus 5.5 | GPT-6.2 Sol |
| --- | ---: | ---: | ---: |
| [CursorBench 4.1](https://cursor.com/cursorbench) (multi-file coding) | 65.4% | 58.1% | Not reported |
| Terminal-Bench 4.1 (terminal tasks) | 65.2% | 65.8% | 61.5% |
| FrontierCode 2.0 (repository patches) | 46.2% | 47.3% | 43.8% |

### What extra thinking buys

For workflow automation, [Zapier’s AutomationBench](https://zapier.com/benchmarks/gemini-neon-4-report) offers a separate test: Neon at high passed **54.3%** of 657 tasks versus Carbon’s **53.9%**, at an estimated $0.88 versus $1.94 per attempt. Moving Neon to extra-high solved 13 more tasks but took the estimated cost to $1.69 per attempt. That makes high the sensible starting point for workflows like these, with extra-high reserved for cases where the extra passes are worth paying for.

## What more competition means for buyers

OpenAI and Anthropic have long been reference points for the best closed-weight models. Google’s Gemini 4 range now gives teams more choices at different prices, and Neon’s CursorBench result shows Google can lead on some coding work. Microsoft is gaining ground in specific jobs such as image editing and routine Copilot fixes. Mistral covers both sides of the market with [hosted commercial tools such as Codestral](https://docs.mistral.ai/models/codestral-25-08) and downloadable [Mistral Large 4 weights](https://mistral.ai/news/mistral-large-4/).

List prices at the top have already moved. [Claude Fable 5.2](https://www.anthropic.com/claude/fable) went from its predecessor’s $10 input and $50 output per million tokens to $8 and $40. [GPT-6.2 Astra](https://openai.com/index/introducing-gpt-6-2-astra-sol/) made the same cut from GPT-6 Astra’s rates. The advantage for paying customers is the ability to move a workload when another model gets it done for less. The more credible that option becomes, the more pressure providers face to keep their rates competitive.

## Sources

### OpenAI

- OpenAI publishes the FrontierCode 2.0 and Agents’ Last Exam charts in its [GPT-6.2 launch post](https://openai.com/index/introducing-gpt-6-2-astra-sol/) and lists the token rates on its [API pricing page](https://developers.openai.com/api/docs/pricing).
- Artificial Analysis publishes the independent results in its [Coding Agent Index comparison](https://artificialanalysis.ai/agents/coding-agents/comparisons/claude-code-vs-codex) and [OpenAI provider benchmarks](https://artificialanalysis.ai/providers/openai/).
- Artificial Analysis explains the change from the previous models in its [GPT-6.2 evaluation report](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol/).
- The firsthand usability accounts are in [Theo Browne’s X article](https://x.com/theo/status/2122760447103484410), [Max Weinbach’s post](https://x.com/mweinbach/status/2122834783650676806) and [Token Gremlin’s post](https://x.com/TokenGremlin/status/2122786802402754829).
- OpenAI’s public responses came from [Sam Altman](https://x.com/sama/status/2122798042734633452) and [Tibo Sottiaux](https://x.com/thsottiaux/status/2122929634916679820). [Dan Shipper replied](https://x.com/danshipper/status/2123036037077201068) about Every’s testing schedule.
- OpenAI gives task-completion and writing guidance in its [GPT-6.2 developer guide](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6.2-astra).

*Public X posts checked November 19, 2026 through indexed mirrors. Direct X access was unavailable.*

### Microsoft

- Microsoft describes image editing, Canvas and Foundry access in its [MAI Image 2.7 launch post](https://microsoft.ai/news/introducing-mai-image-2-7/) and [Foundry model guide](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/use-foundry-models-mai-image).
- Artificial Analysis publishes price, Elo and uncertainty on its [image-editing leaderboard](https://artificialanalysis.ai/image/leaderboard/editing) and reports generation results on its [text-to-image leaderboard](https://artificialanalysis.ai/embed/text-to-image-leaderboard/leaderboard/text-to-image).
- Microsoft details the cost comparison and Foundry preview in its [MAI Code 2 release notes](https://microsoft.ai/news/introducing-mai-code-2-and-mai-code-2-flash/) and publishes raw pass rates in the [model card](https://microsoft.ai/pdf/MAI-Code-2-And-MAI-Code-2-Flash-Model-Card.pdf?v=2).
- Microsoft describes the product strategy and customization program in its [Ignite keynote transcript](https://microsoft.ai/news/microsoft-ignite-2026-mai-keynote/) and [Licensed Weights announcement](https://microsoft.ai/news/introducing-mai-licensed-weights/).
- GitHub lists supported plans and the end of the promotion in its [Copilot changelog](https://github.blog/changelog/2026-11-17-mai-code-2-and-mai-code-2-flash-in-github-copilot/) and [billing documentation](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing).
