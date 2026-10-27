# Jakub Krehel’s teardown skill makes editable technical illustrations

An exploded drawing explains an assembly by separating its parts while keeping their relationships visible. Jakub Krehel’s new **`/teardown` agent skill** brings that approach into a coding-agent workflow, producing technical illustrations with editable parts and downloadable output.

The October 25 announcement shows layered objects that can be recolored and annotated. Its more useful promise is that the drawing remains configurable after generation: you can inspect the assembly, adjust the presentation and export it without starting again from a flattened image.

## The result is a drawing and a viewer

Krehel, who writes the design-engineering publication **Interfaces**, describes the skill in his [public collection](https://jakub.kr/skills). Its viewer switches between assembled and expanded views, changes dimensions and part colors, and exports SVG or PNG. The [current skill source](https://github.com/jakubkrehel/skills/blob/main/skills/teardown/SKILL.md) also documents PDF output.

This is an extension for an existing coding agent. The agent uses instructions and bundled geometry helpers to construct the drawing and its preview page. It is not a new image-generation model or a hosted CAD product.

For a diagram of a display, the useful output might be a stack showing the cover, light-control layers and pixels. The assembled state explains where the layers sit; the expanded state makes them individually visible. Giving both states the same underlying geometry keeps the parts consistent when the spacing changes.

## Its workflow asks what the drawing actually knows

The [implementation guidance](https://github.com/jakubkrehel/skills/blob/main/skills/teardown/SKILL.md) starts by separating supplied geometry from visual references. Dimensions from a CAD model are different evidence from proportions estimated from a photograph. Hidden construction must be omitted, requested or identified as illustrative.

That distinction matters because a convincing technical style can make invented internals appear authoritative. The skill asks for an evidence record, then derives the views from one object model, checks the geometry and renders the result before packaging it.

Krehel’s [announcement thread](https://teapawt.org/jakubkrehel) credits teardown illustrations in Teenage Engineering’s SoHo store as an inspiration. The visual reference helps explain its restrained linework and separated assemblies; it does not establish the construction of another product.

For documentation, the result could clarify a device’s layers, a conceptual memory system or a product’s component relationships. A technical writer can recolor one layer to match the surrounding explanation while retaining the rest of the drawing.

## Editable illustration, CAD and raster generation solve different jobs

| Need | Suitable approach |
| --- | --- |
| Explain how parts or conceptual layers relate | Teardown’s configurable illustration |
| Specify a part for manufacture | CAD and a toleranced drawing workflow |
| Produce a photographic or painted visual | A raster image-generation workflow |
| Place exact labels in an existing vector design | Direct SVG or vector-editor work |

The skill itself says its output is **not a manufacturing drawing**. Changing an illustrative dimension in a viewer does not validate tolerances, materials or whether an assembly can be built.

There is also **no published comparative benchmark** establishing higher geometric accuracy or shorter authoring time than a designer or another tool. The public examples demonstrate the interface and visual output. The evidence record and rendered checks are a useful process for controlling errors, not a guarantee that the agent has reconstructed an object correctly.

## Availability and where it fits

The collection is **MIT-licensed** and can be added using `npx skills add jakubkrehel/skills`. Generation still depends on the coding agent and its available runtime; an open-source skill does not remove those model and execution costs.

For web publishing, SVG preserves sharp lines and editable elements, while PNG provides a conventional image export. The [portfolio’s design-trends article](/blog/ui-design-trends-skeuomorphism-isometric-glass/) discusses why spatial presentation can make an interface or explanation easier to read. `/teardown` offers a practical authoring workflow for one such presentation.

Its strongest use is an explanation whose parts need to stay identifiable through revisions. A reader should be able to understand the assembly after a label, color or view changes. Keeping those views connected to one model is the feature that makes the release more than a collection of attractive example images.

Sources: [Krehel’s examples](https://jakub.kr/skills), [teardown workflow and limitations](https://github.com/jakubkrehel/skills/blob/main/skills/teardown/SKILL.md), [collection and MIT license](https://github.com/jakubkrehel/skills), [announcement thread mirror](https://teapawt.org/jakubkrehel), and [SkillsMP’s catalog entry](https://skillsmp.com/creators/jakubkrehel/skills/skills-teardown).
