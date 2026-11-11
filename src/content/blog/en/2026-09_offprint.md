---
title: 'Offprint: PDF to Markdown, entirely on my Mac'
description: 'Offprint is a native macOS app that turns PDFs into Markdown and JSON locally, with columns in reading order, tables kept as tables and maths as LaTeX. Notes on how it decides per page, and what broke along the way.'
pubDate: '2026-09-08'
heroImage: '/assets/img/title_img/bg14-unsplash.jpg'
heroImageAttribution: 'unsplash'
heroImageCredit: 'Camilo Rueda López'
heroImageLink: 'https://unsplash.com/photos/3CLPBgNuX40'
tags: ['pdf', 'macos', 'open source', 'tools']
draft: false
---

Back in the [PubCrawl post](/en/blog/2023-02_publications/) I wrote that converting a PDF to clean text is "an unsolved problem dressed up as a solved one". My pipeline back then was `pdftotext` with `pdf2txt.py` as a fallback and a word-length heuristic to catch garbled output, which got maybe 85% of papers right. Two-column layouts were the weak spot, equations were simply lost, and GROBID felt like too much infrastructure for a side tool.

Three and a half years later the recognition side looks very different. The [Offprint README](https://github.com/J0nasW/offprint) puts it like this: a 0.9B open model now scores 95.22 on OmniDocBench v1.6, above Gemini 3 Pro (92.91) and GPT-5.2 (86.59). That model is GLM-OCR, and those are published benchmark numbers for it, not something I measured. What matters for me is the last part of the sentence: it runs on a laptop, in 1.25 GB at 4-bit.

So I built [Offprint](https://github.com/J0nasW/offprint), a native SwiftUI app for Apple Silicon that turns PDFs into Markdown and JSON without an account, an upload or a per-page bill. Version 0.1.0 went out on 8 September, MIT licensed.

<img src="/assets/img/blog/offprint/icon.png" alt="Offprint app icon" width="128" height="128" />

The reason I finally sat down and built it was not a single bad PDF. I wanted my documents in one flat, searchable place as plain Markdown, the same files readable in Obsidian, searchable in VS Code and usable by AI tools, without a folder hierarchy that only makes sense to whoever created it. PDFs are the one format that does not fit that picture, so Offprint turns them into files that do.

## The real problem is reading order

Most PDF converters read a two-column paper wrong, and they do it quietly. `PDFPage.string` returns characters in content-stream order, which is the order the file happens to store them in. On a two-column page that interleaves the columns into fluent text that says something the paper never said. Nothing downstream can notice, because the output still reads like English.

Offprint ignores that order and rebuilds it from geometry. It looks for a vertical strip in the middle half of the page that no line crosses, ignores full-width elements like a title or a wide table while searching, and then reads the left column to the bottom before starting the right one. This is the core of it, from `ReadingOrder.swift`:

```swift
// Scan the middle half of the page for a vertical strip nothing crosses.
let step = pageWidth / 200
var best: (x: Double, clearance: Double)?
var x = pageWidth * 0.25
while x <= pageWidth * 0.75 {
    let crossing = candidates.contains { $0.minX < x && $0.maxX > x }
    if !crossing {
        let clearance = candidates.reduce(Double.greatestFiniteMagnitude) { acc, b in
            min(acc, b.maxX <= x ? x - b.maxX : b.minX - x)
        }
        if best == nil || clearance > best!.clearance { best = (x, clearance) }
    }
    x += step
}
```

A gutter only counts if its clearance is more than 1.5% of the page width and both sides hold at least two elements, and the split recurses at most twice. Getting the geometry was its own fight: `characterBounds(at:)` does not share an index space with `string`, and the mapping drifts by a couple of characters per line, which silently truncated every line. Offprint now takes only the geometry from it and reads each row's text back with `selection(for:)`.

<!-- Screenshot to add (a real one, not AI-generated): before/after of one two-column paper page: the original PDF page on the left, Offprint's Markdown output for the same page on the right (ideally with the naive interleaved `pdftotext` output as a third panel). -->

## Deciding per page

Offprint routes each page on its own. Hybrid documents are common (think of a born-digital report with scanned appendices), and treating a whole document as one thing gets half of it wrong. A `PageClassifier` checks whether the embedded text layer can be trusted: character density, the share of characters that look like broken encoding, whether fonts are embedded, and whether the text layer has any geometry at all.

One detail I like in there: the density threshold is set deliberately close to zero (0.08 characters per 1000 pt², where a dense A4 page of prose sits around 6). A cover page or a section divider has a sparse but perfectly good text layer. Sending it to OCR reads the artwork instead, and the logos come back as headings that pollute the outline of the whole document. A multi-column layout is recorded but does not disqualify the text layer, because the reading order is rebuilt anyway.

On top of the classifier sit three quality settings. Speeds are seconds per page on an M1 Pro, measured with the project's own harness:

| Setting | What runs | Speed | Download |
|---|---|---|---|
| Fast | The PDF's own text layer, Apple Vision where it cannot be trusted | 0.04–0.8 s | none |
| Balanced | GLM-OCR reads whatever the text layer cannot describe | ≈4 s | 1.25 GB |
| Best | GLM-OCR reads every region of every page | ≈23 s | same model |

Fast handles most born-digital PDFs completely, and its text is exact because it comes from the file, not from a guess about pixels. A 125-page report takes about 40 seconds on Fast.

## Apple Vision for layout, GLM-OCR for recognition

The design turns on one split. GLM-OCR was built to sit behind a layout detector, not to read whole pages. Instead of porting that detector, Offprint uses Apple's `RecognizeDocumentsRequest` (macOS 26 and later), which already returns tables with merged-cell ranges, lists with marker types and paragraph grouping. It runs on the Neural Engine and costs no download.

How much the regions matter was very visible in testing. On a dense two-column journal page, one GLM-OCR pass over the whole page recovered 20% of the text and stopped. The same page cut into eleven paragraph regions came back complete. Tall regions get split too: a paragraph of about 90 pt transcribes perfectly, while a 712 pt column loses a third of its words, so anything above 260 pt is cut. Generation is capped at 6,000 tokens per page because document OCR models are known to fall into repetition loops on dense pages, and without a cap that becomes a hang.

GLM-OCR runs through MLX Swift, and that was a deciding factor: according to the code comments it is the only one in its class with a first-class Swift implementation in MLX, so there is no Python anywhere. The model emits Markdown, which Offprint parses back into its own block tree, so a model-read page and a text-layer page look identical downstream. The weights land in Application Support, excluded from Time Machine, where Settings can show their size and delete them, instead of hiding in a dot-directory.

<!-- Screenshot to add (a real one, not AI-generated): screenshot of the Offprint app window: drop zone and queue on the left, the quality setting, and the live Markdown preview of a converted paper. -->

## One block tree, two outputs

Markdown and JSON are rendered from the same block tree, so they cannot disagree:

```json
{
  "source": { "filename": "paper.pdf", "pages": 22 },
  "engine": { "tier": "fast", "appVersion": "0.1.0" },
  "pages": [{
    "index": 0, "width": 595, "height": 841,
    "blocks": [
      { "type": "heading", "level": 1, "text": "…", "bbox": [74, 71, 447, 12.8] },
      { "type": "table", "rows": [[{ "text": "…", "rowSpan": 1, "colSpan": 2 }]] }
    ]
  }]
}
```

Column spans survive in JSON. Markdown cannot express them, so a spanned region keeps its text in the top-left cell. That is lossy, but visibly so.

Tables cost real time. Columns are found by whitespace corridors, not by wide gaps. A dense results table sets its numeric columns barely wider than a word space, so a gap-width threshold either merges them all or shreds justified prose into cells. What separates the two cases is that a table's column boundary is empty on every row, while the gaps in justified text land wherever the line breaks put them. And Vision can still split a table along the wrong axis, which produces perfectly valid Markdown that nothing downstream can detect. Those tables carry a `structureSuspect` flag, and the Markdown says so.

A few smaller things: maths comes out as real LaTeX in the export, while the in-app preview renders it as Unicode so you can see whether the conversion worked. Running headers are dropped (a journal that repeats its title and DOI on all fifteen pages does not need fifteen copies in your Markdown). Outlines are built from section numbering, not typography, because many styles set `3.2.1 Embedding layer` at body size and weight, and the number states the nesting depth directly anyway.

## Counts, chunks and agents

Extraction is usually one step before a language model, so every document ships with the numbers that decide whether it fits into a context window:

```
41,096 words · 285,085 chars · ~63,708 tokens · 55 tables
```

The token count is labelled an estimate on purpose. It assumes roughly four characters per token for Latin scripts, adjusted upward for CJK, because an exact count is only exact for one tokenizer.

For retrieval, chunks are cut by section first and by size second. Each chunk carries its heading path, its position within the section and links to its neighbours, and an `.outline.json` lists the section tree with token counts. The same idea drives the MCP mode: Claude Code or any other MCP client can open a PDF on the Mac, but the tools are built around `open_document`, `get_outline`, `read_section` and `search_document` rather than "give me all the text". A 125-page report is about 64,000 tokens, and dumping it into one tool call spends most of an agent's context on a question one section would have answered. Search is lexical, not semantic, which saves a second model download and an index.

## Install, and what is still rough

```sh
brew install --cask J0nasW/offprint/offprint
```

It needs macOS 26 and Apple Silicon. Builds are ad-hoc signed rather than notarised, so on first launch macOS will refuse to verify the developer, and you have to allow it under *System Settings → Privacy & Security → Open Anyway*. Homebrew no longer gets around this either, since `--no-quarantine` was removed in July 2026. A side effect: an ad-hoc signed app cannot use the App Sandbox at all, because the sandbox needs a team identity to anchor its container, and the app traps in `libsecinit` before `main()` even runs. So the sandbox is off for now, and `Offprint.entitlements` documents how to turn it back on.

Notarised builds are the next item on the roadmap, and they need an Apple Developer Program membership. Until then, the source and the Swift test suite are on [GitHub](https://github.com/J0nasW/offprint), and the harness (`offprint-harness classify paper.pdf`) prints the routing decision for every page of your PDF, with the reasons.
