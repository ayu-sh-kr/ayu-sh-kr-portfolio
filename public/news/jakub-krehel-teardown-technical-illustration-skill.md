# Jakub Krehel’s teardown skill makes editable technical illustrations

Jakub Krehel’s **`/teardown` skill** gives coding agents a way to draw an object with its parts pulled apart, then bring them back together in a viewer. The October 25 announcement shows technical illustrations you can recolor, annotate and export, with the individual components kept editable.

It takes the spatial language of isometric illustrations into an engineering-style drawing: the depth helps you recognize the object, while the separated parts explain its construction. For documentation, that gives you a useful way to show what sits inside a device or how several layers fit together.

## One assembly, several views

Krehel, who writes the design-engineering publication **Interfaces**, publishes the skill in his [open-source collection](https://github.com/jakubkrehel/skills). You supply an object description, photographs, dimensions or an existing CAD model; the agent constructs geometry and packages a preview page around it.

The [viewer](https://jakub.kr/skills) switches between assembled and exploded views, adjusts dimensions and part colors, and adds labels. SVG, PNG and PDF exports let the drawing move into an article, presentation or document. With **SVG**, you can also edit individual vector elements afterwards.

The important detail is that the views come from **one object model**. Pulling the cover away should expose the same mounting points that line up when it closes. Changing the spacing should reveal the assembly without changing which parts belong together.

Here is an original concept illustration of a small network appliance, using that visual approach. The lid lifts away from a finned heatsink, which sits above the processor on the circuit board; the board mounts inside the lower chassis. The dashed guides keep the mounting positions aligned.

![Isometric concept teardown of a network appliance, with its vented lid, finned heatsink, circuit board and chassis separated vertically along shared mounting guides](/news/assets/jakub-krehel-teardown-technical-illustration-skill/network-appliance-teardown.svg)

This is an illustrative assembly for this article, rather than output from Krehel’s viewer or a reconstruction of a commercial device.

## The drawing still needs evidence

The [skill’s workflow](https://github.com/jakubkrehel/skills/blob/main/skills/teardown/SKILL.md) separates supplied dimensions from proportions estimated from photographs. Hidden construction must be omitted, requested or marked as illustrative. That is a useful constraint: precise linework can otherwise make a guessed interior look established.

It also asks the agent to render and inspect the geometry before delivery, checking both assembled and separated states. Those checks help catch misaligned holes, obscured components and parts that have no credible place in the finished object. The result remains an explanatory illustration; manufacturing requires a separate CAD drawing with tolerances and material specifications.

The collection is **MIT-licensed**, and you can install it with `npx skills add jakubkrehel/skills`. It runs through your coding agent and its available tools.

The [design-trends article](/blog/ui-design-trends-skeuomorphism-isometric-glass/) looks at how depth can make an explanation easier to follow. `/teardown` applies that idea to an assembly you can revise. When the explanation changes, you can highlight the board, separate the cooling parts or export another view while keeping the object recognizable.

Sources: [Krehel’s examples](https://jakub.kr/skills), [teardown workflow](https://github.com/jakubkrehel/skills/blob/main/skills/teardown/SKILL.md), and [collection and license](https://github.com/jakubkrehel/skills).
