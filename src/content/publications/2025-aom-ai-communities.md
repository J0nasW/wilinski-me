---
title: "Attention-Based Concept Mining and Community Detection in AI Research"
authors: ["Jonas Wilinski"]
venue: "Academy of Management Annual Meeting"
year: 2025
link: "https://www.aom.org/events/annual-meeting/"
linkText: "Conference Website"
pdf: "/assets/pdf/aom_poster_2025_jw.pdf"
tldr: "This paper proposes a dual-layered framework merging attention-based concept mining with co-authorship network analysis to visualize the emergence and diffusion of AI innovations. It overcomes traditional bibliometric limitations by linking specific technical concepts to the evolution of collaborative structures within the scientific community."
keyPoints:
  - "Attention-Based Mining: Integrates frequency and dictionary-based techniques with transformer attention maps to accurately identify high-impact AI concepts while filtering out noise."
  - "Network Dynamics: Constructs temporal co-authorship networks populated with these concepts to track concept drift and identify how new ideas catalyze interdisciplinary partnerships."
  - "Comprehensive Dataset: Builds an extensive knowledge graph using data from 500,000 papers in PapersWithCode, enriched with metadata and full texts from OpenAlex and SemanticScholar."
  - "Diffusion Analysis: Demonstrates that linking concept adoption to network dynamics provides a robust empirical basis for understanding how innovations propagate and reshape research communities."
---
Artificial Intelligence (AI) research has grown at a fast pace in recent years, introducing a variety of new methods (e.g., Large Language Models), specialized datasets (e.g., ImageNet), and emergent tasks (e.g., multi-modal text generation). Traditional bibliometric analyses shed light on publication volumes and co-authorship patterns but often fail to capture the specific concepts that underlie these collaborations. To address this gap, we propose a two-tiered approach that merges attention-based concept mining with co-authorship network analysis. First, we integrate frequency-based and dictionary-based techniques, guided by anchor-phrases, to train a neural network that identifies not only high-frequency AI terms but also rare, high-impact concepts. By leveraging attention maps from a pre-trained transformer, we reduce noise—distinguishing genuine new ideas like “Vision Transformer” from random token clusters. Second, we situate these concepts in temporal co-authorship networks, applying community detection to reveal where innovations emerge, how they travel across research subfields, and what collaboration patterns accelerate or inhibit their diffusion. This synthesis provides a robust framework for research methods, enabling richer inquiries into how AI knowledge diffuses and reshapes scientific collaboration.
