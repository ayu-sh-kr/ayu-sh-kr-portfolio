# Reinforcement Learning for LLMs: From RLHF and RLVR to RLSC

You ask an AI to fix a bug. It explains the cause, writes a tidy patch, and confidently tells you the problem is solved. Then you run the tests. The bug is still there.

That gap between a convincing answer and a working result is a useful way into reinforcement learning. A model may have learned enough about programming to describe the right approach, yet still choose an implementation that fails. More knowledge helps, but we also need a training signal that rewards the behaviour we actually want.

Reinforcement learning, or RL, trains an agent to improve its decisions using rewards. In large language models, those rewards can come from human preferences, executable checks, or even the model's own probability estimates. These sources carry very different kinds of evidence: someone liked the answer, a test passed, or the model assigned the response a high probability.

We'll start with the machine-learning foundations, then follow the ideas behind RLHF, RLAIF, DPO, RLVR, process supervision, and RLSC. The question running through them is simple: **what tells the model that one attempt deserves to be repeated?**

## Reinforcement learning starts with decisions and consequences

Imagine training a robot to reach a charging station. You could give it demonstrations of successful routes, but the room may contain obstacles it has never encountered. Reinforcement learning gives it a way to improve through attempts: observe the room, choose a movement, see what happens, and use the result to adjust its behaviour.

The robot is the **agent**. The room is its **environment**. Its available information describes the **state**, and a movement is an **action**. The **policy** is the strategy that chooses actions from that information. A **reward** is a number supplied by the training setup to score an outcome. These terms also apply to games, resource scheduling, and other decision problems; a robot is just an easy example to picture.

The diagram separates interaction from learning. The agent acts in the environment; a training algorithm uses the resulting experience to update the policy.

![The policy selects an action; the environment returns a new state and reward; a learning update changes the policy for future attempts.](/blogs/tutorial/assets/reinforcement-learning-from-rlhf-to-rlsc/01-rl-loop.svg)

A reward does not necessarily tell us whether the latest action was good in isolation. Reaching the charger may require moving away from it first to go around a wall. RL therefore aims to improve expected accumulated reward, often called the **return**, across a sequence of decisions. A discount factor can reduce the weight of rewards farther into the future.

This creates the credit-assignment problem: which earlier choices contributed to success? It also creates the exploration problem. Repeating the best route found so far is useful, but occasionally trying another route may reveal a shorter one. Too little exploration can trap the agent in a mediocre strategy; too much wastes attempts on poor choices.

Rewards are designed signals, not an automatic understanding of our intent. If we reward the robot only for getting closer to the charger, it might keep pushing against the wall. If we reward reaching the charger but ignore collisions, it might learn a route we would never allow in a real room. The objective must describe enough of the task for improved scores to mean improved behaviour.

## How the RL loop maps to a language model

For an LLM, the policy is the model's distribution over possible next tokens. The state can be represented by the prompt and the tokens generated so far. Each token is an action, and a completed answer is a sequence of those actions. In an agent workflow, tool calls and their returned observations extend that sequence.

Pre-training usually teaches next-token prediction over large amounts of text. Supervised fine-tuning, or SFT, then shows the model examples of desired responses. RL adds a different learning signal: sample an attempt, score its outcome, and update the model so higher-reward behaviour becomes more likely. These stages can complement one another; RL is not a requirement for every useful language model.

Here is how the same decision loop looks when the task is producing an answer. The final score can influence many token choices that preceded it.

![A prompt and generated tokens form the state, the LLM samples a response, and an evaluator scores that response for training.](/blogs/tutorial/assets/reinforcement-learning-from-rlhf-to-rlsc/02-rl-to-llm.svg)

For our bug-fixing assistant, a training attempt might include inspecting a file, editing a function, and running a test. A successful result can reward that sequence, while a failing result provides evidence against it. The training algorithm still has to work out how to distribute that signal across the choices; the test does not directly supply the correct patch.

It also helps to distinguish training from ordinary use. Generating several answers and selecting the best one at inference time does not, by itself, update the model's weights. An assistant can use test feedback to revise a patch within a conversation without undergoing reinforcement learning. RL happens when experience feeds a parameter-update process.

That leaves the central design decision: who supplies the score, and what does that score actually measure?

## RLHF: learning which answers people prefer

Some qualities are difficult to express as a test. You may want an explanation to be clear, relevant, appropriately cautious, and responsive to the question. **Reinforcement Learning from Human Feedback (RLHF)** uses human judgments to help define that target.

In the classic pipeline, reviewers compare candidate answers to the same prompt. Those comparisons train a separate reward model to predict human preferences. The language model then generates responses and receives scores from that reward model during RL training. The [InstructGPT paper](https://arxiv.org/abs/2203.02155) describes this progression from supervised demonstrations to preference comparisons and policy optimization.

The distinction between the two stages matters: people label comparisons, while the learned reward model supplies scores for many subsequent training attempts.

![Human comparisons train a reward model; the reward model then scores newly sampled responses to guide LLM policy updates.](/blogs/tutorial/assets/reinforcement-learning-from-rlhf-to-rlsc/03-rlhf.svg)

Think about asking for an explanation of [Redis messaging](/blog/why-use-redis-channels/). One answer is accurate but assumes you already understand delivery semantics. Another introduces the terms and explains when losing a message matters. A reviewer can prefer the second without reducing good teaching to a single mechanical rule.

The breakthrough was making such judgments usable at training scale. However, the model optimizes the reward model's prediction, which is an imperfect stand-in for what reviewers intended. A score can favour persuasive wording or excessive agreement, even when an answer deserves more scrutiny.

Return to the broken patch. A reviewer who reads the explanation without executing the code might prefer it. That does not make preference feedback useless; it tells us which part of the task still needs another kind of evidence.

## RLAIF: scaling feedback with an AI evaluator

Human comparison data takes time to produce. **Reinforcement Learning from AI Feedback (RLAIF)** uses model-generated judgments for some of that supervision. A judge model can compare responses against stated criteria, producing preference data that can support reward-model training.

[Constitutional AI](https://arxiv.org/abs/2212.08073) is an influential example. It combines a supervised stage involving critique and revision with a reinforcement-learning stage using AI-generated preferences. Written principles guide the process. Humans still determine those principles and evaluate the resulting system; the method changes how some individual judgments are produced.

For a bug-fixing task, a judge might assess whether a patch addresses the requested scope and whether its explanation matches the changes. This could provide useful feedback across many examples. But the judge can also miss the same subtle bug as the model it evaluates.

AI feedback therefore moves part of the quality problem into the evaluator and its criteria. More judgments are useful only when they retain a meaningful relationship to the behaviour we want.

## DPO: using preferences without a separate RL stage

Once you have preferred and rejected answers, do you always need to train a reward model and run an RL loop? **Direct Preference Optimization (DPO)** offers another route. It trains directly on preference pairs, using a reference policy to define the optimization objective. The [DPO paper](https://arxiv.org/abs/2305.18290) derives this objective from a regularized reward-maximization formulation.

Standard DPO avoids the separate reward-model training and online response-sampling loop of classic RLHF. That can make preference training simpler to implement. It belongs in this discussion as an alternative way to learn from preferences, rather than another source of rewards.

Both routes start with comparisons. The diagram shows where their training machinery differs.

![Classic RLHF fits a reward model and runs policy optimization; DPO trains directly on preferred and rejected responses with a reference policy.](/blogs/tutorial/assets/reinforcement-learning-from-rlhf-to-rlsc/04-rlhf-vs-dpo.svg)

The distinction is practical. If your comparison dataset rewards tidy but broken patches, changing the optimizer will not fix its definition of “better.” You still need preferences that reflect the actual task, and an evaluation set that can expose failures the training data missed.

## RLVR: rewarding results we can check

Our opening example has an unusually useful property: we can execute the patch. **Reinforcement Learning with Verifiable Rewards (RLVR)** uses checkable outcomes to construct the reward. A numeric answer can be compared with a known solution, code can be run against tests, and a formal proof can be checked by a proof assistant.

For a small arithmetic task, suppose the prompt asks for 137 × 46. The correct result is 6,302. A simple verifier assigns a reward of 1 to that answer and 0 to an incorrect answer. It does not need to decide which response sounds more thoughtful. In more complex tasks, rewards may include several checks rather than one binary result.

Each task needs an appropriate verifier. These are alternative examples, rather than four checks every response must pass.

![Arithmetic uses an answer checker, code uses executable tests, and formal proofs use a proof checker; each produces a task-specific reward.](/blogs/tutorial/assets/reinforcement-learning-from-rlhf-to-rlsc/05-rlvr.svg)

[DeepSeek-R1](https://arxiv.org/abs/2501.12948) is a prominent example of reinforcement learning applied to reasoning. Its R1-Zero experiments used rule-based rewards, including accuracy and format rewards, without an initial supervised fine-tuning stage. The full R1 pipeline included additional stages, including cold-start data. Those are different training setups and should not be collapsed into the claim that all reasoning models learn through RL alone.

The useful shift is that training can reward successful attempts even when nobody has supplied a demonstration of every intermediate step. For coding, this gives us a way to score candidate solutions by what they do. It still leaves a substantial engineering task: building a verifier whose successes correspond to the user's requirements.

### A passing check has a boundary

A unit test establishes that the code passed that test under its conditions. It does not establish that the patch handles every input, preserves security, or behaves correctly under concurrency. A model might find an implementation that passes visible examples while failing nearby cases. Worse, if the environment lets it modify the evaluator, it may obtain the reward without solving the intended problem.

Imagine a function that should return a discount for eligible customers. A training set containing only eligible customers could reward a patch that returns the discount unconditionally. Every available test passes; the business rule is still wrong. Adding ineligible customers changes the evidence the reward can represent.

A stronger setup protects the evaluator, varies inputs, includes negative cases, and measures performance on held-out tasks. For a repository agent, build success, regression tests, task-specific checks, and change-scope constraints answer different questions. Combining them requires care because a large score for one dimension can otherwise hide failure on another.

> A verifiable reward is only as useful as the property the verifier actually checks.

That is why “evidence-based reward” needs a precise definition. A citation, a judge's opinion, and an executable test may all count as evidence in ordinary language, but they have different failure modes. RLVR refers specifically to rewards grounded in verifiable task outcomes.

## PPO and GRPO: how rewards change the policy

Reward sources and optimization algorithms are separate choices. RLHF and RLVR describe where feedback comes from. **Proximal Policy Optimization (PPO)** and **Group Relative Policy Optimization (GRPO)** describe ways to use feedback when updating a policy. Seeing these acronyms together does not mean they are competing definitions of reinforcement learning.

[PPO](https://arxiv.org/abs/1707.06347) aims to make policy updates more controlled, commonly using a clipped objective to discourage overly large changes. In typical LLM RLHF setups, a value model helps estimate expected rewards, and a reference-policy penalty can discourage excessive drift. The implementation has several interacting parts; the reward score alone is not the complete training objective.

[DeepSeekMath](https://arxiv.org/abs/2402.03300) introduced GRPO, which compares rewards across a group of sampled responses to the same prompt and avoids the separate critic model used in typical PPO setups. Responses can be judged relative to the group's performance, providing a baseline for the update.

For intuition, imagine four sampled patches, with two passing the checks and two failing. Relative scores give the optimizer a way to favour stronger attempts. If every attempt fails identically, that group provides little distinction to learn from. Better task selection, useful exploration, and informative rewards still matter, whichever algorithm performs the update.

## Process supervision: inspecting intermediate steps

A final answer can be right for the wrong reason. In arithmetic, two mistakes might cancel out. In a repository, a patch might bypass the failing code rather than repair it. **Process supervision** supplies feedback on intermediate steps, whereas outcome supervision evaluates the end result.

[Let's Verify Step by Step](https://arxiv.org/abs/2305.20050) studied process and outcome supervision for mathematical reasoning. Step-level judgments can train a process reward model. Such a model may help rank candidate solutions or provide training feedback; using a process reward model does not automatically mean an RL update occurred.

For our coding example, an intermediate check might establish whether the proposed reproduction actually triggers the bug. Another could check whether the patch preserves a required invariant. These signals can make failure easier to locate than a single score at the end of a long attempt.

The difficulty is deciding what counts as a valid step. Several approaches may be correct, and a judge can penalize an unfamiliar but sound solution. A written reasoning trace also need not fully reveal how the model produced its answer. Process feedback is useful evidence about observable steps, with its own evaluator limits.

## Self-rewarding models: generating part of their own feedback

Could a model help produce the judgments used to improve itself? **Self-rewarding approaches** investigate that possibility. The [Self-Rewarding Language Models paper](https://arxiv.org/abs/2401.10020) used LLM-as-a-judge prompting to generate rewards and iterative DPO for training. This is an important detail: self-generated feedback does not require a conventional RL optimizer.

The motivation is that evaluating a candidate and generating one are different tasks. A model may be able to compare two solutions more reliably than it can consistently produce its best solution on the first attempt. Its judgments can then contribute new preference examples.

Consider two candidate explanations of a patch, one mentioning an input assumption and one hiding it. A judge might usefully favour the explicit version. But if both the generator and judge misunderstand the assumption, repeated self-evaluation can preserve that mistake. An independent evaluation set is still needed to establish whether the loop is improving the outcome you care about.

## RLSC: what self-confidence actually means

Human comparisons and external checks both require a source of supervision. **Reinforcement Learning via Self-Confidence (RLSC)** explores an internal signal instead. The June 2025 preprint [Confidence Is All You Need](https://arxiv.org/html/2506.06395v3) describes an objective that sharpens the model's response distribution, increasing concentration on responses it already assigns higher probability.

Here, confidence comes from model probabilities, not a sentence saying “I am 94% sure.” The paper weights sampled responses using a frozen sampling model's probabilities and updates the trainable model. It reports mathematical-reasoning improvements in experiments with Qwen2.5-Math-7B. That is a specific research result, not evidence that confidence rewards work universally.

The diagram shows the source of the signal. There is no external correctness check inside this simplified training loop.

![A frozen sampling policy supplies response probabilities; these weight the training loss used to update the trainable model, without checking answer correctness.](/blogs/tutorial/assets/reinforcement-learning-from-rlhf-to-rlsc/06-rlsc.svg)

A useful way to think about the limitation is to imagine a model with a persistent misconception. If its most probable response contains that misconception, increasing concentration can make the error more consistent. The score measures the model's distribution, not the world's agreement with it.

Similarly, calibration is a separate question: among predictions assigned a particular confidence level, how often are they correct? A high response probability is not automatically a calibrated probability of factual correctness. We should evaluate confidence-based training against independent answers and held-out tasks before treating higher confidence as improvement.

## Choosing feedback for the task you actually have

These methods form a set of design choices, rather than a ladder where each new acronym makes the previous one obsolete. Preference data can describe qualities that are hard to test. Verifiers can establish specific outcomes. Process feedback can inspect intermediate work. Confidence supplies an internal signal whose relationship to correctness has to be measured.

The following diagram is an illustrative design for a coding task, not a claim about a particular deployed model. It keeps required checks separate from softer preferences so that polished explanations cannot compensate for broken behaviour.

![A candidate patch first faces required correctness and scope checks; failed candidates receive failure feedback, while passing candidates can be compared on useful explanations.](/blogs/tutorial/assets/reinforcement-learning-from-rlhf-to-rlsc/07-reward-stack.svg)

For our bug-fixing assistant, I would start by defining what success means: reproduce the bug, fix the behaviour, preserve existing contracts, and explain the relevant changes. Executable checks can cover parts of the first three requirements. Human or AI preferences can help with the explanation. Any weighted combination needs inspection because changing the weights can change which trade-offs the model learns to accept.

Evaluation should then look beyond the training reward. Does the model solve unseen bugs? Does it still succeed when inputs change? Does it report a failed check honestly? A rising reward curve is useful diagnostic information, but it cannot answer questions the evaluator never asked.

## Back to the patch that looked finished

The assistant in the opening had enough knowledge to sound useful. What it lacked in that attempt was a working result. Reinforcement learning gives us a way to make successful behaviour more likely, provided the reward captures the part of success we care about.

RLHF brings human preference into training; RLAIF scales some judgments through models; DPO offers a direct route from comparisons to policy changes. RLVR rewards checkable outcomes, while process supervision adds evidence about the steps. Self-rewarding methods and RLSC explore how much supervision a model can supply for itself, with independent evaluation still needed to establish improvement.

So when you assess a new training method, ask what earned the reward and what could earn the same reward while still failing the task. For the patch we started with, a convincing explanation deserved attention. A passing, well-designed test deserved a different kind of trust. Better models depend on teaching that distinction—and checking that they learned it.

## Sources and further reading

The links below are primary research. The robot and coding examples are illustrations, not reported experiments. RLSC is presented as a research proposal; this guide does not claim it is the latest or established replacement for other post-training methods.

- Schulman et al. (2017), [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
- Ouyang et al. (2022), [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155).
- Bai et al. (2022), [Constitutional AI: Harmlessness from AI Feedback](https://arxiv.org/abs/2212.08073).
- Rafailov et al. (2023), [Direct Preference Optimization](https://arxiv.org/abs/2305.18290).
- Lightman et al. (2023), [Let's Verify Step by Step](https://arxiv.org/abs/2305.20050).
- Yuan et al. (2024), [Self-Rewarding Language Models](https://arxiv.org/abs/2401.10020).
- Shao et al. (2024), [DeepSeekMath](https://arxiv.org/abs/2402.03300).
- DeepSeek-AI et al. (2025), [DeepSeek-R1](https://arxiv.org/abs/2501.12948).
- Li et al. (2025), [Confidence Is All You Need, version 3](https://arxiv.org/html/2506.06395v3).
