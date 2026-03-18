---
title: 'Visualizing Invention: Fine-Tuning SBERTa on the USPTO Dataset'
description: 'Insert Description'
pubDate: '2024-05-10'
heroImage: '/assets/img/title_img/bg07-unsplash.jpg'
heroImageAttribution: 'unsplash'
heroImageCredit: 'Ashkan Forouzani'
heroImageLink: 'https://unsplash.com/de/fotos/rote-weisse-schwarze-und-rosa-abstrakte-kunstwerke-bJWLRgwm0Fw'
tags: ['nlp', 'machine learning', 'embeddings', 'patents']
---

As established in my previous logs, relying on exact string matching to map scientific innovation is inherently flawed due to semantic drift. We must project documents into a latent vector space to measure their true conceptual distance.

While applying this to academic abstracts via "SciNCL" provided a solid baseline, mapping the diffusion of an idea from a university lab into industrial application requires crossing over into patent data. Specifically, the United States Patent and Trademark Office (USPTO) database.

Processing patent text presents a unique NLP challenge. Unlike academic papers, which generally aim to explain a method clearly, patent claims are written in highly stylized, legalistic language designed to be simultaneously precise in scope but maximally broad in application. A patent might never use the phrase "Convolutional Neural Network," instead describing "a plurality of interconnected processing nodes configured to perform spatial feature extraction." Standard pre-trained models fail to capture this semantic linkage.

To bridge this gap, I developed `patentCL`, an experimental pipeline utilizing Contrastive Learning to fine-tune a Sentence-BERT (SBERTa) architecture specifically for patent data.

### **The Contrastive Approach**

The core intuition behind Contrastive Learning is relatively straightforward: we want the model to pull representations of similar patents closer together in the high-dimensional vector space, while pushing dissimilar patents apart.

Rather than relying on human-annotated labels—which are impossibly expensive to acquire at the scale of millions of patents—we construct a self-supervised task.

1. **Positive Pairs:** We leverage the existing (albeit noisy) metadata. If two patents share multiple, highly specific Cooperative Patent Classification (CPC) codes and cite the same foundational academic papers, we treat them as a positive pair.
2. **Negative Pairs:** We sample patents from disparate technological domains (e.g., a patent on autonomous navigation vs. a patent on chemical fertilizers).
3. **The Loss Function:** By utilizing a contrastive loss function (such as InfoNCE), we force the SBERTa model to adjust its weights so that the cosine similarity of positive pairs approaches $1$, and negative pairs approach $-1$.

### **Visualizing the Latent Space**

The objective of `patentCL` was not just to improve search, but to create a topological map of industrial innovation. Once the model was fine-tuned, we embedded a large sample of recent AI-related patents and projected their 768-dimensional vectors down to two dimensions using UMAP (Uniform Manifold Approximation and Projection).

The results are highly revealing. Without being explicitly programmed to do so, the model's latent space organically clustered the patents into distinct technological neighborhoods. Furthermore, by calculating the density and vector trajectories of these clusters over time, we can visualize the "bleeding edge" where AI software algorithms begin to physically manifest in hardware patents.

The `patentCL` repository contains the PyTorch implementation of the fine-tuning loop and the necessary data loaders to handle the raw USPTO XML dumps. The next step is to integrate these patent embeddings with the academic paper embeddings, creating a unified graph that models the entire lifecycle of an algorithmic concept.
