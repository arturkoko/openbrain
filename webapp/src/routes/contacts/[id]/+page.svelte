<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let { data, form: formResult } = $props();
	let c = $state(data.contact || {
		first_name: '', last_name: '', company: '', role: '', email_private: '', email_business: '',
		phone_private: '', phone_business: '', linkedin: '', address: '', warmth: 50, birthday: '',
		industry: '', is_vip: false, preferred_platform: '', relationship_type: '', how_met: '',
		notes: '', projects: [], tags: []
	});
	let showInteractionForm = $state(false);
	let saved = $state(false);

	function formatDate(d: any): string {
		if (!d) return '';
		if (d instanceof Date) return d.toISOString().split('T')[0];
		if (typeof d === 'string') return d.split('T')[0];
		return '';
	}

	function daysSince(date: any): string {
		if (!date) return 'Never';
		const d = typeof date === 'string' ? new Date(date) : date;
		const days = Math.floor((Date.now() - d.getTime()) / 86400000);
		if (days === 0) return 'Today';
		if (days === 1) return 'Yesterday';
		return `${days}d ago`;
	}

	function isHitThemUp(): boolean {
		if (!c.is_vip) return false;
		if (!c.last_contact) return true;
		const d = typeof c.last_contact === 'string' ? new Date(c.last_contact) : c.last_contact;
		const days = Math.floor((Date.now() - d.getTime()) / 86400000);
		return days > 90;
	}

	function warmthColor(w: number) {
		if (w >= 70) return 'text-success';
		if (w >= 40) return 'text-warning';
		return 'text-danger';
	}

	$effect(() => {
		if (formResult?.success) {
			saved = true;
			setTimeout(() => saved = false, 2000);
		}
	});
</script>

<div class="min-h-screen bg-surface">
	<header class="bg-surface-raised border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
		<a href="/contacts" class="text-text-muted hover:text-text-primary">← Contacts</a>
		<div class="flex-1">
			{#if data.isNew}
				<h1 class="text-lg font-bold text-text-primary">New Contact</h1>
			{:else}
				<h1 class="text-lg font-bold text-text-primary">
					{#if c.is_vip}<span class="text-warning">★</span>{/if}
					{c.first_name} {c.last_name || ''}
				</h1>
			{/if}
		</div>
		{#if saved}
			<span class="text-success text-sm font-medium animate-pulse">✓ Saved</span>
		{/if}
		{#if isHitThemUp()}
			<span class="px-2 py-0.5 bg-danger/15 text-danger border border-danger/20 rounded-full text-xs font-medium">Hit Them Up · {daysSince(c.last_contact)}</span>
		{/if}
	</header>

	<main class="max-w-3xl mx-auto p-4 space-y-6">
		<!-- Contact Form -->
		<form method="POST" action="?/save" use:enhance class="space-y-6">
			<!-- Identity -->
			<section class="bg-surface-raised rounded-xl border border-border p-4 space-y-3">
				<h2 class="text-sm font-semibold text-text-secondary uppercase tracking-wider">Identity</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<label class="space-y-1">
						<span class="text-xs text-text-muted">First Name *</span>
						<input name="first_name" value={c.first_name} required class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
					</label>
					<label class="space-y-1">
						<span class="text-xs text-text-muted">Last Name</span>
						<input name="last_name" value={c.last_name || ''} class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
					</label>
					<label class="space-y-1">
						<span class="text-xs text-text-muted">Birthday</span>
						<input name="birthday" type="date" value={formatDate(c.birthday)} class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
					</label>
					<label class="space-y-1">
						<span class="text-xs text-text-muted">Relationship</span>
						<select name="relationship_type" class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500">
							<option value="">—</option>
							{#each [['colleague','Colleague'],['friend','Friend'],['family','Family'],['sport','Sport'],['kids','Kids'],['network','Network'],['service','Service'],['kol','KOL']] as [val, label]}
								<option value={val} selected={c.relationship_type === val}>{label}</option>
							{/each}
						</select>
					</label>
				</div>
			</section>

			<!-- Professional -->
			<section class="bg-surface-raised rounded-xl border border-border p-4 space-y-3">
				<h2 class="text-sm font-semibold text-text-secondary uppercase tracking-wider">Professional</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<label class="space-y-1">
						<span class="text-xs text-text-muted">Company</span>
						<input name="company" value={c.company || ''} class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
					</label>
					<label class="space-y-1">
						<span class="text-xs text-text-muted">Role</span>
						<input name="role" value={c.role || ''} class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
					</label>
					<label class="space-y-1">
						<span class="text-xs text-text-muted">Industry</span>
						<input name="industry" value={c.industry || ''} class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
					</label>
					<label class="space-y-1">
						<span class="text-xs text-text-muted">Projects (comma-separated)</span>
						<input name="projects" value={(c.projects || []).join(', ')} class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
					</label>
				</div>
			</section>

			<!-- Contact Info -->
			<section class="bg-surface-raised rounded-xl border border-border p-4 space-y-3">
				<h2 class="text-sm font-semibold text-text-secondary uppercase tracking-wider">Contact Info</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<label class="space-y-1">
						<span class="text-xs text-text-muted">Private Email</span>
						<input name="email_private" type="email" value={c.email_private || ''} class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
					</label>
					<label class="space-y-1">
						<span class="text-xs text-text-muted">Business Email</span>
						<input name="email_business" type="email" value={c.email_business || ''} class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
					</label>
					<label class="space-y-1">
						<span class="text-xs text-text-muted">Private Phone</span>
						<input name="phone_private" value={c.phone_private || ''} class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
					</label>
					<label class="space-y-1">
						<span class="text-xs text-text-muted">Business Phone</span>
						<input name="phone_business" value={c.phone_business || ''} class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
					</label>
					<label class="space-y-1">
						<span class="text-xs text-text-muted">LinkedIn</span>
						<input name="linkedin" value={c.linkedin || ''} class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
					</label>
					<label class="space-y-1">
						<span class="text-xs text-text-muted">Preferred Platform</span>
						<select name="preferred_platform" class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500">
							<option value="">—</option>
							{#each [['whatsapp','WhatsApp'],['email','Email'],['linkedin','LinkedIn'],['phone','Phone'],['teams','Teams / Slack'],['sms','SMS'],['other','Other']] as [val, label]}
								<option value={val} selected={c.preferred_platform === val}>{label}</option>
							{/each}
						</select>
					</label>
					<label class="space-y-1 sm:col-span-2">
						<span class="text-xs text-text-muted">Address</span>
						<input name="address" value={c.address || ''} placeholder="Street, City" class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500" />
					</label>
				</div>
			</section>

			<!-- CRM Status -->
			<section class="bg-surface-raised rounded-xl border border-border p-4 space-y-3">
				<h2 class="text-sm font-semibold text-text-secondary uppercase tracking-wider">CRM</h2>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
					<label class="space-y-1">
						<span class="text-xs text-text-muted">Warmth (0–100)</span>
						<div class="flex items-center gap-2">
							<input name="warmth" type="range" min="0" max="100" value={c.warmth || 50} oninput={(e) => c.warmth = parseInt(e.currentTarget.value)}
								class="flex-1 h-2 bg-surface-overlay rounded-full appearance-none cursor-pointer accent-brain-500" />
							<span class="text-sm font-mono {warmthColor(c.warmth || 0)} w-8 text-right">{c.warmth || 0}</span>
						</div>
					</label>
					<label class="flex items-center gap-2 cursor-pointer py-2">
						<input name="is_vip" type="checkbox" checked={c.is_vip} class="rounded border-border bg-surface text-warning focus:ring-warning" />
						<span class="text-sm text-text-primary">★ VIP Contact</span>
					</label>
					{#if !data.isNew}
						<div class="text-sm text-text-muted">
							Last contacted: <span class="text-text-primary font-medium">{daysSince(c.last_contact)}</span>
						</div>
					{/if}
				</div>
				<label class="space-y-1">
					<span class="text-xs text-text-muted">How Met</span>
					<input name="how_met" value={c.how_met || ''} class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
				</label>
				<label class="space-y-1">
					<span class="text-xs text-text-muted">Tags (comma-separated)</span>
					<input name="tags" value={(c.tags || []).join(', ')} class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
				</label>
				<label class="space-y-1">
					<span class="text-xs text-text-muted">Notes</span>
					<textarea name="notes" rows="3" class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500">{c.notes || ''}</textarea>
				</label>
			</section>

			<!-- Actions -->
			<div class="flex gap-2 justify-between">
				<button type="submit" class="bg-brain-600 hover:bg-brain-500 text-white text-sm px-6 py-2 rounded-lg transition-colors font-medium">
					{data.isNew ? 'Create Contact' : 'Save Changes'}
				</button>
				{#if !data.isNew}
					<div class="flex gap-2">
						<form method="POST" action="?/ping" use:enhance>
							<button type="submit" class="bg-success/15 text-success text-sm px-4 py-2 rounded-lg hover:bg-success/25 transition-colors" title="Updates 'Last Contacted' to today">📡 Ping</button>
						</form>
						<form method="POST" action="?/delete" use:enhance onclick={(e) => { if (!confirm('Delete this contact permanently?')) e.preventDefault(); }}>
							<button type="submit" class="bg-danger/15 text-danger text-sm px-4 py-2 rounded-lg hover:bg-danger/25 transition-colors">Delete</button>
						</form>
					</div>
				{/if}
			</div>
		</form>

		<!-- Interactions (VIP section) -->
		{#if !data.isNew}
			<section class="bg-surface-raised rounded-xl border border-border p-4 space-y-3">
				<div class="flex items-center justify-between">
					<h2 class="text-sm font-semibold text-text-secondary uppercase tracking-wider">
						Interaction History
						{#if c.is_vip}<span class="text-warning">★</span>{/if}
					</h2>
					<button onclick={() => showInteractionForm = !showInteractionForm} class="text-brain-400 text-sm hover:text-brain-300 transition-colors">
						{showInteractionForm ? 'Cancel' : '+ Log Interaction'}
					</button>
				</div>

				{#if showInteractionForm}
					<form method="POST" action="?/add_interaction" use:enhance={() => { return async ({ update }) => { showInteractionForm = false; update(); }; }} class="bg-surface rounded-lg border border-border p-3 space-y-2">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
							<input name="date" type="date" value={new Date().toISOString().split('T')[0]} class="bg-surface-overlay border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
							<input name="summary" placeholder="Quick summary *" required class="bg-surface-overlay border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500" />
						</div>
						<textarea name="interaction_notes" placeholder="Detailed notes (optional)" rows="2" class="w-full bg-surface-overlay border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500"></textarea>
						<button type="submit" class="bg-brain-600 hover:bg-brain-500 text-white text-xs px-3 py-1.5 rounded-lg">Save Interaction</button>
					</form>
				{/if}

				{#if data.interactions.length > 0}
					<div class="space-y-2">
						{#each data.interactions as interaction}
							<div class="flex items-start gap-3 bg-surface rounded-lg border border-border/50 p-3">
								<div class="text-xs text-text-muted whitespace-nowrap pt-0.5">
									{new Date(interaction.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
								</div>
								<div class="flex-1 min-w-0">
									<div class="text-sm text-text-primary">{interaction.summary}</div>
									{#if interaction.notes}
										<div class="text-xs text-text-muted mt-1">{interaction.notes}</div>
									{/if}
								</div>
								<form method="POST" action="?/delete_interaction" use:enhance>
									<input type="hidden" name="interaction_id" value={interaction.id} />
									<button type="submit" class="text-text-muted hover:text-danger text-xs transition-colors" onclick={(e) => { if (!confirm('Delete?')) e.preventDefault(); }}>✕</button>
								</form>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-text-muted text-sm text-center py-4">No interactions logged yet.</p>
				{/if}
			</section>
		{/if}
	</main>
</div>
