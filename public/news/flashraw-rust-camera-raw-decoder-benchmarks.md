# FlashRaw’s Rust RAW decoder: what its LibRaw benchmarks measure

Camera RAW support sits underneath photo editors, upload previews and media-processing pipelines. The file contains sensor measurements and camera-specific metadata; turning it into a usable image requires more work than opening a finished JPEG.

Yassine Bouanane’s **FlashRaw 0.1.0** offers a new implementation of that work in Rust, with native and browser interfaces. Its launch claims large speed improvements over LibRaw. The interesting details are which stages it combines, where the gains appear and which camera files remain exceptions.

## From sensor values to a photograph on screen

[FlashRaw](https://github.com/ybouane/flashraw) can return decoded sensor samples, metadata and embedded previews, or develop the RAW file into a display-ready image. Those are different outputs with different costs.

A photo editor may want sensor data so it can apply its own processing. An upload service may only need the embedded preview. A browser application may want the complete conversion to sRGB, the color space commonly used for web images. Comparing the time for one of these operations with another would give a misleading impression of speed.

The release provides **Rust, C, C++, Python and JavaScript interfaces**, with WebAssembly for execution in browsers. That makes it a library developers can integrate, rather than a replacement photo-editing application. Bouanane also builds the browser tools LightFlow and ImageFlow, which the repository identifies as users of the decoder.

## A fused development pass changes the amount of work

The [architecture documentation](https://github.com/ybouane/flashraw/blob/main/docs/architecture.md) describes parallel decoding and vectorized routines, alongside a combined image-development stage. That stage reconstructs color pixels from the sensor pattern, applies white balance and color conversion, and writes the output without storing a succession of full-size intermediate images.

For a large camera file, avoiding those buffers can reduce memory traffic as well as memory consumption. The GPU can accelerate the development stage on supported backends. That does not mean every part of every RAW file is decoded on the GPU: compressed sensor data can still leave CPU decoding as the dominant cost.

The [WebAssembly documentation](https://github.com/ybouane/flashraw/blob/main/docs/wasm.md) adds another deployment option. An editor can process a file within the browser, avoiding an upload for that operation. Its native benchmark results should not be treated as browser timings, since the runtime, threading setup and GPU transfer costs differ.

## What the 15.4× claim actually compares

FlashRaw’s published comparison uses files from **62 popular cameras, phones and drones**, with each library measured on the same machine and on files it supports. Results are reported separately for a **Ryzen 7 9700X on Linux** and an **Apple M1 Ultra on macOS**, using all cores.

The project reports the following median speedups against LibRaw:

| Work performed | Linux Ryzen 7 9700X | macOS M1 Ultra |
| --- | ---: | ---: |
| RAW to decoded sensor samples | 7.9× | 11.4× |
| RAW to an sRGB image | 8.8× | 15.4× |

The Canon EOS R5 example in the launch image is a narrower result: approximately **109 ms for FlashRaw versus 737 ms for LibRaw** for RAW-to-sRGB processing on the M1 Ultra, about 6.7× on that file. It illustrates one conversion, rather than contradicting the median across a larger set.

These are **author-produced benchmarks**. The [published methodology and result files](https://github.com/ybouane/flashraw/blob/main/docs/benchmarks.md) make the comparison more inspectable, including build settings, repeated runs and exceptions. The project’s [Show HN appearance](https://buzz0.com/daily/2026-10-25) documents public launch attention, not an independent performance replication.

Output quality remains a separate question. Timing two development pipelines does not establish identical color rendering or demosaicing—the reconstruction of full-color pixels from the camera’s sensor pattern. An editor needs to compare the results visually and check the stages it actually intends to use.

## Alternatives and compatibility still decide adoption

**LibRaw** is the direct alternative for decoding and development. **RawSpeed**, used in darktable, focuses on RAW decoding; **rawler**, used by dnglab, offers another Rust implementation. Their responsibilities overlap without matching exactly.

FlashRaw’s benchmark notes include cases where RawSpeed wins, particularly some uncompressed or lossless formats, and a JPEG XL DNG where rawler is faster. A plain parallel decode can also use more memory than LibRaw because of per-thread buffers. The attractive full-conversion result does not imply a win in every stage.

The repository reports decoding 1,980 of 2,016 files in the raw.pixls.us test corpus. That describes the supplied corpus, not a guarantee for every camera, firmware variation or damaged file. The parser uses Rust, resource limits and fuzz tests; those are meaningful protections for untrusted uploads, with ongoing testing still necessary.

**FlashRaw is available under MIT or Apache 2.0**, with packages on crates.io, PyPI and npm. For a new image pipeline, it is a credible option to benchmark against the existing decoder. Start with the cameras your users upload and the exact output your application needs. That is where its implementation choices can turn into a visible improvement in preview time or server capacity.

Sources: [FlashRaw release and APIs](https://github.com/ybouane/flashraw), [benchmark methodology and exceptions](https://github.com/ybouane/flashraw/blob/main/docs/benchmarks.md), [architecture](https://github.com/ybouane/flashraw/blob/main/docs/architecture.md), [browser runtime documentation](https://github.com/ybouane/flashraw/blob/main/docs/wasm.md), and [October 25 Show HN listing](https://buzz0.com/daily/2026-10-25).
