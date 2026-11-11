---
title: "SciEmbed: Citation-Context Supervision for Scientific Document Embeddings"
authors: ["Jonas Wilinski", "Michael Färber"]
venue: "Empirical Methods in Natural Language Processing (EMNLP) 2026 - ACL"
year: 2026
logo: "/assets/img/venues/emnlp-2026.png"
pdf: "https://aclanthology.org/2026.findings-emnlp.2057.pdf"
link: "https://aclanthology.org/2026.findings-emnlp.2057/"
linkText: "ACL Anthology"
links:
  - { label: "Code", url: "https://github.com/J0nasW/SciEmbed-release" }
  - { label: "OpenReview", url: "https://openreview.net/forum?id=yfFMj23hmI" }
  - { label: "Hugging Face models", url: "https://huggingface.co/models?author=J0nasW&search=sciembed" }
bibtex: |
  @inproceedings{wilinski-farber-2026-sciembed,
      title = "{S}ci{E}mbed: Citation-Context Supervision for Scientific Document Embeddings",
      author = {Wilinski, Jonas  and
        F{\"a}rber, Michael},
      editor = "Lee, Hung-Yi  and
        Dev, Sunipa  and
        Li, Jessy  and
        Elliott, Desmond",
      booktitle = "Findings of the {A}ssociation for {C}omputational {L}inguistics: {EMNLP} 2026",
      month = oct,
      year = "2026",
      address = "Budapest, Hungary",
      publisher = "Association for Computational Linguistics",
      url = "https://aclanthology.org/2026.findings-emnlp.2057/",
      pages = "43793--43819",
      ISBN = "979-8-89176-462-0"
  }
tldr: "SciEmbed is a 149M-parameter scientific document embedder (ModernBERT-base, 8K context) trained with citation context sentences as the primary contrastive signal. It scores 66.85 on SciRepEval, ahead of SPECTER2, SciNCL and BGE-large, and leads all compared models on the regression tasks."
keyPoints:
  - "Citation contexts as supervision: the sentences in which papers cite each other serve as the main contrastive training signal, on top of citation edges."
  - "Two-stage training: masked-language-model domain adaptation on scientific text (4×H200, 16 h), followed by contrastive training on up to ~30M pairs."
  - "SciRepEval 66.85 overall (3 seeds): above SPECTER2 (66.4), SciNCL (65.4) and BGE-large (66.5), 0.6 behind Granite Embedding R2, but +2.3 ahead on the regression cluster."
  - "Open release: code, configs, evaluation results and six checkpoints (512 to 8192 tokens context) under MIT license on Hugging Face."
---
