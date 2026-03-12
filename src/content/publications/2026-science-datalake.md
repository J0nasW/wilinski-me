---
title: "The Science Data Lake: A Unified Open Infrastructure Integrating 293 Million Papers Across Eight Scholarly Sources with Embedding-Based Ontology Alignment"
authors: ["Jonas Wilinski"]
venue: "arXiv Preprint"
year: 2026
link: "https://arxiv.org/abs/2603.03126"
linkText: "arXiv"
pdf: "/assets/pdf/2603.03126v1.pdf"
tldr: "We present the Science Data Lake, a locally-deployable open infrastructure built on DuckDB and Parquet files that unifies eight scholarly data sources (Semantic Scholar, OpenAlex, SciSciNet, Papers with Code, Retraction Watch, Reliance on Science, Preprint-to-Published, and Crossref) into a single queryable resource spanning 293 million papers. An embedding-based ontology alignment maps 4,516 OpenAlex topics to 13 scientific ontologies with F1 = 0.77, outperforming lexical baselines."
keyPoints:
  - "Multi-Source Integration: Unifies eight open scholarly databases into ~960 GB of Parquet files with 22 schemas and 153 SQL views, preserving each source's native schema for cross-source comparison at the record level."
  - "Embedding-Based Ontology Alignment: Maps 4,516 OpenAlex topics to 1.3 million terms across 13 scientific ontologies using BGE-large embeddings, achieving F1 = 0.77 and outperforming TF-IDF, BM25, and Jaro-Winkler baselines."
  - "Cross-Source Validation: 10 automated sanity checks pass without violations; pairwise citation correlations across S2AG, OpenAlex, and SciSciNet range from r = 0.76 to 0.87, confirming broad consistency while preserving independent counts for sensitivity analysis."
  - "Four Research Vignettes: Demonstrates analyses impossible with any single database, including disruption profiles of code-releasing papers, retraction enrichment by ontology domain, patent-citation impact footprints, and cross-source citation reliability."
  - "Open and LLM-Ready: Hosted on HuggingFace with a persistent DOI, deployable locally or queryable remotely via DuckDB, with structured SCHEMA.md documentation designed for LLM-based research agents."
---
Scholarly data are largely fragmented across siloed databases with divergent metadata and missing linkages among them. We present the Science Data Lake, a locally-deployable infrastructure built on DuckDB and simple Parquet files that unifies eight open sources — Semantic Scholar, OpenAlex, SciSciNet, Papers with Code, Retraction Watch, Reliance on Science, a preprint-to-published mapping, and Crossref — via DOI normalization while preserving source-level schemas. The resource comprises approximately 960 GB of Parquet files spanning 293 million uniquely identifiable papers across 22 schemas and 153 SQL views. An embedding-based ontology alignment using BGE-large sentence embeddings maps 4,516 OpenAlex topics to 13 scientific ontologies (1.3 million terms), yielding 16,150 mappings covering 99.8% of topics with F1 = 0.77 at the recommended operating point, outperforming TF-IDF, BM25, and Jaro-Winkler baselines on a 300-pair gold-standard evaluation. We validate through 10 automated checks, cross-source citation agreement analysis, and stratified manual annotation. Four vignettes demonstrate cross-source analyses infeasible with any single database. The resource is open source, deployable on a single drive or queryable remotely via HuggingFace, and includes structured documentation suitable for large language model (LLM) based research agents.
