#!/usr/bin/env python3
"""Measure first HTTP responses from a disposable, already-running FastVM sandbox.

Run on the Linux/KVM host. Start a sandbox with networking and --no-auto-sleep,
no attached data volumes and an HTTP endpoint returning 2xx. Point --url at that
guest's IP and port. Keep other traffic off the sandbox; measure page-cache
conditions in separate runs. The script does not flush the host's cache.
"""
import argparse
import json
import math
import statistics
import subprocess
import time
from urllib.parse import urlsplit


def command(*args, timeout=60):
    return subprocess.run(
        args, check=True, capture_output=True, text=True, timeout=timeout
    ).stdout


def status(name):
    return json.loads(command("fastvmctl", "get", name))


def wait_for_wake(name, old_count):
    for _ in range(40):
        current = status(name)
        if (
            current["state"] in {"Running", "Idle"}
            and current["wake_count"] == old_count + 1
        ):
            return
        time.sleep(0.05)
    raise RuntimeError("The first connection did not produce one confirmed wake.")


def request(url):
    # Each call starts a fresh client connection. No proxy, retry or redirect.
    fields = command(
        "curl", "--noproxy", "*", "--silent", "--show-error",
        "--max-time", "20", "--output", "/dev/null",
        "--write-out", "%{http_code} %{time_connect} %{time_starttransfer} %{time_total}",
        "--", url, timeout=25,
    ).split()
    if not 200 <= int(fields[0]) < 300:
        raise RuntimeError(f"Expected a 2xx response, got HTTP {fields[0]}.")
    return {
        key: round(float(value) * 1000, 3)
        for key, value in zip(("connect_ms", "ttfb_ms", "total_ms"), fields[1:])
    }


def summary(rows):
    results = {}
    for key in ("connect_ms", "ttfb_ms", "total_ms"):
        ordered = sorted(row[key] for row in rows)
        results[key] = {
            "p50": statistics.median(ordered),
            "p95": ordered[math.ceil(0.95 * len(ordered)) - 1],
        }
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sandbox", help="Name of a disposable sandbox")
    parser.add_argument("--url", required=True, help="Direct HTTP URL using the guest IP")
    parser.add_argument("--samples", type=int, default=30, help="Trials per state")
    parser.add_argument(
        "--wake-spacing", type=float, default=12,
        help="Seconds after each wake; stay below the default six wakes per minute",
    )
    args = parser.parse_args()
    if args.samples < 1 or not math.isfinite(args.wake_spacing) or args.wake_spacing < 0:
        parser.error("samples must be positive and wake spacing must be nonnegative")
    url = urlsplit(args.url)
    if url.scheme != "http" or not url.hostname or url.username or url.password:
        parser.error("use a direct HTTP URL without credentials")

    result = {}
    for mode in ("Running", "Paused", "Dormant"):
        rows = []
        for _ in range(args.samples):
            before = status(args.sandbox)
            if before["state"] not in {"Running", "Idle"}:
                raise RuntimeError("Start with a running sandbox and disable auto-sleep.")
            if mode != "Running":
                flags = ("--deep",) if mode == "Dormant" else ()
                command("fastvmctl", "pause", args.sandbox, *flags, timeout=180)
                paused = status(args.sandbox)
                if paused["state"] != mode or paused["wake_count"] != before["wake_count"]:
                    raise RuntimeError(f"Sandbox did not stay in {mode} until the probe.")
            rows.append(request(args.url))
            if mode != "Running":
                wait_for_wake(args.sandbox, before["wake_count"])
                time.sleep(args.wake_spacing)
        result[mode] = {"samples": rows, "summary": summary(rows)}
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
