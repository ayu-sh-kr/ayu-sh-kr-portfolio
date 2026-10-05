# Aleph Alpha releases Kolibri, a 78B open-weight model for German and English

A model can have tens of billions of parameters without using all of them for every word it generates. Aleph Alpha’s new **Kolibri 1** is built around that idea: the German AI company released an open-weight model with 78 billion total parameters, but 3.46 billion active for each token.

The model is aimed at German and English work, including reasoning, coding and tool use. Its weights are available on Hugging Face under the Apache 2.0 licence, so teams can download and run them on infrastructure they control.

## What “3.46B active” means

Kolibri uses a **mixture-of-experts (MoE)** architecture. You can think of it as a team of specialist parts: the model routes each token through selected experts instead of activating every parameter. That reduces the computation needed for each token compared with a dense model of the same total size.

But “active” does not mean the rest can be left out of memory. The complete model still has to be available to the serving system. Aleph Alpha lists about **78 GB for FP8 weights** and recommends multiple server-class GPUs, with a minimum configuration starting at two A100 80 GB cards or equivalent. The architecture may reduce per-token computation; it does not make Kolibri a lightweight laptop download.

## A long context with a practical limit

Aleph Alpha says Kolibri can process up to **1,048,576 tokens**. The model card gives useful context for that headline: the model’s native context is 262,144 tokens, and the team says it validated extension to one million. For efficient serving and complex tasks, it recommends staying at or below 262,144.

That distinction matters when a team considers feeding a large document collection or long conversation into one request. A maximum context describes what has been tested, while the recommendation describes the range the developer considers more practical.

Kolibri also supports an explicit reasoning mode and tool calling, which lets an application ask it to use tools such as search or code execution. Those capabilities make it suitable for experiments with assistants and retrieval systems, though the model’s output still needs evaluation for the intended task.

## What the release changes

Open weights and Apache 2.0 terms give organizations room to inspect, host and adapt Kolibri within the licence. Aleph Alpha presents the model as a European-built option for organizations that want more control over deployment and data handling. Those are useful properties to assess, but they do not by themselves establish accuracy, compliance or lower operating costs for a particular deployment.

For teams working in German and English, Kolibri is now something they can test on their own hardware and workloads. The key question is not only how many parameters it activates, but whether the model’s quality, GPU requirements and recommended context fit the job.

Sources: [Aleph Alpha’s announcement](https://aleph-alpha.com/en/blog/kolibri-has-landed-a-sovereign-open-weight-model/) · [Kolibri model card](https://huggingface.co/Aleph-Alpha/Kolibri-1) · [Technical report](https://aleph-alpha.com/downloads/tech-report.pdf).
