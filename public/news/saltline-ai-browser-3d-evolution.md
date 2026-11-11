# Saltline: how AI is changing 3D browser game creation

Open a link and you can be standing in a rain-soaked cargo port, moving between containers with a weapon in view. Felix Rieseberg’s [Saltline](https://x.com/felixrieseberg/status/2119925633564463609), made with Claude Fable 5.2, makes that experience available in a browser. The first impression is visual. The more interesting change is in the work behind it.

Browser 3D has existed for years. What is becoming more approachable is creating the world itself: its objects, surfaces, sounds and behaviour. To understand the shift, it helps to follow the work from an artist’s model, through a browser renderer, to code an AI system can help produce.

## Before the first frame, someone has to build the world

Most websites ask you to scroll and click. A 3D website lets you move through a space, but someone first has to build everything you can see.

Think of a street. Buildings need walls and windows; a vehicle needs a body and wheels. Their shapes are made from geometry, often small triangles joined into surfaces called **meshes**. Textures add details such as signs and weathering. Lighting gives the scene depth, while code makes vehicles move and stops you walking through walls.

Creating that content can take considerable time. Artists model objects in graphics software and export files; developers load those assets, position them and connect them to the application. Existing asset packs can reduce the work. Another approach is to write code that constructs objects from shapes and rules. Each route still requires decisions about appearance, scale, movement and how everything fits together.

The challenge was never only drawing a triangle. It was turning thousands of those decisions into a place worth exploring.

## WebGL made the browser a practical place to display it

An earlier shift happened in the platform. [WebGL 1.0’s final specification arrived in March 2011](https://www.khronos.org/news/press/khronos-releases-final-webgl-1.0-specification), enabling hardware-accelerated browser graphics without a plugin. [Three.js](https://threejs.org/manual/pages/fundamentals.html) provides a higher-level way to organize objects, lights and cameras. Its WebGL renderer sends drawing work through the browser to the device’s graphics hardware, with the result appearing in a canvas on the page.

Early demonstrations already offered first-person exploration. Brandon Jones published a [Quake 3 WebGL level renderer in August 2010](https://blog.tojicode.com/2010/08/rendering-quake-3-maps-with-webgl-demo.html), while the standard was still developing. His [technical account](https://blog.tojicode.com/2010/08/rendering-quake-3-maps-with-webgl-tech.html) describes adapting existing game maps and assets: converting textures, packing lighting data and preparing geometry for WebGL. Credit belongs to Jones for the renderer and to the original game and map creators for the content. It was a navigable level renderer, not a complete browser recreation of Quake 3 gameplay.

Procedural worlds offered another route. [Joel Strait’s City Tour](https://github.com/jstrait/city-tour) generates terrain, roads, lots and buildings, then turns that blueprint into a Three.js/WebGL scene. Instead of placing every building individually, a developer writes rules that produce many of them.

These approaches did not replace one another. Imported assets, procedural geometry and custom code can coexist. The browser made distribution easier, and libraries reduced rendering work, but creating the content remained a substantial task.

## Saltline brings AI into the asset-making work

AI coding tools can now help with that remaining work. A creator describes an object or scene, and the model writes code to construct it, then revises the result in response to direction. This is different from simply selecting ready-made model files. It moves more of the geometry, surface detail and behaviour into instructions a creator can discuss and change.

Rieseberg credits **Claude Fable 5.2** with generating Saltline’s models, sounds and textures. His launch post reports an initial eight-hour run costing roughly $550 at API pricing, with substantial prompt caching. Those are his reported conditions, not a standard price or a controlled comparison with an artist’s workflow.

The [published game](https://claude.ai/artifact/BGY1SztrAYcJQHSsnHHGmp) bundles **Three.js r180** and uses a WebGL renderer. Its code generates texture atlases, which gather surface details into one image, on canvases before passing them into Three.js. A corrugated-steel shader, a program run on the graphics hardware, uses a repeating mathematical wave and layered noise to create ridges and variation. Code supplies much of the material a player sees.

The Hound enemy shows the same approach in motion. Its code defines bones for the body, head and legs, giving the program joints to animate. Sound generators produce audio data for Web Audio buffers. These are still assets, even when their definition is a function rather than a separately downloaded art file.

Credit belongs to Rieseberg for the experiment and published game, Anthropic’s model for the reported generation work, and the Three.js contributors and browser platform underneath. The current artifact also notes **two additional hours of weapon, sound and gameplay improvements**, and links the original build. A focused shooter still leaves content scale, combat quality and device testing to evaluate; its first-person view does not make it equivalent to Call of Duty.

[**Gulmohar Local**](https://gulmohar-local.pages.dev/), shared by Shardul Nandedkar (@pracosm), offers a complementary example. His [September launch](https://x.com/pracosm/status/2103387804281745459) introduced miniature Mumbai and Bengaluru worlds with Claude Opus 5.5; the site now lists seven cities. His [technical explanation](https://x.com/pracosm/status/2103496707195687220) describes Three.js code generating buildings, trains and characters through a Claude Code workflow. He also [credits code from GMI Cloud’s Sakura Crossing](https://x.com/pracosm/status/2103388178807980273). It is an adapted city experience with a predecessor, not evidence that every part began from an empty file.

## The shift is in creation, not where every game runs

Opening a game through a link can hide different architectures. With cloud gaming such as [GeForce NOW](https://www.nvidia.com/en-us/geforce-now/faq/), a remote machine runs the game and streams the audiovisual result to the player. Input travels back to that machine. A locally rendered browser scene instead runs code and draws geometry on the player’s device, although it can still use servers for downloads or multiplayer.

AI-assisted construction is a separate distinction again. A coding model can produce a conventional program that later runs without asking it to generate each frame. A world model such as [Google DeepMind’s Genie 3](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/) generates an interactive environment’s evolution in response to actions. Using AI to build a scene does not automatically make that scene a world model.

The progression is easier to see when you return to Saltline’s port. Browser graphics made the scene accessible through a link. Libraries and procedural techniques made its construction more manageable. AI now helps produce and revise more of that construction code, giving creators a shorter path from an idea to something explorable.

For a smaller starting point, [isometric illustration and motion on the web](/blog/ui-design-trends-skeuomorphism-isometric-glass/) offer ways to make a page feel spatial without building an entire explorable world.

Creativity has more room to lead, but a convincing, enjoyable world still needs judgement and refinement. That is the shift worth watching: more people can attempt the work before the first frame, without having to author every shape and behaviour themselves.
