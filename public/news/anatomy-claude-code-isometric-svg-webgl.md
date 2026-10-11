# Anatomy brings interactive SVG and 3D machine illustrations to Claude Code

A drawing of an engine can show where its parts sit. Making those parts move, exposing the inside and showing exhaust adds another layer of explanation. **Anatomy**, an open-source skill by Ryan (@wheresryan22), gives Claude Code a drawing kit and workflow for building those interactive figures from a written idea.

The project targets documentation, articles and landing pages. Its output is editable source: an SVG, a standalone HTML page, or React/Next.js components. A short prompt starts the work, but the detailed geometry and checks can take a long session.

## From a description to a working figure

Anatomy packages instructions in a `SKILL.md` file alongside code, examples and reference guides. Claude uses them to plan the object, list its parts, build the geometry and review the result.

The drawings use **isometric projection**, which shows width, height and depth together without distant parts shrinking. Shading makes each solid readable, while pointer and keyboard interactions can move assemblies and update a readout. Both light and dark themes are supported.

The repository’s Raptor engine example separates into 11 assemblies, exposing its internal arrangement. A dial indicator offers a smaller demonstration: moving a carriage changes what the gauge reads. The goal is motion that explains the object’s behaviour.

Software concepts can also become physical mechanisms. The project describes a cache key as a lock whose pins must match before it turns. That connection matters: the object should help explain the idea, rather than simply decorate it.

## How SVG, WebGL and 3D fit together

The base drawing uses **SVG**, a vector format that keeps outlines sharp when resized. Anatomy’s JavaScript and TypeScript kit supplies the camera, solid parts, round surfaces, pipes and cables. Shapes are painted from back to front so nearer parts cover those behind them.

Fire and water need more than outlines. Anatomy adds **WebGL shaders**: small programs that use the browser’s graphics hardware to draw effects such as exhaust, reflections, glow and steam. In the engine example, the plume sits between rear and front SVG layers, sharing their camera so it belongs inside the drawing.

Inspecting [`kit/gl.mjs`](https://github.com/wheresryan22/anatomy/blob/main/kit/gl.mjs) shows how that alignment works. Its `glCamera()` function converts the drawing’s viewing angles, origin and scale into shader inputs. `glLayer()` passes those values to a transparent WebGL canvas and returns `null` when a WebGL context is unavailable. That code supports the documented fallback: the SVG remains readable without the effects. It was inspected for this report; browser performance was not independently tested.

The separate **beta 3D mode** recalculates the projection and shading of moving parts each frame. A turning dial or bending finger can therefore change its actual orientation, while the surrounding illustration remains static. This is a distinct capability from sliding parts within a fixed isometric view.

## Installation and source ownership

The documented command installs Anatomy for Claude Code at user level:

```bash
npx skills add wheresryan22/anatomy -g -a claude-code
```

Then a prompt in Claude Code names what the figure should explain:

```text
/anatomy explain how a token bucket rate limiter works, interactive
```

The drawing kit requires Node.js 20.10 or later; the installer has its own newer Node requirement. Chrome or Chromium runs the visual checks, and React is needed only for React output. The kit otherwise avoids external dependencies. Its MIT license permits reuse and modification.

## What still needs review

Anatomy includes geometry audits, screenshot capture and checks for disconnected line ends. These help catch misplaced parts, but cannot establish that an explanation is scientifically correct.

> A figure’s mechanism needs review alongside its appearance.

The author also marks 3D as beta, with limited validation beyond example figures. Complex scenes may run slowly, and generation includes substantial planning and visual inspection.

For the engine drawing, Anatomy’s contribution is the connection between structure, movement and a readable result. It provides a starting point for explainers whose source can be maintained with the page. The useful test is whether moving or inspecting the parts makes the mechanism easier to understand.

Sources: [Anatomy repository and documentation](https://github.com/wheresryan22/anatomy), [interactive gallery](https://skills.wheresryan.sh/anatomy), and [inspected WebGL implementation](https://github.com/wheresryan22/anatomy/blob/main/kit/gl.mjs).
