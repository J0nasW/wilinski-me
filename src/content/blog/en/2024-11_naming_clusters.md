---
title: 'Naming clusters with flan-t5, and where the names go wrong'
description: 'How the topic clusters behind the AI Concept List got their names: SciNCL embeddings, openTSNE, HDBSCAN and a single prompt to flan-t5. Plus what the model actually saw, and which names it got wrong.'
pubDate: '2024-11-22'
heroImage: '/assets/img/title_img/bg09-unsplash.jpg'
heroImageAttribution: 'unsplash'
heroImageCredit: 'jonakoh _'
heroImageLink: 'https://unsplash.com/photos/qY-XlCf9Zs4'
tags: ['nlp', 'clustering', 'llms', 'python']
draft: false
---

Anyone who has clustered text knows the moment. HDBSCAN returns its labels, the scatter plot looks great, and you have no idea what cluster 17 is about. For the [AI Concept List](/en/blog/2024-09_ai_concept_list/) I needed every cluster to have a name: for the plots in the [DRUID paper](/en/publications/2024-druid-ai-compass/), and because the clusters are the topics from which the list gets extended. In the paper, the naming step gets two sentences. This post is the longer version, based on the paper and on the notebooks in the [AI-Dictionary repository](https://github.com/J0nasW/AI-Dictionary).

## From phrases to clusters

The input is the seed list: 9,070 AI concepts from textbook indices, the Computer Science Ontology and PapersWithCode methods and tasks. Every phrase is embedded with [SciNCL](https://huggingface.co/malteos/scincl), a model trained on scientific documents, into a 768-dimensional vector. Similar phrases end up close to each other, which is the whole premise of the method.

![Similarity search around "neural network"](/assets/img/blog/ai-concept-list/similarity-search.png)
*Figure 2 from the paper: the phrase "neural network" and its nearest neighbours, reduced to three dimensions with TSNE. "neural net", "neural network learning" and "artificial neural network-based" all sit close by.*

These vectors are reduced to two dimensions with openTSNE, and HDBSCAN clusters the 2D points. In the repo, the TSNE step uses multiscale affinities with perplexities 50 and 200, cosine distance and a PCA initialisation. HDBSCAN runs with `min_cluster_size=200`, `min_samples=10` and the `leaf` selection method, which prefers many small, homogeneous clusters over a few big ones.

Clustering in 2D rather than in the full 768 dimensions is a trade-off. The paper does it "for visualization and clustering purposes", and it makes the clusters match what you see in the plot. The price is that TSNE layouts are not stable: the paper notes that the cluster positions in two of its figures differ purely because of TSNE. The clusters themselves are what matters, not where they land on the page.

For the paper's seed list, this gives 25 clusters.

## Centroids instead of single phrases

Each cluster gets a centroid, the mean embedding of all its members. The centroid is what the list is later extended from: a k-nearest-neighbour search finds the 100 closest phrases among 562,066 keyphrases from PapersWithCode abstracts.

![The "Graph Neural Network" cluster centroid](/assets/img/blog/ai-concept-list/cluster-centroid.png)
*Figure 3: the topic "Graph Neural Network" with nearby phrases such as "GNN", "graph labels" and "graph representation learning", in two TSNE dimensions.*

This was not the first approach. The public repo still contains an earlier extension script that compares every single seed phrase with every candidate and keeps candidates above a fixed cosine similarity. It sweeps thresholds from 0.75 to 0.99. At 0.99 it yields 948 phrases, of which 829 are new. The paper's argument for switching to centroids is that a mean over a whole cluster is much less sensitive to individual odd phrases than a search from each phrase on its own. One strange seed phrase drags in its own set of strange neighbours. One strange phrase in a cluster of several hundred barely moves the centroid.

## The naming step

Now the names. The paper describes it like this: the member phrases of each cluster go into flan-t5-xl via the Hugging Face `transformers` library, with the prompt

```text
Given the following phrases, come up with a topic name that is
specific and precise: [KEYWORDS]
```

and a temperature of $t = 0.1$, to keep the output as deterministic as possible.

The visualisation notebook in the public repo is a bit different, and I want to be honest about that. It loads `flan-t5-large`, not the XL model, adds "not general and maximum 3 words" to the prompt and samples at a temperature of 0.2:

```python
def representation_generator(keyword_list):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = "google/flan-t5-large"
    generator = pipeline('text2text-generation', model=model, device=device)
    representation_list = []
    for keywords in tqdm(keyword_list, desc="Generating representations..."):
        prompt = "Given the following phrases, come up with a topic name that is specific and precise, not general and maximum 3 words: [KEYWORDS]"
        keyword_string = ', '.join(keywords)[:2000]
        prompt = prompt.replace('[KEYWORDS]', keyword_string)
        representation_list.append(representation_generator_helper(generator, prompt))
    return representation_list

def representation_generator_helper(generator, prompt):
    representation = generator(
        prompt,
        max_length=10,
        do_sample=True,
        temperature=0.2
    )[0]['generated_text']
    return representation
```

Two things in here matter more than they look. First, `do_sample=True`: a low temperature makes sampling very peaked, but it is still sampling. If the goal is the same name on every rerun, `do_sample=False` (greedy decoding) is the actual switch. Second, `max_length=10` caps the output at ten tokens, which forces short labels regardless of what the prompt says.

The whole thing runs locally through a `transformers` pipeline, on the GPU if there is one. The model is called once per cluster, so a few dozen calls per run.

Why a small local model and not GPT-4 through an API? A few dozen calls per run sounds cheap, but nobody runs this once. While the clustering parameters were still moving, every change to `min_cluster_size` or the perplexities meant new clusters and a fresh round of names, and over the course of development that adds up to a lot of runs. With an API, each of those costs money, and the bill grows exactly while you are still trying things out. flan-t5-large has about 780M parameters and flan-t5-xl about 3B; both fit on the GPU in my workstation, so a rerun costs a few seconds and nothing else.

There is also a reason that has less to do with this project. I am interested in what small models can do on hardware you already own, from a workstation GPU down to edge devices. Naming clusters is a good test for that: a narrow task with short inputs and short outputs, where a model of under a billion parameters should be enough. Mostly, it was.

## What the model actually sees

The prompt is built from the cluster's members in the order they come out of the dataframe, joined with commas and cut at 2,000 characters. In the run in the notebook, that order is by importance weight, so the most AI-typical phrases come first. Sounds sensible. In practice, the top of the graph neural network cluster looks like this:

```text
graph neural network, graph neural networks based, graph neuralnetworks,
graph neural networkand, graph neural network based, ...
```

Five spellings of the same concept, all with the identical weight (8.59, the top of the list), eating the start of the prompt. "graph neuralnetworks" and "graph neural networkand" are preprocessing leftovers from abstracts where spaces went missing, and lemmatisation does not fix glued words.

The 2,000-character cut also does not protect the model's input limit. The notebook output contains this warning from the tokenizer:

```text
Token indices sequence length is longer than the specified maximum
sequence length for this model (523 > 512).
```

512 tokens is the input length T5 was trained with, and 2,000 characters of comma-separated technical phrases can tokenize into more than that. Whatever happens past position 512, it is not what the model was trained for.

## What came out

Here are the 25 seed clusters as they appear in the paper.

![2D scatter of the initial AI concept clusters with topic names](/assets/img/blog/ai-concept-list/seed-clusters.png)
*Figure 4: the seed concepts in TSNE space, coloured by HDBSCAN cluster and labelled with their generated topic names. Look at the spread: "face recognition" and "3d point cloud classification" next to "matrix" and "derivative".*

Many names are good. "Face recognition", "video segmentation", "multi agent system", "audio classification" and "3d point cloud classification" are specific and you can check them against the members in seconds. The paper's discussion points out exactly this mix: topics that come from PapersWithCode tasks, like face recognition, next to foundational ones, like reinforcement learning.

Others are too broad to be useful as a topic: "matrix", "derivative", "correlation coefficient", "neural network". These are the more mathematical clusters, and for them "specific and precise" just produced a single generic term. "Backstepping", a control technique, reads more like one member phrase than a summary of a cluster. And one cluster is labelled "abbreviations". That is the cluster of short forms like "gnn" and "rnn", and it is excluded from the nearest-neighbour extension because semantic similarity between acronyms is not interpretable.

The repo notebook shows the same patterns more bluntly. It clusters a different, larger version of the list (16,277 phrases) into 18 clusters plus noise, and its first output rows are:

| Cluster members (start) | Generated name |
|---|---|
| graph neural network, graph neural networks based, ... | graph convolution network |
| variational autoencoders latent, variational ... | variational autoencoders |
| generative adversarial network based, generat... | adversarial attack |
| carlo tree search, monte carlo tree search, ... | evolutionary algorithm |
| (noise points) | deep learning |

"Variational autoencoders" is right. "Graph convolution network" is close but narrower than the cluster. "Adversarial attack" for a cluster about generative adversarial networks is a false friend: the shared word "adversarial" won. And Monte Carlo tree search is not an evolutionary algorithm, though both are search methods. The noise points got "deep learning", which is the kind of answer you get when you ask a model to summarise everything at once. The notebook overwrites that label with "noise" before plotting.

After the clusters were extended, the picture looks like this:

![Cluster centroids with their k-nearest neighbours](/assets/img/blog/ai-concept-list/centroids-knn.png)
*Figure 5: the cluster centroids with the candidate phrases from PapersWithCode abstracts that their k-nearest-neighbour search picked up. Only a few candidates are actually added, because many overlap with the seed list. Positions differ from Figure 4 because of the TSNE step.*

## What I would change

Most fixes are small. Deduplicate near-identical members before building the prompt, so five spellings of "graph neural network" become one. Sort members by distance to the centroid instead of by weight, so the prompt starts with the most typical phrases rather than the most AI-heavy ones. Cap the prompt in tokens, not characters. Use greedy decoding if reproducibility is the point. None of this needs a bigger model.

The bigger gap is evaluation. The pipeline itself does not check whether a name fits its cluster, and the table above shows why that matters: "adversarial attack" sounds perfectly reasonable unless you read the members.

For the paper I did a manual sanity check: I read the members behind roughly 10% of the generated names and compared them with the label. That spot check came out fine, and the names went into the figures as they were. It is a sanity check, not an evaluation. A proper one would have several people rate how well each name fits its members, or ask whether a reader can match names back to clusters, and it would rerun the naming a few times to see how stable the labels are.

The notebook with the clustering and naming step is [`06_Data_Visualization.ipynb`](https://github.com/J0nasW/AI-Dictionary/blob/main/06_Data_Visualization.ipynb) in the AI-Dictionary repo, if you want to see the full output yourself.
