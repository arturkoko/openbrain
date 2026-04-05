import { query } from '$lib/server/db.js';

export async function load({ url }) {
	const category = url.searchParams.get('cat') || '';
	const search = url.searchParams.get('q') || '';

	let sql = 'SELECT * FROM recipes';
	const conditions: string[] = [];
	const params: string[] = [];

	if (category) {
		params.push(category);
		conditions.push(`category = $${params.length}`);
	}
	if (search) {
		params.push(`%${search}%`);
		const p = params.length;
		conditions.push(`(title ILIKE $${p} OR instructions ILIKE $${p} OR ingredients::text ILIKE $${p})`);
	}

	if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
	sql += ' ORDER BY title';

	const rows = await query(sql, params);
	const cats = await query('SELECT DISTINCT category FROM recipes WHERE category IS NOT NULL ORDER BY category');

	return {
		recipes: rows.rows,
		categories: cats.rows.map((r: { category: string }) => r.category),
		activeCategory: category,
		searchQuery: search,
	};
}
