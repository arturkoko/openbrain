import type { Handle } from '@sveltejs/kit';
import { verifyToken, userCount, createUser } from '$lib/server/auth.js';

export const handle: Handle = async ({ event, resolve }) => {
	// Ensure default admin user exists
	const count = await userCount();
	if (count === 0) {
		const defaultUser = process.env.DEFAULT_ADMIN_USER || 'admin';
		const defaultPass = process.env.DEFAULT_ADMIN_PASSWORD || 'change-me-on-first-login';
		await createUser(defaultUser, defaultPass);
	}

	// Public routes
	const publicPaths = ['/login', '/api/auth/login'];
	if (publicPaths.some(p => event.url.pathname.startsWith(p))) {
		return resolve(event);
	}

	// Check auth
	const token = event.cookies.get('session');
	if (!token) {
		return new Response(null, { status: 302, headers: { location: '/login' } });
	}

	const user = verifyToken(token);
	if (!user) {
		event.cookies.delete('session', { path: '/' });
		return new Response(null, { status: 302, headers: { location: '/login' } });
	}

	event.locals.user = user;
	return resolve(event);
};
