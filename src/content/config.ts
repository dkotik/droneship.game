import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
	type: 'content',
	// Type-check frontmatter using a schema
	schema: z.object({
    // slug: z.string(),
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
	}),
});

const authors = defineCollection({
	type: 'content',
	// Type-check frontmatter using a schema
	schema: ({ image }) => z.object({
		name: z.string(),
    image: image(),
		// description: z.string(),
		// // Transform string to Date object
		// pubDate: z.coerce.date(),
		// updatedDate: z.coerce.date().optional(),
		// heroImage: z.string().optional(),
	}),
});

export const collections = { blog, authors };
