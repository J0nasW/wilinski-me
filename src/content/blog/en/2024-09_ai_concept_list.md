---
title: 'How to build a list of 10,797 AI concepts'
description: 'The pipeline behind the AI Concept List from the DRUID 2024 paper: textbook indices and the Computer Science Ontology as a seed, YAKE keyphrases from PapersWithCode to extend it, and a logistic regression against OpenAlex abstracts to weight it and throw out what is too generic.'
pubDate: '2024-09-16'
heroImage: '/assets/img/title_img/bg08-unsplash.jpg'
heroImageAttribution: 'unsplash'
heroImageCredit: 'Conny Schneider'
heroImageLink: 'https://unsplash.com/photos/xuTJZ7uD7PI'
tags: ['nlp', 'science of science', 'keyphrase extraction', 'python']
draft: false
---

In the [DRUID post](/en/blog/2024-07_post_druid/) I mostly talked about what the AI Concept List is *for* and what the innovation researchers in the audience made of it. This one is about how it is made. The full method is in the [paper](/en/publications/2024-druid-ai-compass/), the code is in the [AI-Dictionary repository](https://github.com/J0nasW/AI-Dictionary) and the list itself is on [HuggingFace](https://huggingface.co/datasets/J0nasW/AI-Dictionary).

The goal sounds simple: a list of phrases that, when they show up in a paper, indicate that the paper uses AI. It has to be broad enough to catch "graph neural network" and "random forest", specific enough to ignore "model" and "data", and fresh enough to know about methods from last year. Ideally every phrase also carries a number saying how strongly it points to AI.

![The full AI Concept List pipeline](/assets/img/blog/ai-concept-list/full-pipeline.png)
*The whole pipeline (Figure 7 in the paper): four seed sources merge into 9,070 concepts, similarity search extends them to 11,577, and validation against positive and negative abstracts leaves 10,797 weighted concepts. Footnote: the 991,425 documents on the right do not match the 1.6 million rows of the final regression matrix in the paper's text.*

## A seed from people who already did the work

The first version comes from sources where humans already decided what counts as AI. I took the indices of three textbooks: Goodfellow, Bengio and Courville's *Deep Learning* (2016), Murphy's *Probabilistic Machine Learning* (2022) and Prince's *Understanding Deep Learning* (2023). Book indices are underrated: somebody already listed every term worth looking up.

The second source is the [Computer Science Ontology](https://cso.kmi.open.ac.uk/) (CSO, version 3.3). I start at the node *artificial intelligence* and walk down the `superTopicOf` relations until nothing is left. The core of it is a plain loop:

```python
start_ids = ["artificial intelligence"]
all_end_ids = []

while True:
    cso_ai = cso[cso.start_id.isin(start_ids)]
    cso_ai = cso_ai[cso_ai.relationship == "superTopicOf"]
    if len(cso_ai) == 0:
        break
    start_ids = cso_ai.end_id.tolist()
    all_end_ids.extend(start_ids)
```

In the repo notebook this goes eleven levels deep and returns 5,901 CSO topics.

Textbooks and ontologies are solid but dated. For what the field is actually writing about right now I used [PapersWithCode](https://paperswithcode.com): around 400k AI papers, tagged with tasks, methods and datasets, partly by an extraction algorithm but mostly by the community. I loaded the dump into a Neo4j graph (papers, methods and tasks as nodes, each linked to its keyphrases with the YAKE score on the edge), and all later queries run in Cypher against that graph. Method and task descriptions go into the seed directly; the paper abstracts are kept for the extension step.

Per source, the paper counts 1,726 PapersWithCode methods, 2,945 tasks, 2,565 book index terms and 1,834 CSO topics. Out of 14,655 raw candidates, lowercasing, removing abbreviations, lemmatising and deduplicating leaves **9,070 unique AI concepts**.

<!-- Image to generate with Gemini: save as /assets/img/blog/ai-concept-list/pwc-graph.png (16:9), then uncomment the image below.
Prompt: *A clean technical illustration of a small knowledge graph on a plain white background, flat vector style, no 3D, no glow. In the centre one circular node labelled "Paper". Three smaller nodes connect to it with thin grey lines: "Task: image segmentation", "Method: U-Net", "Method: attention". From the paper node, five thin lines lead to rounded rectangles holding short keyphrases such as "skip connections", "medical images", "encoder decoder", each line carrying a small number like 0.04 or 0.08. Muted palette: dark navy nodes, light grey edges, one soft blue for keyphrase boxes. Legible sans-serif labels, generous spacing, looks like a figure from a computer science paper, not a stock image.*
-->
<!-- ![A paper node linked to its tasks, methods and YAKE keyphrases](/assets/img/blog/ai-concept-list/pwc-graph.png "AI-generated (Gemini)")
*Illustration of how one paper sits in the graph: linked to its tasks and methods, and to its keyphrases with the YAKE score on each edge.* -->

## One keyphrase pipeline for everything

Every text in this project, from method descriptions to OpenAlex geology abstracts, goes through the same preprocessing. Otherwise the regression later would learn differences in preprocessing instead of content.

![The keyphrase preprocessing pipeline](/assets/img/blog/ai-concept-list/preprocessing-pipeline.png)
*Figure 1 from the paper: text goes into YAKE, and every candidate has to pass lemmatisation, lowercasing, a length check, a YAKE score threshold and a noun chunk check before it counts as a keyphrase.*

The text is first normalised to plain UTF-8 and stripped of links and odd characters. Then [YAKE](https://github.com/LIAAD/yake) extracts candidates. I picked YAKE mainly because it returns a relevance score per candidate, and a score is something I can threshold. Lower is better in YAKE, and after some experimenting $S(x) \leq 0.1$ turned out to keep phrases that are specific rather than generic. The repo configures it like this (the paper says up to 15 candidates per text, the code stops at 10):

```python
yake.KeywordExtractor(lan="en", n=3, dedupLim=0.2, dedupFunc="seqm",
                      windowsSize=5, top=10, features=None)
```

After YAKE, each candidate is lemmatised word by word with WordNet, so "networks", "networking" and "networked" all end up as "network". Everything is lowercased, anything shorter than four characters is dropped, and finally each candidate has to appear inside one of the noun chunks spaCy finds in the original sentence. That last check removes phrases like "paper describes".

## Growing the seed with embeddings

Running the same pipeline over all PapersWithCode abstracts gives **562,066 unique candidate keyphrases**, far too many to add blindly.

Both the seed and the candidates are embedded with [SciNCL](https://huggingface.co/malteos/scincl), which at the time was the best transformer baseline on the SciRepEval benchmark. The seed concepts are projected to 2D with openTSNE, clustered with HDBSCAN into 25 topics, and each topic gets a centroid: the mean embedding of its members. From every centroid, a k-nearest-neighbour search pulls the 100 closest candidate phrases. One cluster made of abbreviations ("gnn", "rnn" and friends) is left out, because semantic similarity between acronyms means very little.

This adds 2,507 new phrases, for a total of 11,577. The clustering, the centroids and the cluster names (written by flan-t5) have their own post: [naming the clusters](/en/blog/2024-11_naming_clusters/).

## Kicking out the generic ones

The list still contains phrases that appear everywhere. The most frequent keyphrases from PapersWithCode *task* descriptions in the repo notebook are "image", "computer vision task", "text", "video", "task" and "data". All of them are in AI papers, and none of them tells you a paper uses AI.

To find out which phrases separate AI from non-AI text, I needed a lot of non-AI text. OpenAlex had around 240 million works at the time, and its API does not serve requests that size, so I loaded the snapshot into a local PostgreSQL instance in Docker and sampled abstracts from there. The final validation set has 1,219,378 negative documents from OpenAlex and 415,941 positive documents from PapersWithCode, all run through the same keyphrase pipeline.

From these I build a phrase-document matrix $M$ with $|D| = 1{,}635{,}319$ rows (documents) and $|P| = 11{,}577$ columns (concepts), where $M_{ij}$ counts how often concept $j$ appears in document $i$, plus a label vector $y$ with $y_i = 1$ for AI documents. The matching is done with WordTrie, my word-level prefix-tree package from the [SynapseTrie post](/en/blog/2023-10_algorithmic_bottlenecks/). It later became SynapseTrie.

Then a logistic regression:

$$P(y_i = 1 \mid \mathbf{x}_i) = \frac{1}{1 + e^{-(\beta_0 + \beta_1 x_{i1} + \dots + \beta_{|P|} x_{i|P|})}}$$

Why not something fancier? Because I did not care much about classifying documents. I wanted one interpretable number per phrase, and $\beta_j$ is exactly that. Positive means the phrase pushes a document towards AI. In the repo, the model is scikit-learn's `LogisticRegression` with the `saga` solver, L2 penalty, `C=20` and `class_weight="balanced"`, because there are roughly three negative documents for every positive one.

![Confusion matrix of the logistic regression](/assets/img/blog/ai-concept-list/confusion-matrix.png)
*Figure 6: confusion matrix on the 20% test split. Class 0 is non-AI, class 1 is AI. Almost no non-AI document is called AI (3,454 false positives), but 39,163 AI documents slip through as non-AI.*

10-fold cross-validation lands at 87% accuracy. The classification report is more telling. For the AI class, precision is 0.93 and recall is 0.53. When the model says "AI", it is almost always right; it just misses nearly half of the AI documents. For deriving weights that is the less harmful direction: a phrase only gets a high coefficient if it is really distinctive. The missed AI documents are still the main thing to improve.

Mapping the coefficients back onto the phrases:

| | Phrases |
|---|---|
| Concept list before validation | 11,577 |
| Negative coefficient, removed | 780 |
| No coefficient, filled from nearest neighbour | 4,551 |
| **Final weighted AI Concept List** | **10,797** |

Phrases without a coefficient inherit the one of their nearest SciNCL neighbour. All positive coefficients are then divided by the largest one. "graph neural network" has the largest coefficient (8.59) and therefore weight 1.0, followed by "neural network" at 0.99 and "multi-task learning manner" at 0.79.

![Histogram of importance weights](/assets/img/blog/ai-concept-list/weight-histogram.png)
*Figure 8: distribution of the importance weights over all 10,797 concepts. A few phrases get very high weights, most sit in the middle. The tall spikes near 0.37 and 0.47 are probably the nearest-neighbour fill-in at work, since many phrases inherit the exact same coefficient from the same neighbour.*

That third entry is a reminder that the filter is statistical. The appendix sample also has "slightly lower accuracy" and "important observation" at weights around 0.3: phrases that describe how ML papers are written, not what they do.

## What the list shows

With the weighted list, I took the OpenAlex level-0 concepts (Biology, Medicine, History and so on), sampled up to 100k English abstracts per domain (History only has 4,487) and counted AI concepts per document.

![Share of documents with AI concepts per domain](/assets/img/blog/ai-concept-list/share-per-domain.png)
*Figure 9: share of documents with at least three AI concept occurrences in title and abstract. Computer Science is close to 60%, Environmental Science above 40%, History near zero.*

![AI concept occurrences across domains over time](/assets/img/blog/ai-concept-list/domains-over-time.png)
*Figure 10: share of documents with AI concepts per domain, 1980 to 2020. Computer Science climbs steeply after around 2010; Environmental Science and Medicine rise steadily.*

## What I would change

The negative sample is the weakest point. Selecting OpenAlex papers that are not tagged with concepts like "Artificial Intelligence" or "Machine Learning" means relying on another classifier's output, and any AI paper that slips through is labelled as non-AI. That probably costs recall and pushes some legitimate AI phrases towards zero.

YAKE is a statistical extractor and has no idea what a concept is. It is good at frequent, well-formed phrases and bad at rare ones, which is exactly where new methods live. The paper suggests phrase mining on several levels in the spirit of Shang et al. (2017). Later, in 2025, I went a different route and used transformer attention to mine concepts instead (the [AOM 2025 poster](/en/publications/2025-aom-ai-communities/)).

And there is a more fundamental issue the paper names in its last section: a list built from what textbooks, an ontology and PapersWithCode already know will always be better at finding established AI than at noticing something new. For an instrument meant to measure innovation, that is uncomfortable. A first step the paper proposes is to refresh the regression continuously as new papers come in, so the weights at least follow the field instead of a 2024 snapshot.
