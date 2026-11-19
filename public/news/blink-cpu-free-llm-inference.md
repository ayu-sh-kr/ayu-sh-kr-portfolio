# How Blink keeps the host CPU out of LLM inference

When researchers at KTH and RISE ran a second workload on an inference server, the model slowed down. Yet the GPU took about as long as before to multiply its matrices. The team traced the extra wait to the gaps **between GPU operations**, while the busy host CPU prepared the next one.

Their prototype, **Blink**, moves scheduling onto the GPU and uses a programmable network card to receive prompts and stream replies. The host CPU still handles startup. The researchers wanted to know whether keeping it out of the token loop would make inference less sensitive to other work on the server.

## What happens when another workload shares the CPU?

Reserving CPU cores for inference helps keep replies responsive. Sharing those cores lets an operator get more work out of the same server. To measure the trade-off, the researchers sent four requests per second to Qwen3-30B-A3B, first with the host CPU available for inference and then with another workload competing for it.

| Serving engine | Throughput retained when sharing the CPU |
| --- | ---: |
| TensorRT-LLM | 28% |
| SGLang | 45% |
| vLLM | 54% |
| Blink | 100% |

Each percentage compares an engine’s throughput under contention with **its own throughput when run alone**. At that request rate, the researchers measured no drop for Blink. They attribute the difference to where the four engines schedule work between tokens.

## From a prompt to a streamed reply

At startup, the host loads the model and records sequences of GPU operations as **CUDA graphs**. The GPU can then launch those sequences itself.

![A prompt crosses from BlueField-3 to the H100 scheduler over RDMA. Generated tokens return to the card for streaming.](/news/assets/blink-cpu-free-llm-inference/inference-loop.svg)

1. **Receive the prompt.** The BlueField-3 network card handles HTTP and can split text into tokens. It writes the input straight into GPU memory using remote direct memory access (RDMA).
2. **Schedule the work.** A program called a persistent kernel stays active on the GPU. It groups requests into batches, launches the appropriate graph, and manages the attention data each request reuses as its answer grows.
3. **Stream the reply.** The card reads newly generated tokens and streams them to the client. Meanwhile, the GPU can start the next round.

NVIDIA already ships a DOCA example that delivers network packets directly into GPU memory. In Blink, the GPU also decides **which request runs next**.

## What would it take to adopt Blink?

On the application side, Blink exposes an OpenAI-compatible HTTP endpoint and streams replies using server-sent events. Behind that endpoint, the researchers compiled the models with TensorRT, captured CUDA graphs, and connected BlueField-3 to GPU memory over RDMA. Reproducing their setup would also require the GPU scheduler and the code that coordinates it with the card.

The two devices coordinate through a **shared queue in GPU memory**. The card writes a prompt into a free slot and marks it ready. The GPU claims the slot and updates it as tokens become available. The paper describes which device owns each slot and how ownership changes. The authors say they plan to release the code. As of November 19, a public code release and a versioned specification for that interface remain unconfirmed.

## How mature is the GPU scheduler?

The kernel can admit a new prompt while earlier replies are streaming. It also preserves requests in progress when it restarts a CUDA graph to stay within a launch limit. The authors tested it with **four models on a single H100**.

The study leaves a practical question for larger deployments. When a model spans several GPUs, those devices must coordinate as they generate each token. The authors leave that case for future work, so the throughput figures cover only the single-GPU setup.

## Sources

- [Blink preprint, architecture and evaluation](https://arxiv.org/html/2604.07609v1)
- [NVIDIA DOCA GPU packet-processing application guide](https://networking-docs.nvidia.com/doca/archive/2-8-0/nvidia-doca-gpu-packet-processing-application-guide)
