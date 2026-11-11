// Single source for the experience page (/cv/) and the generated PDF CV
// (/jonas-wilinski-cv.pdf). Edit here; both update on the next build.
// Projects live in ./projects.ts, publications in src/content/publications.
//
// Dates are "MM.YYYY" (or "YYYY"); `end: null` means ongoing.

export interface Period {
    // Leave out when unknown; the period then shows just the end ("Present")
    start?: string;
    end: string | null;
}

export interface Role extends Period {
    title: string;
    org: string;
    orgUrl?: string;
    logo?: string;
    location?: string;
    summary?: string;
    highlights?: string[];
}

export interface Degree extends Period {
    degree: string;
    school: string;
    logo?: string;
    thesis?: { kind: 'dissertation' | 'master' | 'bachelor'; title: string; grade?: string };
    focus?: { label: 'focusAreas' | 'curriculum'; items: string[] };
    concurrent?: { title: string; start: string; end: string; summary: string };
    note?: string;
    // false keeps the entry on the website but out of the PDF
    pdf?: boolean;
}

export interface Internship extends Period {
    org: string;
    title: string;
    location?: string;
    logo?: string;
    highlights?: string[];
    pdf?: boolean;
}

export const profile = {
    name: 'Jonas Wilinski',
    headline: 'ML engineer & researcher',
    degree: 'M. Sc.',
    location: 'Hamburg, Germany',
    email: 'jonas@wilinski.me',
    website: 'https://wilinski.me',
    links: [
        { label: 'LinkedIn', url: 'https://www.linkedin.com/in/jonas-wilinski-a31a35143/' },
        { label: 'GitHub', url: 'https://github.com/J0nasW' },
        { label: 'Hugging Face', url: 'https://huggingface.co/J0nasW' },
        { label: 'ORCID', url: 'https://orcid.org/0009-0005-4672-7197' },
        { label: 'Google Scholar', url: 'https://scholar.google.com/citations?user=P2kbASEAAAAJ' },
    ],
    summary:
        'I train language and embedding models, build the data pipelines they depend on, and publish the code and weights. ' +
        'Before the PhD I was CTO of a port logistics start-up in Hamburg and worked on HR IT at Porsche. I have taken on freelance IT work since 2014, lately mostly AI projects.',
    // Shown in the homepage hero, on /cv/ and in the PDF
    availability: {
        en: 'Finishing my PhD at TU Hamburg in 2027 and looking for industry roles in applied ML, NLP and R&D.',
        de: 'Ich schließe meine Promotion an der TU Hamburg 2027 ab und suche eine Stelle in der Industrie, in angewandtem ML, NLP oder F&E.',
    },
};

export const skills: { group: string; items: string[] }[] = [
    { group: 'Machine learning', items: ['PyTorch', 'Transformers & embedding models', 'Contrastive learning', 'Retrieval & evaluation', 'LLMs & LangChain', 'Multi-GPU training'] },
    { group: 'Data', items: ['Python', 'SQL', 'DuckDB', 'Parquet', 'PostgreSQL', 'Neo4j'] },
    { group: 'Software', items: ['Docker', 'React & Next.js', 'Swift & SwiftUI', 'AWS', 'GCP'] },
];

export const experience: Role[] = [
    {
        title: 'Researcher & PhD Candidate, NLP',
        org: 'Hamburg University of Technology (TUHH)',
        logo: '/assets/img/tuhh-square.png',
        location: 'Hamburg',
        end: null,
        highlights: [
            'Designed and trained SciEmbed, a 149M-parameter embedding model for scientific documents (ModernBERT, 8K context), with contrastive learning on up to ~30M citation-context pairs on 4×H200. Beats SPECTER2 and BGE-large on SciRepEval; published at EMNLP 2026, six checkpoints open on Hugging Face',
            'Built the Science Data Lake: eight scholarly databases (293M papers, ~960 GB of Parquet) behind 153 DuckDB SQL views, with embedding-based ontology alignment (F1 0.77)',
            'Built NLP pipelines over millions of documents: a 10,797-term AI taxonomy, attention-based concept mining on ~500k papers, and LLM labelling of topic clusters (DRUID 2024, AOM 2025)',
            'Applied LLMs to unstructured text outside science, e.g. GPT-based extraction of evaluation criteria from online reviews of venture capital firms (AOM 2025)',
            'Teaching: Deep Learning',
        ],
    },
    {
        title: 'IT Consultant (Freelance)',
        org: 'Self-employed',
        start: '2014',
        end: null,
        highlights: [
            'IT consulting and implementation for small and medium-sized businesses, from requirements to roll-out',
            'Recently focused on AI: consulting, custom AI products and solutions, and web platforms',
        ],
    },
    {
        title: 'Chief Technical Officer (CTO)',
        org: 'Cargofaces, port logistics start-up, Hamburg',
        logo: '/assets/img/cargofaces.png',
        start: '11.2021',
        end: '11.2022',
        highlights: [
            'Owned the technology of a platform connecting truck drivers, container freight stations and terminals in the Port of Hamburg (six-person core team)',
            'Led 5+ full-time developers building the platform, as product owner for backlog, priorities and releases',
            'Discovery with 10+ potential customers, pilot projects with several of them, and pitches to investors and accelerators; the company had investors and traction when I left for the PhD',
        ],
    },
    {
        title: 'Coordinator Processes & Digitalization',
        org: 'Porsche AG, Project Management Digitalization',
        logo: '/assets/img/porsche_lo.png',
        start: '10.2018',
        end: '09.2019',
        highlights: [
            'Project lead for GDPR-compliant HR IT systems on SAP, used for nearly all Porsche employees',
            'Introduced the digital personnel file and acted as key user between HR and IT',
            'Worked extensively on the company-wide HR IT strategy',
            'Member of a task force bringing agile methods to other departments',
            'Innovation management and the start-up highway program',
        ],
    },
];

export const education: Degree[] = [
    {
        degree: 'Ph.D. in Computer Science and Social Science (Dr.-Ing.)',
        school: 'Hamburg University of Technology (TU Hamburg)',
        logo: '/assets/img/tuhh-square.png',
        end: null,
        thesis: { kind: 'dissertation', title: 'Diffusion of AI concepts across the global scientific landscape' },
        focus: {
            label: 'focusAreas',
            items: ['Natural Language Processing', 'Large Language Models', 'Science of Science', 'Knowledge Graphs', 'Concept Extraction'],
        },
    },
    {
        degree: 'M. Sc. International Industrial Engineering (120 ECTS)',
        school: 'Hamburg University of Technology (TU Hamburg)',
        logo: '/assets/img/tuhh-square.png',
        start: '10.2019',
        end: '09.2021',
        thesis: { kind: 'master', title: 'Design and implementation of a blockchain-based asset tracking service', grade: '1.0' },
        focus: {
            label: 'focusAreas',
            items: ['International Business', 'Production & Logistics', 'Innovation Management', 'Software Security', 'Operations Research'],
        },
        concurrent: {
            title: 'Research Associate',
            start: '01.2020',
            end: '09.2021',
            summary: 'Early PhD research on AI diffusion, blockchain applications, co-hosting the MLE Days conference, teaching.',
        },
    },
    {
        degree: 'B. Sc. Electrical Engineering & IT (210 ECTS)',
        school: 'Kiel University (Christian-Albrechts-Universität)',
        logo: '/assets/img/cau.png',
        start: '10.2014',
        end: '09.2018',
        thesis: {
            kind: 'bachelor',
            title: 'An application of Reinforcement Learning on biological neural networks for dynamic systems control (Inverted Pendulum)',
            grade: '1.0',
        },
        focus: {
            label: 'curriculum',
            items: ['Electrical Engineering', 'Control Engineering', 'Signal & System Theory', 'Business Administration', 'Power Electronics'],
        },
        concurrent: {
            title: 'Research Associate, Webmaster',
            start: '07.2016',
            end: '10.2017',
            summary: 'Technical Faculty web presence, virtual 360° lab tours, print and media design.',
        },
    },
    {
        degree: 'Abitur',
        school: 'Steinhagener Gymnasium',
        logo: '/assets/img/steingy.jpg',
        start: '07.2006',
        end: '06.2014',
        pdf: false,
        note: 'Majors: Mathematics & Physics. 2010: student exchange in Fort Smith, AR, USA',
    },
];

export const internships: Internship[] = [
    {
        org: 'Porsche AG',
        title: 'IT Processes & Digitalization',
        logo: '/assets/img/porsche_lo.png',
        start: '11.2017',
        end: '04.2018',
        // Led to the later Porsche role, which the PDF already lists
        pdf: false,
        highlights: ['Interface between HR and IT', 'Introduction of new digital media for HR', 'Creation of the intranet and My Porsche Cockpit'],
    },
    {
        org: 'Horst Filipp GmbH',
        title: 'Basic Industrial Internship',
        logo: '/assets/img/hf_logo_lq.jpg',
        start: '06.2014',
        end: '08.2014',
        pdf: false,
        highlights: ['Turning, milling and drilling', 'Metal types and machining operations', 'Installation and programming of CNC machines'],
    },
];

export const voluntary: Role[] = [
    {
        title: 'Head of IT & DevOps',
        org: 'Ecomap Global gGmbH (non-profit)',
        orgUrl: 'https://www.ecomap.global',
        logo: '/assets/img/ecomap_pin_500px.png',
        start: '07.2020',
        end: '02.2022',
        summary: 'Led the development of an online map for sustainable SMEs and coordinated a European team of 20 volunteers, in cooperation with Oikos International.',
    },
];

// Short school internships, shown on the web page only
export const minorInternships = [
    { org: 'Golf Club Teutoburger Wald', location: 'Halle Westf.', summary: '6 weeks economic internship' },
    { org: 'HO Systeme', location: 'Halle Westf.', summary: '2 weeks IT & communication technology internship' },
    { org: 'Niehaus & Rückert', location: 'Bielefeld', summary: '2 weeks production internship' },
];

export function formatPeriod({ start, end }: Period, present = 'Present'): string {
    return start ? `${start} – ${end ?? present}` : end ?? present;
}
