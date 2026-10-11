# Anatomy brings interactive SVG and 3D machine illustrations to Claude Code

## Overview: engineering drawings that explain through motion

**Anatomy** is an open-source Claude Code skill for creating interactive isometric illustrations. Describe a machine or technical concept, and Claude builds its parts, movement and controls as editable code for documentation, articles or landing pages.

Created by Ryan (@wheresryan22), it combines **SVG geometry, optional WebGL effects and beta 3D motion**. The engineering angle is how these pieces work together: a housing shows structure, moving assemblies reveal the mechanism, and effects show what passes through it.

The illustration below uses a cutaway turbine to make that relationship visible. It is an editorial SVG with animated blades and airflow, rather than an Anatomy-generated model or a WebGL simulation.

![Isometric cutaway turbine on a test stand, with a shaft connecting three blade stages and airflow passing through the housing. Callouts identify SVG structure, moving parts and the WebGL effects layer used by Anatomy.](/news/assets/anatomy-claude-code-isometric-svg-webgl/engineering-cutaway.svg)

## Details: geometry, effects and moving parts

Anatomy’s JavaScript and TypeScript drawing kit supplies an isometric camera, solid shapes, round parts, pipes and cables. **Isometric projection** shows width, height and depth on consistent axes. SVG outlines and shading make the assembly readable, with nearer surfaces drawn over those behind them.

The shipped examples show what interaction adds. A Raptor engine separates into 11 assemblies to expose its construction. In a dial indicator, sliding a carriage changes the gauge reading. Pointer and keyboard controls connect an action to a visible result, with light and dark themes available.

For exhaust, water, glow and steam, Anatomy adds **WebGL shaders**—programs that draw effects using the browser’s graphics hardware. A transparent canvas sits between rear and front SVG layers. Sharing the drawing’s camera makes the effect appear inside the machine.

Inspection of [`kit/gl.mjs`](https://github.com/wheresryan22/anatomy/blob/main/kit/gl.mjs) confirms that `glCamera()` passes viewing angles, scale and origin into this layer. The renderer returns `null` when WebGL is unavailable; the underlying SVG remains readable. This was a source inspection, not a browser benchmark.

The **beta 3D runtime** recalculates moving parts’ projection and shading each frame. A dial can turn or a finger can bend in three dimensions while the surrounding artwork stays static. That adds true orientation changes beyond sliding assemblies in a fixed view.

Install the skill for Claude Code with the documented command:

```bash
npx skills add wheresryan22/anatomy -g -a claude-code
```

Then describe the mechanism, what should move and the required output. Anatomy produces standalone HTML, SVG or React/Next.js components under an **MIT license**. Its kit uses Node.js; React is needed only for React output.

## Closure: the mechanism still needs engineering review

Anatomy includes geometry audits and screenshot checks to catch misplaced parts and disconnected lines. Detailed figures take time to build and inspect, and the 3D mode remains beta.

> Visual checks establish how the parts fit; engineering review establishes what their movement explains.

For a turbine, the useful outcome is seeing how the shaft, blades and flow relate. Anatomy offers a way to build that explanation as maintainable web source, provided the geometry and behaviour are reviewed together.

Sources: [Anatomy documentation and examples](https://github.com/wheresryan22/anatomy), [interactive gallery](https://skills.wheresryan.sh/anatomy), and [WebGL implementation](https://github.com/wheresryan22/anatomy/blob/main/kit/gl.mjs).
