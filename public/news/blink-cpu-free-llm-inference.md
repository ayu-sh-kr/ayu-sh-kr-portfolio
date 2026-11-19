# How Blink keeps the host CPU out of LLM inference

When researchers at KTH and RISE ran a second workload on an inference server, the model slowed down. Yet the GPU took about as long as before to multiply its matrices. The extra wait came **between GPU operations**, while the busy host CPU prepared the next one.

Their prototype, **Blink**, moves that decision onto the GPU and gives a programmable network card responsibility for receiving prompts and streaming replies. The host CPU still sets everything up. After that, it can run other work while the model answers.

## What happens when another workload shares the CPU?

Reserving CPU cores for inference helps keep replies responsive. Sharing those cores lets an operator get more work out of the same server. To measure the trade-off, the researchers sent four requests per second to Qwen3-30B-A3B, first with the host CPU available for inference and then with another workload competing for it.

| Serving engine | Throughput retained when sharing the CPU |
| --- | ---: |
| TensorRT-LLM | 28% |
| SGLang | 45% |
| vLLM | 54% |
| Blink | 100% |

Each percentage compares an engine with **its own throughput in the first run**. Blink completed requests at the same rate in both runs. Its architecture explains why a busy host made so little difference.

## From a prompt to a streamed reply

At startup, the host loads the model and records sequences of GPU operations as **CUDA graphs**. The GPU can then launch those sequences itself. Here’s how a request moves through the system.

![A prompt crosses from BlueField-3 to the H100 scheduler over RDMA. Generated tokens return to the card for streaming.](/news/assets/blink-cpu-free-llm-inference/inference-loop.svg)

1. **Receive the prompt.** The BlueField-3 network card handles HTTP and can split text into tokens. It writes the input straight into GPU memory using remote direct memory access (RDMA).
2. **Schedule the work.** A program called a persistent kernel stays active on the GPU. It groups requests into batches, launches the appropriate graph, and manages the attention data each request reuses as its answer grows.
3. **Stream the reply.** The card reads newly generated tokens and streams them to the client. Meanwhile, the GPU can start the next round.

NVIDIA already ships a DOCA example that delivers network packets directly into GPU memory. Blink goes a step further by moving the decision about **which request runs next** onto the GPU as well.

## What would it take to adopt Blink?

On the application side, Blink exposes an OpenAI-compatible HTTP endpoint and streams replies using server-sent events. Most of the work is on the server. To reproduce the prototype, a team would compile its model with TensorRT, capture CUDA graphs, and connect BlueField-3 to GPU memory over RDMA.

The two devices coordinate through a **shared queue in GPU memory**. The card writes a prompt into a free slot and marks it ready. The GPU claims the slot and updates it as tokens become available. The paper describes these handoffs in enough detail to guide an independent implementation. The authors plan to open-source Blink. As of November 19, a public code release and a versioned specification for that interface remain unconfirmed.

## How mature is the GPU scheduler?

The kernel can admit a new prompt while earlier replies are streaming. It also preserves requests in progress when it restarts a CUDA graph to stay within a launch limit. The authors tested it with **four models on a single H100**.

That puts the opening result in perspective. At the tested load, Blink kept serving Qwen at the same rate even as another workload used the host CPU. For teams whose models fit on one GPU, that gives them a reason to reconsider how many CPU cores to reserve. For larger models, the open question is whether Blink can sustain that rate when several GPUs must coordinate every step.

## Sources

- [Blink preprint, architecture and evaluation](https://arxiv.org/html/2604.07609v1)
- [NVIDIA DOCA GPU packet-processing application guide](https://networking-docs.nvidia.com/doca/archive/2-8-0/nvidia-doca-gpu-packet-processing-application-guide)
