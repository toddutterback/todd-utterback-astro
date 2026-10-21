// Paintings for the essays on /thoughts, keyed by post slug. To add one, see the
// paint-thought skill in .claude/skills.

import { inPolygon, nearSegment, type Brush, type Painter } from '../pointillism';
import { headAt, limb, skin, STAGE, striped, tights, type Pt } from './figures';

// Rotate (x, y) into a frame centered at (cx, cy) and tilted by `tilt` radians.
function local(x: number, y: number, cx: number, cy: number, tilt: number): Pt {
	const c = Math.cos(-tilt);
	const s = Math.sin(-tilt);
	return [(x - cx) * c - (y - cy) * s, (x - cx) * s + (y - cy) * c];
}

// Mend and Make Do: Knox-Johnston's little ketch SUHAILI in a Southern Ocean swell,
// mainsail patched in coral.
const suhaili: Painter = (x, y, { w, P, fleck }) => {
	const S = STAGE;
	const surface = S * 0.6 + 8 * Math.sin(x / 22) + 4 * Math.sin(x / 9 + 1);

	const [lx, ly] = local(x, y, w * 0.5, S * 0.64, -0.12);
	// Hull, with a dark rail along the top
	if (ly > -3 && ly < 13 && Math.abs(lx - 2) < 60 - ly * 2.2) {
		if (ly < 1) return fleck([P.ink, P.lavenderDeep], [P.sand], 0.1);
		return fleck([P.lavenderDeep, P.sand, P.lavenderDeep], [P.coral], 0.12);
	}
	// Masts: main and the shorter mizzen
	if (Math.abs(lx - 4) < 1.8 && ly > -94 && ly < -2) return P.ink;
	if (Math.abs(lx + 34) < 1.6 && ly > -62 && ly < -2) return P.ink;
	// Sails: jib, patched main, mizzen
	if (inPolygon(lx, ly, [[8, -88], [56, -6], [9, -6]])) return fleck([P.cream, P.white], [P.sand], 0.1);
	if (inPolygon(lx, ly, [[1, -90], [1, -6], [-30, -6]])) {
		if (lx > -15 && lx < -5 && ly > -40 && ly < -29) return fleck([P.coral, P.coral], [P.sand], 0.1);
		return fleck([P.cream, P.white], [P.sand], 0.1);
	}
	if (inPolygon(lx, ly, [[-36, -60], [-36, -6], [-58, -6]])) return fleck([P.cream, P.mist], [P.sand], 0.1);

	// Stormy sky, then the sea with whitecaps on the swell
	if (y < surface) {
		const cloud = Math.sin(x / 30) * 6 + S * 0.22;
		if (Math.abs(y - cloud) < 14) return fleck([P.lavender, P.mist, P.lavenderDeep], [P.cream], 0.15);
		return fleck([P.mist, P.sky, P.lavender], [P.cream], 0.1);
	}
	if (y - surface < 5) return fleck([P.white, P.cream, P.mist], [P.sea], 0.3);
	return fleck([P.blueDeep, P.blue, P.sea, P.blueDeep], [P.white, P.mist], 0.12);
};

// The Efficiency Bargain: a steam locomotive barreling across a stone viaduct.
const locomotive: Painter = (x, y, { w, P, fleck }) => {
	const S = STAGE;
	const deck = S * 0.56;
	const front = w * 0.8;

	// Smoke billowing back from the chimney
	for (let i = 0; i < 5; i++) {
		const sx = front - 24 - i * w * 0.13;
		const sy = deck - 66 - i * 5;
		if (Math.hypot(x - sx, y - sy) < 10 + i * 3) return fleck([P.cream, P.white, P.lavender], [P.mist], 0.15);
	}
	// Wheels with sand hubs
	for (const wx of [front - 66, front - 44, front - 22]) {
		const d = Math.hypot(x - wx, y - (deck - 10));
		if (d < 3) return P.sand;
		if (d < 10) return fleck([P.lavenderDeep, P.ink], [P.sand], 0.1);
	}
	// Chimney, boiler with a coral band, cab with a lit window, tender, cowcatcher
	if (x > front - 30 && x < front - 20 && y > deck - 58 && y < deck - 38) return P.ink;
	if (x > front - 86 && x < front && y > deck - 40 && y < deck - 14) {
		if (y > deck - 30 && y < deck - 25) return P.coral;
		return fleck([P.blueDeep, P.ink], [P.blue], 0.1);
	}
	if (x > front - 120 && x < front - 84 && y > deck - 60 && y < deck - 14) {
		if (x > front - 112 && x < front - 94 && y > deck - 52 && y < deck - 38) return fleck([P.cream, P.sand], [P.coral], 0.1);
		return fleck([P.ink, P.blueDeep], [P.lavender], 0.1);
	}
	if (x > front - 170 && x < front - 124 && y > deck - 36 && y < deck - 10) return fleck([P.blueDeep, P.lavenderDeep], [P.ink], 0.1);
	if (inPolygon(x, y, [[front, deck - 20], [front + 16, deck - 2], [front, deck - 2]])) return P.coral;

	// Rails and the stone viaduct with its arches
	if (y > deck - 2 && y < deck + 1) return P.ink;
	if (y >= deck + 1 && y < deck + 8) return fleck([P.sand, P.lavender], [P.lavenderDeep], 0.15);
	if (y >= deck + 8) {
		const span = 44;
		const lx = (((x + 10) % span) + span) % span - span / 2;
		const crown = deck + 24;
		const open = Math.hypot(lx, y - crown) < 16 || (Math.abs(lx) < 16 && y > crown);
		if (!open) return fleck([P.sand, P.lavender, P.sand], [P.lavenderDeep], 0.15);
		return fleck([P.blue, P.mist, P.sea], [P.white], 0.12);
	}

	// Sky over soft green hills
	const hills = S * 0.4 + 8 * Math.sin(x / 40 + 2);
	if (y > hills) return fleck([P.foam, P.sea, P.foam], [P.sand], 0.1);
	return fleck([P.sky, P.sky, P.mist, P.cream], [P.sand, P.lavender], 0.1);
};

// The Official Engineering Leader of Utah Tech Week: a blue-ribbon medal over the Wasatch.
const PEAKS = [
	[0.08, 46],
	[0.28, 70],
	[0.5, 54],
	[0.72, 78],
	[0.94, 50],
];
const medal: Painter = (x, y, { w, P, fleck }) => {
	const S = STAGE;
	const cx = w * 0.5;
	const my = S * 0.5;

	// Medal: gold disc, darker rim, coral star
	const d = Math.hypot(x - cx, y - my);
	if (d < 31) {
		const a = Math.atan2(y - my, x - cx) + Math.PI / 2;
		const star = 8 + 8 * Math.abs(Math.cos(2.5 * a)) ** 3;
		if (d < star) return P.coral;
		if (d > 27) return fleck([P.sand, P.lavenderDeep], [P.coral], 0.1);
		return fleck([P.sand, P.cream, P.sand], [P.coral, P.white], 0.12);
	}
	// Blue ribbon in a V from the top of the card down to the medal
	if (nearSegment(x, y, cx - w * 0.16, 0, cx - 5, my - 28, 8) || nearSegment(x, y, cx + w * 0.16, 0, cx + 5, my - 28, 8))
		return fleck([P.blue, P.blueDeep], [P.mist], 0.12);

	// Snowcapped peaks, foothills, a green valley
	let ridge = Infinity;
	for (const [pu, ph] of PEAKS) ridge = Math.min(ridge, S * 0.68 - ph + Math.abs(x - w * pu) * 0.9);
	if (y > ridge && y < S * 0.68) {
		if (y < S * 0.68 - 44) return fleck([P.white, P.cream, P.mist], [P.lavender], 0.12);
		return fleck([P.lavender, P.blue, P.lavenderDeep], [P.mist], 0.12);
	}
	if (y >= S * 0.68) return fleck([P.foam, P.sea, P.foam], [P.sand], 0.1);
	return fleck([P.sky, P.sky, P.mist, P.cream], [P.sand], 0.1);
};

// The Golden Mean: a tightrope walker balanced right in the middle, after Seurat's Le Cirque.
const tightrope: Painter = (x, y, b) => {
	const { w, P, fleck } = b;
	const S = STAGE;
	const cx = w * 0.5;
	const ropeY = (px: number) => S * 0.76 + 6 * (1 - ((px - cx) / (w / 2)) ** 2);
	const feet = ropeY(cx);
	const k = 1.4;

	// The walker: bun, head, bodice, coral tutu, legs, arms out to the pole
	if (Math.hypot(x - (cx - 5), y - (feet - 70 * k)) < 4.5) return P.ink;
	if (Math.hypot(x - cx, y - (feet - 62 * k)) < 9) return y < feet - 66 * k ? P.ink : skin(b);
	if (Math.hypot((x - cx) / 22, (y - (feet - 31 * k)) / 6) < 1) return fleck([P.coral, P.coral, P.cream], [P.sand], 0.12);
	if (limb(x, y, [[cx, feet - 52 * k], [cx, feet - 32 * k]], 8)) return fleck([P.blueDeep, P.lavenderDeep], [P.sand], 0.1);
	if (limb(x, y, [[cx, feet - 30 * k], [cx - 5, feet - 1]], 3.8) || limb(x, y, [[cx, feet - 30 * k], [cx + 5, feet - 1]], 3.8)) return tights(b);
	if (limb(x, y, [[cx, feet - 50 * k], [cx - 20, feet - 43 * k]], 3.2) || limb(x, y, [[cx, feet - 50 * k], [cx + 20, feet - 45 * k]], 3.2)) return skin(b);
	// Balance pole, with a weight on each end: the two vices
	const pole: [Pt, Pt] = [[cx - w * 0.38, feet - 40 * k], [cx + w * 0.38, feet - 46 * k]];
	for (const [px, py] of pole) if (Math.hypot(x - px, y - py) < 7) return fleck([P.sand, P.lavenderDeep], [P.coral], 0.1);
	if (limb(x, y, pole, 2)) return P.ink;

	// Rope, the posts holding it, and the sawdust ring
	const onStage = x > 0 && x < w;
	if (onStage && Math.abs(y - ropeY(x)) < 1.6) return P.ink;
	if (onStage && (x < w * 0.05 || x > w * 0.95) && y > ropeY(x)) return fleck([P.lavenderDeep, P.ink], [P.sand], 0.1);
	if (y > S * 0.9) return fleck([P.sand, P.cream, P.sand], [P.coral, P.lavender], 0.1);

	// Bunting strung along the top, over the striped tent wall
	const flag = ((x % 24) + 24) % 24;
	const top = 8 + 5 * Math.sin((x / w) * Math.PI);
	if (y > top && y < top + 12 - Math.abs(flag - 12)) return Math.floor(x / 24) % 2 ? P.coral : P.sand;
	if (Math.abs(y - top) < 1) return P.lavenderDeep;
	return Math.floor(x / 26) % 2 ? fleck([P.cream, P.sky], [P.sand], 0.1) : fleck([P.foam, P.sky, P.foam], [P.mist], 0.1);
};

// Why this site: someone writing on a park bench, a trail of dots behind them and a
// thought bubble rising.
const benchWriter: Painter = (x, y, b) => {
	const { w, P, fleck } = b;
	const S = STAGE;
	const seat = S * 0.7;
	const bx = w * 0.6;

	// Thought bubble
	for (const [u, v, r] of [
		[0.71, 0.33, 3],
		[0.76, 0.24, 5],
		[0.85, 0.12, 13],
	]) {
		const d = Math.hypot(x - w * u, y - S * v);
		if (d < r) return fleck([P.white, P.cream], [P.mist], 0.1);
		if (d < r + 2.5) return fleck([P.lavenderDeep, P.lavender], [P.blue], 0.1);
	}

	// Writer: bowler hat, head, coat, legs, notebook, pencil, writing arm
	if (Math.hypot((x - (bx + 2)) / 10, (y - (S * 0.37)) / 5) < 1 && y < S * 0.38) return P.ink;
	if (Math.abs(x - (bx + 2)) < 13 && Math.abs(y - S * 0.38) < 1.5) return P.ink;
	const head = headAt(x, y, bx + 3, S * 0.43, 9, b);
	if (head) return head;
	if (limb(x, y, [[bx + 2, S * 0.5], [bx - 2, seat - 4]], 9)) return fleck([P.blueDeep, P.ink], [P.blue], 0.1);
	if (limb(x, y, [[bx, seat - 3], [bx + 22, seat - 3], [bx + 22, S * 0.92]], 5)) return tights(b);
	if (inPolygon(x, y, [[bx + 12, seat - 18], [bx + 30, seat - 22], [bx + 32, seat - 10], [bx + 14, seat - 7]]))
		return fleck([P.cream, P.white], [P.lavender], 0.1);
	if (limb(x, y, [[bx + 22, seat - 26], [bx + 28, seat - 14]], 1.4)) return P.coral;
	if (limb(x, y, [[bx + 4, S * 0.52], [bx + 14, seat - 12], [bx + 24, seat - 16]], 3.2)) return skin(b);

	// Bench: backrest, seat, legs
	if (x > w * 0.44 && x < w * 0.8) {
		if (Math.abs(y - S * 0.56) < 2.5 || Math.abs(y - seat) < 2.5) return fleck([P.sand, P.lavenderDeep], [P.ink], 0.15);
		if ((Math.abs(x - w * 0.47) < 2 || Math.abs(x - w * 0.77) < 2) && y > S * 0.55 && y < S * 0.9)
			return fleck([P.lavenderDeep, P.ink], [P.sand], 0.1);
	}

	// A trail of dots wandering in from the lower left
	for (let t = 0; t <= 1; t += 0.09) {
		const tx = w * (0.03 + 0.36 * t);
		const ty = S * (1.02 - 0.12 * t + 0.05 * Math.sin(t * 7));
		if (Math.hypot(x - tx, y - ty) < 3) return Math.round(t * 11) % 2 ? P.coral : P.sand;
	}

	// Tree on the left, sky, grass
	if (Math.hypot(x - w * 0.12, y - S * 0.28) < 42) return fleck([P.seaDeep, P.sea, P.seaDeep], [P.blue, P.lavender], 0.15);
	if (Math.abs(x - w * 0.12) < 5 && y < S * 0.8) return fleck([P.lavenderDeep, P.ink], [P.sand], 0.1);
	if (y < S * 0.5) return fleck([P.sky, P.sky, P.mist, P.cream], [P.sand], 0.1);
	return fleck([P.foam, P.sea, P.foam, P.sky], [P.sand, P.lavender], 0.1);
};

// Trust is the process: the strongman tossing a coral coin into a big piggy bank, one more
// deposit in the trust account.
const piggyBank: Painter = (x, y, b) => {
	const { w, P, fleck } = b;
	const S = STAGE;
	const ground = S * 0.86;
	const onStage = x > -20 && x < w + 20;
	const px = w * 0.64;
	const py = S * 0.6;
	const slot: Pt = [px - 6, py - 35];

	// The coin just above the slot, and its arc back to his hand
	const coin: Pt = [slot[0] - 2, slot[1] - 24];
	const cd = Math.hypot(x - coin[0], y - coin[1]);
	if (cd < 16) {
		if (cd > 12.5) return P.ink;
		if (Math.hypot(x - (coin[0] - 5), y - (coin[1] - 5)) < 3.5) return P.white;
		return fleck([P.coral, P.coral, P.sand], [P.white], 0.08);
	}
	const hand: Pt = [w * 0.3, S * 0.2];
	for (let t = 0.15; t < 0.9; t += 0.15) {
		const tx = hand[0] + (coin[0] - hand[0]) * t;
		const ty = hand[1] + (coin[1] - hand[1]) * t - 26 * Math.sin(t * Math.PI);
		if (Math.hypot(x - tx, y - ty) < 2.8) return P.lavenderDeep;
	}

	// The strongman, arm still up from the toss
	const shoulders: Pt = [w * 0.2, S * 0.42];
	const hips: Pt = [w * 0.2, S * 0.64];
	const head = headAt(x, y, w * 0.21, S * 0.31, 12, b);
	if (head) return head;
	if (limb(x, y, [shoulders, [w * 0.26, S * 0.3], hand], 4.5)) return skin(b);
	if (limb(x, y, [shoulders, hips], 11)) return striped(x, y, shoulders, hips, b);
	if (limb(x, y, [hips, [w * 0.16, ground - 2]], 6) || limb(x, y, [hips, [w * 0.25, ground - 2]], 6)) return tights(b);
	if (limb(x, y, [shoulders, [w * 0.15, S * 0.54], [w * 0.17, S * 0.63]], 4.5)) return skin(b);

	// The piggy bank, facing right: slot, ear, eye, pale snout, round body, legs, curly tail
	if (Math.abs(x - slot[0]) < 12 && Math.abs(y - slot[1]) < 2.5) return P.ink;
	if (inPolygon(x, y, [[px + 16, py - 28], [px + 26, py - 52], [px + 38, py - 22]])) return fleck([P.blueDeep, P.ink], [P.lavender], 0.1);
	if (Math.hypot(x - (px + 38), y - (py - 12)) < 3.5) return P.white;
	const snout = Math.hypot((x - (px + 60)) / 9, (y - (py - 2)) / 14);
	if (snout < 1) {
		if (Math.hypot(x - (px + 61), y - (py - 7)) < 2.5 || Math.hypot(x - (px + 61), y - (py + 3)) < 2.5) return P.ink;
		return fleck([P.lavender, P.mist], [P.cream], 0.1);
	}
	if (Math.hypot((x - px) / 58, (y - py) / 36) < 1) {
		if (Math.hypot((x - (px - 18)) / 18, (y - (py - 18)) / 8) < 1) return fleck([P.lavender, P.blue], [P.mist], 0.15);
		return fleck([P.blueDeep, P.lavenderDeep, P.blueDeep], [P.lavender], 0.1);
	}
	for (const lx of [-36, -16, 18, 38]) if (Math.abs(x - (px + lx)) < 6 && y > py && y < ground) return fleck([P.blueDeep, P.ink], [P.lavender], 0.08);
	const tail = Math.hypot(x - (px - 62), y - (py - 10));
	if (tail > 4 && tail < 7.5 && x < px - 57) return P.ink;

	// A stack of earlier deposits on the grass
	if (onStage && Math.abs(x - w * 0.92) < 11 && y > ground - 26 && y < ground)
		return Math.floor((y - ground) / 4.5) % 2 ? fleck([P.sand, P.cream], [P.white], 0.1) : P.ink;

	// Shadows under both of them
	if (Math.hypot((x - px) / 66, (y - ground) / 4) < 1 || Math.hypot((x - w * 0.21) / 22, (y - ground) / 3.5) < 1)
		return fleck([P.seaDeep, P.blue], [P.lavender], 0.15);

	// Plain pale sky, a low line of distant trees, pale lawn
	const treeTop = S * 0.5 + 3 * Math.sin(x / 14) + 2 * Math.sin(x / 5);
	if (y < treeTop) return fleck([P.sky, P.sky, P.mist], [P.cream], 0.06);
	if (y < S * 0.56) return fleck([P.sea, P.foam], [P.blue], 0.12);
	return fleck([P.foam, P.foam, P.cream], [P.sea], 0.06);
};

export const THOUGHTS: Record<string, Painter> = {
	'mend-and-make-do': suhaili,
	'the-efficiency-bargain': locomotive,
	'official-engineering-leader-of-utah-tech-week': medal,
	'vice-virtue-vice': tightrope,
	'why-this-site': benchWriter,
	'trust-is-the-process': piggyBank,
};

// Fallback for posts that don't have a bespoke painting yet: a calm seaside whose sun and boats
// are placed from the post's slug, so each one is a little different.
export function seaside(seed: string): Painter {
	let h = 2166136261;
	for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
	const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % 1000) / 1000;
	const sun = { u: 0.15 + rnd() * 0.7, v: 0.15 + rnd() * 0.15 };
	const boats = Array.from({ length: 1 + Math.floor(rnd() * 3) }, () => ({ u: 0.1 + rnd() * 0.75, s: 14 + rnd() * 16 }));
	const coralBoat = Math.floor(rnd() * boats.length);

	return (x, y, { w, P, fleck }: Brush) => {
		const S = STAGE;
		const horizon = S * 0.5;
		if (Math.hypot(x - w * sun.u, y - S * sun.v) < 16) return fleck([P.sand, P.cream], [P.coral], 0.08);
		for (const [i, bt] of boats.entries()) {
			const bx = w * bt.u;
			const by = horizon + 6;
			if (y < by && y > by - bt.s * 1.5) {
				const t = (y - (by - bt.s * 1.5)) / (bt.s * 1.5);
				if (x > bx && x < bx + bt.s * t)
					return i === coralBoat ? fleck([P.coral, P.sand], [P.cream], 0.15) : fleck([P.white, P.cream], [P.sand], 0.1);
			}
			if (y >= by && y < by + 4 && Math.abs(x - (bx + bt.s * 0.4)) < bt.s * 0.7) return fleck([P.blueDeep, P.ink], [P.sand], 0.1);
		}
		if (y < horizon) return fleck([P.sky, P.sky, P.mist, P.cream], [P.lavender, P.sand], 0.1);
		if (y < horizon + 4) return fleck([P.blue, P.sea], [P.lavender], 0.1);
		return fleck([P.foam, P.sky, P.foam, P.mist], [P.sand, P.lavender], 0.1);
	};
}
