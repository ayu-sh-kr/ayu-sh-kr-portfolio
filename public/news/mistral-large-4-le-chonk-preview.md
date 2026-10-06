# Mistral Large 4 ‘Le Chonk’ opens for testing before weight release

**Mistral Large 4 is available to try through a public preview**, starting October 6. Nicknamed “Le Chonk,” the model can be accessed through Mistral Studio’s API. Mistral plans to release downloadable model weights later this month, so organizations can also run it themselves.

The French company is aiming the model at coding, cybersecurity and work with documents and images. It also emphasizes **sovereign AI**, meaning organizations have more say over where their AI runs and who can access it.

## How mixture-of-experts divides the work

Large 4 has **1.05 trillion parameters**, the values learned during training. Only 49 billion are active for each token, a small piece of text the model processes. This is possible because it uses **mixture-of-experts (MoE)**: different parts of the model do different portions of the work.

A part called the router chooses which experts process each token. Their results are then combined, with some given more weight than others. The next token may go to a different set of experts.

The illustration shows that choice: the black modules do the work, while the outlined ones stay idle for this token.

![Isometric MoE illustration: a router sends one token to two selected experts, then combines their results; two other experts stay idle.](/news/assets/mistral-large-4-le-chonk-preview/mixture-of-experts.svg)

*This uses two of four experts to explain the idea. It does not show Large 4’s exact number of experts or selection rules.*

Using fewer experts reduces the calculation needed at each step. But the whole model still needs to be stored and available. The smaller active count does not mean the model is small enough to run on an ordinary laptop.

## What Mistral says the model can do

Mistral reports improvements in coding, cybersecurity and other professional tasks. Large 4 can also work with images and documents. One capability is **visual grounding**: identifying the object or area in an image that an answer refers to.

The documentation lists tool calling, which lets an application connect the model to external services, and structured output, which returns answers in a format software can use.

Mistral’s test results describe particular tasks, rather than a lead in every use case. Some coding tests were evaluated privately before the testing tools became public. The preview lets teams compare those claims with the work they actually need done.

## What downloadable weights would change

Mistral says it trained Large 4 on 3,800 NVIDIA Grace Blackwell GPUs in its European data centers. The preview is served from the same infrastructure.

Releasing the weights would give organizations another way to use the model: host it on infrastructure they control, with their own rules for data access. That may matter to teams handling private code or company documents.

They would also take on the work of hosting, securing and maintaining it. Open weights give access to the trained model; they do not necessarily include the training data or every detail of how it was built.

## What comes next

Mistral plans to share more details about the model and its tests when the weights are released. It also intends to build versions for more specific tasks.

For now, teams can test the API preview. The weight release will make it possible to assess whether running Large 4 themselves is practical, alongside checking the quality of its answers.

Sources: [Mistral’s announcement](https://mistral.ai/news/mistral-large-4/), [Large 4 documentation](https://docs.mistral.ai/models/mistral-large-4-0), and [Mistral’s deployment approach](https://mistral.ai/).
