<script lang="ts">
	let { data } = $props();
	let search = $state(data.search || '');
	let showAdd = $state(false);
	let form = $state({ category: '', key: '', value: '' });

	async function addMemory() {
		await fetch('/api/memories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
		window.location.reload();
	}

	function formatDate(d: string) {
		return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="min-h-screen bg-surface">
	<header class="bg-surface-raised border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
		<a href="/dashboard" class="text-text-muted hover:text-text-primary">&#8592;</a>
		<h1 class="text-lg font-bold text-text-primary flex-1">Memories</h1>
		<button onclick={() => showAdd = !showAdd} class="bg-brain-600 text-white text-sm px-3 py-1.5 rounded-lg">+ Add</button>
	</header>

	<main class="max-w-4xl mx-auto p-4 space-y-4">
		<form action="/memories" method="GET" class="flex gap-2">
			<input type="text" name="q" bind:value={search} placeholder="Search memories..."
				class="flex-1 bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500" />
			<button type="submit" class="bg-surface-overlay text-text-primary px-3 py-2 rounded-lg text-sm">Search</button>
		</form>

		{#if showAdd}
			<div class="bg-surface-raised border border-border rounded-xl p-4 space-y-3">
				<input type="text" bind:value={form.category} placeholder="Category (e.g. preference, fact, context)"
					class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500" />
				<input type="text" bind:value={form.key} placeholder="Key (e.g. favorite_color)"
					class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500" />
				<textarea bind:value={form.value} placeholder="Value" rows="3"
					class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500"></textarea>
				<div class="flex gap-2 justify-end">
					<button onclick={() => showAdd = false} class="text-text-muted text-sm px-3 py-1.5">Cancel</button>
					<button onclick={addMemory} class="bg-brain-600 text-white text-sm px-4 py-1.5 rounded-lg">Save</button>
				</div>
			</div>
		{/if}

		<div class="space-y-2">
			{#each data.memories as m}
				<div class="bg-surface-raised border border-border rounded-xl p-4">
					<div class="flex items-start justify-between mb-1">
						<div class="flex items-center gap-2">
							{#if m.category}<span class="text-xs bg-surface-overlay text-text-secondary px-2 py-0.5 rounded-full">{m.category}</span>{/if}
							{#if m.key}<span class="text-xs text-brain-400 font-mono">{m.key}</span>{/if}
						</div>
						<span class="text-xs text-text-muted">{m.created_by === 'ai' ? '🤖' : '👤'} {formatDate(m.created_at)}</span>
					</div>
					<div class="text-text-primary text-sm">{m.value}</div>
				</div>
			{:else}
				<p class="text-text-muted text-center py-8">No memories yet.</p>
			{/each}
		</div>
	</main>
</div>
