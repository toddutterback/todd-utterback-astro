// A tiny pointillist engine: fills a canvas with jittered dots whose colors come from a
// "painter" function, then lets the dots scatter from the pointer and spring back home.

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
};

type Dot = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; r: number; c: string };

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

export function paintInDots(canvas: HTMLCanvasElement, painter: Painter, options: Options = {}) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const { step: stepFor = (w) => (w < 520 ? 4.5 : 5), radius = 45, ripple = true } = options;
	const P = readPalette();
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	let dots: Dot[] = [];
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

		const brush: Brush = { w, h, P, fleck };
		const step = stepFor(w);
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
					r: step * (0.42 + Math.random() * 0.18),
					c: painter(hx, hy, brush),
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

	function draw() {
		ctx!.fillStyle = P.cream;
		ctx!.fillRect(0, 0, w, h);
		for (const d of dots) {
			ctx!.fillStyle = d.c;
			ctx!.beginPath();
			ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
			ctx!.fill();
		}
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

	build();
	new ResizeObserver(() => {
		const rect = canvas.getBoundingClientRect();
		if (Math.abs(rect.width - w) > 1 || Math.abs(rect.height - h) > 1) build();
	}).observe(canvas);

	if (reduceMotion) return;

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
			for (const d of dots) {
				const dx = d.x - p.x;
				const dy = d.y - p.y;
				const dist = Math.hypot(dx, dy);
				if (dist < 160 && dist > 0.01) {
					const kick = (1 - dist / 160) * 14;
					d.vx += (dx / dist) * kick;
					d.vy += (dy / dist) * kick;
				}
			}
			wake();
		});
	}
}
