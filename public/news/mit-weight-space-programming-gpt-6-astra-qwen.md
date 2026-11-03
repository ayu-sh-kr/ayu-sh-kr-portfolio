# MIT researchers use GPT-6 Astra to edit Qwen’s weights

An AI model can sometimes solve a problem and still never give you the answer. In a new MIT CSAIL experiment, **GPT-6 Astra edited another model’s weights** to reduce that failure, raising its reported math benchmark score without a conventional training run.

The [November 2 research post](https://rikiyat.github.io/blog/weight-space-programming/) comes from Rikiya Takehi, Jayden Teoh, Alex Zhang and Omar Khattab. Takehi studies language models and AI agents; Khattab’s work includes programming and optimizing AI systems, including DSPy. Their team calls the approach **weight-space programming**: using a model to reason about and directly change the numerical parameters that shape another network’s behavior.

## What Astra changed

The target was Qwen3.5-0.8B, a small open-weight language model. When asked to reason, it could get caught repeating itself until it ran out of room to answer. [Qwen’s model card](https://huggingface.co/Qwen/Qwen3.5-0.8B) also warns about thinking loops.

Astra used a Python environment to inspect the weights and test Qwen on practice problems. The researchers report that it identified a direction associated with looping in two layers and removed it from selected parts of their weights. The resulting edit changed **131,072 parameters, about 0.016%** of the model.

There was no gradient descent or training loop to calculate the update. But this was not a one-shot fix without feedback: the strongest result used **50 rounds of model evaluations**, with Astra examining behavior and making edits along the way.

## What the improvement means

With the same sampling settings, the researchers report that Qwen’s score on MATH-500 rose from **7.9% to 48.1%**. The share of responses reaching the 32,768-token limit fell from **93% to 33.1%**. They also report instruction-following performance on IFEval rising from 21% to 62.3%. MATH-500 scores averaged four samples per problem; Astra did not see the evaluation problems.

The distinction matters: the team’s analysis found that nearly all recovered answers had previously been cut off. The edit helped Qwen **finish answers it could already work out**; it does not establish that Astra taught it new math. When the researchers tried Gemma 3 270M, which rarely looped, they could not establish a meaningful math improvement.

## A promising repair, with boundaries

The team reports targeted controls and has released the [experiment logs](https://github.com/RikiyaT/lm_understand-logs) and edited model. They credit Hugging Face’s Ahsen Khaliq with rebuilding and reevaluating it. These are encouraging steps toward reproduction, though the broader method still needs further independent testing across models and failures.

Direct weight editing is not new; the interesting result is a general-purpose model using tools and behavioral feedback to find a targeted repair. For the question that Qwen kept trying to answer, the change was simple in effect: it gave the model a better chance to finish. Whether similar repairs work beyond identifiable failures remains open.

Sources: [MIT CSAIL research and experiment details](https://rikiyat.github.io/blog/weight-space-programming/), [Qwen model card](https://huggingface.co/Qwen/Qwen3.5-0.8B), [experiment logs](https://github.com/RikiyaT/lm_understand-logs), and [Omar Khattab’s research](https://omarkhattab.com/).
