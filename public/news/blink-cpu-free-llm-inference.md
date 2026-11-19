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

Each percentage compares an engine with its own run on an otherwise idle host. The result describes how each handled interference at that load. [Experiment and methodology, Figure 1](https://arxiv.org/html/2604.07609v1#S1.F1)

## From an HTTP request to a stream of tokens

At startup, the host loads the model and records the GPU operations needed to run it. After that, three steps carry a reply back to the client.

1. **The network card receives the prompt.** Its onboard processor handles HTTP and can tokenize text. It writes the input directly into GPU memory using remote direct memory access (RDMA).
2. **The GPU decides what runs next.** A scheduler stays running on the GPU. It groups requests into batches, launches the recorded operations, and manages the cached attention data each request reuses as its answer grows.
3. **The card streams the reply.** As the GPU produces tokens, the card sends results over the client’s open connection. The host is free to run another workload throughout generation.

Part of this path already ships. NVIDIA’s DOCA examples demonstrate a network card delivering packets directly to GPU memory. Blink tackles the next decision too: once a token is ready, the GPU can schedule the work for the following one. [NVIDIA’s GPU packet-processing example](https://networking-docs.nvidia.com/doca/archive/2-8-0/nvidia-doca-gpu-packet-processing-application-guide)

## What you can try today

The April 8 preprint describes a working prototype tested with one H100 and a BlueField-3 network processor on a separate machine. The authors say they plan to release the code upon publication. I could verify the paper and its benchmark configuration, but no public Blink release. Serving a model across multiple GPUs remains future work. [Paper, implementation and evaluation](https://arxiv.org/html/2604.07609v1)

One reader, Yue Yu, suggested putting an agent’s sandbox on the freed CPU so its tools and model could share a server. That proposal gives Blink a practical next test. Can an agent compile code on the host while another user’s answer keeps streaming smoothly? The paper shows why that is plausible on one GPU. A run with real sandboxes would tell operators how much host capacity they could put back to work. [Yue Yu’s discussion](https://www.linkedin.com/posts/yue-yu-4609b8197_blink-cpu-free-llm-inference-by-delegating-activity-7451256636272324608-5BBB)
