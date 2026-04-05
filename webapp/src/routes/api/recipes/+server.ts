import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db.js';

export async function POST({ request }) {
	const data = await request.json();
	const ingredients = JSON.stringify(data.ingredients || []);
	const result = await query(
		`INSERT INTO recipes (title, description, ingredients, instructions, servings, prep_time, cook_time, category, language, source_url, notes, tags, created_by)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'human') RETURNING *`,
		[data.title, data.description, ingredients, data.instructions, data.servings, data.prep_time, data.cook_time, data.category, data.language || 'de', data.source_url, data.notes, data.tags || []]
	);
	return json(result.rows[0], { status: 201 });
}

export async function PUT({ request }) {
	const data = await request.json();
	const { id, ...fields } = data;
	if (fields.ingredients) fields.ingredients = JSON.stringify(fields.ingredients);
	const keys = Object.keys(fields);
	const vals = Object.values(fields);
	const sets = keys.map((k, i) => `${k} = $${i + 1}`);
	vals.push(id);
	const result = await query(
		`UPDATE recipes SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING *`,
		vals
	);
	return result.rows.length ? json(result.rows[0]) : json({ error: 'Not found' }, { status: 404 });
}

export async function DELETE({ request }) {
	const { id } = await request.json();
	const result = await query('DELETE FROM recipes WHERE id = $1 RETURNING id', [id]);
	return result.rows.length ? json({ deleted: id }) : json({ error: 'Not found' }, { status: 404 });
}
