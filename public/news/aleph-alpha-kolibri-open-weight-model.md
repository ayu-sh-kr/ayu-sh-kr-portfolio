# Aleph Alpha releases Kolibri 1: 78B open weights and 1M context

**Aleph Alpha has released Kolibri 1**, a German-English language model with downloadable weights under Apache 2.0. Available since October 3, it combines **78 billion total parameters with 3.46 billion active per token** and supports context lengths of up to one million tokens.

The German company is targeting public administration and industry, where organizations may want to run AI on infrastructure they control. Alongside the weights, it has published a [model card](https://huggingface.co/Aleph-Alpha/Kolibri-1) and [technical report](https://aleph-alpha.com/downloads/tech-report.pdf) describing the architecture, training and evaluations.

## How Kolibri’s MoE design reduces computation

Kolibri uses **mixture-of-experts (MoE)**: each token passes through selected parts of the model, reducing the computation needed compared with activating all 78 billion parameters. The 3.46B figure describes that active portion.

Memory is a separate requirement. The full model still needs to be available, and Aleph Alpha lists approximately **78 GB for FP8 weights**, before memory for the running workload. Its supported minimum configurations include two A100 80 GB GPUs or one H200. The smaller active count therefore helps explain inference efficiency, while the total size determines much of the memory demand.

## Up to 1M tokens, with 262K recommended

The context window determines how much text a model can process in one request. Kolibri’s native window is **262,144 tokens**; Aleph Alpha says it validated an extension to 1,048,576 tokens.

For efficient serving and complex tasks, the company recommends staying at or below 262,144. Teams considering long documents or conversations should treat one million as the tested upper range, with the recommendation guiding everyday deployment. The [model card’s context section](https://huggingface.co/Aleph-Alpha/Kolibri-1#intended-use) explains the distinction.

Kolibri also supports a reasoning mode and **tool calling**, allowing applications to connect it to services such as search. Aleph Alpha identifies coding, document processing and retrieval-augmented generation among its intended uses.

## What open weights make possible

The Apache 2.0 release lets teams download, host and adapt Kolibri under the licence terms. That gives German-English applications another option for running inference within their own infrastructure.

The release makes that option available to evaluate. Whether it fits a particular service will depend on answer quality, GPU capacity and workload measurements. For organizations seeking deployment control, those are now decisions they can test directly with the released weights.

Sources: [Aleph Alpha’s October 3 announcement](https://aleph-alpha.com/en/blog/kolibri-has-landed-a-sovereign-open-weight-model/) · [Kolibri model card](https://huggingface.co/Aleph-Alpha/Kolibri-1).
