# prek brings a faster pre-commit workflow to open source projects

A commit can pause while a formatter, linter, or file check runs. Those checks help keep a shared codebase clean, but setting up their runtimes across contributors and CI can take longer than the checks themselves. The open-source project **prek** is trying to make that familiar workflow lighter.

prek is a **Git hook manager written in Rust**. It runs checks before commits, on demand, and in CI, and it understands the existing `.pre-commit-config.yaml` format and hooks. That gives projects already using pre-commit a way to try it without rewriting their hook definitions.

## What changes for a contributor?

The runner ships as a **single binary**, so it does not need Python merely to start. Hooks can still use Python or other languages when their tools require them. prek manages those environments, shares toolchains and caches across hooks, and can prepare independent work in parallel. It also includes Rust implementations of some common checks.

For a monorepo, **workspace support** lets subprojects keep separate hook configs while one command runs the relevant checks. That matters when a repository contains services or packages with different tooling. The project lists CPython, Apache Airflow, and FastAPI among its users, though actual speed gains will depend on a repository's hooks and cache state.

The useful part of this open-source release is its low-friction trial: keep the checks the team already trusts, run them with prek, and compare the experience in the repository that matters. A faster runner does not fix a slow formatter, but it can remove setup and repeated environment work around it.

Source: [prek project and documentation](https://github.com/j178/prek).
