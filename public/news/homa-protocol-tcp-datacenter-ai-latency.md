# Homa revisits TCP’s place in the datacenter as AI waits on tiny messages

Stanford’s Homa starts with a mismatch: datacenter applications send requests and wait for complete replies, while TCP carries a stream of bytes. A tiny reply can end up waiting behind a much larger transfer. Homa was designed to give that small message a way through.

Stanford’s **Homa transport protocol** tackles this part of datacenter communication. It has been researched for years—the first Homa paper appeared in 2018—so this is **not a newly released internet protocol**. Its renewed relevance is easy to see as AI services and distributed applications exchange many short requests and wait for replies.

## Where TCP makes the small request wait

TCP gives applications a **reliable stream of bytes**. That is useful across the internet, but a datacenter application often thinks in complete request and response messages. When a small request shares a connection with a large transfer, it may wait behind bytes already in that stream. TCP also has to manage congestion without knowing the size of each application message.

Homa takes a different approach: it is a **reliable, message-based transport for datacenter RPCs**. A sender can transmit an initial part immediately; for longer messages, the receiver grants permission to send more and assigns network priorities. This lets receivers coordinate incoming traffic and gives short messages a chance to finish quickly amid larger transfers. It is an alternative transport design, not a drop-in TCP setting for an existing app.

![Hand-drawn Homa flowchart: send initial bytes, complete short requests immediately, or use receiver grants and priorities to finish longer requests.](/news/assets/homa-protocol/homa-request-flow.svg)

*Homa’s request flow: short messages can fit in the initial transmission; longer ones continue as the receiver grants more bytes. Responses use the same rules with roles reversed.*

The comparison has numbers, but they need context. In a **40-node cluster benchmark**, Stanford researchers reported that Homa’s 99th-percentile latency for short messages was **7–83× lower than TCP and DCTCP**, depending on the workload. That is a measured result in a particular test environment, not a promise that every AI request or public internet connection will see the same gain. The circulating “13× faster” claim should be read with the same caution.

## Why AI makes the wait visible

An inference service may fan out to caches, retrieval systems, and other services before it can return a response. If it must wait for all of them, the slowest reply matters. A coding agent can also make many service calls, although **Homa helps only where those calls actually use Homa inside a datacenter**; it cannot speed up model computation by itself.

Adoption is still a real hurdle. Homa has a Linux kernel implementation and early gRPC support, but applications and infrastructure need to accommodate its message-based interface. TCP remains the practical default for most systems. Homa’s lesson is more specific: when work consists of many short requests, the network should treat those requests as messages worth finishing, rather than leaving a tiny answer waiting behind a large stream.

That mismatch between messages and streams is the thread running through Homa’s design. It will take changes across applications and infrastructure to put the protocol to work, but its question is straightforward: how much time does a short reply lose simply waiting for its turn?

Sources: [Stanford PlatformLab’s Homa overview](https://github.com/PlatformLab/HomaModule), [Homa/Linux evaluation, USENIX ATC 2021](https://www.usenix.org/conference/atc21/presentation/ousterhout), and [Homa protocol synopsis](https://github.com/PlatformLab/HomaModule/blob/main/protocol.md).
