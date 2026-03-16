import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db.js';

const JWT_SECRET = process.env.SESSION_SECRET || 'change_me_to_a_random_string_64_chars';
const TOKEN_EXPIRY = '7d';

export async function verifyLogin(username: string, password: string): Promise<string | null> {
	const result = await query('SELECT id, password_hash FROM app_users WHERE username = $1', [username]);
	if (result.rows.length === 0) return null;
	const user = result.rows[0];
	const valid = await bcryptjs.compare(password, user.password_hash);
	if (!valid) return null;
	return jwt.sign({ userId: user.id, username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): { userId: string; username: string } | null {
	try {
		return jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
	} catch {
		return null;
	}
}

export async function createUser(username: string, password: string) {
	const hash = await bcryptjs.hash(password, 12);
	await query('INSERT INTO app_users (username, password_hash) VALUES ($1, $2)', [username, hash]);
}

export async function userCount(): Promise<number> {
	const result = await query('SELECT COUNT(*) FROM app_users');
	return parseInt(result.rows[0].count);
}
