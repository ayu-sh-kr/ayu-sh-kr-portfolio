# PageIndex replaces vector search with tree-based document retrieval

Imagine asking an AI assistant why a company’s profit fell even though its sales grew. It opens the annual report and returns the table showing both numbers. The table is accurate, but the answer may be several pages away, where the company explains a large one-time expense.

That gap between **finding related words** and **finding the answer** is the problem VectifyAI’s open-source **PageIndex** tries to solve. It gives an AI model a map of a long document, then lets the model decide which sections to read, much as someone would use a table of contents before turning to a page.

## Why a similar passage can miss the point

A common way to let an AI answer questions from documents is **retrieval-augmented generation**, or **RAG**. Before the model writes an answer, a search step finds passages to give it. Without that step, the model might have no access to the report at all.

Many RAG systems cut a document into smaller pieces and turn each piece into an **embedding**: a list of numbers representing its meaning. The question gets its own embedding, and a vector search returns pieces that are close to it. This can be an effective way to find passages about the same subject.

But closeness is not the same as answering the question. In our imagined report, the profit table and several repeated mentions of “profit” may rank highly. The explanation might be filed under “restructuring charges” in a note with little wording in common with “Why did profit fall?” Splitting the report into fixed-size pieces can also separate a figure from the note that explains it. Better chunking, keyword search, and reranking can help conventional RAG; PageIndex explores another route.

## PageIndex builds a map of the document

The first stage is **indexing**. PageIndex creates a tree of sections and subsections, with titles, page locations, and descriptions linked to the original text. Picture a table of contents that an AI can follow: “Management discussion” leads to “Results of operations,” while “Financial statements” leads to detailed notes. The tree is a guide, not a replacement for the pages themselves.

In the current SDK’s local PDF workflow, the document layout supplies the structure. An indexing model can summarize and refine the section descriptions. The project recommends that a relatively basic model handle this part, because it does not need to answer every future question while the map is being made.

The second stage begins when a question arrives. A **chat model** considers the question and the tree, chooses a promising section, and reads the source material behind it. If that section only reports that profit fell, the model can look at related notes to find the cause. The SDK lets developers choose separate models for indexing and chat; the chat model does the harder work of deciding where to look and forming an answer from what it finds.

That is the human comparison behind PageIndex. Someone reading the report would not count how often “profit” appears on each page. They might start with the results section, see a reference to an unusual charge, and follow it to the note. PageIndex gives the model a similar path through the document, with references back to the source pages.

## Where this approach fits

This is most compelling for **long, structured material**: financial reports, legal documents, manuals, and research papers where headings, sections, tables, and cross-references carry meaning. PageIndex also offers a local SDK workflow for text-based PDFs and a managed cloud option for scanned or image-rich documents. Those capabilities depend on the chosen mode; “vectorless” does not mean every document can be handled locally in the same way.

There is a cost to letting a model make several reading decisions. It may take more model calls and time than a simple similarity lookup, and a poor index or a mistaken branch choice can still miss the answer. The project reports strong results on financial-document questions, but that is not a promise for every set of files. The useful comparison is whether it finds the right evidence, with acceptable speed and cost, on the questions people actually ask.

Return to the company report. The assistant already had the correct profit table; it needed the paragraph explaining **why** those numbers changed. PageIndex’s bet is that a map of the report gives the model a better way to reach that paragraph—and a clear route back to the page a reader can check.

Sources: [PageIndex repository and SDK guidance](https://github.com/VectifyAI/PageIndex) and [VectifyAI’s explanation of its tree search](https://pageindex.ai/blog/pageindex-intro).
