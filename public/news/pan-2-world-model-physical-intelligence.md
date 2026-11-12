# PAN 2: an open world model for testing actions before taking them

Before an agent pours a drink or moves an object, it needs some idea of what its action will do. **PAN 2** turns that question into a video: give it a scene and an action, and it generates a possible sequence of events for an agent to examine before acting.

The [Institute of Foundation Models announced PAN 2 on November 10](https://ifm.ai/pan2/press-release/). IFM was established by **Mohamed bin Zayed University of Artificial Intelligence**, based in Abu Dhabi, UAE. The release makes its video-model weights and training and inference code available under **Apache 2.0**, giving researchers a system they can adapt. Its Qwen and Wan components retain their own licenses.

## From an instruction to a possible outcome

A **world model** predicts how an environment changes when something happens. PAN 2 divides that work between two components: a language model describes the expected events, their timing and camera movement; a video model generates the visual details.

| Metric or specification | PAN 2 |
| --- | --- |
| Video backbone | **29 billion parameters**; language reasoner separate |
| Inputs | Text instructions and an optional starting image |
| Video output | Up to **20 seconds**, 704 × 1248 pixels, 24 fps |
| Individual steps completed | **75.1%** in IFM's evaluation |
| Full plans completed | **34%**, versus MiniMax-H3's 32.5% |

Specifications: [model card](https://huggingface.co/IFM/PAN2). Results: [IFM evaluation](https://ifm.ai/blog/pan2/), using 100 everyday tasks in both image- and text-conditioned settings, covering 456 ordered steps, averaged over three seeds with Kimi K3 as PAN 2’s reasoner.

> **Reading the numbers:** These are IFM's model-judged results, not independently verified robot success rates. Video frame rate describes playback, not generation speed.

For the pouring example, the description establishes who moves the container and when. The video model supplies the visible motion and changing liquid levels. The research goal is to compare possible actions through their predicted consequences. That is a different role from [AI helping write a browser game's code](/news/saltline-ai-browser-3d-evolution/): here, the model itself generates the unfolding scene.

## Completing a sequence remains difficult

The gap between **individual steps and complete plans** matters: several plausible actions do not necessarily add up to a successful sequence.

The model can also skip prerequisites or change objects across clips. Its quantitative study tested plans intended to succeed; **simulating plans that should fail** remains unmeasured. For planning, that distinction is crucial: an agent must learn when an action will go wrong, not merely generate a convincing successful outcome.

That makes PAN 2 useful as an open research platform: teams can test where simulated actions match reality and where they break down. The next step is closing that gap. Before an agent trusts the imagined pour, it needs evidence that the real glass behaves the same way.

## Sources

- [PAN 2 announcement](https://ifm.ai/pan2/press-release/) and [technical report with demonstrations](https://ifm.ai/blog/pan2/).
- [Model weights and limitations](https://huggingface.co/IFM/PAN2) and [training and inference code](https://github.com/ifm-ai/PAN2).
