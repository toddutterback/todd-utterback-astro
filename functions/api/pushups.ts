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
};

function json(data: unknown, init?: ResponseInit) {
	return new Response(JSON.stringify(data), {
		headers: { 'content-type': 'application/json; charset=utf-8' },
		...init,
	});
}

function buildWebhookUrl(env: Env, body: Partial<Payload>) {
	const webhookUrl = env.PUSHUP_WEBHOOK_URL;
	if (!webhookUrl) return null;
	const passcode = env.PUSHUP_PASSCODE;
	if (!passcode) return null;

	const payload: Payload = {
		date: String(body.date || ''),
		time: String(body.time || ''),
		count: Number(body.count || 0),
		style: String(body.style || 'standard'),
		recordedAt: String(body.recordedAt || new Date().toISOString()),
	};

	const url = new URL(webhookUrl);
	Object.entries(payload).forEach(([k, v]) => url.searchParams.set(k, String(v)));
	url.searchParams.set('passcode', passcode);
	url.searchParams.set('v', String(Date.now()));
	return url.toString();
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
	try {
		const url = new URL(request.url);
		const p = url.searchParams;

		// Health check
		if (!p.has('count') && !p.has('recordedAt')) {
			return json({ ok: true });
		}

		const target = buildWebhookUrl(env, {
			date: p.get('date') || '',
			time: p.get('time') || '',
			count: Number(p.get('count') || 0),
			style: p.get('style') || 'standard',
			recordedAt: p.get('recordedAt') || '',
		});
		if (!target) return json({ ok: false, error: 'MISSING_WEBHOOK_URL_OR_PASSCODE' }, { status: 500 });
		return Response.redirect(target, 302);
	} catch (err) {
		return json({ ok: false, error: 'UNHANDLED_GET', detail: String(err) }, { status: 500 });
	}
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	try {
		const body = (await request.json()) as Partial<Payload>;
		const target = buildWebhookUrl(env, body);
		if (!target) return json({ ok: false, error: 'MISSING_WEBHOOK_URL_OR_PASSCODE' }, { status: 500 });
		return Response.redirect(target, 302);
	} catch {
		return json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
	}
};

