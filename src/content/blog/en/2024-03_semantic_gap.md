---
title: 'The Semantic Gap: Why Keywords Fail to Capture Innovation'
description: 'ABC'
pubDate: '2024-03-15'
heroImage: '/assets/img/title_img/bg06-unsplash.jpg'
heroImageAttribution: 'unsplash'
heroImageCredit: 'Aron Yigin'
heroImageLink: 'https://unsplash.com/de/fotos/ein-schwarzer-hintergrund-mit-blauen-linien-darauf-Ba6CjJFZMb4'
tags: ['nlp', 'science of science', 'semantic networks', 'python']
---

In my last update, I documented the engineering required to overcome the algorithmic bottlenecks of searching through 100 million documents. `SynapseTrie` solved the compute problem, bringing our extraction time down from weeks to seconds by optimizing exact string matching.

But solving the engineering bottleneck only exposed a deeper, methodological flaw in the research design itself. `SynapseTrie` is blazingly fast, but it is entirely literal. To a prefix tree, the phrases "multi-layer perceptron", "deep neural network", and "deep learning" share no overlapping characters, and therefore, no connection. Yet, conceptually, they describe the same evolutionary thread of technology.

If the goal of my PhD is to measure the diffusion of Artificial Intelligence across the scientific landscape, I cannot rely on static keywords. Science is dynamic, and the language used to describe it exhibits severe "semantic drift" over time.

### AI as a General Purpose Technology (GPT)

To understand why this is critical, we have to look at how AI operates within the broader scientific ecosystem. We are witnessing a rapidly evolving landscape of technological advancements in the field of Artificial Intelligence. The versatility of AI in solving complex problems across different fields—from medicine to environmental science—is indicative of its role as a General Purpose Technology (GPT).

A GPT is defined as an interrelated technology with extensive applicability across various sectors and high technological dynamism. Because AI acts as a GPT, we find *unconventional* applications in subjects that traditionally relied on conventional methods.

The problem is *measurement*. Traditional quantitative metrics for technology innovation rely heavily on patent filings or R&D investments. While these are foundational, they often miss the contextual subtleties of technological advancements. Even metadata analysis of citation networks falls short when trying to capture the actual content and nuanced flow of a methodology from computer science into applied physics.

### Crossing the Semantic Gap

To measure the diffusion of a GPT accurately, text-based approaches leverage the rich information embedded in the documents themselves. We have to move from matching strings to matching *meanings*.

Fundamental to this approach is the use of concepts and conceptual spaces. By utilizing state-of-the-art word embeddings from large language models, we can represent keyphrases in a high-dimensional vector space and calculate semantic similarities.

Instead of searching for exact keyword matches, our pipeline now embeds candidate concepts using the Sentence Transformers library, specifically utilizing the "SciNCL" model. This specific embedding model was meticulously tuned to scientific language and allows for a good clustering performance on scientific topics.

By projecting text into a 768-dimensional space, we can use cosine similarity to find nearest neighbors. In this latent space, terms like "neural network" and "artificial neural network-based" are positioned in close proximity due to their semantic relationship.

### Introducing "The AI Innovation Compass"

This realization—that measuring innovation requires a semantic network rather than a keyword dictionary—forms the basis of my current working paper, which I am thrilled to share has been submitted for presentation at the DRUID 2024 conference.

The paper, titled *"The AI Innovation Compass: Constructing Semantic Networks from AI Concepts to Identify and Measure Technology Innovation"*, details our end-to-end methodology for building a dynamic ontology of AI.

Here is a brief look under the hood at the methodology we developed:

* **Data Acquisition:** We manually created a list of AI concepts compiled from the indices of well-known books, the Computer Science Ontology, and enriched them with tasks and methods from the active PapersWithCode dataset.
* **Pre-Processing:** We implemented a rigorous pipeline utilizing the YAKE keyphrase extractor, alongside lemmatization and noun-chunk checking to ensure candidate phrases were significant, descriptive, and in canonical form.
* **Clustering:** To group our embedded concepts into topics, we utilized Hierarchical Density-Based Spatial Clustering of Applications with Noise (HDBSCAN), which is adept at mitigating the influence of outlier cases.
* **Validation:** To ensure these concepts actually distinguish AI research from other fields, we built a massive phrase-document matrix and utilized a logistic regression model. The learned coefficients from this regression were then normalized to assign importance weights to the keyphrases.

The result is a robust, weighted AI Concept List consisting of 10,797 high-quality AI Concept Phrases.

### **What's Next?**

By treating AI concepts as nodes and their occurrences within documents as edges, we can construct a semantic network that represents the relationships inherent in the corpus. Preliminary findings unveil a steady rise in the prevalence of AI concepts across certain research domains.

I am looking forward to presenting these findings to the community at DRUID this summer. The transition from pure data engineering to applied quantitative social science is fully underway. The code and the dataset will be open-sourced alongside the presentation.
