import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db.js';

export async function POST({ request }) {
	const data = await request.json();
	const result = await query(
		`INSERT INTO reminders (title, description, due_date, priority, created_by) VALUES ($1,$2,$3,$4,'human') RETURNING *`,
		[data.title, data.description, data.due_date || null, data.priority]
	);
	return json(result.rows[0], { status: 201 });
}

export async function PATCH({ request }) {
	const data = await request.json();
	const result = await query('UPDATE reminders SET status = $1 WHERE id = $2 RETURNING *', [data.status, data.id]);
	return json(result.rows[0]);
}
