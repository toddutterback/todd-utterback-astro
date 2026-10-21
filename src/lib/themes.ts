// Site themes, each celebrating a painter the way they actually painted. Every painting on the
// site uses the same color roles (sea, sky, sand, ...), so a theme's palette recolors it, and its
// brush renders it in that artist's hand: dots and tiles for the pointillists, an underpainting
// and real brushstrokes for the Impressionists.
//
// The -deep roles and `text` must stay dark: figures, silhouettes and filled UI depend on them.

/** Pointillists paint in separate dots; Impressionists in brushstrokes over a covered canvas. */
export type Medium = 'dots' | 'paint';

export type Brush = {
	shape: 'dot' | 'tile' | 'brush';
	/** Multiplies the mark spacing. Bigger marks need more room. */
	step: number;
	/** Multiplies mark size. */
	size: number;
	/** For brushstrokes: length and width as multiples of the mark radius. */
	length?: number;
	thickness?: number;
	/** How much a brushstroke curves, as a fraction of its length. */
	bend?: number;
	/** Stroke angle in radians for a mark at (x, y); `jitter` is a random number in [-0.5, 0.5). */
	angle?: (x: number, y: number, jitter: number) => number;
	alpha?: number;
	/** Lay a soft, blended underpainting first so no bare canvas shows between strokes. */
	underpaint?: boolean;
};

export type Theme = {
	id: string;
	artist: string;
	years: string;
	medium: Medium;
	/** Footer tagline, e.g. "painted one dot at a time". */
	tagline: string;
	/** The home page painting, after one of this artist's works (a key in src/lib/paintings). */
	hero: { painting: string; title: string; year: number };
	palette: Record<string, string>;
	brush: Brush;
};

export const THEMES: Theme[] = [
	{
		id: 'seurat',
		artist: 'Seurat',
		years: '1859–1891',
		medium: 'dots',
		tagline: 'painted one dot at a time',
		hero: { painting: 'harbor', title: 'Port-en-Bessin, Entrance to the Harbor', year: 1888 },
		palette: {
			canvas: '#f7efdb',
			paper: '#fffaf0',
			text: '#262147',
			muted: '#5f5a7a',
			border: '#e4d8bb',
			sea: '#5c9c86',
			'sea-deep': '#2f6f5e',
			foam: '#a7cfb8',
			sky: '#d3e6f1',
			mist: '#a9cbe2',
			blue: '#5f8fb8',
			'blue-deep': '#3f6b96',
			sand: '#e3cf9f',
			lavender: '#b2a6cf',
			'lavender-deep': '#6f6399',
			coral: '#dd8b6e',
		},
		brush: { shape: 'dot', step: 1, size: 1 },
	},
	{
		id: 'signac',
		artist: 'Signac',
		years: '1863–1935',
		medium: 'dots',
		tagline: 'laid one little tile at a time',
		hero: { painting: 'capo-di-noli', title: 'Capo di Noli', year: 1898 },
		// Saint-Tropez and Capo di Noli: hot gold skies, cobalt and teal water, violet shadows.
		palette: {
			canvas: '#fbf0de',
			paper: '#fffaf2',
			text: '#241a4a',
			muted: '#5e5280',
			border: '#eed8b4',
			sea: '#1f9e8f',
			'sea-deep': '#0f5e6b',
			foam: '#6fd0b0',
			sky: '#fbe3b8',
			mist: '#f4b6a0',
			blue: '#2d6fd1',
			'blue-deep': '#1d3f9a',
			sand: '#f5a93a',
			lavender: '#b47fd6',
			'lavender-deep': '#6a3fa3',
			coral: '#ef4f3a',
		},
		// His "mosaic" divisionism: small square dabs, set a touch further apart than Seurat's dots.
		brush: { shape: 'tile', step: 1.12, size: 0.82, angle: (_x, _y, j) => j * 0.35 },
	},
	{
		id: 'pissarro',
		artist: 'Pissarro',
		years: '1830–1903',
		medium: 'paint',
		tagline: 'painted out of doors, in all weathers',
		hero: { painting: 'montmartre', title: 'Boulevard Montmartre, Spring', year: 1897 },
		// Red Roofs and Hoarfrost: ochre fields, olive greens, slate-blue skies, rust roofs.
		palette: {
			canvas: '#f3ecdd',
			paper: '#fbf7ee',
			text: '#2f2a26',
			muted: '#6b6257',
			border: '#e2d7c0',
			sea: '#7f9a5c',
			'sea-deep': '#4a5e33',
			foam: '#b9c48f',
			sky: '#dfe4e6',
			mist: '#b6c3cc',
			blue: '#6f8aa3',
			'blue-deep': '#3f5469',
			sand: '#d9b77a',
			lavender: '#b9a7a0',
			'lavender-deep': '#6b5148',
			coral: '#c8573a',
		},
		// Short, thick strokes laid in a loose weave of crossing directions.
		brush: {
			shape: 'brush',
			step: 1.65,
			size: 1,
			length: 1.3,
			thickness: 0.55,
			bend: 0.15,
			angle: (x, y, j) => (Math.sin(x / 23 + Math.cos(y / 17) * 2) > 0 ? 0.6 : -0.6) + j * 0.6,
			underpaint: true,
		},
	},
	{
		id: 'monet',
		artist: 'Monet',
		years: '1840–1926',
		medium: 'paint',
		tagline: 'painted en plein air, mostly lilies',
		hero: { painting: 'footbridge', title: 'The Japanese Footbridge', year: 1899 },
		// Impression, Sunrise and the water lilies: lilac, sage, periwinkle, peach.
		palette: {
			canvas: '#f6f0ea',
			paper: '#fdfaf6',
			text: '#2c2440',
			muted: '#6a6078',
			border: '#e6dbd2',
			sea: '#7fa08a',
			'sea-deep': '#3f6656',
			foam: '#b9d1b0',
			sky: '#e6e1f0',
			mist: '#c3cfe6',
			blue: '#7b8fc4',
			'blue-deep': '#44518a',
			sand: '#f2c9a0',
			lavender: '#c9a7cf',
			'lavender-deep': '#74537e',
			coral: '#e8836b',
		},
		// Loose comma strokes that follow a gentle, rippling flow.
		// Broad, soft, rippling strokes, mostly following the water.
		brush: {
			shape: 'brush',
			step: 1.8,
			size: 1.05,
			length: 1.6,
			thickness: 0.6,
			bend: 0.25,
			angle: (x, y, j) => Math.sin(y / 18 + x / 60) * 0.35 + j * 0.7,
			alpha: 0.85,
			underpaint: true,
		},
	},
	{
		id: 'hassam',
		artist: 'Hassam',
		years: '1859–1935',
		medium: 'paint',
		tagline: 'painted in high summer light',
		hero: { painting: 'poppies', title: 'Poppies, Isles of Shoals', year: 1891 },
		// Appledore and the flag series: brilliant whites, sea blues, poppy red, summer yellow.
		palette: {
			canvas: '#fbf6ec',
			paper: '#fffdf7',
			text: '#1f2a44',
			muted: '#56607a',
			border: '#ebe0c8',
			sea: '#3f9fb5',
			'sea-deep': '#1f5f86',
			foam: '#9fd8d9',
			sky: '#eaf3fa',
			mist: '#f5d6dc',
			blue: '#3a78c9',
			'blue-deep': '#1e3f7a',
			sand: '#f7d774',
			lavender: '#e7a9c4',
			'lavender-deep': '#8a4a78',
			coral: '#e2453c',
		},
		// Quick, upright flicks, leaning a little like sunlit grass.
		brush: {
			shape: 'brush',
			step: 1.75,
			size: 1,
			length: 1.8,
			thickness: 0.48,
			bend: 0.2,
			angle: (_x, _y, j) => -1.3 + j * 0.8,
			alpha: 0.95,
			underpaint: true,
		},
	},
];

export const DEFAULT_THEME = 'seurat';

/**
 * Themes visitors can actually use. The others are switched off for now: add an id here to bring
 * it back. With more than one enabled, the "Painted after" picker appears in the footer.
 */
const ENABLED = ['seurat'];
export const ENABLED_THEMES = THEMES.filter((t) => ENABLED.includes(t.id));
export const THEME_STORAGE_KEY = 'theme';
export const THEME_EVENT = 'themechange';

export function themeById(id: string | undefined): Theme {
	return ENABLED_THEMES.find((t) => t.id === id) ?? ENABLED_THEMES[0];
}

export const MEDIA = Object.fromEntries(ENABLED_THEMES.map((t) => [t.id, t.medium]));

/** Apply a theme to the page: colors via data-theme, decoration via data-medium. */
export function applyTheme(id: string) {
	const t = themeById(id);
	document.documentElement.dataset.theme = t.id;
	document.documentElement.dataset.medium = t.medium;
}

/** The theme currently applied to the page. */
export function currentTheme(): Theme {
	return themeById(document.documentElement.dataset.theme);
}

/** CSS custom properties for every theme, keyed off <html data-theme>. Seurat is also the default. */
export function themeCss() {
	return ENABLED_THEMES.map((t) => {
		const selector = t.id === DEFAULT_THEME ? `:root, :root[data-theme='${t.id}']` : `:root[data-theme='${t.id}']`;
		const vars = Object.entries(t.palette)
			.map(([k, v]) => `--${k}: ${v};`)
			.join(' ');
		return `${selector} { ${vars} }`;
	}).join('\n');
}
