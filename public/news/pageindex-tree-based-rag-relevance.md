# PageIndex replaces vector search with tree-based document retrieval

A financial report may mention the same metric in several places, but only one section answers a particular question. Vector search can return passages that sound similar to the query; **PageIndex tries to find the passage that is relevant in the document’s structure**.

The open-source project from VectifyAI replaces the usual embedding index with a **tree-shaped document index**. Think of using a table of contents: start with the likely chapter, follow a subsection, then open the pages that contain the detail.

## Build an index, then navigate it

PageIndex has two stages. First, it turns a document’s layout into a hierarchy of sections and page references. An indexing model can add or refine short descriptions for those nodes. The tree points back to the original content, so retrieval can bring back the source pages rather than relying on a summary alone.

When someone asks a question, a chat model reads the tree, chooses promising branches, and fetches the corresponding source sections. If the evidence is incomplete, it can continue through another branch. The SDK supports separate models for indexing and chat; its README says a basic model is usually enough for the indexing work, while retrieval benefits from a stronger model.

## Similarity is a useful signal, not the whole answer

In conventional vector-based retrieval, text is split into chunks, converted into embeddings, and ranked by similarity to the query. That works well when similar wording points to the right passage. But a question may refer to a table, an appendix, or a section using different language. PageIndex’s tree gives the model structural clues and a path to follow.

That reasoning has a trade-off: the model must inspect the tree and selected source sections, which can add latency and model cost. PageIndex is aimed especially at long, structured documents such as financial reports, legal filings, manuals, and research papers. It does not establish that tree retrieval is better for every dataset or query; evaluation should match the documents and questions an application actually has.

For a question about a report, the useful result is not the paragraph that sounds closest. It is the section that contains the answer, with a route back to the evidence. PageIndex makes that route part of retrieval.

Sources: [PageIndex on GitHub](https://github.com/VectifyAI/PageIndex) and [VectifyAI’s PageIndex introduction](https://pageindex.ai/blog/pageindex-intro).
