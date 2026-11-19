# How Blink keeps the host CPU out of LLM inference

A language model can slow down even when the time its GPU spends on matrix multiplication barely changes. Researchers at KTH and RISE saw this when they ran a second workload on an inference server. The delay was between GPU operations. The host CPU took longer to send the next piece of work, and the GPU waited.

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

## Could a serving team adopt Blink?

For an application developer, the familiar part is the network endpoint. Blink’s prototype accepts OpenAI-compatible HTTP requests and streams replies using server-sent events. Most of the integration work falls to whoever runs the inference server. To follow the tested design, that team would compile its model with TensorRT, capture the operations as CUDA graphs, and connect a BlueField-3 frontend to GPU memory over RDMA. Installing a network card alone would still leave the existing serving engine scheduling work on the host.

The handoff between the card and GPU is what another team would have to implement. They share a queue in GPU memory. The card fills a slot with a prompt and marks it ready. The GPU claims the slot and updates it as tokens become available. The paper describes who can change each slot and when those changes become visible. That gives implementers a design to follow. As of November 19, the authors had announced plans to open-source Blink, but a public code release or a versioned interface specification for independently built components could not be verified.

## How far has the scheduler been tested?

Blink’s persistent kernel is a working GPU scheduler. It admits new prompts while other replies are in progress and preserves their state when it restarts its CUDA graph to stay within a launch limit. The authors evaluated four models on one H100. Coordinating several GPUs to serve a larger model remains future work.

That boundary matters when reading the throughput table. For a model that fits on one GPU, the Qwen run shows that sharing the host CPU need not slow the stream of completed requests at the tested load. A team with similar hardware has a concrete experiment to repeat. A team serving one model across several GPUs still needs evidence that the benefit survives coordination between them.

## Sources

- [Blink preprint, architecture and evaluation](https://arxiv.org/html/2604.07609v1)
- [NVIDIA DOCA GPU packet-processing application guide](https://networking-docs.nvidia.com/doca/archive/2-8-0/nvidia-doca-gpu-packet-processing-application-guide)
