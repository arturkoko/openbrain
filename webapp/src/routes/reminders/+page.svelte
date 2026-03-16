<script lang="ts">
	let { data } = $props();
	let showAdd = $state(false);
	let form = $state({ title: '', description: '', due_date: '', priority: 'normal' });

	async function addReminder() {
		await fetch('/api/reminders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
		window.location.reload();
	}

	async function complete(id: string) {
		await fetch('/api/reminders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'completed' }) });
		window.location.reload();
	}

	function formatDate(d: string | null) {
		if (!d) return 'No date';
		return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
	}

	function priorityBadge(p: string) {
		const colors: Record<string, string> = { urgent: 'bg-danger/20 text-danger', high: 'bg-warning/20 text-warning', normal: 'bg-brain-500/20 text-brain-400', low: 'bg-surface-overlay text-text-muted' };
		return colors[p] || colors.normal;
	}
</script>

<div class="min-h-screen bg-surface">
	<header class="bg-surface-raised border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
		<a href="/dashboard" class="text-text-muted hover:text-text-primary">&#8592;</a>
		<h1 class="text-lg font-bold text-text-primary flex-1">Reminders</h1>
		<button onclick={() => showAdd = !showAdd} class="bg-brain-600 text-white text-sm px-3 py-1.5 rounded-lg">+ Add</button>
	</header>

	<main class="max-w-4xl mx-auto p-4 space-y-4">
		{#if showAdd}
			<div class="bg-surface-raised border border-border rounded-xl p-4 space-y-3">
				<input type="text" bind:value={form.title} placeholder="Reminder title"
					class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500" />
				<textarea bind:value={form.description} placeholder="Description (optional)" rows="2"
					class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500"></textarea>
				<div class="flex gap-3">
					<input type="date" bind:value={form.due_date}
						class="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
					<select bind:value={form.priority}
						class="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500">
						<option value="low">Low</option>
						<option value="normal">Normal</option>
						<option value="high">High</option>
						<option value="urgent">Urgent</option>
					</select>
				</div>
				<div class="flex gap-2 justify-end">
					<button onclick={() => showAdd = false} class="text-text-muted text-sm px-3 py-1.5">Cancel</button>
					<button onclick={addReminder} class="bg-brain-600 text-white text-sm px-4 py-1.5 rounded-lg">Save</button>
				</div>
			</div>
		{/if}

		<section>
			<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Pending ({data.pending.length})</h2>
			<div class="space-y-2">
				{#each data.pending as r}
					<div class="bg-surface-raised border border-border rounded-xl p-4 flex items-center gap-3">
						<button onclick={() => complete(r.id)} class="w-5 h-5 border-2 border-border rounded hover:border-success transition shrink-0"></button>
						<div class="flex-1 min-w-0">
							<div class="text-text-primary text-sm font-medium truncate">{r.title}</div>
							{#if r.description}<div class="text-text-muted text-xs truncate">{r.description}</div>{/if}
						</div>
						<span class="text-xs px-2 py-0.5 rounded-full {priorityBadge(r.priority)}">{r.priority}</span>
						<span class="text-xs text-text-muted shrink-0">{formatDate(r.due_date)}</span>
					</div>
				{:else}
					<p class="text-text-muted text-center py-4 text-sm">All clear!</p>
				{/each}
			</div>
		</section>

		{#if data.completed.length > 0}
			<section>
				<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Recently Completed</h2>
				<div class="space-y-1">
					{#each data.completed as r}
						<div class="flex items-center gap-3 py-2 px-4 opacity-50">
							<div class="w-5 h-5 border-2 border-success rounded flex items-center justify-center text-success text-xs">&#10003;</div>
							<span class="text-text-muted text-sm line-through">{r.title}</span>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</main>
</div>
