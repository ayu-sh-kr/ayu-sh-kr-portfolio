# UI Design Trends: Analog Gauges and Animated Isometric Illustrations

Some interfaces make you stop scrolling. A row of cockpit dials, with needles slowly turning. A little machine carrying pieces along a conveyor belt. You recognise the objects before you know what the product does.

These two styles borrow from familiar things: physical instruments and technical drawings. The first makes a screen feel like a control panel. The second makes an idea feel like something you can watch working.

They are the focus of this guide. Let's look at where they come from, what makes them look right, and where they belong on a website. The examples move on their own, so you can see the style while you read.

## Analog gauges: a familiar face for a digital value

The cockpit reference uses round faces, fine markings and moving needles. It feels familiar because we have seen the same arrangement in cars, clocks and measuring instruments. The screen borrows the appearance of a physical object.

That approach is called **skeuomorphism**. The name is less useful than the idea: use something people already recognise to help them understand something new. A folder icon borrows from a paper folder. A digital volume knob borrows from an audio device.

This has been part of interface design for decades. Early graphical interfaces used office objects to explain files and actions. Later apps went further, with wooden bookshelves, leather notebooks and realistic buttons. [Nielsen Norman Group's overview](https://www.nngroup.com/articles/skeuomorphism/) explains both the useful familiarity and the excess that followed.

The gauges in the reference belong to that family, but they do not need a whole screen covered in textures. A dark face, a fine rim and carefully spaced markings already carry much of the character.

<ui-gauge-showcase></ui-gauge-showcase>

### What makes the style work?

The **visual grammar** is the set of rules that makes the dials feel related. Their rims have a similar thickness. The numbers sit at the same distance from the centre. Major markings are longer than minor ones. The needles are thin enough to point clearly without hiding the scale.

Small details matter here. A bright edge suggests a raised rim. A darker face suggests depth. If the highlights come from the same direction across all the instruments, the panel feels like one object.

Movement completes the impression. A needle turning gently feels like a reading changing. A needle jumping around for no reason feels like a broken instrument. The showcase above uses illustrative movement; it is not displaying live measurements.

The [Gauge UI studio](https://www.gauge-ui.dev/studio) is an example of this approach in a current component tool. It lets creators compose a dial from arcs, markings and needles. The interesting part is the careful arrangement of those pieces, rather than how many effects you can add.

### When should you use it?

Gauges suit a single reading with a clear range: speed, pressure, temperature or an audio level. They can also fit a simulator or a product whose audience already understands instrument panels.

Imagine a home energy app showing how much power you are using right now. A dial can give that reading a familiar shape. Beside it, you would still want the actual number and unit. The needle helps you get a quick impression; the number gives you an exact answer.

For a dashboard comparing twenty readings, rows or bars will usually be easier to scan. For yesterday's changes, a chart is more useful than a dial. Choose the instrument when its shape helps with the question the reader is asking.

You can also borrow the feeling without copying every detail. One well-made dial may be enough to give a page character. Turning every button and card into a physical object can make the page feel crowded.

> A familiar object is useful when it makes the meaning easier to recognise.

## Isometric illustration: a small world on the page

The other references show little machines, platforms and moving parts. They have depth, but the view stays steady. You can see the top and two sides at once.

This is **isometric illustration**. Objects follow the same angled grid, so their edges line up even when they sit in different parts of the scene. A small box and a large machine feel as though they belong to the same world.

The style comes from technical drawing. William Farish's *On Isometrical Perspective*, published in 1822, described a way to show machinery clearly. The [original paper](https://www.aproged.pt/biblioteca/farishisometrical.pdf) contains the same basic concern we still have: how do you show the shape and arrangement of several parts on a flat page?

Today's illustrations use that drawing language more freely. A conveyor can stand for work moving through a system. A stack of cards can stand for stored information. You do not have to explain the whole product inside the picture; one recognisable action can be enough.

<ui-isometric-showcase></ui-isometric-showcase>

### What makes the style work?

Start with the angles. The conveyor, the machine and the loose pieces should all follow the same directions. If one object appears to face a different camera, it breaks the scene's sense of order.

Then give the faces slightly different tones. A light top and quieter sides make a plain box feel solid. Fine outlines help small details stay visible. A little colour can draw attention to the moving pieces without making the whole scene noisy.

[IBM's isometric illustration guide](https://www.ibm.com/design/language/illustration/isometric-style/design/) uses a grid, simple shapes and consistent light to keep illustrations coherent. You can apply those ideas to a pale line drawing like the references, or to a darker scene that fits your website.

Notice how much you can say with a few shapes. An opening makes the box feel like a machine. A belt suggests movement. A small piece travelling toward the opening suggests something being handled. More detail is useful only when it strengthens that impression.

### Why add motion?

A still picture shows the parts. Motion shows what they do. In the reference, the appeal comes from small repeated actions: pieces travel, a platform turns, or a mechanism lifts something.

The movement should fit the object. A conveyor carries pieces along its path. A wheel rotates around its centre. A lift travels up and down. When unrelated parts all float or bounce together, the scene loses the mechanical feeling that made it interesting.

[IBM's animation guidance](https://www.ibm.com/design/language/illustration/isometric-style/usage/) also emphasises keeping the perspective consistent during movement. The scene can stay simple while one part does the work. In the example above, the machine stays still while pieces enter and leave.

### Where does it belong?

This style works well beside a feature introduction, on a product landing page, or in an explanation of how something moves through a system. It gives an abstract idea a shape the reader can remember.

A delivery service might show parcels passing through a sorting machine. A developer tool might show files entering a processor. A storage product might show blocks being organised into a stack. Each gives you an impression of the product without asking you to inspect a full dashboard.

Keep that role clear. The illustration can introduce the idea; the nearby words explain what the product actually does. If the picture has to carry every detail, it becomes a diagram with too many parts to follow.

On a small screen, simpler scenes also hold up better. The main object and movement should remain recognisable after the illustration shrinks. Tiny labels and dozens of moving pieces often disappear into visual noise.

## Choosing between them

The gauges draw you toward a **reading**. The isometric machine draws you toward an **action**. That difference is a useful starting point.

If you want someone to notice a current level, try an instrument. If you want them to picture work moving between parts, try an isometric scene. Neither needs to become the visual style of the entire application.

Let the rest of the page give the illustration room. Plain text, comfortable spacing and a quiet background help the details stand out. A strong example loses its effect when every section competes with it.

The references work because the objects are carefully drawn and the movement feels natural. Start there: make one dial readable, or make one small machine convincing. Add the details that support it, and stop when the idea is clear.
