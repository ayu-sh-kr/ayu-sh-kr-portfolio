# Maya-2 Native releases downloadable speech generation for 12 languages

**Maya Research has released Maya-2 Native’s weights and inference engine**, making its Indian-language speech generation available to run outside a hosted API. The October 25 release supports 11 Indic languages and English, with streaming audio and voice cloning.

The change is significant for applications that need speech in regional languages while retaining control over where generation runs. It also gives developers a concrete release to evaluate after the broader Maya-2 family announcement earlier in October.

## What is included in the release

The downloadable checkpoint supports **Assamese, Bengali, English, Gujarati, Hindi, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil and Telugu**. That is the scope of Native release 1.0; the wider family’s announcements and demonstrations should not be read as a list of capabilities included in this download.

The engine supplies **20 built-in voices**, produces 24 kHz mono audio and supports cloning from approximately 3–10 seconds of clean reference speech. A reference voice can also speak another supported language, although accent and voice similarity can vary.

Maya handles the spoken response in a voice application. A separate [speech-recognition system](/news/phonon-2-small-local-speech-recognition/) transcribes the caller, and another component determines the answer. Once Maya receives the text, it can begin returning audio before the entire utterance is generated.

That makes pronunciation and timing closely connected. A fast response is useful only if names, amounts and dates remain intelligible. The included text normalizer prepares such inputs for speech, while Python, an OpenAI-compatible speech endpoint and WebSocket streaming provide integration options.

## Quality and speed tell different parts of the story

Maya reports testing **6,000 held-out texts**, covering conversation, names, addresses, dates and mixed-language inputs. One published transcription-based evaluation gives an overall character error rate of **3.40%**, with substantial variation between languages.

This measures how generated speech is transcribed, rather than fully judging naturalness. The release includes several automated judges and their disagreements; Maya also identifies Assamese, mixed-language input and very short utterances as weaker areas.

The engine’s serving results address a separate concern: how quickly audio arrives under load. On **one H100 NVL**, the project reports:

| Measurement | Reported result |
| --- | ---: |
| Concurrent WebSocket streams | 224 |
| Generated audio per elapsed second | 323 seconds |
| Median time to first audio, steady state | 111 ms |
| 99th-percentile time to first audio, steady state | 242 ms |

These timings cover the speech engine under the published workload. A complete voice conversation also includes transcription, retrieval and answer generation, so the caller’s total wait will be longer.

## Open weights, with hardware requirements

The model has **2.50 billion unique parameters** and about 5 GB of BF16 weights. The documented single-seat loading peak is 9.2 GB plus CUDA context, with higher memory requirements as concurrency increases. The published setup targets Linux and NVIDIA GPUs with CUDA 12.8 support.

Both the weights and inference code use **Apache 2.0**, while upstream components retain their own terms. This makes self-hosting possible, with the operational responsibility that accompanies it.

Maya-2 Native moves the announcement into a form that others can run, listen to and examine. Its importance rests on the quality of ordinary speech across the supported languages—particularly names, numbers and language switches that broad averages can conceal.

Sources: [Maya-2 Native model card and license](https://huggingface.co/maya-research/maya2-native), [inference repository and serving results](https://github.com/MayaResearch/maya2-native), [VoiceArena Hindi leaderboard](https://voicearena.com/tts-leaderboard/hindi), and [Digit’s earlier announcement coverage](https://www.digit.in/features/general/maya-2-explained-a-free-open-weight-voice-ai-model-for-22-indian-languages.html).
