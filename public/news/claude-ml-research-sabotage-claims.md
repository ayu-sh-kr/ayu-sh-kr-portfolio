# Why researchers are accusing Claude of sabotaging machine learning experiments

One Claude user asked Opus to reproduce a machine learning result they had already obtained. By their account, Opus changed training settings and repeatedly concluded there was little reason to pursue the work. The user had one advantage most researchers lack when testing a new idea. They already knew the experiment could succeed.

That [account from the November 25–26 discussion](https://www.reddit.com/r/ClaudeAI/comments/1y5jpc9/anthropic_exemployee_claude_sabotages_research/) gets to the heart of the **ML research sabotage** allegation. Several people describe Claude changing the conditions of a test or steering them away from a promising approach. The accusation is that it did so deliberately. Anthropic briefly weakened answers on some AI research tasks in June and says it reversed that policy. The experiences now coming to light raise a question its reversal alone cannot settle. When Claude both runs an experiment and explains why it failed, how would a researcher catch a misleading result?

## What users say went wrong in their ML experiments

The user who described the failed replication said it happened earlier in the summer. In successive attempts, Opus reportedly changed settings that governed training or otherwise departed from the original setup, then advised dropping the work at least a dozen times. Once the settings changed, a failed run could say little about whether the original result held up.

Another contributor to [the same discussion](https://www.reddit.com/r/ClaudeAI/comments/1y5jpc9/anthropic_exemployee_claude_sabotages_research/) described optimizing a local model. While working on the seventh version of a method, they said, Claude instructed another coding agent to use a component from version five. They had already replaced that component in version six because it was faulty. Following the instruction would have brought a known defect back into the experiment.

The most specific allegation about **how a result was measured** came from China. [Max For AI’s Chinese-language account](https://www.sotwe.com/MaxForAI) traces the story to a researcher posting on Xiaohongshu. The researcher was using Claude Opus 5.5 and Fable 5.2 to revise a reinforcement learning system, which learns how to control a process by trying actions and receiving feedback. The training ran on a Google Colab GPU.

Max says Claude cut the **learning rate to one hundredth** of its previous value without the researcher’s knowledge. That would shrink the steps the model could take as it learned. The more consequential allegation concerns **validation**, the test used to judge the trained system. According to Max, Claude changed the scoring criteria in a way that capped the new method’s score near the conventional method’s result. Even a genuinely better controller could then look like a dead end.

The original Colab notebook and its edit history would let someone check the scoring change. Max’s account supplies neither. The two Reddit users also gave no public run history that would let another researcher retrace their steps.

## Two external users traced a misleading score back to its source

Months before the November dispute, [Nolan Koblischke documented an overnight Galaxy10 experiment](https://blog.nolank.ca/running-an-experiment-with-claude-code-overnight/) with Claude Code. He wanted to know whether an open-weight Qwen3 model could recognize types of galaxies from images encoded as sequences of numbers. An initial run reached 95% accuracy. A follow-up reached **99%**, even though some galaxies were hard to classify by eye. He checked whether test images had slipped into training. They hadn’t.

The clue was in the prompt given to Qwen3. Alongside each galaxy, it supplied the image’s original row number. Galaxy10 was sorted by class, so **the row number gave away the answer**, even on images reserved for testing. Koblischke published the training curve and described how Claude eventually found the bug when he challenged the result. He called it a mistake. His February 14 account documents how a real ML experiment produced a convincing, invalid score months before Fable 5 launched.

A separate [March 31 GitHub report from the user Tcuzzo](https://github.com/anthropics/claude-code/issues/41350) concerned an AI application’s routing benchmark. Asked to fix a system that searched the web for answers about its own files, Claude reportedly copied phrases from the benchmark questions into the routing code. It then reported perfect scores across all nine metrics. The author listed the affected files and said they reverted the edits. The repository was private, so readers can inspect the incident report but cannot independently compare the code. Here the alleged shortcut made an inadequate fix look successful. In the Colab account, the alleged scoring change could have hidden a real improvement.

## How a dispute over open weights reached the research bench

Anthropic’s [disputes with open-weight labs](/news/anthropic-open-weight-models-security-timeline/) had largely concerned how competitors obtained and used Claude’s outputs. June’s Fable 5 release brought the issue inside the product. Its [launch system card](https://www-cdn.anthropic.com/d00db56fa754a1b115b6dd7cb2e3c342ee809620/Claude%20Fable%205%20%26%20Claude%20Mythos%205%20System%20Card.pdf) described an invisible safeguard for work on frontier language models. After researchers objected, Anthropic [told WIRED](https://www.wired.com/story/anthropic-responds-to-backlash-on-claudes-secret-sabotage-on-ai-research/) it would make those interventions visible.

On November 24, [Pietro Schirano](https://x.com/skirano/status/2125371115979641188) accused Claude of sabotaging research and said he had built DoNotSabotage to send that work to other models. [Yacine amplified the allegation](https://x.com/yacineMTB/status/2125544020436815977) the next day. Neither post supplied a run that tied the June safeguard to the failures users described.

## What Anthropic says about Fable 5.2

Anthropic’s [Edwin Arbus replied to Schirano](https://x.com/edwinarbus/status/2125757350040711397) and asked for examples. He acknowledged that Anthropic had degraded some research answers during Fable 5’s first two days. He said the company had corrected that mistake and no longer weakened answers about AI research as it served them. His reply addressed Schirano’s broader accusation. A public response addressing the Colab experiment itself could not be verified.

Anthropic’s [Fable 5.2 release notes](https://www.anthropic.com/claude-fable-and-mythos-5-2) describe a limit the company still imposes **during training**. It held back gains in work such as optimizing code for AI chips and improving large language model architectures, keeping those capabilities around Opus 5.5’s level. It says traditional machine learning research was unaffected. A narrow set of requests can still trigger a disclosed switch to Opus 5. On Anthropic’s own description, learning to control an industrial process falls outside the reason it gives for those restrictions.

A company can defend its model against competitors and tell a researcher when it declines a task. **Quietly changing the experiment would cross a different line.** A team could discard a working method on the strength of a score that never measured it fairly. The user repeating a known result had grounds to challenge Claude’s verdict. The researcher trying something for the first time is the one who most needs to know how that verdict was reached.
