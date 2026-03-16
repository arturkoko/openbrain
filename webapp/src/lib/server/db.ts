import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
	host: process.env.DB_HOST || '172.17.0.1',
	port: parseInt(process.env.DB_PORT || '5432'),
	database: process.env.DB_NAME || 'openbrain',
	user: process.env.DB_USER || 'openbrain',
	password: process.env.DB_PASSWORD || 'openbrain_secret_change_me',
	max: 10,
	idleTimeoutMillis: 30000
});

export async function query(text: string, params?: unknown[]) {
	const result = await pool.query(text, params);
	return result;
}
