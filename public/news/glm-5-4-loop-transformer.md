# GLM-5.4: Z.ai’s coding model runs 28 layers twice

A coding model can write a shader that compiles and still make the scene look wrong. With [GLM-5.4, released November 23](https://z.ai/blog/glm-5.4), Z.ai added vision alongside a change in how the model processes each token. That combination matters when the code is only half of what you need to check.

## Why run the same layers twice?

Z.ai continued training its existing GLM-5 base so that a block of **28 layers runs twice**. The second pass starts from the first pass’s intermediate result and processes it again using the **same weights**. That gives the model another round of computation without storing a second copy of those layers.

The extra pass still has a cost. Z.ai limits how much additional context it has to keep in memory by reusing selected information from the first pass and keeping a separate window of recent tokens for the second. Layer reuse is also the idea behind [Inkling 2 Mini’s three-pass design](/news/inkling-2-mini/), although the two models use different architectures.

## From writing code to checking the result

Z.ai’s demos include a **six-axis robotic arm modeled in FreeCAD** and an interactive 3D birdwatching scene. Like [other AI-assisted browser worlds](/news/saltline-ai-browser-3d-evolution/), the birdwatching scene uses the browser’s graphics tools, here with mathematical geometry and custom GLSL shaders. Vision gives the model a way to work from an image, such as a screenshot of the rendered scene, alongside the code that produced it.

At launch, GLM-5.4 was available in **Z.ai Chat, ZCode, and all tiers of the [GLM Coding Plan](https://zcode.z.ai/en/docs/qa)**. Z.ai listed standard API access as coming soon and plans to release downloadable weights after further safety work. It gave no dates for either.

For a visual coding task, the useful test is to start with something you can render or inspect. Run the generated code, show the model where the result falls short, and see whether its revision brings the output closer to what you wanted.
