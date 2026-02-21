export interface Env {
	PUSHUP_WEBHOOK_URL: string;
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

function safeSnippet(input: unknown, max = 300) {
	const text = typeof input === 'string' ? input : JSON.stringify(input ?? '');
	return text.length > max ? `${text.slice(0, max)}…` : text;
}

async function relayToWebhook(env: Env, body: Partial<Payload>) {
	const webhookUrl = env.PUSHUP_WEBHOOK_URL;
	if (!webhookUrl) return json({ ok: false, error: 'MISSING_WEBHOOK_URL' }, { status: 500 });

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

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort('timeout'), 10000);
		const res = await fetch(url.toString(), {
			method: 'GET',
			redirect: 'follow',
			signal: controller.signal,
		});
		clearTimeout(timeout);

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
				{
					ok: false,
					error: 'UPSTREAM_ERROR',
					status: res.status,
					upstream: safeSnippet(upstream),
				},
				{ status: 502 },
			);
		}

		// We expect the Apps Script endpoint to return JSON with { ok: true } on successful append.
		// If it returns { ok: false } (e.g. PASSCODE_MISMATCH) or HTML, treat as failure.
		if (typeof upstream === 'object' && upstream !== null && 'ok' in upstream) {
			const ok = (upstream as { ok?: unknown }).ok === true;
			if (!ok) {
				return json(
					{ ok: false, error: 'UPSTREAM_NOT_OK', upstream: safeSnippet(upstream) },
					{ status: 502 },
				);
			}
		} else {
			return json(
				{ ok: false, error: 'UPSTREAM_NOT_JSON', upstream: safeSnippet(upstream) },
				{ status: 502 },
			);
		}

		return json({ ok: true, upstream });
	} catch (err) {
		return json({ ok: false, error: 'FETCH_FAILED', detail: safeSnippet(String(err)) }, { status: 502 });
	}
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
	try {
		const url = new URL(request.url);
		const p = url.searchParams;

		// Health check
		if (!p.has('count') && !p.has('recordedAt')) {
			return json({ ok: true });
		}

		return relayToWebhook(env, {
			date: p.get('date') || '',
			time: p.get('time') || '',
			count: Number(p.get('count') || 0),
			style: p.get('style') || 'standard',
			recordedAt: p.get('recordedAt') || '',
		});
	} catch (err) {
		return json({ ok: false, error: 'UNHANDLED_GET', detail: safeSnippet(String(err)) }, { status: 500 });
	}
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	try {
		const body = (await request.json()) as Partial<Payload>;
		return relayToWebhook(env, body);
	} catch {
		return json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
	}
};

