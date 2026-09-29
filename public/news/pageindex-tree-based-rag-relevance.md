# PageIndex vs Vector RAG: How Tree Search Finds Relevant Pages

A deployment goes wrong. The question is simple: **“How do we get the previous version back?”** A search through the team handbook brings up release notes, deployment instructions, and a page about version numbers. Useful territory, but the rollback procedure is still somewhere else.

A teammate who knows the handbook might open “Delivery,” turn to “Rollback,” and follow the instructions. **PageIndex gives an AI a similar way to navigate a document**: inspect its structure, choose a section, then read the pages behind it.

That is the idea worth understanding. Finding text about a subject and finding the information needed to complete a task are related problems, but they do not always lead to the same page.

## What changes in PageIndex vs vector RAG?

**Retrieval-augmented generation**, or **RAG**, means giving an AI relevant source material before it writes an answer. The retrieval step finds that material. PageIndex changes how that search happens; it is still a form of RAG.

A common approach splits documents into passages and converts each passage into numbers representing its meaning. These are **embeddings**, and the conversion is often called **vectorization**. A vector database can store them so the system can compare a question with many passages quickly.

This is **semantic search**: matching meaning, beyond exact words. It can connect “get the previous version back” with “rollback,” even though the wording differs. Vector search is more capable than counting keywords.

The difficulty is deciding which related passage actually answers the question. A release announcement and a recovery procedure can both discuss deployments. The announcement might be a close match while leaving out the steps the developer needs.

PageIndex approaches that decision through the document’s structure. A model looks at a tree of sections and asks where the answer is likely to live. Our handbook example illustrates the difference:

![Vector RAG ranks passages by meaning; PageIndex follows the handbook’s Delivery and Rollback sections. Both read source evidence before answering.](/news/assets/pageindex-tree-based-rag-relevance/retrieval-map.svg)

## First, build the map

**Tree-based indexing** turns a document into sections, subsections, and links to their pages. Imagine an expanded table of contents: “Delivery” contains “Deployments,” “Rollback,” and “Troubleshooting.” Each section can have a short summary explaining what it covers.

Those summaries help when headings are vague. A section called “Recovery” might describe undoing a release, restoring a database, or resetting a password. Its description gives the model a better clue before it opens the pages.

An indexing model can create or refine these summaries. PageIndex’s newer Flash indexer gets the structure from a text-based PDF’s layout, so a smaller model can handle the summarizing work. The map is prepared ahead of questions and can be reused.

## Then, follow the map and read

When a question arrives, a model examines the index and chooses a promising section. Moving from a broad topic to a specific subsection is **hierarchical search**.

For the rollback question, the path might be “Delivery,” then “Rollback,” then the actual procedure. If the procedure says to check compatibility first, the model can look for that section too. Retrieval becomes a sequence of reading decisions, with another search when the evidence is incomplete.

The model must still read the source. A summary saying “this section covers rollback” cannot supply the correct command, conditions, or exceptions. **The index helps locate the evidence; the original pages support the answer.**

Indexing and answering therefore have different jobs. A relatively small model can help prepare the map, while a stronger model can handle navigation and answering. They can be configured separately, without making the conceptual workflow more complicated.

## When does a document tree help?

PageIndex is most interesting when information has useful structure: technical manuals, detailed guides, policies, and other long documents with sections and cross-references. It gives an AI a way to use that organization during document retrieval.

It also asks the model to make more decisions. That can add time and cost, and choosing the wrong branch can still miss the answer. Vector RAG can also improve its results with keyword search, filters, and a second model that reranks passages. The comparison should be about finding usable evidence on real questions.

VectifyAI’s PageIndex was public in 2025, with its introduction credited to **Mingtian Zhang, Yu Tang, and the PageIndex team**. The August 2026 release of **PageIndex Flash** added a newer way to build these indexes locally. The underlying idea has been developing for some time.

Back at the failed deployment, the useful answer is a recovery procedure with its conditions and a page to check. PageIndex’s appeal is easy to see there: a handbook already has an order to it. Letting the AI follow that order may help it reach the instructions the developer came for.

Sources: [PageIndex project](https://github.com/VectifyAI/PageIndex), [the 2025 introduction](https://pageindex.ai/blog/pageindex-intro), [the August 2025 public discussion](https://news.ycombinator.com/item?id=45036944), and [PageIndex Flash](https://pageindex.ai/blog/pageindex-flash).
