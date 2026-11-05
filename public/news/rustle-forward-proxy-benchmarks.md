# Rustle hits 55,258 requests per second in a single-core proxy benchmark

From the commands you use to copy a file to the library that develops a camera’s RAW image, familiar tools are getting new implementations in Rust. Ubuntu 26.10 completed its switch to Rust-based core utilities, and [FlashRaw recently took on LibRaw](/news/flashraw-rust-camera-raw-decoder-benchmarks/). Now there’s a new Rust entry in networking. Rustle takes on established forward proxies by changing how the work is divided across CPU cores.

Édouard Courty says he built **Rustle**, an open-source forward proxy in Rust, in a few days with substantial help from Claude. In his launch benchmark, it handled **55,258 requests per second on one core** with 1 KB HTTP responses. To see where that speed comes from, start with where Rustle sits in a request.

> **Forward proxy.** A forward proxy sits on the client’s side and relays its outgoing requests.
>
> For example, you want to check the weather. If your phone uses a forward proxy, it asks the proxy to connect to the weather site. The proxy makes that connection for you.

> **Reverse proxy.** A reverse proxy sits on the website’s side and routes incoming requests to the servers behind it.
>
> For example, you open a weather app to see tomorrow’s forecast. The app sends its request to the weather service, whose reverse proxy picks a server to answer it and relays the forecast back.

## Each connection stays with one worker

Rustle runs one worker thread per core, each with its own single-threaded Tokio runtime and listening socket. The listeners share a port, so clients can all connect to the same address. The operating system hands each new connection to one listener. From there, the worker that accepted it handles that connection until it closes.

On an open HTTP connection, the worker reads the request from a buffer it can reuse on the next request. It also keeps its own pool of connections to destination servers. When a suitable connection is already open, the worker can borrow it from its pool and send the request without opening a new one or coordinating with another core.

The workers still share a few things, including a DNS cache for hostname lookups, but most of the forwarding work stays local. Large transfers take a different path on Linux. Once a flow is sustained, Rustle can use `splice()` to relay bytes through a kernel pipe without copying the payload through the proxy’s memory.

> **What is a Tokio worker?** Tokio is a Rust runtime for asynchronous work. In Rustle, each worker runs a Tokio event loop on its own thread. While one connection waits for bytes, the loop can advance another connection that’s ready, so one core can handle many open connections.

![Isometric view of two client connections carrying repeated requests. Each stream stays on its assigned Rustle worker, which has a listening socket, event loop and upstream connection pool.](/news/assets/rustle-forward-proxy-benchmarks/connection-per-core.svg)

## What the benchmark measured

The 1 KB test is a useful place to look for the effect of that design. With a small response, reading the request, finding an upstream connection and sending the reply account for more of the work than they do in a large download. Rustle completed **55,258 requests per second** on one core, about **2.6×** 3proxy’s 21,032. The chart shows throughput for the whole proxy under that workload. It can’t isolate how much of the lead came from any one design choice.

![Single-core HTTP throughput with 1 KB responses. Rustle 55,258, 3proxy 21,032, Squid 15,140, Tinyproxy 7,580 and gost 4,755 requests per second.](/news/assets/rustle-forward-proxy-benchmarks/single-core-throughput.svg)

The project ran the load generator, proxy and origin on separate machines. It pinned each proxy to one core, enabled authentication and reported the median of three runs. Each proxy was tested at several connection counts, and the published result uses its best run level without client errors. Courty reports that Rustle led in **all 41 tests it could run**, though some competitors lacked features needed for particular tests.

Two other results show how the workload changes the comparison. With **25,000 idle tunnels**, Rustle used **95 MB** of memory and Tinyproxy used **274 MB**. That measures the cost of holding connections open. For active bulk transfers, Rustle reached about **22 Gbit/s** on a link measured at **23.5 Gbit/s**, leaving little room to see how fast the proxy itself could go. All of these figures come from the project’s own test campaign.

## What backend experience brought to the project

The benchmark also puts Courty’s account of building Rustle in context. In his LinkedIn launch post, he says he doesn’t consider himself a Rust developer, but he knows how to structure software. Decisions such as keeping each connection on one worker and giving workers their own connection pools are examples of where that backend experience applies. Courty credits Claude with much of the implementation work and invites Rust developers to review the code and rerun the tests.

With each new Rust tool, the interesting question is what changed in the design and what that buys. Rustle has a concrete answer for small HTTP responses. The published setup gives others a way to see how much of that lead carries over to their own traffic.

## Sources

- [Ubuntu’s Rust-based utility replacements](https://ubuntu.com/server/docs/reference/other-tools/sudo-rs/).
- [Courty’s launch write-up](https://medium.com/@edouard.courty/rustle-the-fastest-forward-proxy-written-in-rust-764e983f3b73) and his LinkedIn launch post.
- [Rustle source and benchmark results](https://github.com/EdouardCourty/rustle#benchmarks) and [benchmark methodology and tuning](https://github.com/EdouardCourty/rustle/blob/main/benchmarks/documentation/FAIRNESS.md).
- [MDN’s guide to forward and reverse proxies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Proxy_servers_and_tunneling) and [Cloudflare’s examples of filtering and load balancing](https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/).
- [Tokio runtime documentation](https://docs.rs/tokio/latest/tokio/runtime/).
