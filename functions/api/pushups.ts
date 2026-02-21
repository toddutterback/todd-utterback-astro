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

async function relayToWebhook(env: Env, body: Partial<Payload>) {
	try {
		const webhookUrl = env.PUSHUP_WEBHOOK_URL;
		if (!webhookUrl) return json({ ok: false, error: 'MISSING_WEBHOOK_URL' }, { status: 500 });

		const payload: Payload = {
			date: String(body.date || ''),
			time: String(body.time || ''),
			count: Number(body.count || 0),
			style: String(body.style || 'standard'),
			recordedAt: String(body.recordedAt || new Date().toISOString()),
		};

		const url = new URL(webhookUrl);
		Object.entries(payload).forEach(([k, v]) => url.searchParams.set(k, String(v)));
		url.searchParams.set('v', String(Date.now()));

		const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
		const text = await res.text();
		let upstream: any = text;
		try {
			upstream = JSON.parse(text);
		} catch {
			return json({ ok: false, error: 'UPSTREAM_NOT_JSON', upstream: text.slice(0, 300) }, { status: 502 });
		}

		if (!res.ok) {
			return json({ ok: false, error: 'UPSTREAM_ERROR', status: res.status, upstream }, { status: 502 });
		}

		if (upstream?.ok !== true) {
			return json({ ok: false, error: 'UPSTREAM_NOT_OK', upstream }, { status: 502 });
		}

		return json({ ok: true, upstream });
	} catch (err) {
		return json({ ok: false, error: 'RELAY_FAILED', detail: String(err) }, { status: 502 });
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
		return json({ ok: false, error: 'UNHANDLED_GET', detail: String(err) }, { status: 500 });
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

