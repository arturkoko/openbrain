import { query } from '$lib/server/db.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params }) {
	if (params.id === 'new') {
		return {
			contact: null,
			interactions: [],
			isNew: true,
		};
	}

	const result = await query('SELECT * FROM contacts WHERE id = $1', [params.id]);
	if (result.rows.length === 0) throw error(404, 'Contact not found');

	const contact = result.rows[0];
	// Normalize date fields to ISO string for the frontend
	if (contact.birthday instanceof Date) {
		contact.birthday = contact.birthday.toISOString().split('T')[0];
	}
	if (contact.last_contact instanceof Date) {
		contact.last_contact = contact.last_contact.toISOString().split('T')[0];
	}

	const interactions = await query(
		'SELECT * FROM interactions WHERE contact_id = $1 ORDER BY date DESC LIMIT 50',
		[params.id]
	);

	return {
		contact,
		interactions: interactions.rows,
		isNew: false,
	};
}

export const actions = {
	save: async ({ request, params }) => {
		const data = await request.formData();
		const firstName = data.get('first_name') as string;
		if (!firstName) return { error: 'First name is required' };

		const projectsRaw = data.get('projects') as string;
		const projects = projectsRaw ? projectsRaw.split(',').map((p: string) => p.trim()).filter(Boolean) : [];
		const tagsRaw = data.get('tags') as string;
		const tags = tagsRaw ? tagsRaw.split(',').map((t: string) => t.trim()).filter(Boolean) : [];

		const fields = {
			first_name: firstName,
			last_name: data.get('last_name') || null,
			company: data.get('company') || null,
			role: data.get('role') || null,
			email_private: data.get('email_private') || null,
			email_business: data.get('email_business') || null,
			phone_private: data.get('phone_private') || null,
			phone_business: data.get('phone_business') || null,
			linkedin: data.get('linkedin') || null,
			address: data.get('address') || null,
			warmth: parseInt(data.get('warmth') as string) || 50,
			birthday: data.get('birthday') || null,
			industry: data.get('industry') || null,
			is_vip: data.get('is_vip') === 'on',
			preferred_platform: data.get('preferred_platform') || null,
			relationship_type: data.get('relationship_type') || null,
			how_met: data.get('how_met') || null,
			notes: data.get('notes') || null,
			projects: projects,
			tags: tags,
		};

		if (params.id === 'new') {
			const result = await query(
				`INSERT INTO contacts (first_name, last_name, company, role, email_private, email_business, phone_private, phone_business, linkedin, address, warmth, birthday, industry, is_vip, preferred_platform, relationship_type, how_met, notes, projects, tags, created_by)
				 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,'human') RETURNING id`,
				[fields.first_name, fields.last_name, fields.company, fields.role, fields.email_private, fields.email_business, fields.phone_private, fields.phone_business, fields.linkedin, fields.address, fields.warmth, fields.birthday, fields.industry, fields.is_vip, fields.preferred_platform, fields.relationship_type, fields.how_met, fields.notes, fields.projects, fields.tags]
			);
			throw redirect(303, `/contacts/${result.rows[0].id}`);
		} else {
			await query(
				`UPDATE contacts SET first_name=$1, last_name=$2, company=$3, role=$4, email_private=$5, email_business=$6, phone_private=$7, phone_business=$8, linkedin=$9, address=$10, warmth=$11, birthday=$12, industry=$13, is_vip=$14, preferred_platform=$15, relationship_type=$16, how_met=$17, notes=$18, projects=$19, tags=$20
				 WHERE id=$21`,
				[fields.first_name, fields.last_name, fields.company, fields.role, fields.email_private, fields.email_business, fields.phone_private, fields.phone_business, fields.linkedin, fields.address, fields.warmth, fields.birthday, fields.industry, fields.is_vip, fields.preferred_platform, fields.relationship_type, fields.how_met, fields.notes, fields.projects, fields.tags, params.id]
			);
			return { success: true };
		}
	},

	ping: async ({ params }) => {
		await query('UPDATE contacts SET last_contact = CURRENT_DATE WHERE id = $1', [params.id]);
		return { success: true };
	},

	add_interaction: async ({ request, params }) => {
		const data = await request.formData();
		const summary = data.get('summary') as string;
		if (!summary) return { error: 'Summary is required' };

		await query(
			`INSERT INTO interactions (contact_id, date, summary, notes) VALUES ($1, $2, $3, $4)`,
			[params.id, data.get('date') || new Date().toISOString().split('T')[0], summary, data.get('interaction_notes') || null]
		);
		// Also update last_contact
		await query('UPDATE contacts SET last_contact = GREATEST(last_contact, $2) WHERE id = $1', [params.id, data.get('date') || new Date().toISOString().split('T')[0]]);
		return { success: true };
	},

	delete_interaction: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('interaction_id') as string;
		if (id) await query('DELETE FROM interactions WHERE id = $1', [id]);
		return { success: true };
	},

	delete: async ({ params }) => {
		await query('DELETE FROM contacts WHERE id = $1', [params.id]);
		throw redirect(303, '/contacts');
	},
};
