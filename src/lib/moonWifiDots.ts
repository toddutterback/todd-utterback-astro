// Pointillist pieces for the Moon WiFi speed test: a night sky with a dot Earth and Moon,
// a laser beam made of travelling dots, and a speedometer whose arc fills dot by dot.

import { readPalette, type Brush, type Painter } from './pointillism';

type Circle = { x: number; y: number; r: number };

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Center and radius of `el`, in `canvas` CSS px. */
function circleOf(el: HTMLElement, canvas: HTMLElement): Circle {
	const c = canvas.getBoundingClientRect();
	const r = el.getBoundingClientRect();
	return { x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height / 2, r: r.width / 2 };
}

/** Night sky with Earth and the Moon painted where the `earth` and `moon` placeholders sit. */
export function nightSky(canvas: HTMLElement, earth: HTMLElement, moon: HTMLElement): Painter {
	let measuredFor: Brush | null = null;
	let E: Circle = { x: 0, y: 0, r: 0 };
	let M: Circle = { x: 0, y: 0, r: 0 };

	return (x, y, b) => {
		const { P, fleck } = b;
		if (measuredFor !== b) {
			measuredFor = b;
			E = circleOf(earth, canvas);
			M = circleOf(moon, canvas);
		}

		// Earth: blue oceans, green-and-sand continents, ice caps, the night side in shadow
		const ex = x - E.x;
		const ey = y - E.y;
		const ed = Math.hypot(ex, ey);
		if (ed < E.r) {
			const night = ex * 0.8 + ey * 0.4 > E.r * 0.35;
			if (Math.abs(ey) > E.r * 0.8) return fleck([P.white, P.cream], [P.mist], 0.1);
			const land = Math.sin(ex * 0.22 + 1) * Math.cos(ey * 0.28) + Math.sin((ex + ey) * 0.17 + 2) * 0.7 > 0.55;
			if (land) return night ? fleck([P.seaDeep, P.ink], [P.sea], 0.15) : fleck([P.sea, P.seaDeep, P.foam], [P.sand], 0.12);
			return night ? fleck([P.blueDeep, P.ink], [P.blue], 0.12) : fleck([P.blue, P.blueDeep, P.blue], [P.mist], 0.1);
		}
		if (ed < E.r + 3.5) return fleck([P.mist, P.sky], [P.blue], 0.3);

		// The Moon: pale and cratered, with a soft halo
		const md = Math.hypot(x - M.x, y - M.y);
		if (md < M.r) {
			const craters: [number, number, number][] = [
				[-0.3, -0.25, 0.26],
				[0.32, 0.25, 0.22],
				[0.2, -0.45, 0.14],
				[-0.38, 0.38, 0.15],
			];
			for (const [ox, oy, cr] of craters)
				if (Math.hypot(x - M.x - ox * M.r, y - M.y - oy * M.r) < cr * M.r) return fleck([P.lavender, P.mist], [P.sand], 0.2);
			return fleck([P.cream, P.white, P.sand], [P.mist], 0.1);
		}
		if (md < M.r + 12 && Math.random() < 0.45) return fleck([P.lavenderDeep, P.blue], [P.lavender], 0.15);

		// Deep, quiet night with sparse stars, so the gauge and labels read on top of it
		if (Math.random() < 0.02) return fleck([P.cream, P.sand], [P.mist], 0.3);
		return fleck([P.ink, P.ink, P.ink, P.blueDeep], [P.lavenderDeep], 0.08);
	};
}

export type BeamMode = 'idle' | 'download' | 'upload';

/**
 * A stream of dots arcing between Earth and the Moon. Download runs Moon → Earth in sand,
 * upload Earth → Moon in coral, idle is a faint drift. `rate` (0–1+) sets how busy it is.
 */
export function laserBeam(canvas: HTMLCanvasElement, earth: HTMLElement, moon: HTMLElement) {
	const ctx = canvas.getContext('2d')!;
	const P = readPalette();
	type Particle = { t: number; speed: number; off: number; r: number; c: string };
	let particles: Particle[] = [];
	let mode: BeamMode = 'idle';
	let rate = 0.2;
	let w = 0;
	let h = 0;

	function resize() {
		const rect = canvas.getBoundingClientRect();
		w = rect.width;
		h = rect.height;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.round(w * dpr);
		canvas.height = Math.round(h * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	const colors = () =>
		mode === 'download' ? [P.sand, P.cream, P.white] : mode === 'upload' ? [P.coral, P.coral, P.sand] : [P.mist, P.cream, P.lavender];

	function spawn(t = 0) {
		const c = colors();
		particles.push({
			t,
			speed: (mode === 'idle' ? 0.002 : 0.006 + Math.min(rate, 1.5) * 0.008) * (0.7 + Math.random() * 0.6),
			off: (Math.random() - 0.5) * 7,
			r: 1.6 + Math.random() * 1.4,
			c: c[(Math.random() * c.length) | 0],
		});
	}

	function endpoints() {
		const e = circleOf(earth, canvas);
		const m = circleOf(moon, canvas);
		const from = mode === 'upload' ? e : m;
		const to = mode === 'upload' ? m : e;
		return { from, to };
	}

	function frame() {
		const { from, to } = endpoints();
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const len = Math.hypot(dx, dy) || 1;
		const nx = -dy / len;
		const ny = dx / len;
		// Start and end at the globes' edges, not their centers.
		const t0 = (from.r + 6) / len;
		const t1 = 1 - (to.r + 6) / len;

		ctx.clearRect(0, 0, w, h);
		const target = mode === 'idle' ? 26 : 34 + Math.min(rate, 1.5) * 50;
		if (particles.length < target && Math.random() < 0.6) spawn();

		particles = particles.filter((p) => p.t <= 1);
		for (const p of particles) {
			p.t += p.speed;
			const t = t0 + (t1 - t0) * p.t;
			const lift = -Math.sin(Math.PI * p.t) * 22;
			const x = from.x + dx * t + nx * p.off;
			const y = from.y + dy * t + ny * p.off + lift;
			ctx.globalAlpha = (mode === 'idle' ? 0.5 : 0.6) + Math.sin(Math.PI * p.t) * 0.4;
			ctx.fillStyle = p.c;
			ctx.beginPath();
			ctx.arc(x, y, p.r, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.globalAlpha = 1;
		if (!reduceMotion()) requestAnimationFrame(frame);
	}

	resize();
	new ResizeObserver(resize).observe(canvas);
	// Seed the stream so it isn't empty on load.
	for (let i = 0; i < 12; i++) spawn(Math.random());
	if (reduceMotion()) {
		// A still, evenly dotted beam instead of a moving one.
		particles = Array.from({ length: 24 }, (_, i) => ({ t: i / 23, speed: 0, off: 0, r: 1.8, c: P.lavender }));
	}
	frame();

	return {
		set(next: BeamMode, nextRate = rate) {
			if (next !== mode) particles = particles.filter(() => Math.random() < 0.3);
			mode = next;
			rate = nextRate;
		},
	};
}

/**
 * The speedometer arc, drawn in the gauge SVG's viewBox units (-40 -5 330 240) so it lines up
 * with the SVG text laid over it. Arc center (130, 155), radius 90, 240° sweep from 150°.
 */
export function dotGauge(canvas: HTMLCanvasElement) {
	const ctx = canvas.getContext('2d')!;
	const P = readPalette();
	const CX = 130;
	const CY = 155;
	const N = 60;
	const angleAt = (f: number) => ((150 + f * 240) * Math.PI) / 180;

	// Three jittered rows of dots along the arc; each dot keeps its color for its whole life.
	const dots = Array.from({ length: N * 3 }, (_, i) => {
		const f = Math.floor(i / 3) / (N - 1);
		const band = f < 0.4 ? [P.sea, P.sea, P.seaDeep] : f < 0.75 ? [P.foam, P.sea, P.foam] : [P.sand, P.foam, P.sand];
		return {
			f,
			r: 84 + (i % 3) * 6 + (Math.random() - 0.5) * 2.5,
			a: angleAt(f) + (Math.random() - 0.5) * 0.02,
			size: 2.1 + Math.random() * 1.1,
			c: band[(Math.random() * band.length) | 0],
		};
	});

	let state = { pct: 0, moonPct: 0.622, beating: false };

	function resize() {
		const rect = canvas.getBoundingClientRect();
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.round(rect.width * dpr);
		canvas.height = Math.round(rect.height * dpr);
		const k = (rect.width / 330) * dpr;
		ctx.setTransform(k, 0, 0, k, 40 * k, 5 * k);
		draw();
	}

	function dot(x: number, y: number, r: number, c: string, alpha = 1) {
		ctx.globalAlpha = alpha;
		ctx.fillStyle = c;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();
	}

	function draw() {
		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.restore();

		const { pct, moonPct, beating } = state;
		for (const d of dots) {
			const x = CX + Math.cos(d.a) * d.r;
			const y = CY + Math.sin(d.a) * d.r;
			if (d.f <= pct) {
				// The leading edge swells a little, like fresh paint.
				const edge = pct - d.f < 0.03 ? 1.35 : 1;
				dot(x, y, d.size * edge, d.c);
			} else {
				dot(x, y, d.size * 0.8, P.mist, 0.45);
			}
		}

		// The Moon's mark on the dial
		const ma = angleAt(moonPct);
		for (let r = 78; r <= 104; r += 6.5)
			dot(CX + Math.cos(ma) * r, CY + Math.sin(ma) * r, 2.4, beating ? P.foam : P.lavender, 0.95);

		// Needle: a line of cream dots, then the hub
		const na = angleAt(pct);
		for (let r = 12; r <= 80; r += 5.5) dot(CX + Math.cos(na) * r, CY + Math.sin(na) * r, 2.1, r > 70 ? P.white : P.cream);
		for (let i = 0; i < 8; i++) {
			const a = (i / 8) * Math.PI * 2;
			dot(CX + Math.cos(a) * 6, CY + Math.sin(a) * 6, 1.8, P.sand);
		}
		dot(CX, CY, 3, P.cream);
		ctx.globalAlpha = 1;
	}

	new ResizeObserver(resize).observe(canvas);
	resize();

	return {
		set(next: Partial<typeof state>) {
			state = { ...state, ...next };
			draw();
		},
	};
}
