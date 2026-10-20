import type { Painter } from '../pointillism';
import { harbor } from './harbor';
import { book, moon, pushup, runner } from './projects';
import { seaside, THOUGHTS } from './thoughts';

const PAINTINGS: Record<string, Painter> = { harbor, pushup, moon, runner, book, ...THOUGHTS };

/** The painter for a key, falling back to a seeded seaside for anything not painted yet. */
export function painterFor(key: string): Painter {
	return PAINTINGS[key] ?? seaside(key);
}
