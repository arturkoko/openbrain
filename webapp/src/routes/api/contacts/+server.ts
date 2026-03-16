import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db.js';

export async function POST({ request }) {
	const data = await request.json();
	const result = await query(
		`INSERT INTO contacts (first_name, last_name, company, email_private, email_business, phone_private, phone_business, address, warmth, how_met, created_by)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'human') RETURNING *`,
		[data.first_name, data.last_name, data.company, data.email_private, data.email_business, data.phone_private, data.phone_business, data.address, parseInt(data.warmth) || 50, data.how_met]
	);
	return json(result.rows[0], { status: 201 });
}
