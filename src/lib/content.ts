import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/index';

export type Post = CollectionEntry<'blog'>;

const LANG_DIRS = ['en', 'de'];

/** Slug without language folder and file extension, e.g. "en/2024-05_patentcl.md" -> "2024-05_patentcl". */
export function postSlug(id: string): string {
    const parts = id.split('/');
    const slug = parts.length > 1 && LANG_DIRS.includes(parts[0]) ? parts.slice(1).join('/') : id;
    return slug.replace(/\.mdx?$/, '');
}

/** Published posts for a language, newest first. Drafts only show up in `astro dev`. */
export async function getPosts(lang: Lang): Promise<Post[]> {
    const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
    return posts
        .filter((post) => {
            const parts = post.id.split('/');
            // Posts without a language folder show for all languages (legacy support)
            return !(parts.length > 1 && LANG_DIRS.includes(parts[0])) || parts[0] === lang;
        })
        .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Publications, newest year first; within a year, keep a stable order by title. */
export async function getPublications() {
    const pubs = await getCollection('publications');
    return pubs.sort((a, b) => b.data.year - a.data.year || a.data.title.localeCompare(b.data.title));
}

type PublicationData = CollectionEntry<'publications'>['data'];

/** "Venue (kind), year", without repeating the year when the venue name already has it. */
export function venueLine({ venue, kind, year }: PublicationData): string {
    const kindPart = kind ? ` (${kind})` : '';
    return venue.includes(String(year)) ? `${venue}${kindPart}` : `${venue}${kindPart}, ${year}`;
}

/** PDF, main link, extra resources and DOI as one list, without duplicates. */
export function publicationLinks(data: PublicationData): { label: string; url: string }[] {
    const links = [
        data.pdf && { label: 'PDF', url: data.pdf },
        data.link && { label: data.linkText || 'Link', url: data.link },
        ...(data.links ?? []),
        data.doi && !data.link?.includes(data.doi) && { label: 'DOI', url: `https://doi.org/${data.doi}` },
    ];
    return links.filter((l): l is { label: string; url: string } => Boolean(l));
}

/** Language-prefixed URL of a project's write-up, or undefined while that post is still a draft. */
export async function projectPostUrl(post: string | undefined, lang: Lang): Promise<string | undefined> {
    if (!post) return undefined;
    const slug = post.replace(/^\/blog\//, '').replace(/\/$/, '');
    const published = (await getPosts(lang)).some((p) => postSlug(p.id) === slug);
    return published ? `/${lang}${post}` : undefined;
}
