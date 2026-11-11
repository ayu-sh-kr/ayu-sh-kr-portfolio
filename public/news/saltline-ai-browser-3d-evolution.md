# Saltline: from AI 3D demos to playable browser worlds

A glass aquarium. A koi pond where fish swim towards food. Scenes like these became a way to test what an AI model could build in a browser. Felix Rieseberg’s [Saltline](https://claude.ai/artifact/BGY1SztrAYcJQHSsnHHGmp) invites a different response: you are in a rain-soaked port, moving between containers and playing a shooter. The interest shifts from judging an output to spending time inside it.

Saltline did not introduce 3D websites or AI-generated assets. It makes an existing progression easier to see: browser graphics, increasingly capable coding demos, then more connected experiences built around something a visitor can do.

## The browser could draw it. Someone still had to build it.

A 3D world starts with objects. Walls, wheels and windows are assembled from geometry, often triangles joined into surfaces called meshes. Textures add detail; lighting gives depth; code supplies movement and interaction. Artists can create models in graphics software and export files, while developers can also generate shapes directly in code. Either way, building a coherent scene takes time.

The browser became a more accessible home for that work as WebGL brought hardware-accelerated graphics without plugins, reaching its [1.0 specification in 2011](https://www.khronos.org/news/press/khronos-releases-final-webgl-1.0-specification). Libraries such as [Three.js](https://threejs.org/manual/pages/fundamentals.html) made scenes, cameras and materials easier to manage. The device’s graphics hardware draws the result into a canvas on the page.

Developers were already making substantial experiences. Brandon Jones’s [2010 Quake 3 level renderer](https://blog.tojicode.com/2010/08/rendering-quake-3-maps-with-webgl-demo.html) adapted existing game maps and textures for first-person exploration. Joel Strait’s [City Tour](https://github.com/jstrait/city-tour) generates roads and buildings through rules. These were different construction methods, not primitive steps waiting for AI to make browser 3D possible.

## From testing a model to giving someone an experience

AI coding models brought another route: describe a scene and have the model write its construction code. Aquarium and [koi-pond prompts](https://x.com/notjazii/status/2111447347960176809) made useful demonstrations because they combined several visible challenges: convincing water, recognizable fish, movement and interaction. A [published glass-aquarium prompt](https://huggingface.co/infosave/MiMo-V2.6-Flash-RL-cmf/blob/main/examples/aquarium/prompt.md), for example, explicitly asks for procedural geometry rather than imported models. Such community tests sit alongside formal evaluations such as [Artificial Analysis’s AA-3D](https://artificialanalysis.ai/evaluations/aa-3d); they are not one universal benchmark.

Those demonstrations already showed that models could help produce 3D content. The next question is whether the pieces work together for a purpose. A fish reacting to food tests an interaction; a game asks whether movement, enemies, sound and level design hold someone’s attention. A city experience asks whether exploring it is worthwhile. Benchmarks and practical experiments overlap, but they invite different judgements.

## Saltline makes that change tangible

Rieseberg’s [Saltline announcement](https://x.com/felixrieseberg/status/2119925633564463609) credits Claude Fable 5.2 with generating models, textures and sounds. The game uses **Three.js r180 and WebGL**. Its code constructs geometry, draws texture atlases on canvases and generates sound data. A corrugated-steel surface comes from mathematical ridges and noise; the Hound enemy has a code-defined skeleton with joints that can animate. These are assets created through code, rather than every object arriving as a finished model file.

What changes the perception is their combination: a setting, movement, enemies and sound in one playable experience. That makes AI-assisted 3D easier to imagine as a creative workflow beyond a model comparison. It does not establish commercial-game quality. Rieseberg reports an eight-hour initial run and roughly $550 at API pricing; the current version notes two further hours improving weapons, sound and gameplay. Refinement remains part of the work.

[**Gulmohar Local**](https://gulmohar-local.pages.dev/), by Shardul Nandedkar, offers the same idea through exploration. Its [launch](https://x.com/pracosm/status/2103387804281745459) presented miniature Mumbai and Bengaluru worlds made with Claude Opus 5.5, with code-generated buildings, trains and characters. Shardul [credits an earlier project](https://x.com/pracosm/status/2103388178807980273), GMI Cloud’s Sakura Crossing. The appeal is the place you can explore, built on existing work, rather than a claim to have invented the technique.

## A shorter path from an idea to a world

These locally rendered scenes also differ from [cloud gaming](https://www.nvidia.com/en-us/geforce-now/faq/), where a remote computer runs the game and streams its picture. Nor does AI-written code automatically make a [world model](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/), which generates an environment’s evolution in response to actions.

The shift is in creation: more people can describe, generate and revise the pieces of an interactive world without writing every step themselves. Smaller experiments in [spatial illustration and motion](/blog/ui-design-trends-skeuomorphism-isometric-glass/) offer a starting point too. The fish tank demonstrated a capability. Saltline makes it easier to picture what someone might choose to create with it.

## Sources and projects

- [Saltline by Felix Rieseberg](https://claude.ai/artifact/BGY1SztrAYcJQHSsnHHGmp).
- [Gulmohar Local by Shardul Nandedkar](https://gulmohar-local.pages.dev/) and its predecessor, [Sakura Crossing](https://github.com/Kenton-GMI/sakura-crossing).
- [City Tour](https://github.com/jstrait/city-tour) and [Quake 3 WebGL renderer](https://github.com/toji/webgl-quake3).
