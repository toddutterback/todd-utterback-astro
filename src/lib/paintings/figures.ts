// Shared pieces for the card paintings. Each painter composes its subject in the top STAGE px
// of a card (the part not covered by the text placard); x is laid out as a fraction of the
// card width so scenes hold together from phone to desktop.

import { nearSegment, type Brush } from '../pointillism';

export const STAGE = 176;

export type Pt = [number, number];

// An 1880s strongman's striped bathing suit: navy and cream bands along the torso.
export function striped(px: number, py: number, a: Pt, b: Pt, { P, fleck }: Brush) {
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	const t = ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy);
	return Math.floor(t * 7) % 2 === 0 ? fleck([P.blueDeep, P.ink], [P.blue], 0.1) : fleck([P.cream, P.white], [P.sand], 0.1);
}

export const skin = ({ P, fleck }: Brush) => fleck(['#e9c9a8', P.sand, '#f0d6bb'], [P.coral], 0.12);

export function limb(x: number, y: number, pts: Pt[], r: number) {
	for (let i = 0; i < pts.length - 1; i++) {
		if (nearSegment(x, y, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], r)) return true;
	}
	return false;
}

// A top hat, optionally tumbling through the air. `k` scales it.
export function topHat(x: number, y: number, cx: number, cy: number, tilt: number, k: number, b: Brush) {
	const { P, fleck } = b;
	const c = Math.cos(-tilt);
	const s = Math.sin(-tilt);
	const lx = ((x - cx) * c - (y - cy) * s) / k;
	const ly = ((x - cx) * s + (y - cy) * c) / k;
	if (Math.abs(lx) < 7 && ly > -18 && ly < 0) return ly > -6 && ly < -2.5 ? P.coral : fleck([P.ink, P.lavenderDeep], [P.blue], 0.06);
	if (Math.abs(lx) < 12 && ly >= 0 && ly < 3.5) return fleck([P.ink, P.lavenderDeep], [P.blue], 0.06);
	return null;
}

// Head with slicked hair and a handlebar mustache, facing right.
export function headAt(x: number, y: number, hx: number, hy: number, r: number, b: Brush) {
	if (Math.hypot(x - hx, y - hy) >= r) return null;
	if (y < hy - r * 0.25 && x < hx + r * 0.45) return b.P.ink;
	if (Math.abs(y - (hy + r * 0.4)) < 1.8 && Math.abs(x - (hx + r * 0.45)) < r * 0.55) return b.P.ink;
	if (Math.hypot(x - (hx + r * 0.35), y - (hy - r * 0.1)) < 1.5) return b.P.ink;
	return skin(b);
}

export const tights = ({ P, fleck }: Brush) => fleck([P.ink, P.blueDeep], [P.lavender], 0.08);
