import { defineCollection, z } from 'astro:content';

const thoughts = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		publishedAt: z.date(),
		updatedAt: z.date().optional(),
		draft: z.boolean().default(false),
	}),
});

export const collections = { thoughts };

