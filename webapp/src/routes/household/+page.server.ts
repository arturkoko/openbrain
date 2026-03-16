import { query } from '$lib/server/db.js';

export async function load({ url }) {
	const category = url.searchParams.get('cat') || '';
	let rows;
	if (category) {
		rows = await query('SELECT * FROM household_items WHERE category = $1 ORDER BY name', [category]);
	} else {
		rows = await query('SELECT * FROM household_items ORDER BY category, name');
	}
	const cats = await query('SELECT DISTINCT category FROM household_items ORDER BY category');
	return { items: rows.rows, categories: cats.rows.map((r: { category: string }) => r.category), activeCategory: category };
}
