# How Google used Gemini 4 and Lean to cut quantum circuit costs

A quantum computer has a budget for how many qubits it can hold and how much work it can do with them. If a program exceeds that budget, one option is to wait for better hardware. Another is to write a circuit that asks less of the same machine.

In a [November 23 research write-up](https://deepmind.google/blog/finding-faster-quantum-algorithms-with-agents-and-formal-verification/), Google DeepMind and Google Quantum AI described how teams of [Gemini 4 Carbon](/news/gemini-4-argon-carbon-hydrogen-comparison/) agents searched for cheaper quantum circuits. **Lean**, a tool that checks mathematical proofs, verified that the resulting programs met their specifications and resource bounds. One circuit for an inverse-sine calculation came in at roughly **1/290 of the published baseline’s estimated cost**.

## The agents searched. Lean checked their work.

A circuit is a sequence of operations on qubits. To improve one, the researchers first wrote down what it had to compute, how close the answer had to be, and how they would count the resources it used. The agents proposed circuits and supplied proofs that their designs met those requirements.

The distinction is familiar from software: tests exercise selected inputs, while a formal proof can cover every case the specification describes. Google kept the specification fixed and used a separate verifier to reject submissions that altered it or introduced unapproved assumptions. The work was done on classical computers; the circuits did not have to run on quantum hardware for their proofs to be checked. The [published Lean library and examples](https://github.com/google-deepmind/formal-quantum-computation) let others inspect the specifications and solutions.

## What the 290-fold reduction measures

Quantum programs use **inverse sine**, or `arcsin`, to turn numbers into rotation angles when loading data into a quantum state. For one version with 25-bit inputs, the researchers estimated cost by multiplying **logical qubits** (error-corrected units of quantum memory) by **T gates** (a kind of operation that is particularly expensive to carry out on many error-corrected systems).

| 25-bit inverse sine | Logical qubits | T gates | Qubits × T gates |
| --- | ---: | ---: | ---: |
| Published baseline, lower-bound estimate | 245 | 440,576 | About 108 million |
| Agent design using a restricted set of gates | 100 | 4,152 | 415,200 |
| Final circuit checked in Lean | 100 | 3,698 | 369,800 |

The [paper’s Table S2](https://arxiv.org/html/2611.09822v3) shows where the savings came from. Most came from searching circuits within a restricted set that a classical computer could check quickly. Lean let the agents move beyond that restriction, improving the final design by another **11%**. The final circuit also had a tighter reported error tolerance than the baseline.

## A smaller bill for future hardware

The paper reports a smaller but still substantial reduction for a circuit used to model how fusion fuel absorbs energy: **11.8-fold** on the same resource metric, with the logical qubit count falling from 5,650 to 4,338. The 290-fold figure belongs to the inverse-sine routine alone. Actual runtime depends on the machine, its error correction, and the rest of the program.

The result changes the design budget before a machine is ready to run the work. A team planning a larger circuit can start with a smaller, checked implementation of a routine it needs, then see which part still exceeds the hardware budget.
