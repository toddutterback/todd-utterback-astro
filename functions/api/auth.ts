export interface Env {
	PUSHUP_PASSCODE: string;
	PUSHUP_COOKIE_SECRET: string;
}

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

async function hmacSha256(secret: string, message: string) {
	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		enc.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign'],
	);
	const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
	return new Uint8Array(sig);
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	let body: { passcode?: string } = {};
	try {
		body = (await request.json()) as { passcode?: string };
	} catch {
		return json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
	}

	if (!env.PUSHUP_PASSCODE) return json({ ok: false, error: 'MISSING_PASSCODE' }, { status: 500 });
	if (!env.PUSHUP_COOKIE_SECRET) return json({ ok: false, error: 'MISSING_COOKIE_SECRET' }, { status: 500 });

	if (String(body.passcode || '') !== env.PUSHUP_PASSCODE) {
		return json({ ok: false, error: 'PASSCODE_MISMATCH' }, { status: 401 });
	}

	// 30 days
	const exp = Date.now() + 1000 * 60 * 60 * 24 * 30;
	const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ exp })));
	const sigB64 = base64UrlEncode(await hmacSha256(env.PUSHUP_COOKIE_SECRET, payloadB64));
	const token = `${payloadB64}.${sigB64}`;

	return new Response(JSON.stringify({ ok: true }), {
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'set-cookie': [
				`pushup_auth=${token}; Path=/; Max-Age=${60 * 60 * 24 * 30}; HttpOnly; Secure; SameSite=Strict`,
			].join(','),
		},
	});
};

