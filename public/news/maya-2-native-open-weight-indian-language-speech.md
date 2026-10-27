# Maya-2 Native opens its speech model: languages, benchmarks and self-hosting

Maya Research has made **Maya-2 Native** downloadable, giving developers another way to generate Indian-language speech on their own infrastructure. The release includes model weights and an inference engine for **streaming text-to-speech**, turning written responses into audio as generation continues.

For a support assistant answering in Hindi or Tamil, the benefit is control over the speech layer: which voice speaks, where it runs and how it connects to the rest of the application. The release also provides enough technical detail to move beyond the launch’s broad claims about covering India.

## The downloadable release has a specific language list

The [model card](https://huggingface.co/maya-research/maya2-native) identifies release 1.0 as October 25. It lists **Assamese, Bengali, English, Gujarati, Hindi, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil and Telugu**: 11 Indic languages plus English.

Maya Research’s CEO, **Dheemanth Reddy**, promoted the wider Maya-2 family earlier in October. [Digit’s October 15 reporting](https://www.digit.in/features/general/maya-2-explained-a-free-open-weight-voice-ai-model-for-22-indian-languages.html) covered that announcement while weights were still promised, and questioned whether its India-wide framing matched the demonstrated coverage. That earlier API story should be distinguished from the checkpoint now available.

**Maya-2 Native, Global and Flash are separate offerings.** The new repository documents Native. It does not establish that every hosted variant, every language in the company’s demos or all 22 scheduled Indian languages are included in this download.

## What the model produces—and what a voice agent still needs

The [inference code](https://github.com/MayaResearch/maya2-native) provides **20 built-in voices**, 24 kHz mono output and voice cloning from approximately 3–10 seconds of clean reference speech. Cross-language generation lets a reference voice speak a different supported language, though its accent and similarity can vary.

This is the part of a voice application that speaks a written answer. [Speech recognition](/news/phonon-2-small-local-speech-recognition/) must still turn the caller’s audio into text, and another system must decide what to say. Maya’s generation speed is therefore only one part of the delay a caller experiences.

Suppose a customer asks when a refund will arrive. The application retrieves the refund status and composes a sentence. Maya receives that sentence and a chosen voice, then begins returning audio before the entire utterance is finished. The included text normalizer helps convert amounts, dates and digit strings into spoken forms—important details when “₹1,500” or a booking reference appears in the answer.

The engine supports Python, an OpenAI-compatible speech endpoint and WebSocket streaming. Despite the product name, some package identifiers remain **`maya3` and `Maya3TTS`**; developers should follow the repository’s actual examples.

## The benchmarks measure several kinds of quality

Maya reports a release evaluation on **6,000 held-out texts**, 500 per language, spanning conversation, names, dates, addresses and mixed-language inputs. Speech-recognition systems transcribed the generated audio to estimate intelligibility. The published Qwen3-ASR character error rate is **3.40% overall under scorer v1**, with substantial differences between languages.

An automated transcription score cannot fully judge whether a voice sounds natural or appropriate. It can also reflect the transcriber’s own weaknesses. The project publishes results from multiple judges, including their disagreements, which is more informative than a single averaged score.

Its serving measurements answer a different question: how the engine behaves under load. The repository reports the following on **one H100 NVL**, using the release benchmark:

| Serving measurement | Maya’s reported result |
| --- | ---: |
| Concurrent WebSocket streams | 224 |
| Generated audio per wall-clock second | 323 seconds |
| Steady-state median time to first audio | 111 ms |
| Steady-state 99th-percentile time to first audio | 242 ms |

These are project-produced measurements for that hardware and workload. They exclude the rest of a conversational application’s response path and should not be substituted for end-to-end call latency.

The release card also records Maya-2 Native at **second on VoiceArena’s Hindi real-time leaderboard**, checked October 27. That is narrower than “best across Indian languages,” and the leaderboard does not identify the exact downloadable checkpoint revision. Nearby models’ uncertainty intervals overlap. Listener rankings and the release’s automated tests are useful complementary evidence, not interchangeable scores.

## Open weights come with a serving workload

The model card lists **2.50 billion unique parameters** and approximately 5 GB of BF16 weights. Runtime memory is higher: the documented single-seat loading peak is **9.2 GB plus CUDA context**. Increasing allocated concurrency increases memory even when every slot is not busy.

The published setup targets Linux, Python 3.10–3.12 and an NVIDIA GPU with CUDA 12.8 support. Its server needs authentication added before external exposure. Those requirements are part of comparing self-hosting with a managed API, alongside GPU utilization and operational support.

**Weights and inference code use Apache 2.0.** Upstream components retain their own terms: the Mimi audio codec is CC BY 4.0, while the listed Qwen and SpeechBrain components use Apache 2.0. Redistribution needs the applicable notices and attribution.

## Choosing a speech layer for Indian-language applications

Managed products such as **Sarvam Bulbul, Cartesia Sonic and ElevenLabs** are alternatives for teams prioritizing hosted delivery. Maya offers a downloadable route for teams that want to operate and adapt the speech system themselves. The useful comparison is the same set of application sentences, including names, numbers, language switches and short replies.

Maya identifies Assamese, code-mixed input and very short utterances among its weaker areas. Voice cloning also needs the speaker’s permission, and the release does not provide a dedicated cloning-quality benchmark.

For the refund assistant, a natural greeting is only the beginning. The amount, date and pronunciation of the customer’s name have to survive the whole response. Maya’s open release makes that evaluation possible on infrastructure you control; its published limitations help identify which sentences deserve the closest listening.

Sources: [Maya-2 Native model card and license](https://huggingface.co/maya-research/maya2-native), [inference repository and serving results](https://github.com/MayaResearch/maya2-native), [VoiceArena Hindi leaderboard](https://voicearena.com/tts-leaderboard/hindi), and [Digit’s earlier announcement coverage](https://www.digit.in/features/general/maya-2-explained-a-free-open-weight-voice-ai-model-for-22-indian-languages.html).
