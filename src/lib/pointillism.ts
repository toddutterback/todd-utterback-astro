// A tiny painting engine: fills a canvas with jittered marks whose colors come from a "painter"
// function, then lets the marks scatter from the pointer and spring back home. The active theme
// (src/lib/themes.ts) sets the palette and the hand: separate dots or tiles for the
// pointillists, or a blended underpainting covered in brushstrokes for the Impressionists.
// Every painting repaints itself when the theme changes.

import { currentTheme, THEME_EVENT, type Brush as ThemeBrush } from './themes';

export type Palette = ReturnType<typeof readPalette>;
export type Fleck = (main: string[], comp: string[], odds?: number) => string;
export type Brush = { w: number; h: number; P: Palette; fleck: Fleck };
export type Painter = (x: number, y: number, brush: Brush) => string;

type Options = {
	/** Dot spacing in CSS px for a given canvas width. */
	step?: (w: number) => number;
	/** Pointer repel radius in CSS px. */
	radius?: number;
	/** Whether a click sends a ripple through the dots. */
	ripple?: boolean;
	/**
	 * Compose the painting at most this wide, centered. Lets a painting designed for a card sit in
	 * the middle of a wide banner, with its background carrying on out to the edges.
	 */
	virtualWidth?: number;
	/** Color painted under the dots (defaults to cream). A function is re-read on theme change. */
	ground?: string | (() => string);
};

export type DotPainting = {
	/** Shove dots outward from (x, y), in canvas CSS px. */
	poke: (x: number, y: number, radius?: number, strength?: number) => void;
};

type Dot = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; r: number; a: number; len: number; c: string };

function css(name: string) {
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function readPalette() {
	return {
		sea: css('--sea'),
		seaDeep: css('--sea-deep'),
		foam: css('--foam'),
		sky: css('--sky'),
		mist: css('--mist'),
		blue: css('--blue'),
		blueDeep: css('--blue-deep'),
		sand: css('--sand'),
		lavender: css('--lavender'),
		lavenderDeep: css('--lavender-deep'),
		coral: css('--coral'),
		ink: css('--text'),
		cream: '#fbf3dc',
		white: '#ffffff',
	};
}

const pick = (arr: string[]) => arr[(Math.random() * arr.length) | 0];

// Seurat's trick: lay a complementary color next to the main one and let the eye mix them.
const fleck: Fleck = (main, comp, odds = 0.12) => (Math.random() < odds ? pick(comp) : pick(main));

// Shape helpers for painters.
export function nearSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number, r: number) {
	const dx = bx - ax;
	const dy = by - ay;
	const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
	return Math.hypot(px - (ax + t * dx), py - (ay + t * dy)) < r;
}

export function inPolygon(x: number, y: number, pts: [number, number][]) {
	let inside = false;
	for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
		const [xi, yi] = pts[i];
		const [xj, yj] = pts[j];
		if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
	}
	return inside;
}

export function paintInDots(canvas: HTMLCanvasElement, painter: Painter, options: Options = {}): DotPainting | undefined {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const { step: stepFor = (w) => (w < 520 ? 4.5 : 5), radius = 45, ripple = true, virtualWidth } = options;
	let P = readPalette();
	let mark: ThemeBrush = currentTheme().brush;
	const groundColor = () =>
		typeof options.ground === 'function' ? options.ground() : (options.ground ?? P.cream);
	let ground = groundColor();
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	let dots: Dot[] = [];
	// The Impressionist underpainting: a soft, blended layer of the painting's own colors.
	const under = document.createElement('canvas');
	let w = 0;
	let h = 0;
	let pointer: { x: number; y: number } | null = null;
	let raf = 0;

	function build() {
		const rect = canvas.getBoundingClientRect();
		w = rect.width;
		h = rect.height;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.round(w * dpr);
		canvas.height = Math.round(h * dpr);
		ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

		const vw = virtualWidth && w > virtualWidth ? virtualWidth : w;
		const offsetX = (w - vw) / 2;
		const brush: Brush = { w: vw, h, P, fleck };
		const step = stepFor(w) * mark.step;
		if (mark.underpaint) paintUnder(brush, offsetX, dpr);
		dots = [];
		for (let y = step / 2; y < h; y += step) {
			for (let x = step / 2; x < w; x += step) {
				const hx = x + (Math.random() - 0.5) * step * 0.9;
				const hy = y + (Math.random() - 0.5) * step * 0.9;
				dots.push({
					hx,
					hy,
					x: hx,
					y: hy,
					vx: 0,
					vy: 0,
					r: step * (0.42 + Math.random() * 0.18) * mark.size,
					a: mark.angle ? mark.angle(hx, hy, Math.random() - 0.5) : 0,
					len: 0.6 + Math.random() * 0.8,
					c: painter(hx - offsetX, hy, brush),
				});
			}
		}
		// Shuffle draw order so overlapping dots interleave like brushwork.
		for (let i = dots.length - 1; i > 0; i--) {
			const j = (Math.random() * (i + 1)) | 0;
			[dots[i], dots[j]] = [dots[j], dots[i]];
		}
		draw();
	}

	function paintUnder(brush: Brush, offsetX: number, dpr: number) {
		// Sample the painting coarsely onto a tiny canvas, then stretch it up with smoothing:
		// the colors melt into each other like a wet underpainting.
		const block = 8;
		const cols = Math.ceil(w / block) + 1;
		const rows = Math.ceil(h / block) + 1;
		const small = document.createElement('canvas');
		small.width = cols;
		small.height = rows;
		const sc = small.getContext('2d')!;
		for (let j = 0; j < rows; j++) {
			for (let i = 0; i < cols; i++) {
				sc.fillStyle = painter(i * block - offsetX, j * block, brush);
				sc.fillRect(i, j, 1, 1);
			}
		}
		under.width = canvas.width;
		under.height = canvas.height;
		const u = under.getContext('2d')!;
		u.setTransform(dpr, 0, 0, dpr, 0, 0);
		u.imageSmoothingEnabled = true;
		u.imageSmoothingQuality = 'high';
		u.filter = 'blur(3px)';
		u.drawImage(small, -block / 2, -block / 2, cols * block, rows * block);
		u.filter = 'none';
	}

	function draw() {
		const c = ctx!;
		c.globalAlpha = 1;
		if (mark.underpaint) {
			c.save();
			c.setTransform(1, 0, 0, 1, 0, 0);
			c.drawImage(under, 0, 0);
			c.restore();
		} else {
			c.fillStyle = ground;
			c.fillRect(0, 0, w, h);
		}
		c.globalAlpha = mark.alpha ?? 1;
		const long = mark.length ?? 1;
		const thick = mark.thickness ?? 1;
		const bend = mark.bend ?? 0;
		if (mark.shape === 'brush') {
			// Rounded, slightly curved strokes, like a loaded brush dragged a short way
			c.lineCap = 'round';
			for (const d of dots) {
				const half = d.r * long * d.len;
				const cos = Math.cos(d.a);
				const sin = Math.sin(d.a);
				const curve = half * bend;
				c.strokeStyle = d.c;
				c.lineWidth = d.r * thick * 2;
				c.beginPath();
				c.moveTo(d.x - cos * half, d.y - sin * half);
				c.quadraticCurveTo(d.x - sin * curve, d.y + cos * curve, d.x + cos * half, d.y + sin * half);
				c.stroke();
			}
			c.globalAlpha = 1;
			return;
		}
		for (const d of dots) {
			c.fillStyle = d.c;
			c.beginPath();
			if (mark.shape === 'tile') {
				// A squarish mosaic tile, turned a little
				const k = d.r * 0.95;
				const cos = Math.cos(d.a) * k;
				const sin = Math.sin(d.a) * k;
				c.moveTo(d.x - cos + sin, d.y - sin - cos);
				c.lineTo(d.x + cos + sin, d.y + sin - cos);
				c.lineTo(d.x + cos - sin, d.y + sin + cos);
				c.lineTo(d.x - cos - sin, d.y - sin + cos);
			} else {
				c.arc(d.x, d.y, d.r, 0, Math.PI * 2);
			}
			c.fill();
		}
		c.globalAlpha = 1;
	}

	function tick() {
		let moving = false;
		for (const d of dots) {
			if (pointer) {
				const dx = d.x - pointer.x;
				const dy = d.y - pointer.y;
				const dist = Math.hypot(dx, dy);
				if (dist < radius && dist > 0.01) {
					const push = (1 - dist / radius) * 2.4;
					d.vx += (dx / dist) * push;
					d.vy += (dy / dist) * push;
				}
			}
			d.vx = (d.vx + (d.hx - d.x) * 0.06) * 0.84;
			d.vy = (d.vy + (d.hy - d.y) * 0.06) * 0.84;
			d.x += d.vx;
			d.y += d.vy;
			if (Math.abs(d.vx) + Math.abs(d.vy) > 0.02 || Math.abs(d.hx - d.x) + Math.abs(d.hy - d.y) > 0.3)
				moving = true;
		}
		draw();
		raf = moving || pointer ? requestAnimationFrame(tick) : 0;
	}

	function wake() {
		if (!raf) raf = requestAnimationFrame(tick);
	}

	function local(e: PointerEvent) {
		const rect = canvas.getBoundingClientRect();
		return { x: e.clientX - rect.left, y: e.clientY - rect.top };
	}

	function poke(px: number, py: number, reach = 160, strength = 14) {
		if (reduceMotion) return;
		for (const d of dots) {
			const dx = d.x - px;
			const dy = d.y - py;
			const dist = Math.hypot(dx, dy);
			if (dist < reach && dist > 0.01) {
				const kick = (1 - dist / reach) * strength;
				d.vx += (dx / dist) * kick;
				d.vy += (dy / dist) * kick;
			}
		}
		wake();
	}

	build();
	window.addEventListener(THEME_EVENT, () => {
		P = readPalette();
		mark = currentTheme().brush;
		ground = groundColor();
		build();
	});
	new ResizeObserver(() => {
		const rect = canvas.getBoundingClientRect();
		if (Math.abs(rect.width - w) > 1 || Math.abs(rect.height - h) > 1) build();
	}).observe(canvas);

	if (reduceMotion) return { poke };

	// Listen on the parent so dots still react when the pointer is over content layered on top.
	const target = canvas.parentElement ?? canvas;
	target.addEventListener('pointermove', (e) => {
		pointer = local(e);
		wake();
	});
	target.addEventListener('pointerleave', () => {
		pointer = null;
	});
	if (ripple) {
		target.addEventListener('pointerdown', (e) => {
			const p = local(e);
			poke(p.x, p.y);
		});
	}

	return { poke };
}
