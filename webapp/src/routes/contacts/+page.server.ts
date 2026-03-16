import { query } from '$lib/server/db.js';

export async function load({ url }) {
	const search = url.searchParams.get('q') || '';
	const view = url.searchParams.get('view') || 'all';
	const sort = url.searchParams.get('sort') || 'first_name';
	const order = url.searchParams.get('order') || 'asc';

	const allowedSorts = ['first_name', 'last_name', 'company', 'last_contact', 'warmth', 'industry', 'address', 'birthday'];
	const sortCol = allowedSorts.includes(sort) ? sort : 'first_name';
	const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

	let sql = `SELECT * FROM contacts`;
	const params: unknown[] = [];
	const conditions: string[] = [];

	if (view === 'vip') {
		conditions.push('is_vip = true');
	}

	if (search) {
		params.push(`%${search}%`);
		const idx = params.length;
		conditions.push(
			`(first_name ILIKE $${idx} OR last_name ILIKE $${idx} OR company ILIKE $${idx} OR role ILIKE $${idx} OR notes ILIKE $${idx} OR industry ILIKE $${idx} OR address ILIKE $${idx} OR email_private ILIKE $${idx} OR email_business ILIKE $${idx})`
		);
	}

	if (conditions.length > 0) {
		sql += ` WHERE ` + conditions.join(' AND ');
	}

	if (view === 'birthdays') {
		sql += ` ORDER BY
			CASE WHEN birthday IS NULL THEN 1 ELSE 0 END,
			CASE
				WHEN EXTRACT(MONTH FROM birthday) * 100 + EXTRACT(DAY FROM birthday) >= EXTRACT(MONTH FROM CURRENT_DATE) * 100 + EXTRACT(DAY FROM CURRENT_DATE)
				THEN EXTRACT(MONTH FROM birthday) * 100 + EXTRACT(DAY FROM birthday)
				ELSE EXTRACT(MONTH FROM birthday) * 100 + EXTRACT(DAY FROM birthday) + 1300
			END ASC`;
	} else if (view === 'vip') {
		sql += ` ORDER BY last_contact ASC NULLS FIRST`;
	} else {
		sql += ` ORDER BY "${sortCol}" ${sortOrder} NULLS LAST`;
	}

	const result = await query(sql, params);

	return {
		contacts: result.rows,
		sort: sortCol,
		order: order === 'desc' ? 'desc' : 'asc',
		search,
		view,
	};
}
