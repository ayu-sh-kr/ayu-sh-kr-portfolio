# ASCII art’s web revival: AI tools, animation and design

A globe assembled from punctuation, a shark swimming through a browser, a product illustration that looks printed on a terminal: **ASCII art is finding a fresh audience in web design**. The appeal comes from seeing familiar objects resolve out of a deliberately restricted set of marks. Color, lighting and motion give those marks a range that an old command prompt never suggested.

Recent posts on X put several approaches beside one another. On **October 26**, Praveen Kumar shared an [ASCII Web Section](https://x.com/praveenisomer/status/2114680944196264294), while [another designer’s post](https://x.com/evanlong_me/status/2114784842441465922) explicitly asked whether UI design was moving toward ASCII, mentioning jellyfish and cyberpunk imagery. An [October 25 AI-art post](https://x.com/Moric21/status/2114168604212211740) used a prompt for a colored, terminal-style fantasy scene.

These are examples of current interest, rather than evidence that a new art form appeared in three days. The more interesting change is how many routes now lead to the same visual vocabulary: hand-crafted compositions, image converters, procedural animation and AI-assisted coding.

## From terminal constraint to visual choice

ASCII art draws with characters: a sparse dot can suggest a faint surface, while a dense `@` can carry a shadow or highlight. A carefully chosen grid turns those differences into recognizable volume. Monospaced lettering keeps the columns aligned; character choice supplies the texture.

The surrounding aesthetic often includes **dithering**, which uses patterned marks to suggest intermediate tones. Braille dots, block symbols and other Unicode characters expand the palette further. They are frequently grouped under the ASCII label in design tools, although they go beyond the original ASCII character set.

That distinction helps explain why the examples look so different. A text portrait, a field of tiny squares and a shaded 3D globe can share a coarse, tactile surface without sharing an implementation. A screenshot tells you how the result looks; it cannot tell you whether the creator used a shader, a character grid or an exported video.

Kumar’s financial-page study shows how this treatment works in a layout. Pale purple forms recur across a large globe and smaller cards, while ordinary typography carries the product information. His [earlier brain-wave exploration](https://design-on-x.com/praveenisomer/status/2063221867155206263/), archived on June 6, already combined ASCII, dither and particles. The current post is one expression of an established practice, with the surrounding grid doing as much work as the effect.

## AI can help build the renderer without generating the artwork

There are two different AI stories here. An image model can produce a picture that resembles character art, as in the October 25 fantasy-scene prompt. That output may be a raster image: its apparent letters need not form a reusable text grid.

A coding model can instead help someone build a converter or renderer. The finished program then samples an image or calculates a scene and chooses characters according to brightness. Its output can be deterministic, editable and independent of further model calls.

That route predates this week. In February 2025, [Creative Bloq reported](https://www.creativebloq.com/ai/im-obsessed-with-an-openai-o3-generated-image-to-ascii-art-converter) on Mike Bespalov’s Monospace converter, which he said he built with help from OpenAI’s reasoning model. It exposed controls for tone, character sets and dithering. AI lowered the effort of making the tool; the image-to-character conversion remained an explicit graphics process.

Calling every example “AI art” would erase that difference—and overlook designers who compose their work manually. The useful question is **what generates the marks**, and how much control the creator retains over them.

## The repositories make the style reusable

The available tools cover several different jobs. [Asciify](https://github.com/ayangabryl/asciify-engine), published by `ayangabryl`, converts images and video and provides character-based interface effects. Its MIT-licensed engine includes browser rendering and an agent skill for integrating it into a site. The project documents reduced-motion support and pausing off screen; those are implementation features, rather than proof of low cost on every device.

Its [dated changelog](https://asciify.org/changelog) provides a concrete recent development: October 23 updates refined character-field shockwaves and clearing around text. The October 24 release only changed sponsor presentation in the README. A live project can contribute to a visual trend without every version being a new graphics breakthrough.

[ascii.rest](https://github.com/bas3line/ascii), by `bas3line`, offers a different starting point: a collection of animated pieces for web pages, with framework integrations and examples such as lit objects, landscapes and generative patterns. Its MIT license makes the implementation reusable under those terms. The collection is useful when you want a ready-made subject rather than a photo-conversion workflow.

[ascii-sharks](https://github.com/stackedlol/ascii-sharks), by `stackedlol`, narrows the subject further: fish and sharks drawn on an HTML canvas, with a TypeScript `OceanEngine` entry point. The README states zero dependencies and MIT licensing. It demonstrates how a recognizable creature can carry an entire visual theme without a conventional video asset.

These options should not be ranked by an invented speed comparison. A converted video, a procedural sphere and a swimming creature have different workloads. Character density, redraw rate, canvas dimensions and the number of simultaneous effects determine the cost. None of the examples establishes that character art is automatically cheaper than SVG or ordinary imagery.

## An original ASCII study inside the article

The component below builds a shaded sphere from ten printable characters. Its rotating bands show how a repeated mark can suggest curvature and movement. It is an original illustration for this article, rather than a copy of any featured creator’s asset.

<ui-ascii-showcase></ui-ascii-showcase>

Each cell is assigned a point on the sphere. A fixed light direction sets its brightness; a moving band pattern changes the character density. Sixteen calculated frames are included in the page and replayed with CSS. The pause control stops the animation, and a reduced-motion preference keeps a still frame. This small study has no image-generation call, external graphics dependency or continuous JavaScript rendering loop.

These two downloadable, original stills use the same character-first approach for different subjects: a lit orb and a flowing field. They are examples of what the renderer can draw, rather than third-party artwork presented as reusable assets.

![Original lit sphere built from monospaced ASCII characters](/news/assets/praveen-kumar-ascii-web-section-design/ascii-orb.svg)

![Original flowing field rendered as bands of ASCII characters](/news/assets/praveen-kumar-ascii-web-section-design/ascii-flow.svg)

## Where the treatment earns its place

ASCII works particularly well when texture supports the identity of a page: an ambient hero, an illustrated feature card or a restrained loading state. Keep the heading, navigation and meaningful data readable outside the character field. A dense animated backdrop can undermine the copy it was meant to support.

A still image or SVG is often enough for an editorial illustration. A live character renderer becomes useful when the scene needs to react or change. For motion, provide a pause mechanism and a reduced-motion state; for decorative characters, give assistive technology a short description instead of thousands of changing marks. The [broader design-trends article](/blog/ui-design-trends-skeuomorphism-isometric-glass/) examines the same relationship between visual treatment, motion and usability.

The software’s license and the artwork’s reuse rights also remain separate. An MIT-licensed renderer does not grant rights to another designer’s composition, source photograph or brand assets. Link to those examples with attribution and create or license the imagery used on your own page.

The recent posts are a good reason to look again at character graphics. What makes the approach useful is the range of control behind the surface: you can choose the subject, the marks, the shading and the amount of movement. Start with an image that reads well as a still, then add motion only when it improves that composition.

Sources: [Praveen Kumar’s October 26 post](https://x.com/praveenisomer/status/2114680944196264294), [October 26 UI-trend discussion](https://x.com/evanlong_me/status/2114784842441465922), [October 25 AI-art example](https://x.com/Moric21/status/2114168604212211740), [earlier creator work](https://design-on-x.com/praveenisomer/status/2063221867155206263/), [Monospace reporting](https://www.creativebloq.com/ai/im-obsessed-with-an-openai-o3-generated-image-to-ascii-art-converter), [Asciify source](https://github.com/ayangabryl/asciify-engine), [dated Asciify releases](https://asciify.org/changelog), [ascii.rest source and license](https://github.com/bas3line/ascii), and [ascii-sharks source](https://github.com/stackedlol/ascii-sharks). Recent X dates and descriptions are available through search-indexed post records; full threads and replies were not accessible for verification.
