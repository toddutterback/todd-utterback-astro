import { getCollection, type CollectionEntry } from 'astro:content';
import type { PaintedCardItem } from '../components/PaintedCards.astro';

/** Published thoughts, newest first. */
export async function publishedThoughts() {
	return (await getCollection('thoughts', ({ data }) => !data.draft)).sort(
		(a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf(),
	);
}

const fmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short' });

export function thoughtCard(post: CollectionEntry<'thoughts'>): PaintedCardItem {
	return {
		href: `/thoughts/${post.slug}`,
		painting: post.slug,
		title: post.data.title,
		desc: post.data.description,
		meta: fmt.format(post.data.publishedAt),
		datetime: post.data.publishedAt.toISOString(),
	};
}
