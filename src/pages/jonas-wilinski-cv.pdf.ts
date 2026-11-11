import type { APIRoute } from 'astro';
import { getPublications } from '../lib/content';
import { renderCv } from '../lib/cvPdf';

// Built once at build time into a static PDF, from the same data as /cv/
export const GET: APIRoute = async () => {
    const publications = (await getPublications()).map((p) => ({
        title: p.data.title,
        authors: p.data.authors,
        // The year sits in the margin, so the venue line leaves it out
        venue: p.data.kind ? `${p.data.venue} (${p.data.kind})` : p.data.venue,
        year: p.data.year,
        url: `https://wilinski.me/en/publications/${p.id.replace(/\.md$/, '')}/`,
    }));
    const pdf = await renderCv(publications);
    return new Response(new Uint8Array(pdf), {
        headers: { 'Content-Type': 'application/pdf' },
    });
};
