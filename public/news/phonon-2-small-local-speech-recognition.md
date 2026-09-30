# Phonon-2 brings local English speech recognition to a 164 MB model

A transcription model that runs on a laptop can keep recordings on the device, but its download size and speed still matter. **Fermion Research’s Phonon-2** arrives as a **164 MB English speech recognition model**, with a reported benchmark average better than the much larger Whisper large-v3-turbo.

That comparison makes the release interesting for local dictation and transcription. It also raises the obvious question: how much accuracy survives when a speech model gets this small?

## A smaller version of NVIDIA’s Parakeet

Phonon-2 is based on **NVIDIA’s Parakeet TDT 0.6B v3**. Its encoder, the part that processes audio, stores each weight at one of five learned values—about **2.1 bits per weight**. Weights are the numbers that shape a model’s behavior; storing them more compactly reduces the download.

The model card puts the original Parakeet model at 2,508 MB, compared with Phonon-2’s 164 MB. Size alone would be an incomplete result, so Fermion also reports transcription quality across seven English test sets used by the Open ASR Leaderboard.

On that comparison, Phonon-2 averages **5.21% word error rate**, versus **4.96% for its full-precision Parakeet teacher** and **6.58% for Whisper large-v3-turbo**. Word error rate counts missed, substituted, and extra words; lower is better. Phonon-2 gets close to its teacher’s average while beating Whisper turbo’s average in a substantially smaller download.

Those figures describe the selected English tests. The comparison combines published leaderboard rows with Fermion’s own runs using leaderboard code, and an average can hide differences between recordings. It is evidence for the size-and-accuracy trade-off, rather than a promise that every speaker or noisy meeting will produce the same result.

## What that means for local transcription

For a model intended to run locally, the next question is speed. Fermion reports transcribing an hour of audio in about **20 seconds on an M5 MacBook Air**. The result depends on that hardware and setup, but suggests long recordings need not take nearly as long to process as they do to play.

The project offers an Apple silicon path through MLX, plus CPU and CUDA engines, and uses Phonon-2 in its Detta Mac dictation app. The weights are **English-focused and licensed under CC BY 4.0**; the command-line code uses Apache 2.0.

Phonon-2’s practical contribution is bringing a strong English benchmark result into a small local download. For a dictation app or meeting-transcription feature, test it on the recordings, speakers, and devices the product needs to support. That connects the promising benchmark to the transcript people will actually read.

Sources: [Phonon-2 model card and benchmark](https://huggingface.co/FermionResearch/Phonon-2) and [Fermion’s Phonon engines](https://github.com/fermionresearch/phonon).
