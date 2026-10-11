# Anatomy brings interactive SVG and 3D machine illustrations to Claude Code

**Anatomy** is an open-source Claude Code skill that turns a description into an interactive isometric illustration. It gives Claude instructions and a drawing kit to build machines, instruments and technical explainers as editable web code.

Created by Ryan (@wheresryan22), the project combines **SVG drawings, optional WebGL effects and beta 3D motion**. Its output can be a standalone HTML page, an SVG file or React/Next.js components, with light and dark themes.

Our cutaway turbine below introduces those three rendering roles. It was drawn for this article and uses SVG animation. Anatomy’s own designs are linked separately in the sections that follow.

![Editorial isometric turbine cutaway showing a housing, shaft, blade stages and airflow, with callouts for the three rendering roles. This is an independently drawn SVG, not an Anatomy example.](/news/assets/anatomy-claude-code-isometric-svg-webgl/engineering-cutaway.svg)

## SVG: structure and interaction

Start with Anatomy’s [official visual gallery](https://github.com/wheresryan22/anatomy#gallery), which shows the actual designs together. Then look at the [dial-indicator example and its source](https://github.com/wheresryan22/anatomy/tree/main/examples/dial-indicator): a carriage moves beneath a gauge, and the needle responds to the blocks it measures.

That example introduces the core capability: **a drawing whose controls and readout follow the same mechanism**. SVG keeps the outlines sharp as the figure is resized. The JavaScript and TypeScript kit supplies solid parts, round surfaces, pipes and cables, arranged on shared isometric axes to preserve depth.

For documentation, this allows a reader to inspect an assembly and see how an action changes its state. The figure remains source code that can be maintained alongside the page.

## WebGL: effects within the drawing

Next, see the [Raptor engine design](https://github.com/wheresryan22/anatomy/blob/main/.github/assets/raptor-engine-firing.webp) and its [example files](https://github.com/wheresryan22/anatomy/tree/main/examples/raptor-engine). The project shows the engine assembled, separated into 11 assemblies and firing. Its exploded view exposes the assemblies; the firing view adds the exhaust.

The engine and stand are SVG; the plume uses **WebGL shaders**, which draw effects through the browser’s graphics hardware. The effect layer sits between rear and front SVG surfaces and shares their camera, keeping the exhaust aligned with the machine.

Inspection of [`kit/gl.mjs`](https://github.com/wheresryan22/anatomy/blob/main/kit/gl.mjs) confirms that the shader receives the drawing’s viewing angles, scale and origin. When WebGL is unavailable, the underlying SVG remains readable. This was source inspection rather than a performance test.

## Beta 3D: parts that change orientation

Finally, see the [turning-dial design](https://github.com/wheresryan22/anatomy/blob/main/.github/assets/turning-dial.webp) and its [3D example files](https://github.com/wheresryan22/anatomy/tree/main/examples/turning-dial). This demonstrates a dial turning with a small articulated hand.

The **beta 3D runtime** recalculates moving parts’ projection and shading each frame. It supports orientation changes while the surrounding artwork stays static. The author describes this mode as having limited validation beyond example figures.

## Building an explainer with Anatomy

The documented command installs the skill for Claude Code:

```bash
npx skills add wheresryan22/anatomy -g -a claude-code
```

A prompt can name the mechanism, what should move and the desired output. Claude then plans the parts, builds the geometry and checks the result. The kit uses Node.js, with React required only for React output; the project is **MIT licensed**.

Anatomy includes geometry audits and screenshot checks, but detailed figures still take time to inspect. Its contribution is bringing structure, interaction and effects into one reusable illustration. The linked designs show that approach in practice; the next question is whether a generated figure explains its chosen mechanism accurately.

Sources: [Anatomy documentation](https://github.com/wheresryan22/anatomy), [official design gallery](https://github.com/wheresryan22/anatomy#gallery), and [WebGL implementation](https://github.com/wheresryan22/anatomy/blob/main/kit/gl.mjs).
