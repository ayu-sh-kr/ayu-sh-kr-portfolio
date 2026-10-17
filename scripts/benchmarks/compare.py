"""Compare renderer behavior and SSG builds in two portfolio checkouts."""

import argparse
import gzip
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import time

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--baseline", type=Path, required=True)
parser.add_argument("--candidate", type=Path, default=Path.cwd())
parser.add_argument("--output", type=Path, required=True)
args = parser.parse_args()
variants = {"main": args.baseline.resolve(), "current": args.candidate.resolve()}
if variants["main"] == variants["current"]:
    raise ValueError("Use separate baseline and candidate checkouts")

# The baseline predates this harness. Use a dedicated worktree for it.
for filename in ["vitest.config.ts", "rendering.bench.ts"]:
    target = variants["main"] / "scripts/benchmarks" / filename
    source = variants["current"] / "scripts/benchmarks" / filename
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists() and target.read_bytes() != source.read_bytes():
        raise ValueError(f"Refusing to overwrite {target}")
    shutil.copyfile(source, target)

work = Path(tempfile.mkdtemp(prefix="portfolio-benchmark-"))
print(f"Logs and per-process results: {work}", flush=True)
report = {"render": {}, "build": {}}
args.output.parent.mkdir(parents=True, exist_ok=True)


def run_command(command, variant, log_name, env=None):
    """Run one sequential sample, preserving diagnostics and rejecting failed runs."""
    start = time.perf_counter()
    result = subprocess.run(
        command, cwd=variants[variant], env=env, capture_output=True, text=True
    )
    elapsed = time.perf_counter() - start
    (work / log_name).write_text(result.stdout + result.stderr)
    if result.returncode:
        raise RuntimeError(result.stdout[-4000:] + result.stderr[-4000:])
    return elapsed


def save_report():
    """Checkpoint completed samples so an interrupted benchmark is inspectable."""
    args.output.write_text(json.dumps(report, indent=2))


for run in range(3):
    order = ["main", "current"] if run % 2 == 0 else ["current", "main"]
    for variant in order:
        output = work / f"{variant}-render-{run}.json"
        run_command(
            ["node", "node_modules/vitest/vitest.mjs", "run", "--config",
             "scripts/benchmarks/vitest.config.ts"],
            variant,
            f"{variant}-render-{run}.log",
            dict(os.environ, BENCH_OUTPUT=str(output)),
        )
        report["render"].setdefault(variant, []).append(json.loads(output.read_text()))
        save_report()
        print(f"{variant} renderer run {run + 1}/3 complete", flush=True)

for run in range(3):
    order = ["main", "current"] if run % 2 == 0 else ["current", "main"]
    for variant in order:
        # SSG can preserve old hashed assets; remove only this checkout's build output.
        shutil.rmtree(variants[variant] / "dist", ignore_errors=True)
        elapsed = run_command(
            ["npm", "run", "build:ssg"], variant, f"{variant}-ssg-{run}.log"
        )
        dist = variants[variant] / "dist"
        pages = list(dist.rglob("*.html"))
        sizes = {
            "htmlBytes": sum(p.stat().st_size for p in pages),
            "htmlGzipBytes": sum(len(gzip.compress(p.read_bytes(), mtime=0)) for p in pages),
        }
        report["build"].setdefault(variant, []).append(
            {"seconds": elapsed, "pages": len(pages), **sizes}
        )
        save_report()
        print(f"{variant} SSG run {run + 1}/3: {elapsed:.2f}s", flush=True)
