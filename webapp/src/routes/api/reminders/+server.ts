import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db.js';

export async function POST({ request }) {
	const data = await request.json();
	const result = await query(
		`INSERT INTO reminders (title, description, due_date, priority, notes, created_by) VALUES ($1,$2,$3,$4,$5,'human') RETURNING *`,
		[data.title, data.description || null, data.due_date || null, data.priority || 'normal', data.notes || null]
	);
	return json(result.rows[0], { status: 201 });
}

export async function PATCH({ request }) {
	const data = await request.json();
	const { id, ...fields } = data;
	if (!id) return json({ error: 'id required' }, { status: 400 });

	const allowed = ['status', 'title', 'description', 'due_date', 'priority', 'notes', 'recurring'];
	const keys: string[] = [];
	const vals: unknown[] = [];
	for (const [k, v] of Object.entries(fields)) {
		if (allowed.includes(k)) {
			keys.push(k);
			vals.push(v === '' ? null : v);
		}
	}
	if (keys.length === 0) return json({ error: 'no fields' }, { status: 400 });

	const sets = keys.map((k, i) => `${k} = $${i + 1}`);
	vals.push(id);
	const result = await query(`UPDATE reminders SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING *`, vals);
	return json(result.rows[0]);
}
