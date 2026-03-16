import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db.js';

export async function POST({ request }) {
	const data = await request.json();
	const result = await query(
		`INSERT INTO memories (category, key, value, created_by) VALUES ($1,$2,$3,'human') RETURNING *`,
		[data.category, data.key, data.value]
	);
	return json(result.rows[0], { status: 201 });
}
