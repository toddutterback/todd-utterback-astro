export interface Env {
	PUSHUP_WEBHOOK_URL: string;
	PUSHUP_PASSCODE: string;
	PUSHUP_COOKIE_SECRET: string;
}

type Payload = {
	date: string;
	time: string;
	count: number;
	style: string;
	recordedAt: string;
};

function json(data: unknown, init?: ResponseInit) {
	return new Response(JSON.stringify(data), {
		headers: { 'content-type': 'application/json; charset=utf-8' },
		...init,
	});
}

function base64UrlEncode(bytes: Uint8Array) {
	const bin = String.fromCharCode(...bytes);
	const b64 = btoa(bin);
	return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecodeToBytes(s: string) {
	const padded = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
	const bin = atob(padded);
	const bytes = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
	return bytes;
}

async function hmacSha256(secret: string, message: string) {
	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		enc.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign', 'verify'],
	);
	const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
	return new Uint8Array(sig);
}

function getCookie(request: Request, name: string) {
	const cookie = request.headers.get('cookie') || '';
	const parts = cookie.split(';').map((p) => p.trim());
	for (const part of parts) {
		if (!part) continue;
		const eq = part.indexOf('=');
		if (eq === -1) continue;
		const k = part.slice(0, eq);
		if (k !== name) continue;
		return part.slice(eq + 1);
	}
	return null;
}

async function verifyAuthCookie(secret: string, token: string | null) {
	if (!token) return false;
	const [payloadB64, sigB64] = token.split('.', 2);
	if (!payloadB64 || !sigB64) return false;

	let payload: { exp: number } | null = null;
	try {
		const bytes = base64UrlDecodeToBytes(payloadB64);
		payload = JSON.parse(new TextDecoder().decode(bytes));
	} catch {
		return false;
	}

	if (!payload?.exp || Date.now() > payload.exp) return false;

	const expectedSig = await hmacSha256(secret, payloadB64);
	const givenSig = base64UrlDecodeToBytes(sigB64);
	if (givenSig.length !== expectedSig.length) return false;
	for (let i = 0; i < givenSig.length; i++) {
		if (givenSig[i] !== expectedSig[i]) return false;
	}
	return true;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	let body: Partial<Payload> = {};
	try {
		body = (await request.json()) as Partial<Payload>;
	} catch {
		return json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
	}

	const webhookUrl = env.PUSHUP_WEBHOOK_URL;
	if (!webhookUrl) return json({ ok: false, error: 'MISSING_WEBHOOK_URL' }, { status: 500 });
	if (!env.PUSHUP_COOKIE_SECRET) return json({ ok: false, error: 'MISSING_COOKIE_SECRET' }, { status: 500 });

	const ok = await verifyAuthCookie(env.PUSHUP_COOKIE_SECRET, getCookie(request, 'pushup_auth'));
	if (!ok) {
		return json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
	}

	const payload: Payload = {
		date: String(body.date || ''),
		time: String(body.time || ''),
		count: Number(body.count || 0),
		style: String(body.style || 'standard'),
		recordedAt: String(body.recordedAt || new Date().toISOString()),
	};

	try {
		// Use GET with query params to avoid redirect/body edge-cases when calling Apps Script.
		const url = new URL(webhookUrl);
		Object.entries(payload).forEach(([k, v]) => url.searchParams.set(k, String(v)));
		url.searchParams.set('v', String(Date.now())); // cache bust

		const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });

		const text = await res.text();
		// Apps Script may reply with JSON or plain text.
		let upstream: unknown = text;
		try {
			upstream = JSON.parse(text);
		} catch {
			// ignore
		}

		if (!res.ok) {
			return json(
				{ ok: false, error: 'UPSTREAM_ERROR', status: res.status, upstream, url: url.toString() },
				{ status: 502 },
			);
		}

		return json({ ok: true, upstream });
	} catch (err) {
		return json({ ok: false, error: 'FETCH_FAILED', detail: String(err) }, { status: 502 });
	}
};

