# Why RAG Misses the Right Passage: Anthropic’s Contextual Retrieval

**“Can I return the shoes I bought online after 20 days?”** Imagine asking a store’s AI assistant this question. In our example, the store allows footwear returns within 30 days of delivery, while electronics have a 14-day window. Both rules are in its help centre. The assistant needs to find the one that applies to the shoes before it can answer.

To do that, it searches the help centre and reads the passages it finds. This is **retrieval-augmented generation, or RAG**: an AI uses information retrieved from documents to help answer a question. Here, the quality of the answer starts with a simple requirement: the search must bring back the footwear policy.

## How the right rule loses its meaning

Searching an entire help centre usually starts with breaking its documents into smaller passages called **chunks**. That lets the system retrieve a few useful pieces instead of sending every policy to the answering model. But a chunk boundary can separate a rule from the heading that explains it.

Suppose the heading “Online footwear returns” lands in one chunk and “Returns are accepted within 30 days of delivery” lands in another. A person reading the page sees them together. Search may receive only the second piece. The time limit survives, but the clue connecting it to shoes has disappeared.

A common search method turns each chunk and the question into lists of numbers called **embeddings**. These represent meaning, allowing “return shoes” to match “send back footwear” without using identical words. This is **semantic search**, and it helps when customers phrase questions differently from the store’s documentation.

The difficulty is that both the 30-day and 14-day passages talk about returns. Without their product labels, either can look like a useful match. The search has found the subject, but it still needs enough context to distinguish the policy that answers this particular question.

## Keep the product label attached to the rule

That missing connection is what **Anthropic’s Contextual Retrieval**, introduced in September 2024, aims to restore. Before preparing chunks for search, Anthropic gives a model the full document and an individual chunk. The model writes a short preface explaining where that passage belongs.

For our footwear passage, the combined text could read:

> From the store’s online footwear return policy: Returns are accepted within 30 days of delivery.

The original sentence remains intact, with its missing context placed in front. The electronics passage would receive its own explanation. Each piece now carries enough information to distinguish it from another rule about the same subject. These additions are prepared when the documents are indexed, ready for later questions.

When the customer asks about shoes, meaning-based search can now connect “shoes” with “footwear” in the expanded passage. Anthropic also makes that text searchable with **BM25**, which ranks passages using matching words. This second search is useful when a question contains wording directly from the policy, such as a product name or category.

The system combines the results from both searches and removes duplicates. There may still be several plausible passages, so an optional **reranking** step compares them with the customer’s question and reorders them by relevance. The answering model then receives the selected material. Each step works toward the same result: finding the rule for this purchase.

## Does the right passage reach the answer?

Anthropic tested that retrieval step across several kinds of documents. It measured how often relevant material was missing from the **first 20 retrieved chunks**. Its baseline failure rate was **5.7%**. Adding context to both embeddings and BM25 reduced it to **2.9%**, a **49% relative reduction**. With reranking, it fell to **1.9%**, a **67% relative reduction** from the same baseline.

These results show fewer retrieval misses in those tests; they do not establish a 67% improvement in every final answer. The extra context takes work to prepare, and reranking adds time to a search. Document splitting and the accuracy of the generated prefaces still need checking.

For the customer with the shoes, the useful evidence is the **30-day limit connected to the footwear policy**. Once that connection survives the search, the assistant can explain the applicable rule and cite its source. Contextual Retrieval helps preserve the information that makes a sentence useful when it leaves its original page.

Source: [Anthropic Engineering — Introducing Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval) (September 19, 2024).
