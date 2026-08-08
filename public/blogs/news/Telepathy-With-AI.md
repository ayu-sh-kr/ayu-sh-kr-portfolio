# AI Telepathy: How BCIs Turn Imagination into AI Output

Imagine giving an AI system the shape of an idea before you have found the
words for it: a scene, a spatial relationship, a mood, or the direction of a
design. Today, we usually have to compress that idea into a prompt first. The
central promise of AI telepathy is to make that translation less restrictive by
letting a system work with human intention and imagination more directly.

Typing is therefore more than an inconvenience. It is a filter between what we
imagine and what AI can produce. The words we manage to enter may omit the
image, uncertainty, structure, or connection that made the idea valuable. A
neural or silent-speech interface could provide those missing signals, while AI
turns them into text, images, code, sound, or another useful representation.

This is not paranormal mind reading. It means measuring a neural or
silent-speech signal, decoding a likely intention, and giving that intention a
useful form. Thought-to-text is one important application, especially for
assistive communication; the larger idea is an **AI interface that helps us
move from imagination to representation without making language the only
input.** The technology is promising but unfinished, so we need to keep the
distinction clear between a thought, a measured signal, a decoded intention,
and an AI interpretation.

## What do we mean by telepathy?

Traditional telepathy describes mind-to-mind communication without speech,
writing, or gesture. No established scientific method lets us freely read
private thoughts in that sense. The engineering question is narrower: can a
device measure brain activity, recognize a trained pattern, and convert it into
a useful output such as a cursor movement, selected letter, sentence, or image
description?

That is what *telepathy* means here: a **technology-assisted route from
intention to representation**. A system is not discovering every thought. It
is interpreting a constrained signal whose quality depends on the sensor, the
person, the training data, the model, and the output vocabulary.

## Synthetic telepathy: the engineered version

Synthetic telepathy is the engineered version of that idea. It uses neural
signals, computing, and sometimes brain stimulation to create a communication
channel that resembles telepathy. The usual arrangement has four stages:

1. A sensor records activity from the brain or from the muscles involved in
   silent speech.
2. Signal-processing software removes noise and extracts useful features.
3. An AI decoder maps those features to letters, words, commands, or meaning.
4. The result is delivered to a screen, a voice synthesizer, an AI model, or,
   in experimental brain-to-brain work, another stimulation system.

The important word is **synthetic**: engineers construct the channel, and it
depends on both hardware and biology. Experiments have shown limited pieces of
the idea, including [EEG and transcranial magnetic stimulation triggering a
simple action in another person](https://doi.org/10.1371/journal.pone.0111332),
and [BrainNet exploring thought-based input to a shared task](https://doi.org/10.1038/s41598-019-41895-7).
These are proofs of possibility, not silent conversations with unlimited
vocabulary.

The practical difference between synthetic telepathy and an ordinary BCI is
the intended destination:

| System | Signal path | Typical purpose | Current position |
| --- | --- | --- | --- |
| Traditional BCI | Brain → device | Move a cursor, prosthesis, or wheelchair | Active research and clinical development |
| Thought-to-text BCI | Brain → decoder → text | Restore or assist communication | Demonstrated in controlled settings |
| Synthetic telepathy | Brain → decoder → person or device | Brain-to-brain or silent communication | Experimental |
| AI thought interface | Brain or silent-speech signal → AI → representation | Generate text, images, commands, or summaries | Early and highly constrained |

The categories overlap. Synthetic telepathy depends on BCI technology, while
an AI thought interface may be the most useful near-term form of what people
informally call telepathy.

## BCI is the foundation

A **brain-computer interface**, or BCI, connects neural activity to an external
system. The brain produces electrical and metabolic signals while we move,
speak, imagine, pay attention, or prepare to act. A BCI records some of those
signals and tries to infer the user’s intention.

Most BCI systems follow a loop rather than a single conversion:

![Flow diagram showing how a BCI turns neural activity into an output and adapts through user feedback](/blogs/news/assets/bci-signal-to-feedback.svg)

The feedback step is easy to overlook. A decoder is not interpreting a fixed
codebook that works equally well for everyone: the user learns to produce more
consistent signals while the model learns how that person’s signals change.
This co-adaptation is one reason a lab demonstration does not immediately
become a general consumer product.

### How BCI signals are collected

BCIs collect `neural signals` in a few broad ways, depending on where the sensor
sits and how close it is to the activity being measured.

`Implant-based BCIs` place electrodes inside the skull or on the brain’s
surface, close to the neurons involved in movement or speech.
The signal is stronger and higher-bandwidth, which supports more detailed
decoding, but surgery and long-term safety become part of the system. Neuralink’s
implanted [Link](https://neuralink.com/) is a prominent example of this approach, being developed to
let users control computers through neural activity. `Electrocorticography` sits
near this category, with electrodes on the cortical surface rather than deep in
the brain.

`Scalp-based BCIs` collect signals without surgery. `EEG` measures electrical
activity through electrodes on the scalp; by the time the signal reaches the
sensor, it has been weakened and mixed with activity from many brain regions.
OpenBCI’s [Cyton platform](https://docs.openbci.com/Cyton/CytonLanding/) is an example of scalp-`EEG` hardware used in research and experimentation. `fNIRS` measures slower blood-oxygen changes
instead of electrical activity, while `MRI` offers detailed but slow research
measurements. Silent-speech wearables are adjacent rather than direct BCIs:
they measure `neuromuscular activity` around the jaw, face, or throat.

| Signal path | Advantage | Constraint | Example or use |
| --- | --- | --- | --- |
| `Implanted electrodes` | Strong, high-bandwidth neural signal | Surgery and long-term safety | Neuralink `Link`; clinical communication and prosthetics |
| `Scalp EEG` | Non-invasive and comparatively portable | Weaker, noisier, lower-bandwidth signal | OpenBCI `Cyton`; spellers and simple commands |
| `Metabolic` or adjacent signals | Adds spatial, oxygenation, or silent-speech information | Slow or not directly neural | `fNIRS`, `MRI`, and neuromuscular wearables |

The trade-off is consistent: **better access to the signal usually costs more
in invasiveness, setup, or clinical complexity**. AI can improve a weak signal,
but it cannot remove the physical limits of the sensor.

The sensor therefore sets the ceiling for the interface. The next problem is
turning that imperfect recording into language without confusing a plausible
guess for the user’s actual intention.

## From brain activity to text

Thought-to-text is more specific than mind reading. The goal is to decode an
intended linguistic unit—a letter, phoneme, word, or sentence—often from
attempted speech, imagined speech, or the motor plan for speaking. Imagine that
you want to say “open the document” but cannot produce audible speech. A sensor
records the attempted phrase, a decoder looks for speech-plan patterns, and a
language model turns uncertain fragments into a likely sequence of words.

This is a useful reference point rather than the final destination of the
article. If we cannot reliably identify a simple intended phrase, we cannot
expect an AI system to work with a richer imagined scene or an abstract design
direction. Thought-to-text shows how the signal becomes interpretable; the
broader AI question is what we can do with that interpretation after it has been
decoded.

At a high level, the process is:

1. **Acquire:** record activity from relevant motor, speech, auditory, or
   language-related regions.
2. **Preprocess:** filter noise and account for movement, electrode changes,
   and other artefacts.
3. **Decode:** map neural features to phonemes, characters, words, or semantic
   representations.
4. **Complete:** use a language model to resolve likely word sequences and
   correct errors.
5. **Adapt:** use user feedback to recalibrate the decoder over time.

Each step protects the next one from a different kind of uncertainty. Neural
recordings contain electrical interference, muscle movement, eye blinks, and
changes caused by the sensor itself. Preprocessing has to remove those artefacts
without deleting the small patterns that carry speech or movement information.
The decoder is also usually trained for a particular person, because the same
intended phoneme does not produce an identical signal in every brain.

Attempted speech is easier to decode than imagined speech because trying to
speak still activates motor plans for the lips, tongue, and jaw. Imagined or
inner speech may contain the linguistic intention without the same physical
signature. That is why a system can perform well on a trained set of attempted
words while remaining unreliable for an open-ended inner monologue.

The language model is powerful but creates a responsibility: an ambiguous
neural signal can become a fluent sentence the user did not intend. Fluency is
not proof of accuracy, so a good system must show uncertainty, support
correction, and keep the user in control. Research has reported [promising
near-real-time speech decoding](https://doi.org/10.1038/s41586-023-06377-x) for people with paralysis using implanted or
surface electrodes, while non-invasive EEG spelling and predictive typing are
generally slower and less accurate. Imagined and continuous inner speech are
harder still. A small trained vocabulary or an estimated image description is
an important result, but neither is a reliable transcript of private thought.

The distinction between attempted and imagined speech carries us to the role
of AI. The hardware records a signal; the model decides how much meaning can
reasonably be recovered from it.

## Where AI changes the equation

Raw neural data is noisy and high-dimensional. AI provides the pattern
recognition needed to find useful structure: deep learning can connect signal
features to phonemes, words, commands, or semantic embeddings, while sequence
and language models use context to make outputs more plausible and correct
incomplete sentences.

That gives AI three distinct jobs:

- **Decoding:** identify the signal pattern associated with an intended unit.
- **Prediction:** use context to estimate what the user probably means next.
- **Representation:** turn the decoded intent into text, speech, an image,
  code, a search request, or an action.

Consider a simple failure. You intend “show the diagram with the database on
the right,” but the signal only clearly carries *diagram* and *database*. A
language model may produce a smooth sentence and place the database on the
left because that arrangement is common in its training examples. The output
looks confident while the spatial relationship is wrong. AI has made the
signal readable, but it has not proved that the interpretation is yours.

The third job is where generative AI becomes especially interesting. A BCI does
not need to output a perfectly formed prompt if the AI can receive a structured
representation of intent. You might imagine a scene, select a few concepts, or
silently indicate a direction; the AI could turn that input into a visual draft,
a written explanation, or a software command.

For example, the desired workflow could look like this:

![Diagram showing AI decoding a BCI signal, predicting intent, and representing it as an output](/blogs/news/assets/ai-signal-to-representation.svg)

This is not necessarily a future in which AI knows every thought. It is a
future in which we provide intent without translating every detail through a
keyboard. The interface might ask you to confirm a concept, reject an
interpretation, or choose between representations. **The practical goal is a
faster feedback loop between intention and creation.**

That is why a useful system should expose intermediate uncertainty instead of
presenting only polished output. Let the user correct “left” to “right,” reject
the generated draft, or supply one more signal before anything is sent or
executed.

## Telepathy and AI are a natural pairing

AI systems already expand partial instructions: we can give a rough outline,
sketch, or incomplete sentence and let a model help form the result. Neural
interfaces extend that pattern to signals that do not pass through ordinary
speech or typing. This matters because typing is more than a slow input method;
it filters what we are able to express. Some ideas disappear while we search
for words, some users cannot type because of paralysis, injury, or fatigue, and
some tasks require our hands and eyes elsewhere. A direct intention interface
could reduce that friction.

Typing is also a compression step. A spatial idea, a visual mood, or a
half-formed relationship between two things often has to become a sequence of
words before an AI can use it. In that translation, we may lose the detail that
made the idea useful. Neural input will not automatically preserve that detail,
but it could let us provide more than a finished sentence: a direction, a
relationship, a preference, or a correction while the idea is still forming.

The first people to benefit are not speculative future users. People with ALS,
locked-in syndrome, or speech loss already face the cost of this translation
every time they communicate. For them, a slower or narrower channel can still
be a meaningful improvement. Assistive communication is therefore not merely a
stepping stone to consumer products; it is the clearest test of whether the
technology is accurate, safe, and worth the effort.

The likely progression is not “thoughts go directly into an AI.” It is closer
to this:

| Stage | What we provide | What AI contributes | Result |
| --- | --- | --- | --- |
| Assistive control | A consistent signal or attempted action | Classification and calibration | Cursor, switch, prosthesis, or speech output |
| Thought-to-text | Intended speech or spelling signals | Decoding and language correction | A message or sentence |
| Thought-to-meaning | Concepts, relationships, or imagined content | Semantic interpretation | A description, plan, or search request |
| Thought-to-creation | A goal plus feedback | Generation and transformation | Text, image, code, audio, or a design |
| Brain-to-brain research | Encoded signal from one participant | Translation and stimulation | A limited shared task or message |

Each stage depends on the previous one. We cannot responsibly build a fluent
brain-to-brain assistant before we can measure, decode, verify, and correct the
input. The future may therefore be less about a magical telepathic channel and
more about an interface that makes imperfect intention useful.

The next question is not only whether the decoder works. It is whether the
system can adapt to a person without turning its guesses into silent actions.

## What changes if this becomes adaptable?

Adaptability is what separates a lab demonstration from a usable interface.
Brain signals change with the user, fatigue, sensor position, and the task, so
a decoder trained once will eventually drift. The user must learn to produce a
consistent signal while the model learns that user’s patterns. Adaptive
decoders and transfer learning can shorten calibration; hybrid input such as
`EEG` plus eye tracking or touch can resolve an ambiguous choice.

For AI, the useful form of adaptability is limited and practical: learn that a
particular signal means “make this concise” or “show me a diagram,” then offer
the result for confirmation. This makes thought-based input more reliable for
assistive communication and hands-busy control without pretending that the
system understands unrestricted thought. **Adaptation improves the signal’s
usefulness; it does not remove the need to review the output.**

## The boundary between intention and thought

The phrase “read your mind” hides an important technical boundary. Neural data
does not arrive labelled *private memory* or *approved command*; the decoder
infers patterns from training examples. It may work well when you deliberately
attempt a phrase and poorly when your attention wanders.

Imagine thinking “move the cursor right” while also noticing a message on the
left side of the screen. If the system treats attention as instruction, a stray
signal can become an action. A safe interface therefore needs an explicit
difference between what it observes, what it thinks you meant, and what it is
allowed to do.

A safe interface should distinguish at least three states:

1. **Observe:** the system is collecting signals for calibration or research.
2. **Interpret:** the system is proposing what it thinks you intended.
3. **Commit:** the system sends text, changes a file, controls a device, or
   shares information.

Those states should not collapse into one silent action. You need a reliable way
to pause capture, review interpretations, correct errors, and revoke consent.
Neural data deserves strong protection because it can reveal health,
attention, preferences, or identity even when the decoder cannot produce
readable thoughts. Ordinary security questions matter too: who stores the
recordings, can a provider train on them, which applications can access them,
and how are they deleted? The same principle applies to brain-to-brain work:
consent must cover the signal type, recipient, purpose, and possibility of
inference beyond the original task.

There is a second risk: inference beyond the task. A decoder trained to detect
speech intent may also learn patterns associated with fatigue, stress, cognitive
load, or neurological change. That does not mean it can diagnose a condition
reliably, but it does mean the recorded data may reveal more than the user
intended to disclose. A neural record that is subpoenaed, sold, leaked, or
reused for model training could expose a person in ways a normal keyboard log
does not.

Consent must therefore cover collection, retention, access, model training, and
deletion—not only the moment when a user first puts on a sensor. The question
is not whether a company can technically infer a new signal; it is whether the
user agreed to that inference and can stop it.

This is why privacy belongs inside the design of the interface, not in a legal
footer added after the decoder works.

## What is available now?

Today, the reliable part of the field is narrower than the headlines suggest.
BCIs can support cursor control, spelling, robotic movement, neurofeedback, and
communication assistance in research or clinical settings. Invasive systems
generally provide better signal quality; non-invasive systems are easier to
deploy but tend to provide fewer commands, slower text, or more variable
results. Silent-speech wearables and multimodal interfaces may reach everyday
use before unrestricted neural decoding because they work with more accessible
signals and existing language models.

The numbers show the current range. In the cited 2023 speech study, an
implanted system decoded attempted speech at 62 words per minute, with a 9.1%
word error rate on a 50-word vocabulary and 23.8% on a 125,000-word vocabulary.
That is fast enough to change clinical communication, but it still depends on
an implant, a trained participant, and a controlled decoder. Scalp-based EEG
systems are safer and easier to set up, but they generally support slower
spelling, selection, or small command sets rather than fluent open-vocabulary
conversation.

Research is moving toward continuous imagined speech, semantic decoding, image
reconstruction, adaptive models, and smaller sensors. The supplied reports
describe systems using `fNIRS`, `MRI`, implanted electrodes, language models,
and image-generation models. These are research milestones, not evidence that
general-purpose consumer telepathy has arrived: performance still depends on
the participant, vocabulary, training process, and experimental setup. Today’s
strongest systems remain assistive and task-specific.

That distinction does not make the work less important. A constrained system
that lets one person communicate is successful if it serves that person
reliably. The right question is whether the interface produces an accurate,
reversible, and useful result for a defined user and task—not whether the
demonstration looks like science fiction.

## The likely future: a thought interface with guardrails

The likely near-term future is not unrestricted mind reading. It is an AI
assistant that accepts a small set of neural or silent-speech signals, learns
your patterns, and turns an intention into a representation.

That direction is also attracting people from mainstream AI research. In a
recent example, [Naomi Bashkansky left OpenAI to join Conduit as a founding
researcher](https://startupfortune.com/an-openai-researcher-quit-to-build-telepathy-at-a-startup-called-conduit/),
working on non-invasive systems intended to turn neural signals into text and
other AI input. The announcement is an industry signal, not proof that the
technology is ready: the same challenges still apply—signal quality,
calibration, privacy, and the difference between a model’s fluent guess and
your actual intention.

You might think of it as a new layer above the keyboard:

![Diagram showing the thought interface loop from intention to action through signal, interpretation, representation, and review](/blogs/news/assets/thought-interface-loop.svg)

The representation could be a sentence, image, design, command, or search. AI
would fill in structure, but you would still review what it produces. The real
test is not whether a system works once in a lab; it is whether it remains
accurate and useful across users, sessions, fatigue levels, and changing tasks.

## Conclusion: make expression cheaper, keep choice visible

Telepathy with AI is ultimately a question about expression. BCIs can sense an
intention, AI can decode and expand it, and the result can become text, an
image, or an action. The system may reduce the cost of moving from imagination
to representation, but it can also misinterpret us.

The practical rule is simple: **keep interpretation visible, consent explicit,
and final actions under the user’s control.** That is how a neural interface
can make imagination more useful to AI without pretending that a model
understands every private thought.

## References and further reading

- [A high-performance speech neuroprosthesis](https://doi.org/10.1038/s41586-023-06377-x), Nature, 2023.
- [A Direct Brain-to-Brain Interface in Humans](https://doi.org/10.1371/journal.pone.0111332), PLOS ONE, 2014.
- [BrainNet: A Multi-Person Brain-to-Brain Interface for Direct Collaboration Between Brains](https://doi.org/10.1038/s41598-019-41895-7), Scientific Reports, 2019.
- [Neuralink](https://neuralink.com/), official technical and research information.
- [OpenBCI Cyton documentation](https://docs.openbci.com/Cyton/CytonLanding/), scalp-EEG hardware reference.
- [Naomi Bashkansky joins Conduit](https://startupfortune.com/an-openai-researcher-quit-to-build-telepathy-at-a-startup-called-conduit/), reported industry context on non-invasive AI telepathy.
