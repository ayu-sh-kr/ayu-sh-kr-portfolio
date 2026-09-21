# Reinforcement Learning: How Rewards Taught Models to Behave

A model can know a surprising amount and still make the wrong move.

That is the part people often miss when they talk about AI as if more data automatically means better behaviour. Pre-training can teach a model language, patterns, facts, code and even a fair amount of reasoning. But it does not, by itself, teach the model which answer is more useful, which action should be avoided, or which line of reasoning deserves to be repeated next time.

Reinforcement learning enters exactly there. It gives the model something ordinary training does not: a consequence.

Once you see that, RLHF, RLVR, RLAIF, DPO and confidence-based methods stop looking like unrelated acronyms. They become different answers to one question:

**Where should the reward come from?**

---

## Reinforcement learning before LLMs

In machine learning, reinforcement learning is easiest to understand as learning through interaction.

An agent sees some state, chooses an action, receives a reward, and moves into another state. Over many attempts, it learns which actions tend to produce better long-term outcomes.

![A hand-drawn reinforcement learning loop showing state, action, environment, reward and policy update](/blogs/tutorial/assets/reinforcement-learning-from-rlhf-to-rlsc/01-rl-loop.svg)

A useful mental model is:

[
state ightarrow action ightarrow reward ightarrow update
]

The thing being learned is the policy: the strategy that decides which action to take in a given situation.

In a game, the state could be the board and the action could be a move. In robotics, the state could be sensor readings and the action could be a motor command. In recommendation systems, the action could be which item to show.

The reward is the crucial part. It tells the agent whether an action moved it in a useful direction.

That reward does not have to arrive immediately. A chess engine can sacrifice a piece now because that move improves its chance of winning later. RL therefore cares about accumulated future reward, not only what feels good in the next step.

This creates the classic exploration problem. If the agent always repeats the action it currently believes is best, it may never discover something better. If it explores forever, it never settles on what works. RL lives in that tension between trying new things and exploiting what has already been learned.

The details get mathematical quickly, but the basic idea stays simple: **behaviour that leads to better outcomes becomes more likely.**

---

## Why LLMs needed reinforcement learning at all

A language model is trained first by predicting the next token.

Give it:

> The sky appears blue because...

and the model estimates which token is likely to come next, then repeats that process token by token.

That objective is powerful because it forces the model to absorb structure from enormous amounts of text. But next-token prediction is not the same thing as being helpful.

A model can produce a continuation that is statistically plausible and still be rambling, evasive, unsafe, overconfident or simply not what the user asked for.

This is where the RL framing becomes useful.

For an LLM, the state is roughly the conversation so far. The action is the response, or more precisely the sequence of token choices that forms it. The reward is a score that says how desirable that output was.

![A hand-drawn bridge from classical RL to LLM post-training: prompt becomes state, response becomes action, evaluator supplies reward](/blogs/tutorial/assets/reinforcement-learning-from-rlhf-to-rlsc/02-rl-to-llm.svg)

That gives us a new training loop:

[
prompt ightarrow response ightarrow reward ightarrow policy update
]

The hard part is no longer understanding RL. The hard part is deciding who or what gets to produce the reward.

That is where nearly every major post-training idea starts.

---

## RLHF: let people tell the model what they prefer

Reinforcement Learning from Human Feedback, or RLHF, became the best-known answer.

The idea is straightforward. Give human reviewers several responses to the same prompt and ask which one is better.

Imagine the prompt is:

> Explain Redis Streams to someone who already understands Pub/Sub.

The model produces two answers. One is technically correct but bloated. The other is concise, keeps the comparison grounded in delivery semantics and does not wander.

A reviewer prefers the second one.

Repeat that process across many prompts and you get preference data:

[
B > A
]

Those comparisons are then used to train a reward model. The reward model learns to imitate those human preferences so it can score many more model responses than humans could review manually.

The LLM is then optimized against that reward model.

![A hand-drawn RLHF pipeline showing model outputs, human ranking, reward model and policy update](/blogs/tutorial/assets/reinforcement-learning-from-rlhf-to-rlsc/03-rlhf.svg)

This was the core pattern behind InstructGPT: supervised demonstrations first, human rankings next, then reinforcement learning using a learned reward model.

RLHF solved a practical problem. Pre-trained models knew plenty, but they did not reliably follow user intent. Human preference data gave the training process a signal for qualities that are hard to express with a simple formula: helpfulness, clarity, relevance and conversational behaviour.

But RLHF also introduced a subtle weakness.

The model is not optimizing for "what humans truly want" in some abstract sense. It is optimizing for what the reward model predicts humans would prefer.

That is a proxy.

If the reward model learns that polished confidence often wins human preference, the policy may learn to sound more certain even when uncertainty would be healthier. If annotators favour shorter answers in one dataset and more thorough answers in another, those biases can become part of the reward surface.

This is the general RL problem in another costume: when you optimize a proxy hard enough, the proxy starts mattering more than the thing it was meant to represent.

---

## RLAIF: use AI to help generate the feedback

Human feedback is valuable, but it is expensive and slow.

RLAIF, Reinforcement Learning from AI Feedback, asks whether another model can provide part of that supervision.

One influential version appears in Constitutional AI. Instead of relying only on people to rank every output, the system uses a set of written principles and asks a model to critique or compare responses against them. Those AI-generated preferences can then train a reward model, which is used for reinforcement learning.

The important distinction is not that humans disappear. Humans still define the principles, datasets and evaluation criteria. What changes is the scaling layer.

You can think of it as moving from:

[
human ightarrow every preference
]

to:

[
human ightarrow principles ightarrow AI-generated preferences
]

This makes the feedback pipeline much easier to scale, especially when the thing being judged is not mathematically verifiable but still follows recognizable rules.

The trade-off is obvious: if the model acting as evaluator has blind spots, those blind spots can become training signal.

So RLAIF reduces dependence on per-example human labels, but it does not magically remove the problem of reward quality. It changes where that quality has to come from.

---

## DPO: skip the reinforcement-learning loop for preferences

Direct Preference Optimization, or DPO, is interesting because it attacks the machinery around RLHF rather than the preference idea itself.

Traditional RLHF usually has three distinct pieces: gather preferences, train a reward model, then use reinforcement learning to optimize the language model against that reward.

DPO showed that, under the usual preference-model setup, you can directly train the language model on preferred and rejected responses without separately fitting a reward model and then running the RL stage.

![A hand-drawn comparison between RLHF and DPO showing the reward-model-and-RL detour removed in DPO](/blogs/tutorial/assets/reinforcement-learning-from-rlhf-to-rlsc/04-rlhf-vs-dpo.svg)

The practical appeal is large. Fewer moving parts means training can be simpler and more stable.

But conceptually, DPO belongs in this story because it keeps the same source of supervision: preferences.

It is not "RL with a new reward." It is closer to saying: if I already have ranked answers, can I optimize the policy directly instead of explicitly constructing the reward model in the middle?

That is an important distinction because people often group every post-training technique under RL. DPO is better thought of as a direct preference-optimization alternative to the classic RLHF pipeline.

The bigger shift came when researchers asked whether we could leave preference judgments behind for tasks where correctness can actually be checked.

---

## RLVR: stop asking what looks better when we can verify what is correct

Reinforcement Learning with Verifiable Rewards, or RLVR, changes the reward source more dramatically.

Suppose we ask a model:

> What is 137 × 46?

If the model answers 6302, we do not need a panel of humans to tell us whether the answer "feels preferable." We can calculate it.

The reward can be generated by a verifier:

[
reward =
egin{cases}
1 & 	ext{if correct} \\
0 & 	ext{if incorrect}
end{cases}
]

That simple idea becomes extremely powerful in domains where outputs can be checked mechanically.

For math, use an answer checker.

For code, compile it and run tests.

For SQL, execute the query and validate the result.

For a formal proof, use a proof assistant.

For an agent changing a repository, run the build, tests and task-specific checks.

![A hand-drawn RLVR diagram showing one model response being checked by calculator, tests, SQL execution and proof verification](/blogs/tutorial/assets/reinforcement-learning-from-rlhf-to-rlsc/05-rlvr.svg)

This removes a lot of subjectivity from the reward.

RLHF says, roughly:

**A person preferred this answer.**

RLVR says:

**This answer passed the check.**

That sounds like a small difference. It is not.

Once the reward is tied to an external fact about the task, the model has less room to win by merely sounding convincing.

That matters especially for reasoning models. A beautifully written wrong derivation should not beat an ugly correct one just because the evaluator likes the prose.

Research on RLVR has focused heavily on whether verifiable final outcomes also improve the reasoning process itself. Recent work argues that RLVR can encourage logically correct reasoning, not only reweight already-known answers, although measuring reasoning quality remains tricky.

RLVR also explains why coding agents are such a natural fit for reinforcement learning. Software gives us unusually rich evidence.

A patch can be rewarded for compiling, passing existing tests, satisfying new tests and avoiding regressions. The environment gives us signals humans do not have to invent manually.

The limitation is equally important: plenty of useful tasks are not cleanly verifiable.

There is no unit test for "write a tactful apology" or "make this explanation feel less patronizing."

That means verifiable rewards do not replace preference-based methods. They occupy the places where reality can answer the question for us.

---

## Process rewards: reward the path, not only the final answer

Outcome rewards judge where the model ended up.

Process rewards try to judge how it got there.

That distinction matters because a model can arrive at the correct answer through flawed reasoning, guessing or accidental cancellation of errors.

If a system only rewards final correctness, all of those paths can receive the same score.

Process supervision tries to evaluate intermediate steps.

For a math problem, each reasoning step might be checked or scored. For an agent, the sequence of tool calls can be evaluated. For code, an intermediate plan could be judged against constraints before the final patch is produced.

This gives training a denser signal. Instead of waiting until the end to discover that the whole attempt failed, the model can learn which parts of the trajectory were useful.

The downside is cost and ambiguity. Verifying a final numeric answer is easy. Verifying every reasoning step is much harder, and sometimes there is more than one valid path.

So process rewards are powerful when the intermediate structure is inspectable, but they can also reintroduce the same evaluator-quality problem we saw with RLHF.

---

## Self-rewarding models: let the model judge other answers

Another direction asks whether the model itself can participate in building the reward.

This sounds circular, but it is not automatically useless.

A capable model can often distinguish a stronger answer from a weaker one even when generating the stronger answer consistently is still difficult. That gap between recognition and production is common in machine learning.

Self-rewarding approaches exploit it. The model generates candidate answers, evaluates them, and uses those evaluations as additional training signal.

The attraction is obvious: feedback can scale with generation.

The risk is just as obvious: a model can reinforce its own mistakes.

If the evaluator and policy share the same blind spot, self-reward can amplify it. External checks, stronger judge models or mixed reward sources are therefore often used to keep the loop grounded.

This line of work matters because it points toward systems that generate not only their own practice problems, but part of their own supervision.

---

## RLSC: use the model's own confidence as reward

Reinforcement Learning via Self-Confidence, or RLSC, pushes the self-generated reward idea in a different direction.

Instead of asking another model to rank answers, RLSC looks at the model's own confidence.

Language models already produce probability distributions over tokens. Those probabilities contain information about how strongly the model supports one continuation over another.

Suppose a model solves the same problem several ways:

[
A ightarrow 42 quad confidence = 0.94
]

[
B ightarrow 38 quad confidence = 0.31
]

[
C ightarrow 42 quad confidence = 0.88
]

If confidence correlates with correctness often enough, it can become a reward signal.

![A hand-drawn RLSC diagram showing several sampled solutions, their confidence scores and a policy update toward high-confidence trajectories](/blogs/tutorial/assets/reinforcement-learning-from-rlhf-to-rlsc/06-rlsc.svg)

The appeal is strong. Human labels are expensive. External verifiers only exist for some tasks. Confidence is available directly from the model.

Research on RLSC reported improvements on mathematical reasoning tasks using self-confidence as reinforcement signal, which makes it one of the more interesting attempts to reduce dependence on external reward models.

But there is a hard boundary we should not blur:

**confidence is not truth.**

A model can be confidently wrong.

In fact, one of the defining problems of language models is that fluent probability can look like certainty even when the underlying answer is false.

So confidence-based RL becomes much more convincing when confidence is calibrated or combined with independent signals.

A useful reward might therefore look more like:

[
R = alpha R_{verified} + eta R_{confidence}
]

rather than:

[
R = R_{confidence}
]

The verifier anchors the model to reality. Confidence helps distinguish which successful reasoning paths the model itself represents most coherently.

That combination is more interesting than confidence alone.

---

## The reward stack is becoming more mixed

The history of post-training looks less like one technique replacing another and more like reward sources accumulating.

Human feedback is useful for subjective qualities.

AI feedback scales judgments defined by principles.

Direct preference optimization simplifies preference training.

Verifiable rewards anchor reasoning to externally checkable outcomes.

Process rewards add signal along the trajectory.

Self-rewarding systems reduce dependence on external labelers.

Confidence-based rewards try to mine supervision from the model's own probability structure.

![A hand-drawn reward stack showing human preference, AI feedback, verifiers, process checks and confidence converging into one policy update](/blogs/tutorial/assets/reinforcement-learning-from-rlhf-to-rlsc/07-reward-stack.svg)

The interesting systems are increasingly hybrids.

A coding model might get a large reward for passing tests, a smaller reward for following repository conventions, a penalty for breaking unrelated files, and a preference score for whether the final explanation is useful.

An assistant might use human-derived preference training for tone and safety, verifier-based training for math and coding, and process supervision for tool use.

There is no reason one reward source has to own the whole problem.

The real design question becomes: **which parts of this task can be measured directly, which require preference, and which signals can be trusted only as supporting evidence?**

That is a much healthier way to think about post-training than asking which acronym is "the best."

---

## Why reward design is now one of the central AI problems

Once a model becomes capable enough, the bottleneck shifts.

Pre-training asks:

**Can the model represent the behaviour?**

Post-training asks:

**Can we reliably push it toward the behaviour we actually want?**

That second question is harder than it looks because rewards are instructions written in numbers.

Whatever we reward, the model will search for ways to obtain.

If we reward final-answer correctness only, it may learn shortcuts.

If we reward human preference only, it may learn presentation tricks.

If we reward a judge model, it may learn the judge's biases.

If we reward confidence, it may learn to become more certain rather than more correct.

If we reward tests, it may overfit to the tests.

This is not unique to LLMs. It is the old RL problem of reward hacking, now operating inside systems that can write code, use tools and reason over long contexts.

The stronger the model becomes, the more carefully the reward has to describe the thing we truly care about.

---

## Where this leaves us

Go back to the opening problem: a model can know a surprising amount and still make the wrong move.

That is exactly why reinforcement learning became so important for modern AI.

Pre-training gives the model capability. Reinforcement and preference training shape what it does with that capability.

RLHF taught models to listen to human preference.

RLAIF showed that some of that supervision can be scaled through other models.

DPO simplified how preference data can directly shape a policy.

RLVR moved the reward closer to reality wherever correctness can be checked.

Process rewards tried to improve not only the destination but the path.

Self-rewarding approaches asked models to help generate their own supervision.

RLSC went one step further and asked whether confidence itself could become part of the signal.

None of these removes the core difficulty.

The model still follows the reward.

So the real breakthrough is not that we found one perfect training method. It is that we are getting better at building rewards from different kinds of evidence, and at knowing when each kind deserves trust.

The next generation of capable models will not be defined only by how much they know.

They will be defined by **what taught them which move was worth making.**

---

## References

- Ouyang et al., *Training language models to follow instructions with human feedback*, 2022.
- Bai et al., *Constitutional AI: Harmlessness from AI Feedback*, 2022.
- Rafailov et al., *Direct Preference Optimization: Your Language Model is Secretly a Reward Model*, 2023.
- Wen et al., *Reinforcement Learning with Verifiable Rewards Implicitly Incentivizes Correct Reasoning in Base LLMs*, 2025.
- *Reinforcement Learning via Self-Confidence (RLSC)*, 2025.
