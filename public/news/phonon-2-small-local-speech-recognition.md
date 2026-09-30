# Phonon-2 fits English speech recognition into a 164 MB download

Local speech transcription often means choosing between a small model that misses words and a large one that takes more storage and compute. **Phonon-2**, released by Fermion Research, makes that trade-off more interesting: its English speech recognition model is a **164 MB download**, with weights compressed to a small set of learned values.

## How does the small model compare?

Fermion built Phonon-2 from NVIDIA's Parakeet TDT 0.6B v3. Its encoder stores each weight at one of **five learned levels**, around 2.1 bits per weight. This is more than shrinking a file after training: the model card describes a low-bit model designed to preserve transcription accuracy.

Across seven English test sets used by the Open ASR Leaderboard, Fermion reports **5.21% average word error rate**. Lower is better. The full-precision Parakeet teacher scores 4.96% at 2,508 MB; Whisper large-v3-turbo scores 6.58% at 1,618 MB in the comparison. The rows combine leaderboard-published results with Fermion's runs using its code, so the figures describe those English datasets, not every accent, language, microphone, or setting.

## Where might it be useful?

Fermion reports transcribing an hour of audio in about **20 seconds on an M5 MacBook Air**. That is a hardware-specific speed claim, but it points to the model's intended use: local dictation, meeting transcripts, and applications that benefit from keeping audio on the device. The model is available for Apple silicon through MLX, with CPU and CUDA engines described by the project. It is also used in Fermion's Detta dictation app.

The published model is **English-focused**, with weights under **CC BY 4.0**; the command-line code carries an Apache 2.0 license. Developers should still test their own noisy recordings, speakers, and formatting expectations before choosing a transcriber.

The notable change is the size of the accuracy trade-off. Phonon-2 puts a competitive English benchmark result in a download small enough for more local applications, while leaving real-world transcription quality to be checked on the audio that matters to each product.

Sources: [Phonon-2 model card and benchmark](https://huggingface.co/FermionResearch/Phonon-2) and [Fermion's Phonon engines](https://github.com/fermionresearch/phonon).
