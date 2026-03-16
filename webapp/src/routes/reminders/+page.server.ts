import { query } from '$lib/server/db.js';

export async function load() {
	const pending = await query("SELECT * FROM reminders WHERE status = 'pending' ORDER BY due_date ASC NULLS LAST");
	const completed = await query("SELECT * FROM reminders WHERE status = 'completed' ORDER BY updated_at DESC LIMIT 10");
	return { pending: pending.rows, completed: completed.rows };
}
