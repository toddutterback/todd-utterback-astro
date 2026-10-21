import type { Painter } from '../pointillism';
import { currentTheme } from '../themes';
import { harbor } from './harbor';
import { capoDiNoli, footbridge, montmartre, poppies } from './heroes';
import { book, moon, pushup, runner } from './projects';
import { seaside, THOUGHTS } from './thoughts';

const PAINTINGS: Record<string, Painter> = {
	harbor,
	'capo-di-noli': capoDiNoli,
	montmartre,
	footbridge,
	poppies,
	pushup,
	moon,
	runner,
	book,
	...THOUGHTS,
};

/** The home painting: whichever work the active theme's artist is represented by. */
const hero: Painter = (x, y, b) => (PAINTINGS[currentTheme().hero.painting] ?? harbor)(x, y, b);

/** The painter for a key, falling back to a seeded seaside for anything not painted yet. */
export function painterFor(key: string): Painter {
	if (key === 'hero') return hero;
	return PAINTINGS[key] ?? seaside(key);
}
