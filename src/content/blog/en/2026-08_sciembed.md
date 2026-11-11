---
title: 'SciEmbed: teaching an embedding model how scientists cite'
description: 'Our paper on citation-context supervision for scientific document embeddings was accepted at EMNLP 2026. How the model is trained, where it beats a same-size peer, where it loses, and how to use the six released checkpoints.'
pubDate: '2026-08-27'
heroImage: '/assets/img/title_img/bg13-unsplash.jpg'
heroImageAttribution: 'unsplash'
heroImageCredit: 'Conny Schneider'
heroImageLink: 'https://unsplash.com/photos/pREq0ns_p_E'
tags: ['nlp', 'embeddings', 'science of science', 'open source']
draft: false
---

Every time a researcher cites a paper, they write a little summary of it. Usually one sentence, sometimes half of one: "Inspired by [9], we conducted a more extensive and systematic study of assembling several CNN-related techniques into a single network." That sentence was written by someone who read the cited work and decided what it was good for. Multiply that by the roughly one billion citation context sentences in the Semantic Scholar Academic Graph (S2AG) and you have a very large, very free, expert-written training set. Most open scientific embedding models never look at it.

I started looking at them once the [Science Data Lake](/en/blog/2026-02_science_datalake/) was running. With eight scholarly databases joined behind one SQL interface, I spent a lot of time just exploring: following papers through citations, comparing what different sources say about the same work, finding connections that no single database shows. The citation contexts kept standing out as the richest and least used part of it.

That observation became *SciEmbed: Citation-Context Supervision for Scientific Document Embeddings*, joint work with Michael Färber, which was accepted at [EMNLP 2026](/en/publications/2026-emnlp-sciembed/) (Empirical Methods in Natural Language Processing, ACL). The code, configs, evaluation harness and curated result files are on [GitHub](https://github.com/J0nasW/SciEmbed-release), the six checkpoints are on [Hugging Face](https://huggingface.co/J0nasW), the Body-Fact Retrieval probe is published as a [dataset](https://huggingface.co/datasets/J0nasW/bfr-diagnostic), and the paper is in the [ACL Anthology](https://aclanthology.org/2026.findings-emnlp.2057/), with the reviews on [OpenReview](https://openreview.net/forum?id=yfFMj23hmI).

## What a citation edge throws away

The standard recipe for scientific embedders goes back to SPECTER: if paper A cites paper B, pull the embedding of A's title and abstract towards B's. That edge tells the model *that* the two papers are related. It says nothing about *how*. "We follow the training setup of [B]" and "unlike [B], we do not assume labelled data" collapse into the same binary link.

SciEmbed keeps the sentence. Each citation becomes a contrastive triplet: the citation context is the query $q$, the cited paper's title and abstract is the positive $d^{+}$, and a structured hard negative $d^{-}$ is the thing to push away.

![SciEmbed training overview: a citing paper's context sentence becomes a query, the cited paper's title and abstract the positive, plus a hard negative](/assets/img/blog/sciembed/overview.png)
*One citation, one training example: the citing author's sentence is the query, the cited paper is the positive, and a sampled hard negative is pushed away.*

The other thing that bothered me is the backbone. Most scientific embedders still sit on SciBERT from 2019, whose 512-token ceiling cuts off more than 90% of an average full-text paper. ModernBERT offers 8,192 tokens and was pretrained on 2T tokens. As far as we could tell, nobody had put the two together for open scientific embeddings yet.

Here is what such a query looks like next to typical general-retrieval training data:

![A real SciEmbed training pair next to a Natural Questions pair of the kind Granite R2 trains on](/assets/img/blog/sciembed/query-examples.png)
*Top: a real citation-context pair from our training pool. Bottom: a real Natural Questions pair, one of the public datasets the Granite R2 report lists as training data. An expert explaining why a paper matters versus a short search query. That difference shows up again in the results.*

## Where the data came from

All training data came out of a local DuckDB snapshot of S2AG plus full-text sources, frozen on 2026-03-01. This is where the [Science Data Lake](/en/blog/2026-02_science_datalake/) paid for itself: generating the training signals was SQL-level partitioning over the citation graph rather than a pile of API scripts.

The contrastive data has two main signals. Signal A is the classic citation edge, citing title+abstract against cited title+abstract. A two-tier sampler draws 16M triplets from the influential-citation pool (about 140M edges) and 34M from the non-influential pool (about 2.8B edges). Signal B is the citation context: 20M sentences from the influential tier, filtered to 50 to 1,000 characters and a minimum share of alphabetic characters. On top of both sits Signal D, one explicit hard negative per anchor, drawn as a 50/30/20 mix of same-field papers that are not cited, "forward neighbours" (cited by the positive but not by the anchor), and random papers.

Deduplication then shrank the raw 70M pairs to about 30M. Some of that is the graph itself (the S2AG citations table has 2.92B rows but only 2.65B distinct edges, and many papers exist under several corpus IDs), but most of it is Signal B: boilerplate like "Following *X* ..." appears in countless citing papers pointing at the same reference, and MD5 on the text merges them into one example. A third signal, contexts prefixed with S2AG's citation intent labels, did not improve anything and was dropped.

## Two stages, one of which barely mattered

Stage 1 is domain-adaptive masked language modelling on 13.4M scientific full-text papers from PMC-OAS, S2ORC, arXiv and peS2o, cut into 8,192-token chunks with a 30% masking rate. That ran for 16.1 hours on 4×H200 and saw 8.3B tokens.

Stage 2 is the contrastive part: an InfoNCE loss (temperature 0.05) wrapped in a Matryoshka loss over 768, 512, 256 and 128 dimensions, with mean pooling and each minibatch drawn from a single signal type, so edges and context sentences never act as each other's false negatives. Ablation variants train on a 7M-pair subsample for three epochs, about a day on one H100. SciEmbed-FULL does one epoch over the full 30M-pair pool in about two days.

The honest part: in the controlled ablation, Stage 1 contributed almost nothing. Starting Stage 2 from raw ModernBERT-base changes SciRepEval by 0.1 points (66.8 vs. 66.7). That holds at our 8.3B-token budget, and a longer adaptation might still help, but on a smaller budget you can skip Stage 1. `sciembed-nodapt-ctx` is exactly that variant.

## Results: close overall, opposite in detail

The main benchmark is SciRepEval, 22 tasks in four categories, run through the official harness. Overall is the macro average of the categories; SciEmbed rows are three-seed means.

| Model | Params | Classif. | Regr. | Prox. | Search | Overall |
|---|---|---|---|---|---|---|
| SciNCL | 110M | 74.1 | 25.5 | 81.5 | 80.7 | 65.4 |
| SPECTER2 Base | 110M | 74.9 | 27.7 | 81.4 | 81.7 | 66.4 |
| Nomic ModernBERT | 149M | 75.9 | 26.7 | 79.3 | 83.2 | 66.3 |
| BGE-large-en-v1.5 | 335M | 76.1 | 25.6 | 80.5 | 83.9 | 66.5 |
| Granite Embedding R2 | 149M | 76.3 | 25.9 | 82.7 | 84.9 | 67.4 |
| SciEmbed-CTX | 149M | 75.5 | 28.3 | 80.9 | 82.5 | 66.8 |
| SciEmbed-FULL | 149M | 75.6 | 28.2 | 80.9 | 82.7 | 66.85 |

SciEmbed-FULL beats SPECTER2, SciNCL and BGE-large, which is more than twice its size. It does not beat IBM's Granite Embedding R2, which is 0.6 points ahead. But Granite R2 turned out to be the most useful baseline in the paper: same ModernBERT-base backbone, same parameter count, same recipe family. What differs is the training data, general enterprise retrieval pairs, partly public, partly IBM-internal and LLM-generated.

Look at the columns instead. SciEmbed leads regression by 2.3 points (28.2 vs. 25.9). Granite leads classification (+0.7), proximity (+1.7) and search (+2.2). Same architecture, opposite specialisation.

![Per-bucket z-score profile: SciEmbed-FULL peaks on regression, Granite R2 on proximity and search](/assets/img/blog/sciembed/bucket-profile.png)
*Each SciRepEval category, scored relative to the other models in the comparison. SciEmbed (peaking at +1.6σ) stands out on regression and nowhere else; Granite peaks on proximity and search and dips on regression. The two lines cross, and no other model in the cohort has either shape.*

The regression lead sits on tasks like predicting citation count, publication year and h-index. The one regression task against the pattern is Tweet Mentions, which makes sense, since nothing about social media is in citation contexts.

The result I like most is in the appendix. If you take Granite R2's weights and run our Stage 2 on top, with the same 7M citation-context pairs, its regression jumps from 25.9 to 28.0 while proximity stays at 82.7 and search only drops from 84.9 to 84.2. Overall it reaches 67.6, above both parents. The two supervision sources stack.

## Was it the recipe, or the data?

A 0.6-point gap invites the obvious follow-up: tune harder. So we did. A 28-configuration sweep varied temperature, batch and pool composition, and tried four alternative signals, from co-citation pairs to TLDR-to-abstract pairs. The best configuration reached 67.11 against a same-seed FULL baseline of 67.10. Nothing moved.

The ablations point in the same direction. Training on citation contexts alone, without edges or hard negatives, already lifts regression from 26.8 (edges only) to 28.0, and combining both reaches 28.3. The regression specialisation comes from the context sentences. Search goes the other way, so the edges are not useless; the two signals complement each other.

![SciRepEval overall score against number of Stage 2 training pairs, from 3.5M to 30M](/assets/img/blog/sciembed/data-scaling.png)
*More data helps, but not by much. Going from 3.5M to 30M training pairs adds 0.87 points in total, and most of it is gone by 21M. All points are single-seed runs.*

Our reading is that the ceiling sits on the supervision source, not on the hyperparameters. The paper is careful to call this suggestive: Granite's training corpus is not public, so a data-scale or data-quality confound cannot be ruled out completely.

## Long documents

Only 3.9% of SciRepEval inputs are longer than 512 tokens, so it cannot tell you whether an 8K model actually uses its context. We built a probe for that, Body-Fact Retrieval (BFR): 9,749 S2ORC papers encoded as title, abstract and body, and 1,000 query sentences from the middle of the bodies, filtered so that at most 20% of their word trigrams overlap with the abstract. The answer is in the body, not in the abstract.

Within our recipe, longer Stage 2 context helps on every metric: Recall@10 goes from 61.7 (512 tokens) to 62.2 (2K) to 67.1 (8K), and the gain survives same-field candidate pools and queries paraphrased by Qwen3-32B. On LongEmbed the same variants go from 24.7 to 28.9 to 37.0. In absolute terms Granite R2 wins both (72.0 R@10 on BFR, 65.6 on LongEmbed), so we treat BFR as a diagnostic, not a leaderboard.

## What the embedding space looks like

The clearest picture is a UMAP of 2,800 papers from the SciRepEval Fields of Study task (350 from each of the eight largest fields) under three ModernBERT-base embedders.

![UMAP of Fields of Study papers under Nomic ModernBERT, Granite R2 and SciEmbed-FULL](/assets/img/blog/sciembed/umap-fields.png)
*Same backbone, same UMAP settings, three kinds of supervision. Nomic ModernBERT and Granite R2 both mix neighbouring fields in the middle. SciEmbed separates disciplines more cleanly, with Computer Science as its own cluster and Mathematics, Materials Science and Chemistry in separate regions, without ever seeing a field label during training.*

## Where it does not work

SciEmbed is not a general-purpose embedder. On the full 41-task English MTEB it scores 49.3, against 63.4 for Nomic Embed v1.5, and on the MTEB science subset Granite R2 takes the retrieval-style tasks. It is English only and inherits S2AG's coverage gaps across fields and regions, which matters if you use the impact-related scores for anything that affects people.

The training signal is also noisier than it looks. We had an LLM judge 2,000 random citation-context pairs: in 62.5% of them the aspect the citation refers to is recoverable from the cited title and abstract, in 37.5% it is not. The contrastive loss tolerates that noise, but it is an obvious thing to clean up.

## Using it

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("J0nasW/sciembed-full")
emb = model.encode(
    ["citation-context supervision for scientific embeddings"],
    normalize_embeddings=True,
)
```

`sciembed-full` is the general-purpose checkpoint; for long scientific inputs use `sciembed-ctx-8192` (or `sciembed-ctx-2048`). `sciembed-ctx`, `sciembed-base` and `sciembed-nodapt-ctx` are the paper's ablation variants. Embeddings can be truncated from 768 to 512, 256 or 128 dimensions. In fp16 on one H100 it embeds 5,363 documents per second at batch size 128, about 10% more than BGE-large with 2.6× less GPU memory. Code and weights are MIT licensed.

The paper will be presented at EMNLP 2026 in Budapest.


The next step follows from that audit: filter Signal B for substantive contexts, drop self-citations, and align each citation with the passage of the cited paper it actually refers to instead of the abstract. The released pipeline already supports the last one, so if you try it, let me know how it goes.
