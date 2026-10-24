# Anthropic and open-weight AI: why competition keeps becoming a security debate

A Chinese lab releases a capable model. Developers discuss its price, coding results and downloadable weights. Anthropic raises another question: how was it trained, and what happens when its capabilities reach the wrong hands?

That sequence can look like **panic over open-weight competition**. Across DeepSeek, MiniMax, Qwen, Kimi and GLM, Anthropic has challenged more than benchmark scores. Its responses have included copying allegations, security warnings, congressional outreach and restrictions on Claude access.

The criticism worth examining is how those interventions frame a competitor's progress. A cheaper alternative becomes a suspected beneficiary of unauthorized training. Downloadable weights become an irreversible security exposure. The risks may deserve scrutiny; the company describing them also sells the closed alternative.

## DeepSeek: praise followed by warnings

Dario Amodei [responded to DeepSeek's breakthrough](https://darioamodei.com/post/on-deepseek-and-export-controls) by arguing for stronger chip export controls. He credited its engineers and declined to endorse distillation allegations in that essay, but framed its progress as another reason to restrict China's access to advanced compute.

In a subsequent [ChinaTalk interview](https://www.chinatalk.media/p/anthropics-dario-amodei-on-ai-competition), he criticized DeepSeek's protections against sensitive biological information, while saying he did not consider the models dangerous in that way at the time. The overall tone combined recognition of its engineering with warnings about safety and China's growing capabilities.

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

## GLM: a rival gets a dedicated security study

With GLM-5.3, Anthropic went further than mentioning security concerns in a wider report. Its Frontier Red Team published a [dedicated assessment of the rival's cyber capabilities and safeguards](https://www.anthropic.com/research/glm-5-3-and-the-spread-of-advanced-cyber-capabilities), testing exploit development and several ways to bypass or remove protections. It returned to those findings in its later anti-distillation update, giving GLM repeated attention.

In sandboxed evaluations, Anthropic reported working exploits in **50 of 410 attempts**, compared with **56 of 410** for Claude Mythos Preview. It also reported safeguard-bypass engagement rates of **64–100%**, depending on the technique. The effort devoted to testing and publishing the findings made GLM a prominent example in Anthropic's argument about openly available cyber capabilities.

The framing favored controlled access: Claude's restricted version was available to vetted defenders, while GLM's weights could be downloaded and modified, including through [abliteration to reduce refusals](/news/abliterated-models-origin-refusals-use-cases/). Anthropic acknowledged the benefits for defenders too, but its emphasis was the risk of releasing those capabilities without safeguards it considered adequate.

## Safety concerns also serve a competitive narrative

Dario [rejects a blanket open-weight ban](https://www.anthropic.com/news/position-open-weights-models), but **Anthropic's preferred restrictions also serve its competitive interests**: chip controls constrain rival development, and blocking distillation protects Claude. Those interests deserve scrutiny alongside its safety arguments.

Given that pattern, will the [Kimi K3.1 Pro launch](/news/kimi-k3-1-pro-frontier-model-comparison/) prompt another warning or outreach to lawmakers? A further response is conceivable, but none specific to this launch has been verified.

## OpenAI welcomed the competition, with its guard up

Where Anthropic's warnings can read as alarm, OpenAI's initial response sounded more welcoming. Sam Altman [praised DeepSeek R1](https://x.com/sama/status/1884066337103962416) for what it delivered at its price and described the competition as invigorating.

But the welcome came with caution. OpenAI also [raised distillation allegations with US lawmakers](https://www.reuters.com/world/china/openai-accuses-deepseek-distilling-us-models-gain-advantage-bloomberg-news-2026-02-12/) and later [linked reasoning-extraction attempts to people associated with Moonshot](https://openai.com/index/disrupting-a-coordinated-model-distillation-campaign/).

**OpenAI welcomed the competition while keeping its guard up; Anthropic put the warnings more prominently in view.** The public tone differed, even as both companies acted to protect their models and commercial position.

Abusing Anthropic's service to distill Claude into a competing model is wrong, and the company has every reason to protect its work. But its repeated warnings about open-weight rivals can also come across as **childish panic over competition**, especially when attention shifts from what a new model offers to why it should be feared. Anthropic's own [anti-distillation defenses](https://www.anthropic.com/news/distillation-defenses), which it says reduced extracted reasoning data by **90–99%**, show a more constructive response: secure the service, substantiate the accusations, and let competing models stand on their merits.

*Timeline checked through October 24, 2026. January and February 2025 provide background; the main timeline covers 2026.*
