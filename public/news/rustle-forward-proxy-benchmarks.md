# Rustle hits 55,258 requests per second in a single-core proxy benchmark

Édouard Courty says he built **Rustle**, an open-source forward proxy in Rust, in a few days with substantial help from Claude. In his launch benchmark, it handled **55,258 requests per second on one core** with 1 KB HTTP responses. The architecture behind that result starts with a simple decision about who owns each connection.

> **Forward proxy.** A forward proxy sits on the client’s side and relays its outgoing requests.
>
> Say you open an online shop on a work laptop. Your employer has set up the browser to use its proxy, so the request goes there first. The proxy checks the destination against the company’s browsing rules and, if allowed, connects you to the shop.

> **Reverse proxy.** A reverse proxy sits on the website’s side and routes incoming requests to the servers behind it.
>
> Say that same shop runs a flash sale. Shoppers all use the same web address, and the shop’s proxy spreads their requests across several servers so one machine doesn’t have to handle the rush alone.

## Each connection stays with one worker

Rustle runs one worker thread with its own Tokio runtime per CPU core. The kernel hands an incoming connection to one worker, which keeps it for its lifetime. Each worker has its own event loop, listening socket and upstream connection pool. If a browser sends another request over the same open connection, the same worker can handle it with reused buffers and little coordination with other cores.

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
- [MDN’s guide to forward and reverse proxies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Proxy_servers_and_tunneling) and [Cloudflare’s examples of filtering and load balancing](https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/).
- [Tokio runtime documentation](https://docs.rs/tokio/latest/tokio/runtime/).
