<script lang="ts">
	let { data } = $props();

	const navItems = [
		{ href: '/contacts', icon: 'contacts', label: 'Contacts', count: data.stats.contacts },
		{ href: '/reminders', icon: 'reminders', label: 'Reminders', count: data.stats.reminders },
		{ href: '/household', icon: 'household', label: 'Household', count: data.stats.household },
		{ href: '/recipes', icon: 'recipes', label: 'Rezepte', count: data.stats.recipes },
		{ href: '/memories', icon: 'memories', label: 'Memories', count: data.stats.memories },
		{ href: '/vault', icon: 'vault', label: 'Vault', count: null },
		{ href: '/calendar', icon: 'calendar', label: 'Calendar', count: null }
	];

	function formatDate(d: string | null) {
		if (!d) return '—';
		return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
	}

	function priorityColor(p: string) {
		return { urgent: 'text-danger', high: 'text-warning', normal: 'text-text-primary', low: 'text-text-muted' }[p] || 'text-text-primary';
	}

	async function logout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		window.location.href = '/login';
	}
</script>

<div class="min-h-screen bg-surface">
	<div class="px-4 pt-6 pb-4 text-center">
		<div class="w-12 h-12 mx-auto mb-2 rounded-2xl bg-brain-600/20 flex items-center justify-center">
			<svg class="w-7 h-7 text-brain-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
			</svg>
		</div>
		<h1 class="text-xl font-bold text-text-primary">OpenBrain</h1>
	</div>

	<main class="max-w-4xl mx-auto px-4 space-y-5">
		<!-- Navigation Grid -->
		<div class="grid grid-cols-3 gap-2.5">
			{#each navItems as item}
				<a href={item.href}
					class="bg-surface-raised rounded-2xl p-4 text-center hover:bg-surface-overlay transition group">
					<div class="text-2xl mb-1">
						{#if item.icon === 'contacts'}
							<svg class="w-6 h-6 mx-auto text-text-muted group-hover:text-brain-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
						{:else if item.icon === 'reminders'}
							<svg class="w-6 h-6 mx-auto text-text-muted group-hover:text-brain-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
						{:else if item.icon === 'household'}
							<svg class="w-6 h-6 mx-auto text-text-muted group-hover:text-brain-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" /></svg>
						{:else if item.icon === 'memories'}
							<svg class="w-6 h-6 mx-auto text-text-muted group-hover:text-brain-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
						{:else if item.icon === 'vault'}
							<svg class="w-6 h-6 mx-auto text-text-muted group-hover:text-brain-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
						{:else if item.icon === 'recipes'}
							<svg class="w-6 h-6 mx-auto text-text-muted group-hover:text-brain-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M16.5 8.25V4.125a2.25 2.25 0 00-2.25-2.25h-4.5a2.25 2.25 0 00-2.25 2.25V8.25" /></svg>
						{:else if item.icon === 'calendar'}
							<svg class="w-6 h-6 mx-auto text-text-muted group-hover:text-brain-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
						{/if}
					</div>
					<div class="text-xs text-text-secondary group-hover:text-text-primary transition">{item.label}</div>
					{#if item.count !== null}
						<div class="text-lg font-bold text-text-primary mt-1">{item.count}</div>
					{/if}
				</a>
			{/each}
		</div>

		<!-- Upcoming Reminders -->
		<section class="bg-surface-raised rounded-2xl p-4">
			<h2 class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Upcoming Reminders</h2>
			{#if data.recentReminders.length === 0}
				<p class="text-text-muted text-sm">No pending reminders</p>
			{:else}
				<div class="space-y-2.5">
					{#each data.recentReminders as r}
						<div class="flex items-center justify-between">
							<span class="{priorityColor(r.priority)} text-sm font-medium">{r.title}</span>
							<span class="text-xs text-text-muted">{formatDate(r.due_date)}</span>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Recent Contacts -->
		<section class="bg-surface-raised rounded-2xl p-4">
			<h2 class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Recent Contacts</h2>
			{#if data.recentContacts.length === 0}
				<p class="text-text-muted text-sm">No contacts yet</p>
			{:else}
				<div class="space-y-2.5">
					{#each data.recentContacts as c}
						<a href="/contacts?id={c.id}" class="flex items-center justify-between hover:bg-surface-overlay/30 -mx-2 px-2 py-1 rounded-lg transition">
							<div>
								<span class="text-sm text-text-primary font-medium">{c.first_name} {c.last_name || ''}</span>
								{#if c.company}
									<span class="text-xs text-text-muted ml-2">{c.company}</span>
								{/if}
							</div>
							<div class="flex items-center gap-2">
								<div class="w-8 h-1.5 bg-surface-overlay rounded-full overflow-hidden">
									<div class="h-full rounded-full {c.warmth > 66 ? 'bg-success' : c.warmth > 33 ? 'bg-warning' : 'bg-danger'}"
										style="width: {c.warmth || 0}%"></div>
								</div>
								<span class="text-xs text-text-muted">{formatDate(c.last_contact)}</span>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Logout -->
		<div class="text-center pb-4">
			<button onclick={logout} class="text-text-muted hover:text-text-secondary text-xs transition">Logout</button>
		</div>
	</main>
</div>
