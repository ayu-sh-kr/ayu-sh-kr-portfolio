# Anthropic and open-weight AI: why competition keeps becoming a security debate

A Chinese lab releases a capable model. Developers discuss its price, coding results and downloadable weights. Anthropic raises another question: how was it trained, and what happens when its capabilities reach the wrong hands?

That sequence can look like **panic over open-weight competition**. Across DeepSeek, MiniMax, Qwen, Kimi and GLM, Anthropic has challenged more than benchmark scores. Its responses have included copying allegations, security warnings, congressional outreach and restrictions on Claude access.

The criticism worth examining is how those interventions frame a competitor's progress. A cheaper alternative becomes a suspected beneficiary of unauthorized training. Downloadable weights become an irreversible security exposure. The risks may deserve scrutiny; the company describing them also sells the closed alternative.

## DeepSeek: the breakthrough becomes an export-control argument

In [January 2025](https://darioamodei.com/post/on-deepseek-and-export-controls), Dario Amodei argued that DeepSeek's progress made chip export controls more necessary. He acknowledged its engineering and explicitly declined to take a position on distillation allegations in that essay.

His [February 5 ChinaTalk interview](https://www.chinatalk.media/p/anthropics-dario-amodei-on-ai-competition) added a safety argument. He said DeepSeek performed worst in Anthropic's evaluations of protections against sensitive biological information. He also said he did not think the models were literally dangerous in that way at the time.

That qualification matters. A weakness in an evaluation and a demonstrated ability to cause real-world harm are different findings.

Dario also said the consequential development was a Chinese company producing a strong model; much of his argument would have applied even if DeepSeek had offered only an API. The concern was therefore broader than openness.

## The 2026 timeline: accusations, lawmakers and security tests

**Open weights** let others download and run a model's learned parameters. They do not necessarily include its training data or a fully open development process. **Distillation** trains a model using another model's outputs. Anthropic itself describes the method as legitimate; its accusations concern unauthorized extraction and evasion of access restrictions.

The following dates track public interventions, rather than assuming every statement was triggered by the nearest launch.

| Date | Models or developer | Anthropic's intervention |
| --- | --- | --- |
| February 23 | DeepSeek, Moonshot and MiniMax | Alleged more than 16 million Claude exchanges through roughly 24,000 fraudulent accounts across the three labs. Connected extraction to national security and chip controls. |
| June 10; reported June 24 | Alibaba / Qwen | Sent US senators a letter alleging a campaign with more than 28.8 million exchanges. Supported government efforts against the alleged extraction. |
| July 22 | Kimi K3 | Anthropic's policy head welcomed a White House accusation that Moonshot distilled Claude Fable and said it would work with the White House and Congress. |
| July 27 | Open-weight policy | Dario rejected a blanket ban while supporting chip restrictions, action against industrial-scale distillation and mandatory safety testing. |
| September 10 | Qwen, Kimi, DeepSeek, GLM and MiMo | Published expanded extraction allegations, including claims that Moonshot and DeepSeek forwarded customer requests to Claude. |
| September 29 | GLM-5.3 | Published a dedicated assessment warning about exploit-development capabilities and easily bypassed safeguards. |
| October 12 | Distillation enforcement | Announced stronger reasoning protections and account bans, claiming a 90–99% reduction in harvested data. Reiterated concerns about GLM-5.3. |

Sources: [February disclosure](https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks), [Reuters on the June letter](https://www.investing.com/news/stock-market-news/anthropic-says-alibaba-illicitly-extracted-claude-ai-model-capabilities-4759021), [July reporting](https://www.businessinsider.com/white-house-kimi-k3-moonshot-ai-distillation-2026-7), [September report](https://www.anthropic.com/threat-intelligence-report-september-2026) and [October defenses](https://www.anthropic.com/news/distillation-defenses). Extraction figures and attribution are Anthropic's allegations and measurements, not independent findings.

The progression is significant. Anthropic moved beyond protecting an API to asking lawmakers to treat alleged extraction as a strategic problem. Its own February disclosure explicitly connected distillation to preserving the competitive advantage that export controls were intended to maintain.

## GLM: a competitor becomes the security case study

The [September 29 GLM-5.3 assessment](https://www.anthropic.com/research/glm-5-3-and-the-spread-of-advanced-cyber-capabilities) is the clearest example of direct security criticism.

Anthropic reported that GLM-5.3 produced working exploits in **50 of 410 attempts** on a Chrome V8 benchmark, versus **56 of 410** for Claude Mythos Preview. Its tests also found that GLM's safeguards could be bypassed or removed, with engagement rates of **64–100%** depending on the technique. Those percentages describe particular simulated tests, not success rates against arbitrary live targets.

The comparison gave Anthropic a powerful framing: similar dangerous capabilities, different access controls. Its restricted model was presented as a tool for vetted defenders; GLM's downloadable weights were presented as a capability available to attackers.

There is a substantive distinction here. Hosted providers can block accounts and update protections. Downloaded weights can be modified, including through [abliteration to reduce refusals](/news/abliterated-models-origin-refusals-use-cases/). Anthropic also acknowledged that GLM's capabilities could benefit defenders.

But a controlled demonstration does not establish an observed wave of GLM-powered attacks. The warning and the incident record need separate treatment.

## Safety concerns also serve a competitive narrative

Dario's [July 27 position statement](https://www.anthropic.com/news/position-open-weights-models) explicitly rejected a blanket open-weight ban and recognized benefits for developers and researchers. Portraying it as a demand to ban all open models would misrepresent his position.

The narrower criticism remains: **Anthropic's safety arguments also support its competitive interests**. Restricting chips can constrain rival development. Blocking distillation can protect Claude's capabilities. Emphasizing removable safeguards can make controlled access look like the more responsible purchase. That alignment does not prove the warnings are fabricated; it makes their evidence and proposed remedies worth examining.

The latest [Kimi K3.1 Pro launch](/news/kimi-k3-1-pro-frontier-model-comparison/) does not justify inventing another episode. As of October 24, no new Anthropic court filing or legal threat specifically about that model was verified for this article.

Calling the pattern panic is an editorial reading. The documented pattern is more concrete: Anthropic repeatedly challenges the legitimacy and safety of Chinese frontier competition through public messaging, enforcement and policy advocacy.

When the next open-weight model arrives, the question is whose evidence establishes the risk, what was actually demonstrated, and whether the proposed restriction addresses that finding. A competitor's warning deserves scrutiny alongside its benchmark.

*Timeline checked through October 24, 2026. January and February 2025 provide background; the main timeline covers 2026.*
