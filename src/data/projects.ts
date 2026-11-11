// Single source for the projects page, the homepage and the PDF CV.
// Order matters: the first `featured` entries show on the homepage.

export interface Project {
    name: string;
    year: string;
    summary: string;
    // One clause for the PDF CV, which lists projects as short lines
    short: string;
    // One concrete number for scale, shown as a short line
    scale?: string;
    stack: string[];
    links: { label: string; url: string }[];
    // Internal write-up, e.g. "/blog/2026-08_sciembed/" (language prefix is added)
    post?: string;
    featured?: boolean;
    // false keeps the project on the website but out of the PDF CV
    pdf?: boolean;
}

export const projects: Project[] = [
    {
        name: 'SciEmbed',
        year: '2026',
        short: 'embedding model for scientific documents; training code and six checkpoints',
        summary:
            'Embedding model for scientific documents, trained with the sentences in which papers cite each other as contrastive signal. ModernBERT-base with up to 8K context; six checkpoints released under MIT.',
        scale: 'Up to ~30M training pairs on 4×H200, SciRepEval 66.85 (EMNLP 2026)',
        stack: ['PyTorch', 'ModernBERT', 'Contrastive learning', 'DuckDB'],
        links: [
            { label: 'Code', url: 'https://github.com/J0nasW/SciEmbed-release' },
            { label: 'Models', url: 'https://huggingface.co/J0nasW' },
            { label: 'Paper', url: 'https://aclanthology.org/2026.findings-emnlp.2057/' },
        ],
        post: '/blog/2026-08_sciembed/',
        featured: true,
    },
    {
        name: 'Science Data Lake',
        year: '2026',
        short: '293M papers from eight scholarly databases, queryable with DuckDB',
        summary:
            'Locally deployable infrastructure that joins eight scholarly databases (Semantic Scholar, OpenAlex, Crossref and others) into one SQL interface, with embedding-based alignment of 4,516 topics to 13 ontologies.',
        scale: '293M papers, ~960 GB of Parquet behind 153 DuckDB views',
        stack: ['Python', 'DuckDB', 'Parquet', 'Embeddings'],
        links: [
            { label: 'Code', url: 'https://github.com/J0nasW/science-datalake' },
            { label: 'Dataset', url: 'https://huggingface.co/datasets/J0nasW/science-datalake' },
            { label: 'Paper', url: 'https://arxiv.org/abs/2603.03126' },
        ],
        post: '/blog/2026-02_science_datalake/',
        featured: true,
    },
    {
        name: 'Offprint',
        year: '2026',
        short: 'macOS app that turns PDFs into Markdown and JSON on the device, with OCR in MLX Swift',
        summary:
            'Native macOS app that converts PDFs to Markdown and JSON on the device: reading order across columns, tables as tables, maths as LaTeX. Decides per page whether to trust the text layer or run OCR.',
        scale: 'Runs a 0.9B OCR model locally in 1.25 GB at 4-bit',
        stack: ['Swift', 'SwiftUI', 'MLX', 'Apple Vision'],
        links: [{ label: 'Code', url: 'https://github.com/J0nasW/offprint' }],
        post: '/blog/2026-09_offprint/',
        featured: true,
    },
    {
        name: 'AI Concept List',
        year: '2024',
        short: '10,797 weighted AI concepts, with the pipeline that built them',
        summary:
            'Curated, weighted list of AI concepts, seeded from textbook indices and the Computer Science Ontology, extended with keyphrases from PapersWithCode and filtered with a classifier against OpenAlex abstracts.',
        scale: '10,797 concepts (DRUID 2024)',
        stack: ['Python', 'YAKE', 'Neo4j', 'PostgreSQL', 'Logistic regression'],
        links: [
            { label: 'Code', url: 'https://github.com/J0nasW/AI-Dictionary' },
            { label: 'Dataset', url: 'https://huggingface.co/datasets/J0nasW/AI-Dictionary' },
        ],
        post: '/blog/2024-09_ai_concept_list/',
    },
    {
        name: 'PubCrawl',
        year: '2023',
        short: 'bulk download and text extraction for scientific papers',
        summary: 'Tool for downloading scientific papers at scale and converting the PDFs to text in parallel, as the data layer for the first PhD experiments.',
        stack: ['Python', 'multiprocessing'],
        links: [{ label: 'Code', url: 'https://github.com/J0nasW/PubCrawl' }],
        post: '/blog/2023-02_publications/',
        pdf: false,
    },
];
