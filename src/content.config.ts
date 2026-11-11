import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		// Hero image attribution for EU AI Act compliance
		heroImageAttribution: z.enum(['unsplash', 'ai', 'custom', 'none']).optional(),
		heroImageCredit: z.string().optional(),
		heroImageLink: z.string().optional(),
		heroImageModel: z.string().optional(), // For AI-generated images
		tags: z.array(z.string()).optional(),
		// Optional: Link to the translation of this post (slug without language prefix)
		translationOf: z.string().optional(),
		// Drafts render in `astro dev` but are left out of production builds and RSS
		draft: z.boolean().optional(),
		// Pins the post to the top of the blog page; otherwise the newest post is shown there
		featured: z.boolean().optional(),
	}),
});

const publications = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/publications' }),
	schema: z.object({
		title: z.string(),
		authors: z.array(z.string()),
		venue: z.string(), // Conference or Journal name
		year: z.number(),
		// Shown next to the venue, e.g. "Poster", "Preprint"
		kind: z.string().optional(),
		doi: z.string().optional(),
		link: z.string().url().optional(),
		linkText: z.string().optional(),
		pdf: z.string().optional(),
		// Further resources (code, reviews, models), shown next to PDF and DOI
		links: z.array(z.object({ label: z.string(), url: z.string().url() })).optional(),
		// Venue logo in /public, e.g. "/assets/img/venues/aom.png"
		logo: z.string().optional(),
		bibtex: z.string().optional(),
		tldr: z.string().optional(),
		keyPoints: z.array(z.string()).optional(),
	}),
});

export const collections = { blog, publications };
