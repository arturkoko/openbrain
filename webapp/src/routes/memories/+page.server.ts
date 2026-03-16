import { query } from '$lib/server/db.js';

export async function load({ url }) {
	const search = url.searchParams.get('q') || '';
	let rows;
	if (search) {
		rows = await query('SELECT * FROM memories WHERE value ILIKE $1 OR key ILIKE $1 OR category ILIKE $1 ORDER BY created_at DESC', [`%${search}%`]);
	} else {
		rows = await query('SELECT * FROM memories ORDER BY created_at DESC LIMIT 50');
	}
	return { memories: rows.rows, search };
}
