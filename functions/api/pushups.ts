export interface Env {
	PUSHUP_WEBHOOK_URL: string;
	PUSHUP_PASSCODE: string;
}

type Payload = {
	date: string;
	time: string;
	count: number;
	style: string;
	recordedAt: string;
	passcode: string;
};

function json(data: unknown, init?: ResponseInit) {
	return new Response(JSON.stringify(data), {
		headers: { 'content-type': 'application/json; charset=utf-8' },
		...init,
	});
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	let body: Partial<Payload> = {};
	try {
		body = (await request.json()) as Partial<Payload>;
	} catch {
		return json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
	}

	const webhookUrl = env.PUSHUP_WEBHOOK_URL;
	const expected = env.PUSHUP_PASSCODE;
	if (!webhookUrl) return json({ ok: false, error: 'MISSING_WEBHOOK_URL' }, { status: 500 });
	if (!expected) return json({ ok: false, error: 'MISSING_PASSCODE' }, { status: 500 });

	if (String(body.passcode || '') !== expected) {
		return json({ ok: false, error: 'PASSCODE_MISMATCH' }, { status: 401 });
	}

	const payload: Payload = {
		date: String(body.date || ''),
		time: String(body.time || ''),
		count: Number(body.count || 0),
		style: String(body.style || 'standard'),
		recordedAt: String(body.recordedAt || new Date().toISOString()),
		passcode: expected,
	};

	try {
		const res = await fetch(webhookUrl, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(payload),
		});

		const text = await res.text();
		// Apps Script may reply with JSON or plain text.
		let upstream: unknown = text;
		try {
			upstream = JSON.parse(text);
		} catch {
			// ignore
		}

		if (!res.ok) {
			return json({ ok: false, error: 'UPSTREAM_ERROR', status: res.status, upstream }, { status: 502 });
		}

		return json({ ok: true, upstream });
	} catch (err) {
		return json({ ok: false, error: 'FETCH_FAILED', detail: String(err) }, { status: 502 });
	}
};

