# PyBot: DeepSeek agents build a chatbot that runs on Python rules

A thousand AI agents spent a week building a chatbot that would answer without calling an AI model. That is the premise of **PyBot**, the Hugging Face experiment introduced by Leandro von Werra: DeepSeek Flash agents wrote the software, while ordinary Python rules handle the conversation afterwards.

The [published repository](https://github.com/huggingface/pybot) describes more than 1,000 agents producing and evaluating over 5,000 versions. The result is roughly **640,000 lines of Python**, using conditions, text patterns and stored facts instead of neural-network weights.

## How a message becomes a reply

Rule-based chatbots long predate modern language models. Their difficulty is coverage: every new topic or phrasing can require more logic. PyBot explores how far that approach goes when agents do the writing.

Its modules share four building blocks: an understanding layer for interpreting messages, conversation memory, a knowledge base and a response composer. On each turn, modules can propose answers; an **arbiter selects the reply**.

![Isometric PyBot runtime: a message enters shared understanding, memory and knowledge components; candidate replies reach an arbiter, which selects the response. No language model runs in this path.](/news/assets/pybot-deepseek-agent-swarm-python/conversation.svg)

That means a follow-up can use earlier conversation state rather than treating every message as a fresh lookup. The intelligence used to create this machinery and the machinery answering the user are separate parts of the experiment.

## What matching a small model means

The team reports a **26% win rate on SmolTalkBench**, comparable to SmolLM-360M-Instruct. In this evaluation, a language-model judge compares replies against reference answers. The result concerns that conversational benchmark; it does not establish equal reasoning ability or reliability across unfamiliar tasks.

There is also a substantial maintenance burden behind the apparently simple runtime. Hundreds of thousands of lines can encode many cases without providing the flexibility to handle an unexpected one. More generated code is not, by itself, evidence of better software.

The Apache-2.0 release needs **Python 3.8 or newer**, with no model download or external packages. The documented command `python -m pybot` starts a local conversation; the project notes several seconds of startup and roughly a second per reply.

Like [AWS’s agent-built emulator](/news/aws-emulator-localstack-local-testing/), PyBot separates how software is produced from how it runs. Its contribution is an inspectable experiment in turning agent work into ordinary code. The chatbot no longer needs its builders on the other end of each message.
