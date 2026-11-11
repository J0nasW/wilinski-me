---
title: 'Finding "neural radiance fields" before they are everywhere'
description: 'Frequency thresholds miss rare concepts and dictionaries miss new ones. How we combine both with transformer attention maps, UCPhrase-style, to mine AI concepts from around 500,000 PapersWithCode papers.'
pubDate: '2025-02-18'
heroImage: '/assets/img/title_img/bg10-unsplash.jpg'
heroImageAttribution: 'unsplash'
heroImageCredit: 'Aaron Hohenstein'
heroImageLink: 'https://unsplash.com/photos/36ZYJM7Tn14'
tags: ['nlp', 'concept mining', 'transformers', 'science of science']
draft: false
---

If you want to measure how new ideas spread, you have to recognise them while they are still new. That sounds obvious, but it is exactly where most concept extraction breaks. Frequency-based methods only see a term once it is common. Dictionaries only know terms somebody already wrote down. Take "neural radiance fields". In March 2020 the phrase appeared in exactly one paper, the one that introduced NeRF. Three years later it was in more than a hundred papers a year and had its own corner of computer vision. In its first year it is neither common nor in any textbook index, and yet it is precisely the kind of phrase I care about.

This is the starting point of *Attention-Based Concept Mining and Community Detection in AI Research*, which I wrote with Juergen Thiesen and Oliver Specht and which became a [poster at AOM 2025](/en/publications/2025-aom-ai-communities/) in the Research Methods division. The paper has two halves: mining concepts from text, and placing those concepts in co-authorship networks. This post is about the first half. The network side gets its [own post](/en/blog/2025-05_coauthorship_networks/).

## Where this comes from

For the [AI Innovation Compass at DRUID](/en/blog/2024-07_post_druid/) I built a list of 10,797 AI concept phrases. The seed came from textbook indices and the Computer Science Ontology, it was grown with embeddings over PapersWithCode abstracts, and a logistic regression against a large negative sample from OpenAlex threw out what was too generic. The details are in the [AI Concept List post](/en/blog/2024-09_ai_concept_list/).

That list works, but it is a list. Every phrase on it had to show up often enough, in enough places, to survive. Which means it is structurally late. By the time a method is frequent enough to pass the filters, it has already spread, and the interesting part (who used it first, and where) is over. So the question for this paper was: can we train something that recognises a concept from *how it is used in a sentence*, rather than from how often it appears?

## What counts as a concept

The paper borrows its definition from information science: a concept is an abstract unit of knowledge defined by shared properties or contextual significance (Stock, 2010). "Transformer-based reinforcement learning" is one. You can describe a concept by its *intension*, the tasks, methods or datasets associated with the term, and by its *extension*, the papers and authors that actually use it.

That split turns out to be practical. Intension is what the text model has to learn. Extension is what the network analysis in the second post works with.

## The data: a knowledge graph around PapersWithCode

The base is [PapersWithCode](https://paperswithcode.com) (PwC), a repository of AI papers tagged with tasks, methods, datasets, conferences and code repositories. Those tags come partly from PwC's own [extraction tooling](https://github.com/paperswithcode/sota-extractor) and partly from community contributions. We pulled all of it into one database and enriched it with disambiguated authors and full texts from OpenAlex (Priem et al., 2022) and Semantic Scholar (Kinney et al., 2023).

![Knowledge graph schema with node and edge counts](/assets/img/blog/aom-2025/knowledge-graph.png)
*The knowledge graph behind the paper. Papers sit in the middle; everything else hangs off them. Note that the figure uses German thousand separators, so "512.834" means 512,834.*

Some numbers from Figure 1 that matter later. There are 512,834 papers and 379,915 authors, connected by 1,377,263 authorship edges. On the concept side there are 5,268 tasks, 2,307 methods and 11,011 datasets. Papers point to tasks 951,359 times and to methods 621,464 times. Only 2,085 edges say that a paper *introduces* a method, and 8,561 say it introduces a dataset. Full texts are available for 228,953 papers, so for a bit less than half of the corpus. 215,421 code repositories hang off 268,530 `HAS_CODE` edges.

The task, method and dataset names are the most valuable part for concept mining. They are human-curated (more or less) and very AI-specific. But they are also a closed vocabulary. 2,307 methods for half a million papers is a small number, and anything that is not yet a PwC method page simply does not exist in that vocabulary.

Building that graph was the least glamorous part of the project, and it took longer than any model in it. PapersWithCode came from its API, crawled into chunked Parquet files and a SQLite database. Authors came from the OpenAlex snapshot, and full texts from S2ORC, part of the Semantic Scholar Academic Graph (S2AG). Neither snapshot can be queried in place. The OpenAlex works arrive as compressed JSONL, so a set of scripts flattened them into CSV, which `COPY` then loaded into a PostgreSQL database running in Docker. Joining that with PwC and S2AG meant more scripts, more intermediate CSV and Parquet files, and a fair amount of container orchestration just to keep the databases, disks and memory limits in line. What came out at the end is about 30 Parquet tables, around 6 GB, one per node and edge type of the figure above, which the mining code reads directly. If that sounds tedious, it was. It is also the reason I later built the [Science Data Lake](/en/blog/2026-02_science_datalake/), so I would not have to do it again.

## Why frequency and dictionaries are not enough

The classic toolbox for concept extraction is n-gram frequency thresholds, part-of-speech patterns and dictionary lookups. They fail in two directions.

They miss things. An impactful but rare term, say a method that two groups are using in its first year, never makes it over a frequency threshold. A dictionary does not know it either.

And they let things in. Frequency loves short tokens and acronyms. The paper's examples are tokens like "0" or "u": frequent, and meaningless. Part-of-speech filters help a bit, but they cannot tell "graph neural network" from "proposed neural network".

Deep learning approaches to phrase mining and keyphrase extraction exist for exactly this reason (the paper cites Shang et al., 2017; Meng et al., 2021; Choi et al., 2023). The one we took as a template is [UCPhrase](https://arxiv.org/abs/2105.14078) (Gu et al., KDD 2021).

## The UCPhrase idea: attention maps as images

UCPhrase does something I find elegant. Instead of looking at the words of a candidate phrase, it looks at how a pre-trained transformer *attends* within that phrase. For a span of tokens you take the sub-matrix of the attention map that covers only those tokens. Stack it across layers and heads, and you get a small multi-channel image. A lightweight CNN is then trained to classify these images into "quality phrase" and "not a phrase". The transformer itself is not fine-tuned; its attention is only used as a feature.

The training labels are "silver" labels. UCPhrase mines them from each document by looking for word sequences that consistently co-occur. Negatives are randomly sampled spans.

Why should attention carry this signal at all? When a model reads "GAN", its attention tends to connect it to nearby terms like "generator" or "adversarial training". Tokens that form a coherent concept attend to each other in a characteristic way. A random cluster of tokens does not. And because the CNN only sees attention patterns and never the surface strings, it can in principle recognise a phrase it has never seen before. That is the property I was after.

Here is what those images look like for one sentence, "we train a graph neural network to predict molecular properties from the atom graph", run through SciNCL:

![Attention sub-matrices for a concept span and a random span](/assets/img/blog/aom-2025/attention-spans.png)
*Attention inside two three-token spans of the same sentence from SciNCL's first three layers, averaged over heads for this figure (the classifier sees all twelve heads separately). Each row shows where a token's attention goes, restricted to the span. In "graph neural network", "network" puts a lot of its attention on "neural" (0.29 in layer 1, 0.18 in layer 2). In "network to predict", which crosses a phrase boundary, attention stays mostly on the diagonal. One sentence proves nothing; the CNN learns these patterns from millions of spans.*

## Three signals for the training set

Our variation is in how the training set is built. UCPhrase relies on co-occurrence alone. We have a lot of domain knowledge lying around in the knowledge graph and in textbooks, so the paper combines three signals.

The first is dictionary-based. Known tasks, methods, datasets and phrases from PapersWithCode, the Computer Science Ontology (Salatino et al., 2020), and the indices of three textbooks: Goodfellow et al. (2016), Murphy (2022) and Prince (2023). These are the anchor phrases.

The second is frequency-based: repeated n-grams above a threshold, with trivial phrases filtered out.

The third is attention-based. Concept candidates are aligned to subword tokens and filtered through their attention patterns, skipping short or numeric tokens.

Each signal covers a gap in the others. The dictionary catches known concepts even when they appear only once or twice in the corpus, which frequency would never manage. Attention picks up emerging phrases like "Vision Transformer" or "causal NLP" that are still rare and not in any dictionary. And cross-checking the dictionary and frequency hits against the attention signal removes the noise both of them produce, like the "0" and "u" from above.

## What actually ran

The version behind the poster is a set of plain Python scripts, not a package. The encoder is [SciNCL](https://huggingface.co/malteos/scincl), the same scientific BERT model I used for the [AI Concept List](/en/blog/2024-09_ai_concept_list/). For every candidate span of up to four tokens, the attention sub-matrix comes from the first three layers, with each of the twelve heads kept as its own channel, so the CNN sees a 36-channel image. The classifier is intentionally small:

```python
class AttentionCNN(nn.Module):
    # 36 input channels: 3 layers x 12 heads
    # Conv2d(36 -> 64, 3x3) -> ReLU -> Conv2d(64 -> 64, 3x3) -> ReLU
    # AdaptiveMaxPool2d((1, 1)) -> Linear(64 -> 2)
```

Adaptive max pooling lets one network handle spans of different lengths. The trained weights are 234 KB. Training ran for 20 epochs with a batch size of 8 and a learning rate of 1e-3.

The training set is where the size is. The log of the run that built it reads:

```text
Docs processed: 497134
Dictionary hits total: 2243618
Core phrase hits total: 3384096
Collected 6676076 (<attn_map>,<label>) pairs.
```

Positive spans come from dictionary matches (PwC tasks and methods, the textbook indices and CSO) and from n-grams that repeat within a document. Negatives are random spans of one to five tokens. Saved to disk, the 6.7 million attention images take 17.4 GB, a lot more than the model that learns from them.

At inference time, spaCy proposes noun chunks, and the CNN scores each of them. A chunk is kept at a probability of 0.5 or more. A short allow-list keeps single-word names like "bert", "gpt" or "gan", but only at 0.9 or more.

The code later grew into [concept-miner](https://github.com/J0nasW/concept-miner) on GitHub, which replaces the CNN with a graph attention network over the attention maps. That is a different model, and a different post.

## What came out

Across all 512,834 papers, the miner produced 2.76 million span hits. Keeping phrases that occur more than three times with an average score above 0.6 leaves 60,808 unique concepts. 57,525 of them are not in any of the dictionaries the training labels came from: not a PwC task, method or dataset, not in a textbook index, not in CSO. That is the point of the exercise, so I looked at what those phrases actually are.

Some of them are exactly what I hoped for. Rare, specific, and not in any vocabulary at the time:

| Phrase | Occurrences | Avg. score |
|---|---|---|
| masked diffusion models | 6 | 0.86 |
| motion diffusion models | 6 | 0.88 |
| causal reinforcement learning | 8 | 0.77 |
| graph retrieval | 7 | 0.82 |
| diffusion modeling | 25 | 0.94 |
| instruction tuning | 369 | 0.66 |

"Instruction tuning" is a good example of the timing problem from the beginning. The earliest paper in the data using it is from September 2021. By the time the poster was written it was everywhere, and it still was not a PwC method.

Others are clear failures. The most common kind is a filler word glued to the front of a real concept: "like computer vision" (0.81), "combining computer vision" (0.82), "making diffusion models" (0.78), "like point clouds" (0.98). Then generic phrases that only sound technical, like "based approaches" (119 occurrences) and "different languages" (435). And phrases that are perfectly good concepts, just not AI ones, like "cell divisions" and "supply chain". Those come from applied papers, and the miner cannot know that the application is not the method.

Two failures are more telling. About 30% of all hits, 836,715 of them, have exactly the same score, 0.6576, regardless of the phrase. Something in the scoring collapses to a constant for a large class of spans, and I only noticed it when going through the output for this post. And hyphenated terms never appear at all. There is no "chain-of-thought" and no "in-context learning" anywhere in the output. My best guess is a sanity check that drops spans containing punctuation, hyphens included.

Then there is the title of this post. On the NeRF paper itself, *Representing Scenes as Neural Radiance Fields for View Synthesis* from March 2020, the miner does find "neural radiance fields" (0.64), next to "volume rendering" and "novel views". The same phrase then shows up in 5 papers in 2020, 36 in 2021, 61 in 2022 and 118 in 2023. That is the curve this whole project is about: one paper, then a field. One caveat: the Computer Science Ontology the training labels come from lists "neural radiance fields" today, so the model has seen the phrase as a label. A fair test would train only on dictionaries from before 2020 and check whether the concept is still found.

It does not always work. "Vision transformers" (plural) comes out 1,365 times, but on the ViT paper, *An Image is Worth 16x16 Words*, the miner finds "computer vision" (1.0), "image recognition" (0.996) and "image patches" (0.66), and not "vision transformer", probably because the abstract mostly says "Transformer" and "ViT". Recognising a concept from how it is used is the right idea. Getting it right on the first paper is still the hard part.

## What the poster does not show

The AOM paper is a poster in the Research Methods division, and it describes the pipeline and the reasoning behind it. It does not report a quantitative evaluation of the concept miner against keyphrase benchmarks, and the run itself only printed train and test accuracy on a random split, which never made it into a log. I do not want to pretend otherwise here. A few things I know are open.

The anchor phrases are only as good as their sources. PwC tags are partly machine-extracted, and the textbooks are years behind the field. The attention signal is supposed to correct for that, but how well it does is an empirical question.

Attention also depends on the encoder and on which layers you take. "First three layers, all heads" is a sensible default, but it is a default, and I did not compare it with others.

And PwC is not "AI research". It is AI research that somebody linked to code or tagged on PwC, which is a selection in itself.

## Next: who carries these concepts?

Mined concepts are only half of the framework. The other half asks where they show up first and which groups of researchers carry them into the rest of the field. That is the [co-authorship network post](/en/blog/2025-05_coauthorship_networks/). The full paper is in the [AOM Proceedings](https://doi.org/10.5465/amproc.2025.23164poster).
