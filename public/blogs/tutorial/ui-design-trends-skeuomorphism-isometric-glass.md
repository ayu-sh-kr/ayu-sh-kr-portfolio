# UI Design Trends: Skeuomorphism, Isometric Art and Motion

UI design is giving surfaces and movement more attention. Apple's [Liquid Glass redesign, announced in June 2025](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/), brought glass-like depth and moving controls across its platforms.

This guide explores three design directions: **skeuomorphism, isometric illustration and motion UI**. They are established ideas, with different jobs. A physical-looking control makes something familiar; an isometric scene explains a process; a transition helps you follow a change.

We will follow those ideas through fifteen animated examples, moving from familiar objects to small illustrated systems and then to changes inside an app. For each one, start with what the person needs, watch what the visual does, and then consider where it would fit. The values and actions are illustrative.

You do not need to remember every design term. The useful distinction is what each example helps someone understand. Keep that question in mind as we move through the guide: what became clearer because of the way this was drawn or moved?

## Skeuomorphism: borrow a familiar object

A screen can borrow something we already know. A folder suggests a place for several documents. A needle on a scale suggests a changing reading. We bring some understanding of those objects with us, before reading an explanation.

That is the starting point of **skeuomorphism**: borrowing features of physical objects for digital interfaces. The following examples explore how much of the original object is useful to keep. Start with the record player, where the appearance is part of the pleasure of listening.

### A record player that gives playback a familiar shape

For a music listener, a record deck gives playback a familiar shape. The turning disc suggests that the track is running, while the title and time say exactly what is playing.

<div>
<ui-skeuomorphic-showcase example="record"></ui-skeuomorphic-showcase>
</div>

The grooves, spindle and tonearm belong to the same object. Their relationship does more work than a heavy shadow or shiny border. This treatment could suit an album page or a listening room where the music deserves attention.

Watch the disc for a moment. Its movement gives the scene life, but the track information stays still so you can read it. That balance matters: a decorative object should leave the main task easy to follow. [Nielsen Norman Group's overview](https://www.nngroup.com/articles/skeuomorphism/) is a useful reference for judging how physical cues work in an interface.

### A flip clock for one glanceable reading

The record player invites you to spend time with it. A desk clock has a different job: it should give you an answer at a glance. Someone looking across a screen needs to read the time quickly. Large split faces and a clear hour–minute grouping suit that glance.

<div>
<ui-skeuomorphic-showcase example="clock"></ui-skeuomorphic-showcase>
</div>

The hinges and centre seams give the clock its physical character. Only the minute face changes; the hour stays still. It could fit a desk companion or a personal dashboard. A scheduling app comparing several time zones would need more context than one large clock can provide.

The clock shows why restraint is part of this style. A small seam can suggest a mechanical object; the large digits still do most of the work. You can keep the character without asking people to study the decoration.

### A project folder for recognising a collection

Familiar objects can also help us choose something. Imagine opening a project library with separate folders for invoices, photographs and brand assets. A designer looking for the brand files wants to recognise the right collection before opening it. A folder with typography and colour sheets peeking out gives “Brand assets” a more specific identity than an anonymous box.

<div>
<ui-skeuomorphic-showcase example="folder"></ui-skeuomorphic-showcase>
</div>

The tab says “container”; the overlapping sheets say “several things inside”. The count remains readable. This could work in a small project library where a preview helps people choose a folder. Hundreds of folders would be easier to search and scan in a simpler list.

Compare the folder with the clock. One explains what is inside; the other makes a reading easy to recognise. They borrow different objects because they answer different questions.

Their **visual grammar** means the details that make the style hold together: consistent edges, believable layers and parts that belong to the same object. A folder tab and overlapping sheets support one idea. Adding an unrelated dial would make that idea harder to read.

### A thermostat for separating target and actual temperature

Now move from recognising an object to reading a control. A homeowner checking the living room needs to know what temperature they asked for and what the room is doing now. A dial feels familiar, but it must keep those readings distinct.

<div>
<ui-gauge-usecase example="thermostat"></ui-gauge-usecase>
</div>

The large 21° is the target. The room is at 19° and heating. The fixed marker belongs to the target; the heat lines suggest activity rather than an instant temperature change.

Take a moment to separate those two numbers. The target describes what the person wants; the room reading describes what has happened so far. If the design made them look equally important, you would have to work out which one you were changing.

[Google's Nest guidance](https://support.google.com/googlehome/answer/10178773) describes adjusting temperature with a dial in its app. Our study borrows that control language. It suits one room in focus; comparing a whole building calls for a broader view.

### Home energy: keep only the useful shape

The thermostat uses a dial to connect a setting with a room. Staying in the same home, consider a simpler question about solar energy. Here, the useful information is a proportion. A simple ring answers one question: how much of today's generation was used at home? [Home Assistant's energy cards](https://www.home-assistant.io/dashboards/energy/) include this kind of gauge.

<div>
<ui-gauge-usecase example="energy"></ui-gauge-usecase>
</div>

The sample reading is 72%. The sun and house establish what that proportion connects. This is a **flat gauge**, rather than a detailed physical imitation: a useful comparison with the thermostat above.

A familiar form does not require every physical detail. For twenty readings, bars or rows may be easier to compare. For changes over a week, a chart can answer more than a ring.

The ring keeps the circular shape but drops most of the physical detail. A design can borrow just enough of a familiar form to explain a value.

### Audio meters for a recording session

The energy ring shows a summary for the day. Sound recording needs a view of something changing right now. A person recording stereo sound needs to see whether both channels are receiving a signal. Paired meters give left and right their own space, and their movement belongs to the changing input.

<div>
<ui-gauge-usecase example="audio"></ui-gauge-usecase>
</div>

The faces, markings and thin needles borrow from studio equipment. Unlike the energy ring, they preserve an instrument's appearance. [Ableton's mixer documentation](https://www.ableton.com/en/manual/mixing/) explains peak and RMS readings; a real meter must define what it measures. These needles are illustrative.

Look at the pair together: the separate channels matter as much as the shape of either meter. One large needle would lose that comparison. This is where the object’s structure earns its place in the design.

Study [Gauge UI Studio](https://www.gauge-ui.dev/studio) for how arcs, scales and needles are composed. Borrow the instrument when it helps your audience recognise the reading, and keep the value understandable in plain text.

## Isometric illustration: give a process a small world

So far, each visual has represented something a person can recognise or read. But a service often needs to explain a relationship: where a file goes, what happens to a picture, or how a parcel reaches a van. A single control cannot show the whole journey.

An **isometric illustration** gives those parts a shared space. You see their tops and sides from a fixed angle, so their arrangement is easier to follow. We can begin with a simple machine, then replace its anonymous pieces with objects that explain a particular service.

### A machine for showing work moving through a system

Someone meeting an unfamiliar service may understand a small machine before its technical description. Pieces entering and leaving suggest work passing through a process. The camera stays fixed so the action is easy to follow.

<div>
<ui-isometric-showcase></ui-isometric-showcase>
</div>

Follow one piece along the belt. The opening gives it a destination, and the outgoing belt suggests a result. You can understand that sequence before knowing what the machine represents. A short caption could then connect it to the service being introduced.

Its grammar is consistency. Edges follow the same directions, faces have related tones, and moving pieces follow the scene's paths. [IBM's isometric guide](https://www.ibm.com/design/language/illustration/isometric-style/design/) develops those principles into a coherent illustration style.

### Backup: keep the original and show the copy

The machine establishes a process, but its pieces could stand for almost anything. To explain backup, we need to be more specific. Someone choosing a backup service needs to understand a basic relationship: their files remain available, and another copy is kept elsewhere. A separate archive makes that relationship visible.

<div>
<ui-isometric-usecase example="backup"></ui-isometric-usecase>
</div>

The original documents stay on the left. A copy travels through the centre to the archive. The scene represents copying rather than removing or relocating the original.

Notice what does not move: the original files. That is an important part of the story. If they disappeared into the archive, the same attractive animation could suggest moving files instead of protecting another copy.

[Apple's iCloud Backup explanation](https://support.apple.com/en-in/108770) describes what gets copied. Real backup rules and status still need clear text.

### Image resizing: show the benefit at the other end

Backup preserves a copy. An image service changes the output to suit another use. Imagine preparing one photograph for a website that people will open on both a laptop and a phone. A person publishing that picture wants it to work across those screens. Showing several smaller versions makes the output easier to picture than an anonymous block labelled “processing”.

<div>
<ui-isometric-usecase example="images"></ui-isometric-usecase>
</div>

The source is a photo; the outputs sit in a desktop display and a phone. The devices make the intended use visible. [Cloudflare's image transformation documentation](https://developers.cloudflare.com/images/optimization/transformations/overview/) describes resizing and conversion; this is our own illustration of that idea.

Read the scene from the source photo to the two devices. The result gives the processing step a reason to exist: the picture needs to fit more than one place. This is the part a visitor should understand before meeting any details about image formats.

Use this beside a feature introduction. Keep the main input and result recognisable on a phone; tiny moving parts can disappear when the scene shrinks.

### Delivery: use objects the customer already knows

The same approach works for a physical service. We can replace the photo with a parcel and the processing step with a depot. For a delivery customer, these familiar objects make the journey easier to recognise. An incoming package, a sorting hub and onward routes introduce the journey without turning the scene into a live tracking screen.

<div>
<ui-isometric-usecase example="delivery"></ui-isometric-usecase>
</div>

A warehouse, an arriving parcel and a delivery truck give each stage a different shape. The incoming parcel follows the road toward the depot. Motion explains the relationship between the parts. [IBM's usage guidance](https://www.ibm.com/design/language/illustration/isometric-style/usage/) emphasises keeping the perspective coherent during animation.

Watch the incoming and outgoing stages as one journey. The depot connects them; the truck makes the destination of the sorted parcel clear. The scene only needs enough detail to explain that handover. Extra buildings and vehicles would give the eye more to follow without adding much to this particular story.

This belongs in an introduction or onboarding. To find a real parcel, someone still needs status and arrival information, as [UPS's tracking guidance](https://www.ups.com/in/en/support/tracking-support/where-is-my-package) makes clear. The illustration introduces the journey; it does not report it.

## Motion UI: explain a change on the screen

The delivery scene uses movement to explain a journey outside the interface. Now bring that attention back to the screen itself. You add an item, open a photo or move a song. Something changes, and you need to understand what your action did.

That is the role of **motion UI**. Movement connects a before and an after. The strongest starting point is a small change with an obvious purpose, such as confirming that a product reached your shopping bag.

### Shopping: confirm the selected item

A shopper adds a sage mug to their bag. They need to know that the right item went in, with the right quantity and price. A tiny badge changing in the corner can be easy to miss.

<div>
<ui-motion-showcase example="cart"></ui-motion-showcase>
</div>

The item travels toward the bag, then a count and receipt appear. The product stays visible. [Nielsen Norman Group's cart-feedback research](https://www.nngroup.com/articles/cart-feedback/) recommends clear confirmation with product details people have time to review. In a real shop, that receipt would remain available.

Look at where the movement ends. The receipt gives you something stable to check once the item has stopped moving. The animation draws attention; the settled information lets you confirm the result.

[Figma's current motion guide](https://help.figma.com/hc/en-us/articles/41237382040983-Motion-design-fundamentals-Why-motion-matters) describes its roles as orientation, feedback, transition and narrative. Here, movement confirms the shopper's action, then leaves a readable result.

### Uploading: identify the file and the result

Adding a product can produce a quick result. Uploading a file takes time, so the interface also needs to explain the wait. Here, a designer uploads a moodboard for a client review. Its name and preview stay visible during the transfer, so the designer can check what is being sent instead of watching a detached loading symbol.

<div>
<ui-motion-showcase example="save"></ui-motion-showcase>
</div>

The progress line completes and “Ready to share” appears beside that file. Receiving, sharing and publishing are different outcomes; the message should name the one that actually happened.

[Figma's guide to motion fundamentals](https://help.figma.com/hc/en-us/articles/41237382040983-Motion-design-fundamentals-Why-motion-matters) describes feedback as a role of motion. This is a **microinteraction** around one task: the change draws attention, while the settled message carries the meaning.

The filename connects all three moments: waiting, transferring and being ready. Keeping that reference in place makes the progress feel attached to your file. It also gives you a way to check that you uploaded the intended item.

### Opening an album: preserve the selected image

Confirmation is one use of motion. Another is helping you keep your place when a view changes. Imagine browsing several photo albums and choosing Lakeside walks. The selected landscape grows into the album image, giving you a recognisable point to follow instead of replacing the collection with an unrelated screen.

<div>
<ui-motion-showcase example="expand"></ui-motion-showcase>
</div>

This is a **shared element transition**: the same recognisable object connects two views. It can suit a gallery, product collection or story card. Closing the detail should return attention to the original item.

Its grammar is continuity. Keep the image recognisable, let the details arrive after it, and avoid making everything travel at once. [Carbon's motion guidance](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview) distinguishes quiet everyday motion from more expressive moments.

Follow the landscape as it grows. Its appearance gives your eye something to hold on to while the surrounding layout changes. The same idea can connect a small product photo with its detail page: the layout changes, while the selected object stays familiar.

### A music queue: show which song will play next

An album transition moves between views. A queue changes the order within one view, which brings a different concern: did the intended item move to the intended place? Here, a listener wants After the rain to play next while City lights keeps playing. Moving the selected song upward should leave the current track alone. The new position has a clear purpose.

<div>
<ui-motion-showcase example="reorder"></ui-motion-showcase>
</div>

Names and artwork move together. Coastal road makes room, and the current track stays still as a reference. This can also suit a reading queue or a small priority list.

Direction explains where the item goes; timing makes that change easy to follow. In a real app, it happens once after “Play next”. A constantly rearranging list would make the reader's task harder.

The song that keeps playing gives you a fixed reference. Leaving it in place helps you read the change as an adjustment to what comes next. If every row moved, the same action would take more effort to understand.

### A map sheet: reveal details and keep your place

Sometimes we need more information while keeping the current view nearby. On a map, that might mean checking a café’s name and walking time without losing sight of the route. A panel rising from the bottom gives the place another layer while leaving the destination and nearby streets visible.

<div>
<ui-motion-showcase example="sheet"></ui-motion-showcase>
</div>

The name and walking time arrive together. [Material's bottom-sheet reference](https://github.com/material-components/material-components-android/blob/master/docs/components/BottomSheet.md) describes secondary content anchored to the screen's bottom. This suits a place preview or short choice; a whole new task may need its own page.

The panel’s direction helps explain the relationship. It comes over the map, so the map still feels like the place underneath. That is useful when checking a detail is a short step within the task you were already doing.

[Apple's motion guidance](https://developer.apple.com/design/human-interface-guidelines/motion) recommends purposeful feedback and reduced-motion alternatives. All the studies have readable resting states. Their loops are for studying the examples; real interfaces should respond to an action or a genuine state change.

## Which UI trend fits your product?

We started with the renewed attention to surfaces and movement. Across the examples, those qualities have done three different kinds of work: making an object familiar, explaining how parts connect, and showing what changed.

Before choosing a style, describe the moment in plain language. “I want to check the room temperature” leads to different choices from “I want to understand where my parcel goes.” The table below brings those choices together.

| What someone needs | A useful direction |
| --- | --- |
| Recognise playback, time or a collection | Record player, flip clock or folder |
| Read one level or target | Meter, ring or thermostat |
| Picture a process | Isometric machine, archive or sorting hub |
| Understand an interface change | Feedback, shared element or position transition |

You can combine these directions when their roles are clear. A music app might use a physical-looking player for character and a simple queue transition for feedback. Each treatment should make sense in the part of the experience where it appears. The linked Nielsen Norman Group, IBM and Figma guides offer useful starting points for exploring those decisions.

Choose the treatment that helps someone recognise, understand or follow what is happening. Keep the music player expressive, the delivery journey clear, and the shopping confirmation easy to follow.
