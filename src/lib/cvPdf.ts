import PDFDocument from 'pdfkit';
import { join } from 'node:path';
import { profile, skills, experience, education, internships, voluntary, formatPeriod, type Period } from '../data/cv';
import { projects } from '../data/projects';

export interface CvPublication {
    title: string;
    authors: string[];
    venue: string;
    year: number;
    url?: string;
}

// Set like a typeset document rather than a resume template: one serif family,
// a margin column for dates and labels, black text, colour only on links.
const fontDir = join(process.cwd(), 'node_modules/@fontsource/crimson-pro/files');
const fonts = {
    regular: join(fontDir, 'crimson-pro-latin-400-normal.woff'),
    italic: join(fontDir, 'crimson-pro-latin-400-italic.woff'),
    semibold: join(fontDir, 'crimson-pro-latin-600-normal.woff'),
};

const ink = '#111111';
const grey = '#5c5c5c';
const link = '#234E7A';

const isMe = (name: string) => /^Jonas (Helmut )?Wilinski$/.test(name);

/** "Juergen Christopher Thiesen" -> "Thiesen, J. C." */
const citeName = (name: string) => {
    const parts = name.split(' ');
    const last = parts.pop()!;
    return `${last}, ${parts.map((p) => `${p[0]}.`).join(' ')}`;
};

const marginDate = (p: Period) => formatPeriod(p).replace(' – ', '–');

const monthYear = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

/** Renders the CV from src/data/cv.ts, src/data/projects.ts and the publications collection. */
export function renderCv(publications: CvPublication[]): Promise<Buffer> {
    const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 46, bottom: 54, left: 48, right: 48 },
        bufferPages: true,
        info: { Title: `${profile.name}, CV`, Author: profile.name },
    });
    for (const [name, path] of Object.entries(fonts)) doc.registerFont(name, path);

    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const marginW = 74;
    const x = left + marginW + 14;
    const w = right - x;
    const bottom = () => doc.page.height - doc.page.margins.bottom;

    // Start a new page when less than `h` points are left, so entries don't split under their heading
    const keep = (h: number) => {
        if (doc.y + h > bottom()) doc.addPage();
    };

    const section = (title: string) => {
        keep(60);
        doc.y += 11;
        doc.font('semibold').fontSize(12.5).fillColor(ink).text(title, x, doc.y);
        doc.y += 5;
    };

    // Label in the margin column, level with the entry it belongs to
    const margin = (text: string, y: number) => {
        doc.font('regular').fontSize(9.5).fillColor(grey).text(text, left, y + 1, { width: marginW });
    };

    const body = (text: string, font = 'regular', color = ink) => {
        doc.font(font).fontSize(10.5).fillColor(color).text(text, x, doc.y, { width: w, lineGap: 1.2 });
    };

    // Margin label, then the title with the organisation in italics on the same line
    const entry = (label: string, title: string, org?: string) => {
        keep(40);
        const y = doc.y;
        margin(label, y);
        doc.font('semibold').fontSize(10.5).fillColor(ink).text(title, x, y, { width: w, continued: Boolean(org), lineGap: 1.2 });
        if (org) doc.font('italic').text(`, ${org}`, { width: w, lineGap: 1.2 });
        doc.y += 1;
    };

    const items = (list: string[]) => {
        doc.font('regular').fontSize(10.5).fillColor(ink);
        for (const item of list) {
            const y = doc.y;
            doc.text('–', x, y, { lineBreak: false });
            doc.text(item, x + 10, y, { width: w - 10, lineGap: 1.2 });
        }
    };

    // Header: name and a plain line of contact details, no banner or headline block
    doc.font('semibold').fontSize(24).fillColor(ink).text(profile.name, x, doc.y);
    doc.y += 2;
    // Two short lines of contact details, each item a link
    const contactLine = (parts: { label: string; url?: string }[]) => {
        doc.font('regular').fontSize(10).fillColor(grey);
        parts.forEach((c, i) => {
            const last = i === parts.length - 1;
            const opts = { link: c.url ?? null, continued: !last };
            if (i === 0) doc.fillColor(c.url ? link : grey).text(c.label, x, doc.y, { ...opts, width: w });
            else doc.fillColor(c.url ? link : grey).text(c.label, opts);
            if (!last) doc.fillColor(grey).text('   ', { link: null, continued: true });
        });
    };
    const bare = (url: string) => url.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '');
    contactLine([
        { label: profile.email, url: `mailto:${profile.email}` },
        { label: bare(profile.website), url: profile.website },
        { label: profile.location },
    ]);
    contactLine(profile.links.filter((l) => l.label === 'LinkedIn' || l.label === 'GitHub').map((l) => ({ label: bare(l.url), url: l.url })));
    doc.y += 14;
    body(profile.summary);
    doc.y += 3;
    body(profile.availability.en, 'italic');

    section('Experience');
    for (const role of experience) {
        entry(marginDate(role), role.title, role.org);
        if (role.summary) body(role.summary);
        if (role.highlights) items(role.highlights);
        doc.y += 6;
    }

    section('Open source');
    for (const p of projects.filter((p) => p.pdf !== false)) {
        keep(16);
        const y = doc.y;
        margin(p.year, y);
        const main = p.links[0];
        doc.font('semibold').fontSize(10.5).fillColor(ink).text(p.name, x, y, { continued: true, width: w, lineGap: 1.2 });
        doc.font('regular').text(`, ${p.short}.`);
        doc.fillColor(link).text(main.url.replace('https://', ''), x, doc.y, { link: main.url, width: w });
        doc.y += 2;
    }

    // Citation style, the way the papers themselves are cited
    section('Publications');
    for (const pub of publications) {
        keep(30);
        const y = doc.y;
        margin(String(pub.year), y);
        doc.fontSize(10.5).fillColor(ink);
        pub.authors.forEach((a, i) => {
            const n = pub.authors.length;
            const sep = i === n - 1 ? '' : i === n - 2 ? ', & ' : ', ';
            doc.font(isMe(a) ? 'semibold' : 'regular');
            if (i === 0) doc.text(citeName(a), x, y, { width: w, continued: true, lineGap: 1.2 });
            else doc.text(citeName(a), { continued: true });
            if (sep) doc.font('regular').text(sep, { continued: true });
        });
        doc.font('regular').text(` ${pub.title}. `, { continued: true, link: pub.url });
        doc.font('italic').text(`${pub.venue}.`, { link: null });
        doc.y += 4;
    }

    section('Education');
    for (const d of education.filter((d) => d.pdf !== false)) {
        entry(marginDate(d), d.degree, d.school);
        if (d.thesis) {
            const label = d.thesis.kind === 'dissertation' ? 'Dissertation' : 'Thesis';
            body(`${label}: ${d.thesis.title}${d.thesis.grade ? ` (grade ${d.thesis.grade})` : ''}.`);
        }
        if (d.concurrent) body(`Alongside: ${d.concurrent.title}, ${marginDate(d.concurrent)}. ${d.concurrent.summary}`, 'regular', grey);
        if (d.note) body(d.note);
        doc.y += 6;
    }

    section('Skills');
    for (const s of skills) {
        keep(16);
        const y = doc.y;
        margin(s.group, y);
        doc.font('regular').fontSize(10.5).fillColor(ink).text(s.items.join(', '), x, y, { width: w, lineGap: 1.2 });
        doc.y += 3;
    }

    const shownInternships = internships.filter((i) => i.pdf !== false);
    section(shownInternships.length ? 'Internships & voluntary work' : 'Voluntary work');
    for (const i of shownInternships) {
        entry(marginDate(i), i.title, `${i.org}, internship`);
        if (i.highlights) body(i.highlights.join('. ') + '.');
        doc.y += 4;
    }
    for (const role of voluntary) {
        entry(marginDate(role), role.title, role.org);
        if (role.summary) body(role.summary);
        doc.y += 4;
    }

    // Footer on every page: when the file was generated, and the page count
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        const fy = doc.page.height - 36;
        doc.font('regular').fontSize(8.5).fillColor(grey);
        doc.text(`${profile.name}, CV, ${monthYear}`, x, fy, { lineBreak: false });
        const pageLabel = `${i + 1} of ${range.count}`;
        doc.text(pageLabel, right - doc.widthOfString(pageLabel), fy, { lineBreak: false });
    }

    doc.end();
    return done;
}
