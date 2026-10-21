// Home page paintings, one after each theme's artist. Compositions use fractions of the canvas
// (u = x / w, v = y / h) so they hold together from phone to desktop. The Seurat harbor lives in
// harbor.ts.

import type { Painter } from '../pointillism';

// A small seeded random, so scattered details (lily pads) land in the same places every repaint.
function seeded(seed: number) {
	return () => {
		seed = (seed * 16807) % 2147483647;
		return seed / 2147483647;
	};
}

// Signac, Capo di Noli (1898): a sunlit headland plunging into a violet-blue sea.
export const capoDiNoli: Painter = (x, y, { w, h, P, fleck }) => {
	const u = x / w;
	const v = y / h;

	// The cliff: its seaward face runs from high on the right down to the water mid-canvas.
	const t = Math.max(0, Math.min(1, (0.78 - v) / 0.66));
	const edge = 0.42 + 0.5 * Math.pow(t, 0.85);
	if (v > 0.12 && v < 0.82 && u > edge) {
		if (u - edge < 0.05) return fleck([P.lavenderDeep, P.lavender, P.blue], [P.coral], 0.12);
		if (v < 0.24 + (u - 0.8) * 0.3) return fleck([P.sea, P.foam, P.seaDeep], [P.sand], 0.15);
		return fleck([P.coral, P.sand, P.coral, P.mist], [P.lavender], 0.12);
	}
	// The coast road along its foot
	if (v >= 0.8 && v < 0.86 && u > 0.38) return fleck([P.sand, P.cream], [P.lavender], 0.12);

	// Distant headlands on the horizon
	if (v > 0.33 && v < 0.4 && v > 0.4 - 0.05 * Math.max(0, Math.sin(u * 9 + 1)) && u < 0.45)
		return fleck([P.lavender, P.mist], [P.blue], 0.15);

	if (v < 0.4) return fleck([P.sky, P.sky, P.mist, P.sand], [P.lavender], 0.1);
	if (v < 0.44) return fleck([P.blueDeep, P.blue], [P.lavender], 0.12);
	if (v > 0.88) return fleck([P.sand, P.mist, P.lavender], [P.blue], 0.12);
	return fleck([P.blue, P.sea, P.blue, P.lavender], [P.coral, P.foam], 0.1);
};

// Pissarro, Boulevard Montmartre, Spring (1897): the boulevard seen from a high window, running
// away between a sunlit row of buildings and a shaded one, lined with new-leafed trees and busy
// with carriages and people.
export const montmartre: Painter = (x, y, { w, h, P, fleck }) => {
	const u = x / w;
	const v = y / h;
	const vp = { u: 0.58, v: 0.22 };
	const k = Math.max(0, (v - vp.v) / (1 - vp.v)); // 0 at the vanishing point, 1 at the bottom

	// Curbs run from the vanishing point down to the bottom edge
	const curbL = vp.u + (0.18 - vp.u) * k;
	const curbR = vp.u + (0.98 - vp.u) * k;
	// Building fronts sit a sidewalk's width outside the curbs
	const frontL = vp.u + (-0.02 - vp.u) * k;
	const frontR = vp.u + (1.2 - vp.u) * k;

	if (v > vp.v) {
		// Rows of trees along each curb: crowns shrink and crowd together with distance
		for (const side of [0.18, 0.98]) {
			for (let i = 1; i <= 8; i++) {
				const tk = Math.pow(i / 8, 1.4);
				const cu = vp.u + (side - vp.u) * tk;
				const cv = vp.v + (1 - vp.v) * tk - 0.16 * tk;
				const r = 0.015 + 0.09 * tk;
				if (Math.hypot((u - cu) * (w / h), v - cv) < r) return fleck([P.foam, P.sea, P.foam], [P.sand, P.seaDeep], 0.15);
			}
		}
		// The roadway, flecked with carriages and passers-by, thicker toward us
		if (u > curbL && u < curbR) {
			if (Math.random() < 0.05 + 0.2 * k) return fleck([P.ink, P.blueDeep, P.lavenderDeep], [P.coral], 0.1);
			return fleck([P.lavender, P.mist, P.lavender], [P.sand], 0.12);
		}
		// Sidewalks
		if (u > frontL && u < frontR) return fleck([P.sand, P.cream], [P.lavender], 0.12);
	}

	// Facades: the left row in sun, the right row in shade, each with rows of windows
	const roofL = 0.02 + (vp.v - 0.04) * (u / vp.u);
	const roofR = vp.v - 0.04 - (vp.v - 0.06) * ((u - vp.u) / (1 - vp.u));
	const sunlit = u < vp.u;
	if (v > (sunlit ? roofL : roofR)) {
		const win = Math.sin(u * 120) > 0.5 && Math.sin(v * 70) > 0.3;
		if (win) return fleck([P.lavenderDeep, P.blueDeep], [P.ink], 0.15);
		return sunlit ? fleck([P.cream, P.sand, P.cream], [P.coral], 0.08) : fleck([P.mist, P.lavender, P.blue], [P.sand], 0.1);
	}
	return fleck([P.sky, P.white, P.sky], [P.mist], 0.12);
};

const PADS = (() => {
	const r = seeded(1899);
	return Array.from({ length: 34 }, () => {
		const v = 0.55 + r() * 0.45;
		const size = 0.025 + (v - 0.55) * 0.14;
		return { u: r(), v, rx: size * 1.6, ry: size * 0.45, flower: r() < 0.45 ? (r() < 0.6 ? 'pink' : 'white') : null };
	});
})();

// Monet, The Japanese Footbridge (1899): the arched bridge over the water-lily pond, light against
// the dark foliage behind.
export const footbridge: Painter = (x, y, { w, h, P, fleck }) => {
	const u = x / w;
	const v = y / h;
	const span = (u - 0.5) / 0.62;

	if (Math.abs(span) < 1) {
		const deck = 0.58 - 0.3 * (1 - span * span);
		const rail = deck - 0.17;
		const bridge = () => fleck([P.foam, P.white, P.foam, P.sand], [P.mist], 0.12);
		if (v > deck - 0.07 && v < deck + 0.02) return bridge();
		if (Math.abs(v - rail) < 0.03) return bridge();
		if (v > rail && v < deck && Math.abs(((u * 22) % 1) - 0.5) < 0.14) return bridge();
		// Shadow under the arch
		if (v >= deck + 0.02 && v < deck + 0.07) return fleck([P.blueDeep, P.seaDeep], [P.lavender], 0.15);
	}

	if (v > 0.55) {
		for (const p of PADS) {
			const d = Math.hypot((u - p.u) / p.rx, (v - p.v) / p.ry);
			if (d < 0.4 && p.flower) return p.flower === 'pink' ? fleck([P.lavender, P.coral], [P.white], 0.2) : fleck([P.white, P.cream], [P.sand], 0.1);
			if (d < 1) return fleck([P.sea, P.seaDeep, P.sea], [P.foam], 0.12);
		}
		// Pond water: pale reflections of sky
		return fleck([P.mist, P.sky, P.lavender, P.mist], [P.blue, P.foam], 0.12);
	}
	// Dark foliage and willows, a little light breaking through
	return fleck([P.seaDeep, P.sea, P.seaDeep, P.blueDeep], [P.foam, P.lavender], 0.12);
};

// Hassam, Poppies, Isles of Shoals (1891): Celia Thaxter's garden on Appledore, red poppies in
// green foliage tumbling down the rocks toward a deep blue sea.
export const poppies: Painter = (x, y, { w, h, P, fleck }) => {
	const u = x / w;
	const v = y / h;
	const horizon = 0.3;

	if (v < horizon) return fleck([P.sky, P.sky, P.white, P.mist], [P.sand], 0.1);
	// A low distant island on the horizon
	if (v < horizon + 0.04 && u > 0.55 && u < 0.85) return fleck([P.lavender, P.mist], [P.blue], 0.12);

	// The garden slopes down from the right; above it, pale rocky ledges, then the sea
	const gardenTop = 0.7 - 0.32 * u + 0.03 * Math.sin(u * 14);
	const ledgeTop = gardenTop - 0.08 - 0.03 * Math.sin(u * 9 + 1);
	if (v > gardenTop) {
		// Poppies gather in drifts, thicker toward the front
		const drift = Math.sin(x * 0.045 + 1) * Math.sin(y * 0.06 + x * 0.012) + (v - gardenTop) * 0.9;
		if (drift > 0.55) return fleck([P.coral, P.coral, P.coral, P.mist], [P.sand, P.white], 0.1);
		return fleck([P.sea, P.seaDeep, P.foam, P.sea], [P.coral, P.sand], 0.1);
	}
	if (v > ledgeTop) return fleck([P.lavender, P.sand, P.mist, P.white], [P.lavenderDeep], 0.12);
	return fleck([P.blue, P.blueDeep, P.sea, P.blue], [P.white, P.foam], 0.12);
};
