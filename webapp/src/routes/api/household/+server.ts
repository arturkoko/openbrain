import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db.js';

export async function POST({ request }) {
	const data = await request.json();
	const result = await query(
		`INSERT INTO household_items (category, name, value, location, brand, notes, created_by) VALUES ($1,$2,$3,$4,$5,$6,'human') RETURNING *`,
		[data.category, data.name, data.value, data.location, data.brand, data.notes]
	);
	return json(result.rows[0], { status: 201 });
}
