import { json } from '@sveltejs/kit';
import { verifyLogin } from '$lib/server/auth.js';

export async function POST({ request, cookies }) {
	const { username, password } = await request.json();
	const token = await verifyLogin(username, password);
	if (!token) return json({ error: 'Invalid credentials' }, { status: 401 });
	cookies.set('session', token, {
		path: '/', httpOnly: true, sameSite: 'lax', secure: false, maxAge: 60 * 60 * 24 * 7
	});
	return json({ success: true });
}
