# Rustle hits 55,258 requests per second in a single-core proxy benchmark

Édouard Courty says he built **Rustle**, an open-source forward proxy in Rust, in a few days with substantial help from Claude. In his launch benchmark, it handled **55,258 requests per second on one core** with 1 KB HTTP responses. The architecture behind that result starts with a simple decision about who owns each connection.

> **Forward proxy.** A forward proxy contacts websites on behalf of a client. Say you open a news site on an office computer. If the browser is set up to use the office’s proxy, it sends the request there first. The proxy checks whether the site is allowed, then fetches the page and sends it back.

> **Reverse proxy.** A reverse proxy receives requests on behalf of a website and passes them to its servers. When you open an online shop, your browser visits the shop’s public address. The shop’s proxy can send your request to one of several servers and return the page, all under the same address.

## Each connection stays with one worker

Rustle runs one worker thread with its own Tokio runtime per CPU core. The kernel hands an incoming connection to one worker, which keeps it for its lifetime. Each worker has its own event loop, listening socket and upstream connection pool. If the browser sends another request over the same open connection, the same worker can handle it with reused buffers and little coordination with other cores.

> **What is a Tokio worker?** Tokio is a Rust runtime for asynchronous work. In Rustle, each worker runs a Tokio event loop on its own thread. While one connection waits for bytes, the loop can advance another connection that’s ready, so one core can handle many open connections.

![Isometric view of two client connections carrying repeated requests. Each stream stays on its assigned Rustle worker, which has a listening socket, event loop and upstream connection pool.](/news/assets/rustle-forward-proxy-benchmarks/connection-per-core.svg)

## What the benchmark measured

Courty reports that Rustle led in **all 41 tests it could run** against 3proxy, Squid, gost and Tinyproxy. The chart shows one workload, plain HTTP with 1 KB responses. Rustle delivered **2.6×** the throughput of 3proxy, the runner-up in that test.

![Single-core HTTP throughput with 1 KB responses. Rustle 55,258, 3proxy 21,032, Squid 15,140, Tinyproxy 7,580 and gost 4,755 requests per second.](/news/assets/rustle-forward-proxy-benchmarks/single-core-throughput.svg)

The project pinned each proxy to one core, enabled authentication and reported the median of three runs across three bare-metal servers. In a separate test, Rustle used **95 MB for 25,000 idle tunnels**, compared with Tinyproxy’s 274 MB. The figures come from the project’s own test campaign. Bulk transfers approached the test network’s capacity, so the 1 KB result tells you more about this small-response workload than about large downloads.

## What backend experience brought to the project

In his LinkedIn launch post, Courty says he doesn’t consider himself a Rust developer and points to his experience structuring software. Rustle shows where that experience applies. Deciding who owns each connection, what workers share and which workloads to measure gives an assistant a concrete design to implement. Courty also says he can’t judge every line of Rust himself and invites code review and benchmark reruns.

The next step is to see whether that design holds up when someone else runs the tests or puts real traffic through it. Courty published the source and benchmark setup, so both questions are open to scrutiny.

## Sources

- [Courty’s launch write-up](https://medium.com/@edouard.courty/rustle-the-fastest-forward-proxy-written-in-rust-764e983f3b73) and his LinkedIn launch post.
- [Rustle source and benchmark results](https://github.com/EdouardCourty/rustle#benchmarks) and [benchmark methodology and tuning](https://github.com/EdouardCourty/rustle/blob/main/benchmarks/documentation/FAIRNESS.md).
- [MDN’s guide to forward and reverse proxies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Proxy_servers_and_tunneling).
- [Tokio runtime documentation](https://docs.rs/tokio/latest/tokio/runtime/).
