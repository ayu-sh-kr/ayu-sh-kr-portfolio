# prek: an open-source pre-commit alternative built in Rust

A formatting check might take a moment to run, yet preparing its tools can mean downloading repositories and creating separate environments. **prek**, an open-source alternative to pre-commit written in Rust, takes aim at that setup work around a familiar developer habit.

It runs **Git hooks**: commands that check code before a commit. Those checks might format a file, catch a lint error, or detect a secret. They can also run on demand or in continuous integration (CI), keeping the same rules available on a contributor’s machine and in automated builds.

## Existing pre-commit hooks, a different runner

prek reads the familiar `.pre-commit-config.yaml` file and supports existing pre-commit hooks. Projects can try the runner while keeping their configured checks. The project lists **CPython, Apache Airflow, and FastAPI** among its users, giving this community tool a place in established open-source workflows.

The runner ships as a **single binary**, with no Python installation needed to start it. A Python hook still needs a Python environment; prek manages that separately. This distinction matters because switching runners does not change the requirements of the tools being run.

## Less repeated setup, support for monorepos

prek shares toolchains and hook environments instead of recreating them unnecessarily. It uses **uv** to manage Python environments and dependencies, and implements some common checks directly in Rust. Those changes target installation time, storage use, and the overhead around running checks.

Its **workspace support** also lets subprojects keep their own configurations. A monorepo containing several packages or services can run their hooks through one command while preserving each project’s rules.

Once prek is installed, an existing pre-commit project can try `prek run --all-files` to check its tracked files. The [official documentation](https://prek.j178.dev/) covers installation and migration. Actual time saved will depend on the hooks and whether their environments are already cached.

That is prek’s practical appeal: contributors can keep a familiar set of checks while spending less effort preparing the machinery behind them. For open-source maintainers, compatibility makes that improvement easier to evaluate one repository at a time.

Sources: [prek project](https://github.com/j178/prek), [differences from pre-commit](https://prek.j178.dev/diff/), and [running prek in CI](https://prek.j178.dev/dev/ci/).
