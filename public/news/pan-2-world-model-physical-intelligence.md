# PAN 2: an open world model for testing actions before taking them

Before an agent pours a drink or moves an object, it needs some idea of what its action will do. **PAN 2** turns that question into a video: give it a scene and an action, and it generates a possible sequence of events for an agent to examine before acting.

The [Institute of Foundation Models announced PAN 2 on November 10](https://ifm.ai/pan2/press-release/). IFM was established by **Mohamed bin Zayed University of Artificial Intelligence**, based in Abu Dhabi, UAE. The release makes its video-model weights and training and inference code available under Apache 2.0, giving researchers a system they can adapt rather than only a demonstration to watch.

## From an instruction to a possible outcome

A world model predicts how an environment changes when something happens. PAN 2 divides that work between two components. A language model describes the expected events, their timing and camera movement. A **29-billion-parameter video model** then generates the visual details, producing clips of up to 20 seconds from text and an optional starting image. The language reasoner is a separate component, not part of that 29B checkpoint; the release also uses Qwen and Wan components with their own licenses. The [model card](https://huggingface.co/IFM/PAN2) documents the complete pipeline.

For the pouring example, the description establishes who moves the container and when. The video model supplies the visible motion and changing liquid levels. The research goal is to compare possible actions through their predicted consequences. That is a different role from [AI helping write a browser game's code](/news/saltline-ai-browser-3d-evolution/): here, the model itself generates the unfolding scene.

## Completing a sequence remains difficult

IFM's [technical evaluation](https://ifm.ai/blog/pan2/) tested 100 everyday tasks as both image- and text-conditioned prompts, covering 456 ordered steps. PAN 2 completed **75.1% of individual steps but only 34% of full plans**, compared with MiniMax-H3's 32.5% full-plan completion. These are IFM's model-judged results, not proof of reliable physical control. The gap between step and plan scores matters: several plausible actions do not necessarily add up to a successful sequence.

The model can also skip prerequisites or change objects across clips. Its quantitative study tested plans intended to succeed; faithfully simulating plans that should fail remains unmeasured. For planning, that distinction is crucial: an agent must learn when an action will go wrong, not merely generate a convincing successful outcome.

PAN 2 gives robotics and simulation researchers an open place to study that problem. Before it can guide the real pour, its imagined result still needs checking against what actually happens.

## Sources

- [PAN 2 announcement](https://ifm.ai/pan2/press-release/) and [technical report with demonstrations](https://ifm.ai/blog/pan2/).
- [Model weights and limitations](https://huggingface.co/IFM/PAN2) and [training and inference code](https://github.com/ifm-ai/PAN2).
