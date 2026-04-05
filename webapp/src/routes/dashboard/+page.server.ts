import { query } from '$lib/server/db.js';

export async function load() {
	const [contacts, reminders, household, memories, recipes] = await Promise.all([
		query('SELECT COUNT(*) as count FROM contacts'),
		query("SELECT COUNT(*) as count FROM reminders WHERE status = 'pending'"),
		query('SELECT COUNT(*) as count FROM household_items'),
		query('SELECT COUNT(*) as count FROM memories'),
		query('SELECT COUNT(*) as count FROM recipes')
	]);

	const [hitThemUp, coldContacts, upcomingBirthdays, recentReminders, recentContacts] = await Promise.all([
		query(`
			SELECT id, first_name, last_name, company, last_contact, warmth
			FROM contacts
			WHERE is_vip = true AND (last_contact IS NULL OR last_contact < CURRENT_DATE - INTERVAL '90 days')
			ORDER BY last_contact ASC NULLS FIRST
			LIMIT 5
		`),
		query(`
			SELECT id, first_name, last_name, company, last_contact, warmth
			FROM contacts
			WHERE (is_vip IS NOT TRUE) AND (last_contact IS NULL OR last_contact < CURRENT_DATE - INTERVAL '30 days')
			ORDER BY last_contact ASC NULLS FIRST
			LIMIT 5
		`),
		query(`
			SELECT id, first_name, last_name, birthday
			FROM contacts
			WHERE birthday IS NOT NULL
				AND (
					(EXTRACT(MONTH FROM birthday) * 100 + EXTRACT(DAY FROM birthday))
					BETWEEN (EXTRACT(MONTH FROM CURRENT_DATE) * 100 + EXTRACT(DAY FROM CURRENT_DATE))
					AND (EXTRACT(MONTH FROM CURRENT_DATE) * 100 + EXTRACT(DAY FROM CURRENT_DATE) + 14)
				)
			ORDER BY EXTRACT(MONTH FROM birthday) * 100 + EXTRACT(DAY FROM birthday) ASC
			LIMIT 5
		`),
		query(
			"SELECT id, title, due_date, priority FROM reminders WHERE status = 'pending' ORDER BY due_date ASC NULLS LAST LIMIT 5"
		),
		query(
			'SELECT id, first_name, last_name, company, warmth, last_contact FROM contacts ORDER BY last_contact DESC NULLS LAST LIMIT 5'
		),
	]);

	return {
		stats: {
			contacts: parseInt(contacts.rows[0].count),
			reminders: parseInt(reminders.rows[0].count),
			household: parseInt(household.rows[0].count),
			memories: parseInt(memories.rows[0].count),
			recipes: parseInt(recipes.rows[0].count)
		},
		hitThemUp: hitThemUp.rows,
		coldContacts: coldContacts.rows,
		upcomingBirthdays: upcomingBirthdays.rows,
		recentReminders: recentReminders.rows,
		recentContacts: recentContacts.rows
	};
}
