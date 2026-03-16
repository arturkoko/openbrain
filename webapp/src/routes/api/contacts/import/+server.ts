import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db.js';

export async function POST({ request }) {
	const { contacts } = await request.json();
	let imported = 0;
	let skipped = 0;

	for (const c of contacts) {
		// Duplicate check: match on (first_name + last_name) AND (email OR phone)
		const checks: string[] = [];
		const params: unknown[] = [c.first_name];
		let idx = 1;

		let dupSql = `SELECT id FROM contacts WHERE LOWER(first_name) = LOWER($${idx})`;

		if (c.last_name) {
			idx++;
			params.push(c.last_name);
			dupSql += ` AND LOWER(COALESCE(last_name,'')) = LOWER($${idx})`;
		}

		if (c.email) {
			idx++;
			params.push(c.email);
			checks.push(`LOWER(email) = LOWER($${idx})`);
		}
		if (c.phone) {
			// Normalize phone for comparison (strip non-digits)
			idx++;
			params.push(c.phone.replace(/\D/g, '').slice(-10));
			checks.push(`RIGHT(REGEXP_REPLACE(phone, '\\D', '', 'g'), 10) = $${idx}`);
		}

		if (checks.length > 0) {
			dupSql += ` AND (${checks.join(' OR ')})`;
		}

		const existing = await query(dupSql + ' LIMIT 1', params);
		if (existing.rows.length > 0) {
			skipped++;
			continue;
		}

		await query(
			`INSERT INTO contacts (first_name, last_name, company, role, email, phone, linkedin, birthday, created_by)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'human')`,
			[
				c.first_name,
				c.last_name || null,
				c.company || null,
				c.role || null,
				c.email || null,
				c.phone || null,
				c.linkedin || null,
				c.birthday || null,
			]
		);
		imported++;
	}

	return json({ imported, skipped });
}
