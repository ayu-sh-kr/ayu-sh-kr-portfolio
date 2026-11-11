# Saltline: from AI 3D demos to playable browser worlds

Open a link and you can be standing in a rain-soaked cargo port, moving between containers with a weapon in view. Felix Rieseberg’s [Saltline](https://x.com/felixrieseberg/status/2119925633564463609), made with Claude Fable 5.2, makes that experience available in a browser. The first impression is visual. The more interesting change is in the work behind it.

Saltline did not introduce 3D websites or AI-generated assets. It makes an existing progression easier to see: browser graphics, increasingly capable coding demos, then more connected experiences built around something a visitor can do.

## The browser could draw it. Someone still had to build it.

A 3D world starts with objects. Walls, wheels and windows are assembled from geometry, often triangles joined into surfaces called meshes. Textures add detail; lighting gives depth; code supplies movement and interaction. Artists can create models in graphics software and export files, while developers can also generate shapes directly in code. Either way, building a coherent scene takes time.

The browser became a more accessible home for that work as WebGL brought hardware-accelerated graphics without plugins, reaching its [1.0 specification in 2011](https://www.khronos.org/news/press/khronos-releases-final-webgl-1.0-specification). Libraries such as [Three.js](https://threejs.org/manual/pages/fundamentals.html) made scenes, cameras and materials easier to manage. The device’s graphics hardware draws the result into a canvas on the page.

Developers were already making substantial experiences. Brandon Jones’s [2010 Quake 3 level renderer](https://blog.tojicode.com/2010/08/rendering-quake-3-maps-with-webgl-demo.html) adapted existing game maps and textures for first-person exploration. Joel Strait’s [City Tour](https://github.com/jstrait/city-tour) generates roads and buildings through rules. These were different construction methods, not primitive steps waiting for AI to make browser 3D possible.

## From hand-built scenes to AI-assisted worlds

Creators were already turning websites into places to explore. [Andreas Lagerkvist’s portfolio](https://andreaslagerkvist.com/?glitch=true) combined Blender models with Three.js; he described the challenge of keeping those models simple enough to run well. Anderson Mancini’s [Windland](https://tympanus.net/codrops/2022/04/25/case-study-windland-an-immersive-three-js-experience/) took that craft into a miniature city. Its workflow included modelling, precomputing lighting in Blender and compressing assets for the browser. Mancini reported about two weeks of work alongside his job. The results were already expressive, but getting there required both visual craft and technical preparation.

AI coding tools began making parts of that work easier to attempt. Instead of modelling every object or writing every geometry function yourself, you could describe a scene and ask a model to construct it in code. [Glass-aquarium prompts](https://huggingface.co/infosave/MiMo-V2.6-Flash-RL-cmf/blob/main/examples/aquarium/prompt.md) and [koi ponds with feeding behaviour](https://x.com/notjazii/status/2111447347960176809) became useful informal tests: could the model produce convincing shapes, water and movement together? They showed that AI-assisted 3D creation was possible before Saltline.

The progression now extends from generating a small scene to coordinating more of an experience: a place to move through, things to interact with, and sound and behaviour that support the setting. Earlier craftsmanship still matters, but more of the construction can be delegated and revised. Saltline brings that change into focus through a playable world.

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
