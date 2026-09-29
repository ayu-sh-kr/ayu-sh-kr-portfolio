# Anthropic’s Contextual Retrieval: why RAG needs more than a text match

An answer can be sitting in the right document and still be missed by search. Split a support guide into small passages, and one may say “restart the service after changing it” without naming the setting or service. Retrieved on its own, that sentence has lost the clues that make it useful.

**Anthropic’s Contextual Retrieval**, introduced in September 2024, addresses that gap in retrieval-augmented generation (RAG): systems that search documents and pass selected passages to an AI model. The technique adds a short explanation of where each passage belongs **before** building the search indexes. A recent post recirculating its 49% and 67% figures is discussing this earlier research, not a new release.

## Give each passage its missing context

Ordinary RAG splits documents into chunks, then indexes them for search. A chunk from a support guide might mention “this setting” but omit the setting’s name because it appeared two paragraphs earlier. Search can miss the chunk, even though the original document contains the answer.

Anthropic used Claude to read the whole document and write a brief, chunk-specific preface. For our illustrative support guide, the preface could identify the product and setting before the original instruction. The combined text then goes into two indexes: **embeddings** for meaning-based search and **BM25** for keyword matching. BM25 helps when a query contains an exact error code or technical name that a meaning-based search might overlook.

When a question arrives, the system retrieves candidates from both indexes, combines and removes duplicate results, and can **rerank** them against the question before passing the selected passages to the answering model. The extra context is prepared when documents are indexed; reranking happens when someone searches.

## What the 49% and 67% figures measured

In Anthropic’s tests across several document types, the baseline **top-20 retrieval failure rate** was 5.7%: the relevant material was missing from the first 20 chunks. Contextual embeddings plus contextual BM25 lowered that rate to **2.9%**, a **49% relative reduction**. Adding reranking lowered it to **1.9%**, a **67% relative reduction** from the same baseline.

Those numbers describe finding relevant passages in Anthropic’s evaluation, not a 67% improvement in the quality of every final answer. Generating a preface for each chunk adds indexing work and cost, while reranking adds a search-time step. Chunk boundaries and the number of passages sent to the model still matter.

The support-guide sentence is a useful test: if search misses it because “this setting” has no meaning outside its document, a better answer model cannot recover it. Contextual Retrieval tries to keep that missing label attached so the right passage can be found in the first place.

Source: [Anthropic Engineering — Introducing Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval) (September 19, 2024).
