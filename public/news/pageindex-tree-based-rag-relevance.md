# PageIndex vs Vector RAG: How Tree Search Finds Relevant Pages

**“How do I undo a bad deployment?”** An AI searches the team handbook and finds a paragraph explaining that rollbacks restore an earlier version. It has found the right topic. The developer still needs to know what to do.

The answer might be a few pages away: where to select the previous release, which checks to run, and when a database change makes a rollback unsafe. Both passages discuss rollback. Only one provides the information needed for this question.

That gap between **similar content and relevant content** is the idea behind VectifyAI’s **PageIndex**. It uses a document’s structure to help an AI find the pages that can answer the question.

## How vectorization makes semantic search possible

To understand the difference, start with how a typical document search for AI works. A document is divided into passages. An embedding model turns each passage into a list of numbers called a **vector**, or **embedding**. This step is often called **vectorization**.

Think of those numbers as placing each passage on a map of meaning. Passages about related ideas tend to sit near one another. A paragraph about restoring an earlier app version can sit close to one about rolling back a release, even though they use different words.

The question is put on the same map using the embedding model. **Vector search** then finds passages nearby. A vector database stores these representations and makes the comparison efficient across many passages.

This is a common way to perform **semantic search**: searching by meaning. It is why “undo a deployment” can lead to “rollback instructions” without an exact word match. That ability is useful; the remaining question is whether the selected passage contains enough information to answer.

## Similar content shares a topic. Relevant content meets the need.

Consider two imaginary passages from the handbook. The first says, **“Rollback restores an earlier release when a deployment causes problems.”** The second says, **“Open release history, select the last working version, and check database compatibility before restoring it.”**

For “What is a rollback?”, the first passage is relevant. For “How do I undo this deployment?”, the second is more useful. **Relevance depends on what the person needs to learn or do**, even when the subject stays the same.

A similarity score can help find that second passage. It can also rank a definition, a release announcement, or an account of an old incident highly because they discuss closely related ideas. A high score alone does not establish that the passage contains the procedure, conditions, or evidence the question requires.

This matters in **retrieval-augmented generation**, or **RAG**: the system retrieves source material and gives it to an AI to write an answer. If the retrieved material only explains what rollback means, the answer may stop there too. The search has to supply the missing instructions.

## How PageIndex searches for relevant pages

PageIndex gives the model another way to decide where to look. It builds a **tree of the document’s sections**, like an expanded table of contents. Instead of relying on distance between vectors, the model reasons about which section could contain the answer.

In our handbook, “Delivery” might contain “Deployments,” “Rollback,” and “Troubleshooting.” A question about undoing a release points toward “Rollback.” A question about why releases fail might lead somewhere else in the same tree.

The diagram shows the two retrieval approaches. Either can find useful evidence; PageIndex makes the document’s organization part of the search.

![Vector RAG ranks passages by meaning; PageIndex follows the handbook’s Delivery and Rollback sections. Both read source evidence before answering.](/news/assets/pageindex-tree-based-rag-relevance/retrieval-map.svg)

### First, prepare the index

During **tree-based indexing**, sections receive titles, page references, and short summaries. A summary can explain that “Recovery” contains rollback steps, helping the model choose it even when the heading is vague.

An indexing model can prepare those summaries. In PageIndex’s newer Flash approach, a text-based PDF’s layout supplies the structure, leaving the model to summarize and refine it. This map can be reused for later questions.

### Then, read and follow the evidence

At question time, a model examines the index, chooses a section, and reads its source pages. This movement through sections and subsections is **hierarchical search**. If the rollback procedure refers to a separate compatibility check, the model can continue looking for that information.

The summary only tells it where to look. **The source pages must provide the answer.** This is how PageIndex aims to improve relevance: choose a likely location, inspect the evidence, and keep searching when something needed is missing. A smaller model can help build the index, while a stronger model handles these reading decisions.

## What the tree can—and cannot—solve

PageIndex is especially suited to long manuals, guides, and policies where sections and cross-references carry useful context. It still depends on the model choosing well; extra reading decisions can add time and cost. Vector RAG can also improve relevance through filters, keyword search, and reranking the retrieved passages.

The project comes from **VectifyAI**, with its 2025 introduction credited to **Mingtian Zhang, Yu Tang, and the PageIndex team**. PageIndex Flash followed in August 2026. It is an evolving approach to retrieval, with results to judge against real questions.

For the developer facing a failed deployment, success is an answer backed by the correct recovery procedure. A paragraph about rollback gets the subject right. Finding the instructions and their conditions gets the developer closer to solving the problem. **That is the difference PageIndex is trying to close.**

Sources: [PageIndex project](https://github.com/VectifyAI/PageIndex), [the 2025 introduction](https://pageindex.ai/blog/pageindex-intro), [the August 2025 public discussion](https://news.ycombinator.com/item?id=45036944), and [PageIndex Flash](https://pageindex.ai/blog/pageindex-flash).
