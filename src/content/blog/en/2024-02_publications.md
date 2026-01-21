---
title: 'Engineering the Corpus: Challenges in High-Throughput Scientific Data Acquisition'
description: 'After gathering some experience in both corporation and start-up, I am back to academia to get my hands on cutting edge research on LLMs, NLP and Concept Extraction.'
pubDate: '2024-02-13'
heroImage: '/assets/img/title_img/bg02-unsplash.jpg'
heroImageAttribution: 'unsplash'
heroImageCredit: 'Maxim Berg'
heroImageLink: 'https://unsplash.com/de/fotos/wellenformige-violette-linien-auf-schwarzem-hintergrund-T86P5pASsV0'
tags: ['general', 'phd', 'data engineering', 'infrastructure', 'open science']
---

In the previous entry, I outlined the theoretical objective of this doctoral project: quantifying the diffusion of AI concepts across the global scientific landscape. However, the gap between theoretical availability of data and practical accessibility is significant. While "Open Science" is a prevalent mandate, the actual infrastructure required to aggregate, normalize, and store 100 million+ scientific documents does not exist off-the-shelf.

Over the past quarter, the focus of the research has shifted entirely to Data Engineering. To analyze the network of science, we must first reconstruct it locally.

# The Heterogeneity Problem

The primary obstacle in large-scale bibliometric analysis is the lack of a unified schema. Scientific knowledge is fragmented across:

Aggregators: Services like OpenAlex or Semantic Scholar provide high-quality metadata (JSON) but often lack full-text access for deep semantic analysis.

Publisher Silos: Full-text HTML/XML is available but hidden behind diverse paywalls, rate limits, and non-standardized DOM structures.

The PDF Standard: A significant portion of older (and current) research exists solely as PDF—a format designed for visual printing, not machine readability.

To address this, I have begun development on PubCrawl, a custom acquisition framework designed to handle the ingestion of heterogeneous scientific data streams.

## PubCrawl: Architecture and Ethics

The design philosophy of PubCrawl is centered on ethical, high-throughput harvesting. When targeting millions of endpoints, standard sequential scraping (e.g., simple requests loops) is insufficient due to I/O blocking. Conversely, uncontrolled asynchronous scraping risks becoming a Denial-of-Service (DoS) attack on source servers.

The framework implements:

Asynchronous I/O: Utilizing Python’s asyncio and aiohttp to manage thousands of concurrent connections while minimizing overhead.

Polite Concurrency: A strict implementation of robots.txt parsing and per-domain rate limiting. The goal is to maximize throughput without triggering defensive blocks from institutional repositories.

Header Rotation & Session Management: Managing the persistency of sessions to navigate authentication barriers for open-access institutional subscriptions.

From Unstructured Web to Structured Graph
Acquisition is only the first step. The raw data—a mix of JSON, HTML, and binary PDF streams—must be normalized into a computable format.

We are observing a massive "parsing bottleneck." Extracting clean text from double-column PDFs, removing headers/footers, and correctly identifying figure captions requires distinct pipelines. I am currently integrating OCR and layout analysis tools to convert these binary streams into plain text suitable for NLP downstream tasks.

This normalized data is then being fed into PubGraph, a preliminary graph schema I am designing to store the relationships. In this model, documents, authors, and venues become nodes, while citations and co-authorships form the initial edge list.

# Current Status and Bottlenecks

The pipeline is currently stable at a ingestion rate of approximately 50,000 documents per hour. However, this throughput has exposed a new limitation: Storage I/O.

Writing millions of small JSON/text files to a standard file system is introducing significant latency (the "many small files" problem). As the corpus grows towards the terabyte scale, the current local workstation setup is reaching saturation.

The next phase of research will require migrating this storage architecture to a more robust database solution capable of handling the high-write load and eventual complex querying required for the analysis.
