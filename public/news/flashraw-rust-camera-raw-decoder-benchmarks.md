# FlashRaw targets faster camera RAW processing in Rust and the browser

**FlashRaw 0.1.0 is a new Rust library for reading and developing camera RAW files**, with native interfaces and WebAssembly support for browsers. Created by Yassine Bouanane, it reports large speedups over LibRaw, including a 15.4× median improvement for RAW-to-sRGB conversion on an Apple M1 Ultra.

The claim concerns work that sits beneath photo editors and preview services. RAW files contain sensor measurements and camera metadata; producing a viewable photograph requires decoding that data and applying an image-development pipeline. FlashRaw changes how those stages are implemented.

## Doing more of the conversion in one pass

FlashRaw can return sensor samples, metadata or an embedded preview, or develop the file into a display-ready image. These outputs serve different purposes: an editor may need unprocessed samples, while an upload preview may only need an existing thumbnail.

For full development, the library combines color reconstruction, white balance and color conversion into a fused stage. Avoiding a succession of full-size intermediate images reduces the memory traffic involved in processing large files.

Parallel decoding and vectorized routines handle other parts of the workload. Supported GPU backends can accelerate development, although decoding compressed sensor data can still dominate the time spent on a file.

The library exposes Rust, C, C++, Python and JavaScript interfaces. Its browser version allows processing to happen locally without uploading the photograph for that operation. Browser performance remains a separate measurement from the native results.

## Where the reported speedups appear

The project compares files from **62 cameras, phones and drones**, measuring each library on the same machine and supported files. It reports these median gains over LibRaw using all CPU cores:

| Output | Ryzen 7 9700X, Linux | M1 Ultra, macOS |
| --- | ---: | ---: |
| Decoded sensor samples | 7.9× | 11.4× |
| Developed sRGB image | 8.8× | 15.4× |

The distinction between the rows matters. A faster full conversion does not necessarily imply the same gain for an editor using only the decoder.

The launch’s Canon EOS R5 example illustrates that variation: roughly **109 ms versus 737 ms** on the M1 Ultra, about 6.7× for that file. The larger headline figure is a median across the tested set.

These are author-produced benchmarks, with methodology and result files published in the repository. They measure speed, rather than establishing identical color rendering or reconstruction quality between the pipelines.

## Compatibility remains part of the result

FlashRaw reports decoding **1,980 of 2,016 files** in the raw.pixls.us test corpus. That provides a useful indication of coverage while leaving exceptions across formats and camera variations.

> **What is raw.pixls.us?** [raw.pixls.us](https://raw.pixls.us/) is a collection of sample RAW files from many cameras and formats. Projects use the files to check decoder compatibility and catch regressions; FlashRaw’s result counts files decoded, rather than measuring processing speed.

The benchmark documentation also records cases where other decoders are faster, including some formats handled by RawSpeed and a JPEG XL DNG handled by rawler. Their relevance is specific to the processing stage and file involved; the results do not establish one universal winner.

> **Other RAW decoders**
>
> **[RawSpeed](https://github.com/darktable-org/rawspeed)** is the RAW decoding library used by darktable. It extracts sensor data for an application to process, rather than producing a finished image on its own.
>
> **[rawler](https://github.com/dnglab/dnglab)** is a Rust RAW decoding library used by DNGLab, a tool for converting camera RAW files to DNG. It provides another implementation for reading camera formats.

FlashRaw is available under **MIT or Apache 2.0**, with packages on crates.io, PyPI and npm. Its release offers a new implementation for a demanding part of imaging software, particularly where native and browser processing need to share a library. The published gains are substantial, but their practical significance depends on the camera files and image output being processed.

Sources: [FlashRaw release and APIs](https://github.com/ybouane/flashraw), [benchmark methodology and exceptions](https://github.com/ybouane/flashraw/blob/main/docs/benchmarks.md), [architecture](https://github.com/ybouane/flashraw/blob/main/docs/architecture.md), [browser runtime documentation](https://github.com/ybouane/flashraw/blob/main/docs/wasm.md), and [October 25 Show HN listing](https://buzz0.com/daily/2026-10-25).
