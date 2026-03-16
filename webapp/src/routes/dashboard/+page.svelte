<script lang="ts">
	let { data } = $props();

	const navItems = [
		{ href: '/contacts', icon: '👤', label: 'Contacts', count: data.stats.contacts },
		{ href: '/reminders', icon: '🔔', label: 'Reminders', count: data.stats.reminders },
		{ href: '/household', icon: '🏠', label: 'Household', count: data.stats.household },
		{ href: '/memories', icon: '💭', label: 'Memories', count: data.stats.memories },
		{ href: '/vault', icon: '📁', label: 'Vault', count: null },
		{ href: '/calendar', icon: '📅', label: 'Calendar', count: null }
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
	<!-- Header -->
	<header class="bg-surface-raised border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-10">
		<div class="flex items-center gap-2">
			<span class="text-2xl">&#129504;</span>
			<h1 class="text-lg font-bold text-text-primary">OpenBrain</h1>
		</div>
		<button onclick={logout} class="text-text-muted hover:text-text-primary text-sm transition">Logout</button>
	</header>

	<main class="max-w-4xl mx-auto p-4 space-y-6">
		<!-- Navigation Grid -->
		<div class="grid grid-cols-3 gap-3">
			{#each navItems as item}
				<a href={item.href}
					class="bg-surface-raised border border-border rounded-xl p-4 text-center hover:border-brain-500/50 transition group">
					<div class="text-2xl mb-1">{item.icon}</div>
					<div class="text-xs text-text-secondary group-hover:text-text-primary transition">{item.label}</div>
					{#if item.count !== null}
						<div class="text-lg font-bold text-text-primary mt-1">{item.count}</div>
					{/if}
				</a>
			{/each}
		</div>

		<!-- Upcoming Reminders -->
		<section class="bg-surface-raised border border-border rounded-xl p-4">
			<h2 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Upcoming Reminders</h2>
			{#if data.recentReminders.length === 0}
				<p class="text-text-muted text-sm">No pending reminders</p>
			{:else}
				<div class="space-y-2">
					{#each data.recentReminders as r}
						<div class="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
							<div>
								<span class="{priorityColor(r.priority)} text-sm font-medium">{r.title}</span>
							</div>
							<span class="text-xs text-text-muted">{formatDate(r.due_date)}</span>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Recent Contacts -->
		<section class="bg-surface-raised border border-border rounded-xl p-4">
			<h2 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Recent Contacts</h2>
			{#if data.recentContacts.length === 0}
				<p class="text-text-muted text-sm">No contacts yet</p>
			{:else}
				<div class="space-y-2">
					{#each data.recentContacts as c}
						<a href="/contacts?id={c.id}" class="flex items-center justify-between py-2 border-b border-border/50 last:border-0 hover:bg-surface-overlay/30 -mx-2 px-2 rounded transition">
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
	</main>
</div>
