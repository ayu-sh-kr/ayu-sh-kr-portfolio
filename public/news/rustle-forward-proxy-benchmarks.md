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

When a client connects to Rustle, the proxy has to relay traffic between that client and its destination. Rustle divides that work across CPU cores, with one worker thread and its own Tokio runtime per core. The kernel hands an incoming connection to one worker, which keeps it for its lifetime. Each worker has its own event loop, listening socket and upstream connection pool. If a client sends another request over the same open connection, the same worker can handle it with reused buffers and little coordination with other cores.

> **What is a Tokio worker?** Tokio is a Rust runtime for asynchronous work. In Rustle, each worker runs a Tokio event loop on its own thread. While one connection waits for bytes, the loop can advance another connection that’s ready, so one core can handle many open connections.

![Isometric view of two client connections carrying repeated requests. Each stream stays on its assigned Rustle worker, which has a listening socket, event loop and upstream connection pool.](/news/assets/rustle-forward-proxy-benchmarks/connection-per-core.svg)

## What the benchmark measured

Keeping connections local to a worker cuts down on coordination. Courty’s benchmark put that design up against four existing proxies. He reports that Rustle led in **all 41 tests it could run** against 3proxy, Squid, gost and Tinyproxy. In the plain HTTP test with 1 KB responses, it delivered **2.6×** the throughput of 3proxy, the runner-up in that test.

![Single-core HTTP throughput with 1 KB responses. Rustle 55,258, 3proxy 21,032, Squid 15,140, Tinyproxy 7,580 and gost 4,755 requests per second.](/news/assets/rustle-forward-proxy-benchmarks/single-core-throughput.svg)

The project pinned each proxy to one core, enabled authentication and reported the median of three runs across three bare-metal servers. In a separate test, Rustle used **95 MB for 25,000 idle tunnels**, compared with Tinyproxy’s 274 MB. The figures come from the project’s own test campaign. Bulk transfers approached the test network’s capacity, so the 1 KB result tells you more about this small-response workload than about large downloads.

## What backend experience brought to the project

The benchmark also puts Courty’s account of building Rustle in context. In his LinkedIn launch post, he says he doesn’t consider himself a Rust developer, but he knows how to structure software. Decisions such as keeping each connection on one worker and giving workers their own connection pools are examples of where that backend experience applies. Courty credits Claude with much of the implementation work and invites Rust developers to review the code and rerun the tests.

With each new Rust tool, the interesting question is what changed in the design and what that buys. Rustle has a concrete answer for small HTTP responses. The published setup gives others a way to see how much of that lead carries over to their own traffic.

## Sources

- [Ubuntu’s Rust-based utility replacements](https://ubuntu.com/server/docs/reference/other-tools/sudo-rs/).
- [Courty’s launch write-up](https://medium.com/@edouard.courty/rustle-the-fastest-forward-proxy-written-in-rust-764e983f3b73) and his LinkedIn launch post.
- [Rustle source and benchmark results](https://github.com/EdouardCourty/rustle#benchmarks) and [benchmark methodology and tuning](https://github.com/EdouardCourty/rustle/blob/main/benchmarks/documentation/FAIRNESS.md).
- [MDN’s guide to forward and reverse proxies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Proxy_servers_and_tunneling) and [Cloudflare’s examples of filtering and load balancing](https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/).
- [Tokio runtime documentation](https://docs.rs/tokio/latest/tokio/runtime/).
