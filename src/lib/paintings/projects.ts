// Paintings for the project cards.

import { inPolygon, type Painter } from '../pointillism';
import { headAt, limb, skin, STAGE, striped, tights, topHat, type Pt } from './figures';

export const pushup: Painter = (x, y, b) => {
	const { w, P, fleck } = b;
	const S = STAGE;
	const ground = S * 0.84;

	const feet: Pt = [w * 0.1, ground - 7];
	const hips: Pt = [w * 0.38, ground - 26];
	const shoulders: Pt = [w * 0.64, ground - 44];
	const hand: Pt = [w * 0.64 + 4, ground - 1];

	const head = headAt(x, y, shoulders[0] + 20, shoulders[1] - 10, 13, b);
	if (head) return head;
	if (limb(x, y, [shoulders, hand], 5)) return skin(b);
	if (limb(x, y, [shoulders, hips], 11)) return striped(x, y, shoulders, hips, b);
	if (limb(x, y, [hips, feet], 7.5)) return tights(b);

	// His top hat, set neatly on the grass
	const hat = topHat(x, y, w * 0.88, ground - 2, 0, 1.5, b);
	if (hat) return hat;

	// Shadow under him
	if (y > ground - 2 && y < ground + 6 && x > feet[0] - 4 && x < hand[0] + 10) return fleck([P.seaDeep, P.blue], [P.lavender], 0.15);

	// Sky, a bumpy line of park trees, grass
	const treeTop = S * 0.26 + 6 * Math.sin(x / 13) + 4 * Math.sin(x / 5);
	if (y < treeTop) return fleck([P.sky, P.sky, P.mist, P.cream], [P.sand, P.lavender], 0.1);
	if (y < S * 0.46) return fleck([P.sea, P.seaDeep, P.foam], [P.blue, P.lavender], 0.15);
	return fleck([P.foam, P.foam, P.sea, P.sky], [P.sand, P.lavender], 0.1);
};

export const moon: Painter = (x, y, b) => {
	const { w, P, fleck } = b;
	const S = STAGE;
	const horizon = S * 0.64;
	const mx = w * 0.72;
	const my = S * 0.32;
	const mr = 34;

	const md = Math.hypot(x - mx, y - my);
	if (md < mr) {
		const craters: [number, number, number][] = [
			[-10, -7, 8],
			[11, 9, 7],
			[7, -15, 4.5],
			[-13, 13, 4.5],
		];
		for (const [ox, oy, r] of craters) if (Math.hypot(x - mx - ox, y - my - oy) < r) return fleck([P.lavender, P.mist], [P.sand], 0.2);
		return fleck([P.cream, P.white, P.sand], [P.mist], 0.1);
	}

	// A little sailboat beaming WiFi at the moon
	const bx = w * 0.2;
	const deck = horizon + 14;
	if (y > deck - 8 && y < deck + 4 && Math.abs(x - bx - 8) < 30 - (y - (deck - 8)) * 1.4) return fleck([P.coral, P.coral, P.sand], [P.ink], 0.1);
	if (Math.abs(x - bx) < 2 && y > deck - 62 && y < deck - 8) return P.sand;
	if (y > deck - 56 && y < deck - 12) {
		const t = (y - (deck - 56)) / 44;
		if (x > bx + 3 && x < bx + 3 + 28 * t) return fleck([P.cream, P.white], [P.sand], 0.1);
	}
	const ox = bx;
	const oy = deck - 66;
	const toMoon = Math.atan2(my - oy, mx - ox);
	const dist = Math.hypot(x - ox, y - oy);
	const off = Math.abs(Math.atan2(y - oy, x - ox) - toMoon);
	if (off < 0.45 && dist > 6) for (const r of [12, 25, 38, 51]) if (Math.abs(dist - r) < 3) return fleck([P.sand, P.cream], [P.coral], 0.2);

	// Night sky with a soft halo and a few stars
	if (y < horizon) {
		if (md < mr + 14) return fleck([P.blue, P.lavender, P.mist], [P.sand], 0.12);
		return fleck([P.blueDeep, P.blueDeep, P.lavenderDeep, P.ink], [P.sand, P.cream], 0.04);
	}

	// Sea, with a column of moonlight shimmering on it
	if (Math.abs(x - mx) < 12 + (y - horizon) * 0.35 && Math.random() < 0.5) return fleck([P.sand, P.cream, P.white], [P.mist], 0.1);
	return fleck([P.blue, P.blueDeep, P.blue, P.sea], [P.lavender, P.mist], 0.12);
};

export const runner: Painter = (x, y, b) => {
	const { w, P, fleck } = b;
	const S = STAGE;

	const shoulders: Pt = [w * 0.56, S * 0.3];
	const hips: Pt = [w * 0.5, S * 0.56];

	const head = headAt(x, y, shoulders[0] + 8, shoulders[1] - 15, 12, b);
	if (head) return head;
	// Front arm swinging up, torso, legs mid-stride, back arm behind
	if (limb(x, y, [shoulders, [w * 0.66, S * 0.42], [w * 0.72, S * 0.3]], 4.5)) return skin(b);
	if (limb(x, y, [shoulders, hips], 11)) return striped(x, y, shoulders, hips, b);
	if (limb(x, y, [hips, [w * 0.63, S * 0.7], [w * 0.6, S * 0.88]], 7)) return tights(b);
	if (limb(x, y, [hips, [w * 0.4, S * 0.68], [w * 0.27, S * 0.62]], 7)) return tights(b);
	if (limb(x, y, [shoulders, [w * 0.46, S * 0.42], [w * 0.41, S * 0.53]], 4.5)) return skin(b);

	// His hat, left behind mid-air
	const hat = topHat(x, y, w * 0.2, S * 0.2, -0.5, 1.3, b);
	if (hat) return hat;

	// Speed lines
	for (const ly of [0.3, 0.4, 0.5]) {
		if (Math.abs(y - S * ly) < 2 && x > w * 0.3 && x < w * 0.41) return fleck([P.white, P.cream], [P.sand], 0.1);
	}

	// Shadow on the sand
	if (Math.hypot((x - w * 0.52) / 34, (y - S * 0.91) / 4) < 1) return fleck([P.lavender, P.blue], [P.sand], 0.15);

	// Sky, sea, wet sand, dry beach
	if (y < S * 0.36) return fleck([P.sky, P.sky, P.mist, P.cream], [P.sand, P.lavender], 0.1);
	if (y < S * 0.56) return fleck([P.sea, P.mist, P.foam, P.sky], [P.white, P.sand], 0.12);
	if (y < S * 0.64) return fleck([P.mist, P.sand, P.foam], [P.white], 0.12);
	return fleck([P.sand, P.cream, P.sand], [P.lavender, P.coral], 0.08);
};

export const book: Painter = (x, y, b) => {
	const { w, P, fleck } = b;
	const S = STAGE;
	const tableTop = S * 0.56;

	// Candle with a flame and a warm glow on the wall
	const fx = w * 0.86;
	const fy = S * 0.2;
	if (Math.hypot((x - fx) / 6, (y - fy) / 12) < 1) return fleck([P.coral, P.sand, P.white], [P.cream], 0.1);
	if (Math.abs(x - fx) < 8 && y > fy + 12 && y < S * 0.62) return fleck([P.cream, P.white], [P.sand], 0.08);
	if (Math.hypot((x - fx) / 18, (y - S * 0.63) / 5) < 1) return fleck([P.sand, P.coral], [P.ink], 0.1);

	// The open book: a navy cover under two pages, with a ribbon bookmark
	const cx = w * 0.4;
	const cy = S * 0.66;
	const leftPage: Pt[] = [[cx - 84, cy - 52], [cx - 3, cy - 42], [cx - 3, cy + 12], [cx - 90, cy + 4]];
	const rightPage: Pt[] = [[cx + 3, cy - 42], [cx + 84, cy - 52], [cx + 90, cy + 4], [cx + 3, cy + 12]];
	const cover: Pt[] = [[cx - 92, cy - 44], [cx + 92, cy - 44], [cx + 100, cy + 22], [cx - 100, cy + 22]];
	if (limb(x, y, [[cx + 6, cy + 10], [cx + 12, cy + 34]], 2.6)) return P.coral;
	if (inPolygon(x, y, leftPage) || inPolygon(x, y, rightPage)) {
		if (Math.abs(x - cx) < 7) return fleck([P.sand, P.lavender], [P.cream], 0.2);
		const row = (y - (cy - 40)) % 7;
		const inText = Math.abs(x - cx) > 14 && Math.abs(x - cx) < 74 && y > cy - 38 && y < cy;
		if (inText && row < 2.5) return fleck([P.lavenderDeep, P.ink], [P.lavender], 0.25);
		return fleck([P.cream, P.white, P.cream], [P.sand], 0.08);
	}
	if (inPolygon(x, y, cover)) return fleck([P.blueDeep, P.ink, P.blueDeep], [P.sand], 0.1);

	// Wall with candlelight, then the table
	if (y < tableTop) {
		const glow = Math.hypot(x - fx, y - fy);
		if (glow < 30) return fleck([P.cream, P.sand], [P.coral], 0.1);
		if (glow < 58) return fleck([P.sand, P.cream, P.lavender], [P.coral], 0.12);
		return fleck([P.lavender, P.mist, P.sky, P.lavender], [P.sand], 0.1);
	}
	if (y < tableTop + 3) return fleck([P.lavenderDeep, P.ink], [P.sand], 0.1);
	return fleck([P.sand, P.sand, P.lavender, P.cream], [P.coral, P.lavenderDeep], 0.1);
};
