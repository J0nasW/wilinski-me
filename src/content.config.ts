import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
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
	}),
});

const publications = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		authors: z.array(z.string()),
		venue: z.string(), // Conference or Journal name
		year: z.number(),
		link: z.string().url().optional(),
		linkText: z.string().optional(),
		pdf: z.string().optional(),
		tldr: z.string().optional(),
		keyPoints: z.array(z.string()).optional(),
	}),
});

export const collections = { blog, publications };
