# Phonon-2 brings local English speech recognition to a 164 MB model

**Fermion Research has released Phonon-2**, an English speech-to-text model with a **164 MB download**. It can turn recordings into text locally, and the company reports a lower average word error rate than Whisper large-v3-turbo across seven English test sets.

The release targets local transcription and dictation, where model size affects how easily speech recognition can be included in an app. Fermion also reports processing an hour of audio in about **20 seconds on an M5 MacBook Air**. Both results come from the company’s published model card.

## A smaller version of NVIDIA’s Parakeet

Phonon-2 is based on **NVIDIA’s Parakeet TDT 0.6B v3**. Its encoder, the part that processes audio, stores each weight at one of five learned values—about **2.1 bits per weight**. Weights are the numbers that shape a model’s behavior; storing them more compactly reduces the download.

The model card puts the original Parakeet model at 2,508 MB, compared with Phonon-2’s 164 MB. Size alone would be an incomplete result, so Fermion also reports transcription quality across seven English test sets used by the Open ASR Leaderboard.

On that comparison, Phonon-2 averages **5.21% word error rate**, versus **4.96% for its full-precision Parakeet teacher** and **6.58% for Whisper large-v3-turbo**. Word error rate counts missed, substituted, and extra words; lower is better. Phonon-2 gets close to its teacher’s average while beating Whisper turbo’s average in a substantially smaller download.

Those figures describe the selected English tests. The comparison combines published leaderboard rows with Fermion’s own runs using leaderboard code, and an average can hide differences between recordings. It is evidence for the size-and-accuracy trade-off, rather than a promise that every speaker or noisy meeting will produce the same result.

## Local transcription on laptops and other hardware

Alongside the accuracy results, Fermion reports transcribing an hour of audio in about **20 seconds on an M5 MacBook Air**. The result depends on that hardware and setup, but suggests long recordings need not take nearly as long to process as they do to play.

The project offers an Apple silicon path through MLX, plus CPU and CUDA engines, and uses Phonon-2 in its Detta Mac dictation app. The command-line code uses **Apache 2.0**.

Phonon-2 adds a smaller option for **local English transcription**, with open weights under CC BY 4.0. The release’s significance is the combination of a compact download and competitive reported accuracy, making speech recognition easier to package into applications that run on the device.

Sources: [Phonon-2 model card and benchmark](https://huggingface.co/FermionResearch/Phonon-2) and [Fermion’s Phonon engines](https://github.com/fermionresearch/phonon).
