# How Blink keeps the host CPU out of LLM inference

A language model can slow down even when its GPU takes exactly as long to do the math. Researchers at KTH and RISE saw this when they ran a second workload on an inference server. The delay was between GPU operations. The host CPU took longer to send the next piece of work, and the GPU waited.

**Blink** is their answer to that delay. It pairs a programmable network card with a GPU and gives them enough control to serve a request from arrival to final token. The host still starts the system. Once a user sends a prompt, generating the reply can proceed without another instruction from the host.

## Why share an inference server?

An operator can reserve CPU cores to keep replies responsive, but those cores could be doing other work. Sharing them is attractive until a busy neighbour slows the stream of tokens a user sees. The authors measured that trade-off with Qwen3-30B-A3B at an offered load of four requests per second.

| Serving engine | Throughput retained when sharing the CPU |
| --- | ---: |
| TensorRT-LLM | 28% |
| SGLang | 45% |
| vLLM | 54% |
| Blink | 100% |

Each percentage compares an engine with its own run on an otherwise idle host. The result describes how each handled interference at that load.

## From an HTTP request to a stream of tokens

At startup, the host loads the model and records the GPU operations needed to run it. Once setup finishes, the network card and GPU handle each request together.

![A prompt crosses from BlueField-3 to the H100 scheduler over RDMA. Generated tokens return to the card for streaming.](/news/assets/blink-cpu-free-llm-inference/inference-loop.svg)

1. **The network card receives the prompt.** Its onboard processor handles HTTP and can tokenize text. It writes the input directly into GPU memory using remote direct memory access (RDMA).
2. **The GPU decides what runs next.** A scheduler stays running on the GPU. It groups requests into batches, launches the recorded operations, and manages the cached attention data each request reuses as its answer grows.
3. **The card streams the reply.** As the GPU produces tokens, the card sends results over the client’s open connection. The host is free to run another workload throughout generation.

NVIDIA already ships a DOCA example that delivers packets directly into GPU memory. Blink extends that idea beyond moving data. Once the GPU generates a token, its scheduler can start the next round while the network card streams the result.

## Availability

The April 8 preprint describes a prototype tested with one H100 and a BlueField-3 on a separate machine. The researchers plan to release their code upon publication. Their preprint includes the hardware and benchmark settings. Multi-GPU serving remains future work.

## What the experiment changes

On a shared server, even a brief wait for the CPU can recur throughout an answer. Blink shows what happens when the GPU can start each round itself. In the Qwen experiment, the host took on a second workload and the model kept serving requests at the same rate. For an operator weighing how much CPU capacity to reserve, that is the result worth testing at a larger scale.

## Sources

- [Blink preprint, architecture and evaluation](https://arxiv.org/html/2604.07609v1)
- [NVIDIA DOCA GPU packet-processing application guide](https://networking-docs.nvidia.com/doca/archive/2-8-0/nvidia-doca-gpu-packet-processing-application-guide)
