import type { APIRoute } from 'astro';
import { profile, skills, experience, education, voluntary, formatPeriod } from '../data/cv';
import { projects } from '../data/projects';
import { socialLinks } from '../data/socialLinks';
import { getPosts, getPublications, postSlug, publicationLinks, venueLine } from '../lib/content';

// Generated at build time from the same data as /cv/, /projects/ and the PDF CV
export const GET: APIRoute = async () => {
    const site = 'https://wilinski.me';
    const publications = await getPublications();
    const posts = await getPosts('en');
    const out: string[] = [];
    const line = (s = '') => out.push(s);

    line(`# ${profile.name}, Full Profile`);
    line();
    line('## Bio');
    line();
    line(profile.summary);
    line();
    line(profile.availability.en);
    line();
    line(`CV as PDF: ${site}/jonas-wilinski-cv.pdf`);

    line();
    line('## Work Experience');
    for (const r of [...experience, ...voluntary]) {
        line();
        line(`### ${r.title}, ${r.org}`);
        line(`*${formatPeriod(r)}*`);
        if (r.summary) line(`- ${r.summary}`);
        for (const h of r.highlights ?? []) line(`- ${h}`);
    }

    line();
    line('## Projects');
    for (const p of projects) {
        line();
        line(`### ${p.name} (${p.year})`);
        line(p.summary);
        if (p.scale) line(`- **Scale:** ${p.scale}`);
        line(`- **Stack:** ${p.stack.join(', ')}`);
        for (const l of p.links) line(`- **${l.label}:** ${l.url}`);
        if (p.post && posts.some((post) => `/blog/${postSlug(post.id)}/` === p.post)) line(`- **Write-up:** ${site}/en${p.post}`);
    }

    line();
    line('## Publications');
    for (const pub of publications) {
        line();
        line(`### ${pub.data.title}`);
        line(`- **Venue:** ${venueLine(pub.data)}`);
        line(`- **Authors:** ${pub.data.authors.join(', ')}`);
        if (pub.data.tldr) line(`- **Summary:** ${pub.data.tldr}`);
        line(`- **Page:** ${site}/en/publications/${pub.id.replace(/\.md$/, '')}/`);
        for (const l of publicationLinks(pub.data)) line(`- **${l.label}:** ${l.url.startsWith('/') ? site + l.url : l.url}`);
    }

    line();
    line('## Education');
    for (const d of education) {
        line();
        line(`### ${d.degree}, ${d.school}`);
        line(`*${formatPeriod(d)}*`);
        if (d.thesis) line(`- Thesis: "${d.thesis.title}"${d.thesis.grade ? ` (grade ${d.thesis.grade})` : ''}`);
    }

    line();
    line('## Skills');
    line();
    for (const s of skills) line(`- **${s.group}:** ${s.items.join(', ')}`);

    line();
    line('## Blog Posts');
    for (const post of posts) {
        line();
        line(`### ${post.data.title}`);
        line(`*${post.data.pubDate.toISOString().slice(0, 10)}* ${site}/en/blog/${postSlug(post.id)}/`);
        line(post.data.description);
    }

    line();
    line('## Contact');
    line();
    line(`- **Location:** ${profile.location}`);
    line(`- **Email:** ${profile.email}`);
    line(`- **Website:** ${profile.website}`);
    for (const l of socialLinks) line(`- **${l.label}:** ${l.href}`);

    return new Response(out.join('\n') + '\n', {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
};
