---
title: 'First Months: Engineering as Productive Procrastination'
description: 'Finding my path in the PhD journey. While the exact research direction is still fuzzy, I am tackling the immediate technical hurdles of large-scale data acquisition.'
pubDate: '2023-02-13'
heroImage: '/assets/img/title_img/bg02-unsplash.jpg'
heroImageAttribution: 'unsplash'
heroImageCredit: 'Maxim Berg'
heroImageLink: 'https://unsplash.com/de/fotos/wellenformige-violette-linien-auf-schwarzem-hintergrund-T86P5pASsV0'
tags: ['phd', 'data engineering', 'infrastructure', 'reflection']
---

It has been a couple of months since I started my PhD journey. In my last post, I talked about the excitement of returning to academia. Now, the reality has set in. To be honest, I am still wrestling with the specific direction of my research. "Science of Science" is huge. "Diffusion of Concepts" is fascinating but abstract. While I spend days reading papers and trying to formulate a concrete hypothesis, I often feel stuck. So, I did what any former software engineer would do when faced with existential research uncertainty: I started coding. If I don't know *exactly* what I'm looking for yet, I might as well gather *everything* so I have it ready when I do know. And so I started working on **PubCrawl**.

## The "Simple" Task of Downloading Science

It sounds pretty straightforward. Connect to an API, download the papers, start analyzing. But as always, the gap between theoretical availability of data and practical accessibility is significant. While "Open Science" is a prevalent mandate, the actual infrastructure required to aggregate, normalize, and store 100 million+ scientific documents doesn't simply exist off-the-shelf.

## The Problem

I was working on an NLP project that required a corpus of scientific papers. Specifically, I needed full-text content from papers in specific arXiv categories — not just abstracts, but the actual body text, cleaned up enough for topic modeling and text analysis.

This sounds straightforward until you try to do it. The reality is:

1. **Getting the papers is annoying.** ArXiv has an API, but it's designed for searching, not bulk downloads. The actual PDFs live in a Google Cloud bucket. To know which papers to download, you need metadata — which lives in a separate Kaggle dataset as a 4GB JSON file.

2. **PDFs are terrible.** Scientific PDFs are a special kind of terrible. Two-column layouts, embedded LaTeX, figures breaking up text, headers and footers on every page, citation markers scattered everywhere. Converting a PDF to clean text is an unsolved problem dressed up as a solved one.

3. **The cleaning never ends.** Even after you extract text, you get unicode ligatures, `(cid:XX)` artifacts from broken font encodings, leftover LaTeX commands, and non-English words from multilingual references. Every paper has its own special flavor of garbage.

I looked for existing tools that handled this end-to-end. Some handled metadata, some handled PDF conversion, some handled text cleaning — but nothing combined them into a single pipeline. So I built one.

## What PubCrawl Does

PubCrawl is a command-line tool that takes you from "I want papers about X" to "here's a clean JSON dataset" in one command. The pipeline works like this:

**Metadata → PDFs → Text → Clean Text → JSON**

For arXiv, the workflow is:

1. Load the Kaggle arXiv metadata JSON (the full dump of all arXiv papers)
2. Filter by category — supporting AND/OR logic for multiple categories
3. Download PDFs in bulk from Google Cloud using `gsutil`
4. Convert PDFs to text using `pdftotext` (with `pdf2txt.py` as a fallback)
5. Clean the text — unicode normalization, LaTeX removal, English word filtering via NLTK
6. Merge the full text back with the metadata
7. Output a single line-delimited JSON file

The whole thing runs from the command line:

```bash
python main.py -s arxiv -f arxiv-metadata.json -c "cs.AI AND cs.CL" -p
```

That gives you a JSON file where each line is a paper with its metadata and cleaned full text. Ready for whatever downstream analysis you want to do.

## The Architecture

I designed PubCrawl to be extensible. The datasource abstraction means you can plug in new sources — arXiv today, PubMed and Semantic Scholar tomorrow. Each datasource handles its own download logic and outputs a standardized DataFrame that feeds into the shared processing pipeline.

```
Datasources          Pipeline              Output
───────────         ─────────             ──────

arXiv     ──┐      PDF → Text
             ├───>  Text Cleaning  ───>  JSON
Local PDFs ─┘      Metadata Merge
PubMed (planned)
```

The PDF-to-text conversion runs on multiple cores using Python's `multiprocessing.Pool`. On my machine with 10 cores, it processes about 500 papers per minute. The conversion is the bottleneck — downloads from GCP are fast since `gsutil` handles parallel transfers natively.

For the text extraction itself, I'm standing on the shoulders of the [arxiv-public-datasets](https://github.com/mattbierbaum/arxiv-public-datasets) project by Matt Bierbaum and others. Their `fulltext` function tries `pdftotext` first, then falls back to `pdf2txt.py`, and checks the average word length to detect garbled output. If the word length is too high (meaning words are concatenated), it retries with positional analysis. It's a clever heuristic approach and handles maybe 85% of papers correctly.

## The Text Cleaning Problem

This is where I spent most of my time, and honestly, it's the part I'm least satisfied with.

Scientific PDFs produce text that is technically correct but practically useless for NLP. Here's what a typical extracted paragraph looks like before cleaning:

```
the re\x00sults of our experi-
ment show that the trans- former (cid:42)(cid:43) architec-
ture [12, 15] outperforms the LSTM base- line by
≈ 3.2% on the BLEU metric (see Ta-ble 3).
```

My cleaning pipeline runs about 20 regex passes over the text:

- Remove everything before "Introduction" (strips title pages and abstracts)
- Fix hyphenated line breaks (`trans-\nformer` → `transformer`)
- Strip `(cid:XX)` artifacts from broken fonts
- Remove LaTeX commands, equations, and special characters
- Normalize unicode ligatures (ﬁ → fi, ﬂ → fl, etc.)
- Filter out non-English words using NLTK's word corpus
- Remove single characters and repeated punctuation

Is it perfect? No. The Introduction-stripping heuristic sometimes cuts into the actual content. The English word filter removes legitimate technical terms. The regex ordering matters and I've probably got some interactions I haven't caught.

But for topic modeling and basic text analysis, the output is clean enough. And "clean enough" is the goal — if I needed perfect extraction, I'd be hand-annotating papers, not building a pipeline.

## What I Learned

**PDF processing is a dark art.** There's a reason every PDF-to-text tool has a different set of tradeoffs. `pdftotext` (from Poppler) is fast and handles simple layouts well, but struggles with two-column papers. `pdf2txt.py` (from pdfminer) is slower but handles complex layouts better. Neither handles embedded equations. The "right" approach is probably something like GROBID that uses machine learning for document understanding, but that requires running a Java service and felt like overkill for this project.

**Regex cleaning is unglamorous but essential.** I spent more time writing and debugging text cleaning regex than on any other part of the project. It's not impressive code. It's not elegant. But it's the difference between a usable corpus and garbage.

**`gsutil` is surprisingly good.** Google's CLI tool for Cloud Storage handles parallel downloads, retries, and large file lists without breaking a sweat. The arXiv GCP bucket is publicly accessible, and downloading thousands of PDFs is genuinely fast.

**The Kaggle arXiv dataset is underappreciated.** It's a complete metadata dump of every arXiv paper — over 2 million entries with IDs, titles, abstracts, categories, authors, and version history. For any arXiv-related project, this is the starting point.

## What's Next

PubCrawl currently supports arXiv and local PDFs. I want to add:

- **PubMed** — Similar pipeline but using PubMed's E-utilities API for metadata and PMC for full text
- **Semantic Scholar** — Their API has good coverage and provides abstracts without needing PDFs
- **Downstream task integration** — I've started working on [PubGraph](https://github.com/J0nasW/PubGraph) for building citation graphs from the output. The idea is that you can pipe PubCrawl output directly into analysis tools.
- **Better text extraction** — Looking at GROBID for structured parsing, which would give us section headers, references, and figure captions as separate fields instead of one blob of text.

The code is [on GitHub](https://github.com/J0nasW/PubCrawl) if you want to try it or contribute. It's early-stage and rough around the edges, but it works.

## On Productive Procrastination

Did I build PubCrawl because I needed it, or because building it was more fun than the actual research? Honestly, both.

The tool saved me real time. Without it, I would have spent days manually downloading papers, running `pdftotext` in a shell loop, and writing ad-hoc cleaning scripts. With PubCrawl, I got my corpus in about an hour (plus the time waiting for downloads).

But I also spent at least two weeks building and polishing PubCrawl when a more focused approach — download the specific papers I needed, write a quick script, move on — would have taken two days. The extensible architecture, the multi-datasource design, the CLI with pretty colored output... none of that was strictly necessary.

I think productive procrastination gets a bad rap. Yes, I over-engineered it. Yes, I could have been more efficient. But I now have a reusable tool, I understand PDF processing much better, and I have a blog post about it. The ROI isn't great if you measure it in papers-per-hour, but learning rarely optimizes for that metric. Sometimes the best way to learn is to build something slightly more ambitious than you need. Just make sure you eventually use it for the thing you were supposed to be doing in the first place.

---

*PubCrawl is open source at [github.com/J0nasW/PubCrawl](https://github.com/J0nasW/PubCrawl). Feedback welcome, especially if you want to help with the PubMed datasource.*
