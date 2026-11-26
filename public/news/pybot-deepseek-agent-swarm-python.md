# PyBot: a Python chatbot built by DeepSeek agents

Apparently, the web needed another PyBot. With the name already attached to [IRC](https://labix.org/pybot) and [Discord bots](https://github.com/RexBluefox/PyBot), Hugging Face has joined the collection.

How far can a rule-based chatbot go when a swarm of AI agents writes the rules? **PyBot** is Hugging Face’s experiment in that question: agents repeatedly build and evaluate a conversational program whose replies come entirely from Python code.

Leandro von Werra’s announcement attributes the week-long build to **1,000 DeepSeek Flash agents**. The [published repository](https://github.com/huggingface/pybot) describes more than 5,000 evaluated versions, resulting in roughly **640,000 lines of Python**.

## What PyBot is

The [repository](https://github.com/huggingface/pybot#pybot-can-python-be-a-chatbot) places the experiment in the tradition of ELIZA, the early chatbot that matched text patterns to response templates. Extending that approach meant writing more rules by hand. PyBot gives that work to agents and measures the resulting conversational performance.

PyBot is a **rule-based chatbot**, rather than a large language model. Its runtime uses conditions, text patterns and lookup tables. The LLMs did the development work; the finished program runs locally with Python 3.8 or newer and the standard library.

Developers can inspect the rules, change stored facts and trace an answer to its module. The [browser demo](https://huggingface.co/spaces/HuggingFaceSwarms/PyBot) shows which module produced each reply.

## How its Python rules produce a reply

An understanding layer interprets the message, including its topic and references to earlier turns. Modules draw on conversation memory, stored knowledge and a response composer to propose answers. An [**arbiter selects a candidate**](https://github.com/huggingface/pybot/blob/main/bot/modules/arbiter.py), using rules for topic relevance, priority and repetition.

![Animated isometric PyBot assembly: a message reaches shared context and reply modules, candidate answers travel to an arbiter, and one selected reply leaves the system.](/news/assets/pybot-deepseek-agent-swarm-python/conversation.svg)

> **Following the conversation.** Memory carries context between messages. The project’s demo follows kettle-cleaning instructions with a question about duration, which PyBot answers from that context. The diagram groups understanding, memory, knowledge and composition code into the shared assembly.

## How far the experiment reached

On [**SmolTalkBench**](https://huggingface.co/datasets/HuggingFaceSwarms/SmolTalkBench), where an LLM judge compares replies with reference answers, the [team reports](https://github.com/huggingface/pybot#pybot-can-python-be-a-chatbot) its win rate rising from **0% to 26%** across development. The project places that result alongside [**SmolLM-360M-Instruct**](https://huggingface.co/HuggingFaceTB/SmolLM-360M-Instruct) on the same conversational evaluation. Its documented runtime takes a few seconds to start and about a second per reply.

The question was how much further agents could take an approach once expanded by hand. PyBot leaves a measured result and a runnable codebase: a record of the rules the swarm produced, how they work together and how their answers improved through repeated evaluation.
