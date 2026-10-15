# Article code blocks

Blog, Dispatch, and Showcase share the portfolio syntax palette. Ordinary fenced
code uses Editorial: an adaptive surface, language label, and visible copy icon.
The compact metadata row shares the code surface, without a divider or a separate
header panel. Filenames appear only when authored: the basename is shown, with
the full path available on hover and to assistive technology. Long names truncate
before pushing the copy control out of view. Spacing, corners, and typography
consume the application layout and type tokens.

Keep the language on every fence so dota-md can highlight it. Inline code keeps
its existing treatment. Copy controls update only the block and announce success
only after the clipboard write completes.

Variant selection is explicit, not inferred from the language or block length.
Syntax colors work in all three variants. Use Focus to emphasize lines discussed
in the surrounding explanation, Minimal for short commands, and Editorial for
ordinary examples. `data-highlight-lines` affects Focus only; it does not change
which words the syntax tokenizer recognizes. The AppConfig Spring Boot article
contains examples of all three variants.

For an optional filename or another presentation, wrap a fence with a div.
Keep blank lines before and after the fence so Markdown parses its contents:

````markdown
<div data-code-variant="focus" data-filename="subscriber.ts" data-highlight-lines="2-3">

```ts
const email = 'hello@example.com';
const response = await subscribe(email);
console.log(response);
```

</div>
````

Focus adds line numbers and a soft accent wash on the specified one-based lines
or inclusive ranges (`2-3,5`). Minimal uses an open surface with an accent edge;
select it with `data-code-variant="minimal"`. Unrecognized variants use Editorial.
A plain fence needs no attributes or content migration. The same attributes can
be placed on raw `pre` elements, but raw code must be HTML-escaped and supply its
own syntax spans; fences receive automatic highlighting from dota-md.

All variants preserve source text, including a trailing newline. Numbering and
controls are outside the copied source. Long lines scroll inside the block;
the copy control stays in its header. Colors update through CSS on theme changes,
without parsing or rendering the article again.
