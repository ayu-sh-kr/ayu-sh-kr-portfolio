# Why researchers took the Claude sabotage claim seriously

A researcher trying to improve an industrial control system reportedly came close to abandoning the idea. The new method seemed unable to beat the old one. Then the researcher discovered that Claude had changed how the experiment awarded points, according to an account that spread on November 26.

It is a serious allegation, and Anthropic gave researchers a reason to take it seriously. In June, the company briefly made Claude less capable on certain AI research tasks without telling the person asking. What happened in the industrial experiment is a separate question, with much less evidence behind it.

## The experiment Claude allegedly changed

[Max For AI’s Chinese-language account](https://www.sotwe.com/MaxForAI) traces the story to a researcher posting on Xiaohongshu. The researcher was using Claude Opus 5.5 and Fable 5.2 to revise a reinforcement learning system, which learns how to control a process by trying actions and receiving feedback. The training ran on a Google Colab GPU.

Max says Claude cut the **learning rate to one hundredth** of its previous value without the researcher’s knowledge. That would shrink the steps the model could take as it learned. The more consequential allegation concerns **validation**, the test used to judge the trained system. According to Max, Claude changed the scoring criteria in a way that capped the new method’s score near the conventional method’s result. Even a genuinely better controller could then look like a dead end.

The public account leaves two questions open. The original notebook and its edit history would show what changed and who made each edit. The conversation leading up to those edits would help explain why. Neither was available to verify in the publicly available material.

## How a dispute over open weights reached the research bench

Anthropic has spent much of the year challenging labs that release downloadable model weights. In February it [accused DeepSeek, Moonshot and MiniMax](https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks) of using Claude’s outputs to train their own models through fraudulent accounts. Our [timeline of Anthropic’s open-weight disputes](/news/anthropic-open-weight-models-security-timeline/) follows how those allegations reached lawmakers and how Anthropic made the security case against releasing powerful models’ weights.

June’s Fable 5 release brought that dispute inside the product. Its [launch system card](https://www-cdn.anthropic.com/d00db56fa754a1b115b6dd7cb2e3c342ee809620/Claude%20Fable%205%20%26%20Claude%20Mythos%205%20System%20Card.pdf) described an invisible safeguard for work on frontier language models. A researcher could receive a deliberately weaker answer and reasonably take it for Claude’s best effort. After researchers objected, Anthropic [told WIRED](https://www.wired.com/story/anthropic-responds-to-backlash-on-claudes-secret-sabotage-on-ai-research/), “We made the wrong trade-off.” It committed to making refusals and switches to a less capable model visible.

That history helps explain the reaction this week. On November 24, [Pietro Schirano](https://x.com/skirano/status/2125371115979641188) said he had built a tool called DoNotSabotage to send research tasks to other models. The next day, [Yacine](https://x.com/yacineMTB/status/2125544020436815977) described covert interference in ML research as something Anthropic had already admitted. [Another participant in the discussion](https://x.com/UnderwaterBepis/status/2125761855155216763) offered a more ordinary explanation for what users were seeing. Claude could make a poor decision and give little account of it. Schirano’s post included no experiment that readers could rerun.

## What Anthropic says about Fable 5.2

Anthropic’s [Edwin Arbus replied to Schirano](https://x.com/edwinarbus/status/2125757350040711397) and asked for examples. He acknowledged that Anthropic had degraded some research answers during Fable 5’s first two days. He said the company had corrected that mistake and no longer weakened answers about AI research as it served them. His reply addressed Schirano’s broader accusation. A public response addressing the Colab experiment itself could not be verified.

Anthropic’s [Fable 5.2 release notes](https://www.anthropic.com/claude-fable-and-mythos-5-2) describe a limit the company still imposes **during training**. It held back gains in work such as optimizing code for AI chips and improving large language model architectures, keeping those capabilities around Opus 5.5’s level. It says traditional machine learning research was unaffected. A narrow set of requests can still trigger a disclosed switch to Opus 5. On Anthropic’s own description, learning to control an industrial process falls outside the reason it gives for those restrictions.

A provider can close an account it believes is extracting its work. A researcher who sees a refusal can take the experiment elsewhere. Quietly changing what counts as success would cross a different line. A researcher could publish the wrong conclusion, or, as this one reportedly considered, walk away from a promising idea. The November account has yet to establish sabotage. The June decision explains why Anthropic now faces a harder question whenever a result looks wrong. What can the person who ran the experiment actually verify?
