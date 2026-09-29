# Why RAG Misses the Right Passage: Anthropic’s Contextual Retrieval

**“Can I return the shoes I bought online after 20 days?”** A store’s help centre contains the answer: “Returns are accepted within 30 days of delivery.” But that sentence came from the *online footwear* section. Once it is pulled away from its heading, it looks much like a 14-day rule for a different product. Search may bring back the wrong policy—or miss the right one.

This is a problem for **retrieval-augmented generation (RAG)**. Before an AI answers, RAG searches a collection of documents and gives the model a few relevant passages. To make a large collection searchable, it splits documents into smaller pieces called **chunks**. The split can leave a useful sentence behind while taking away the words that say what it applies to.

In September 2024, Anthropic introduced **Contextual Retrieval** to keep those clues attached when it builds a search index.

## Why a similar passage may be the wrong one

A common search method turns both the question and each chunk into lists of numbers called **embeddings**. Chunks with similar meanings tend to sit near each other on this numerical map. That is how a search for “return shoes” can find a passage that says “send back footwear,” even when the words differ.

But “returns are accepted within 30 days” and “returns are accepted within 14 days” also look similar. If their headings were left out during splitting, the search has little to tell it which rule covers online shoes. **Similarity finds related text; relevance depends on the question the passage can actually answer.**

## Attach the missing label before searching

Anthropic’s approach gives a model the whole document and one chunk, then asks for a short explanation of where that chunk belongs. For the store example, the searchable text could become:

> From the store’s online footwear return policy: Returns are accepted within 30 days of delivery.

The policy sentence stays intact. The new preface carries its missing label. This happens **once when documents are indexed**, so later searches can use the added words.

Anthropic indexes that combined text in two ways. **Embeddings** help match related meanings, such as “shoes” and “footwear.” **BM25** helps match exact words, such as a product name, category, or order code. The system combines the candidates from both searches and removes duplicates. If it uses **reranking**, another model then compares those candidates with the actual question and puts the most useful passages first. Reranking runs when someone asks a question, rather than when the document is first indexed.

## What Anthropic’s results actually show

Anthropic measured how often a relevant passage was **absent from the first 20 retrieved chunks**. In its evaluation across several kinds of documents, that failure rate was **5.7%** for its baseline. Adding contextual embeddings and contextual BM25 brought it to **2.9%**, a **49% relative reduction**. Adding reranking brought it to **1.9%**, a **67% relative reduction** from the same baseline.

Those figures measure retrieval in Anthropic’s tests. They do not mean every final answer is 67% better. Generating the prefaces takes work at indexing time; reranking adds a step and some latency to each search. The way documents are split and the number of passages the model receives still matter.

Back at the store, the useful result is the **30-day rule together with “online footwear.”** The answer can then say what the rule covers and cite the right policy. When a chunk only makes sense under its heading, keeping that heading’s meaning attached gives search a better chance to find it.

Source: [Anthropic Engineering — Introducing Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval) (September 19, 2024).
