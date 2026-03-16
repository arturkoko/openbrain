<script lang="ts">
	let { data } = $props();
	let showAdd = $state(false);
	let form = $state({ category: '', name: '', value: '', location: '', brand: '', notes: '' });

	async function addItem() {
		await fetch('/api/household', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
		window.location.reload();
	}
</script>

<div class="min-h-screen bg-surface">
	<header class="bg-surface-raised border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
		<a href="/dashboard" class="text-text-muted hover:text-text-primary">&#8592;</a>
		<h1 class="text-lg font-bold text-text-primary flex-1">Household</h1>
		<button onclick={() => showAdd = !showAdd} class="bg-brain-600 text-white text-sm px-3 py-1.5 rounded-lg">+ Add</button>
	</header>

	<main class="max-w-4xl mx-auto p-4 space-y-4">
		<!-- Category filter -->
		<div class="flex gap-2 overflow-x-auto pb-2">
			<a href="/household" class="shrink-0 text-xs px-3 py-1.5 rounded-full {data.activeCategory === '' ? 'bg-brain-600 text-white' : 'bg-surface-raised text-text-secondary border border-border'}">All</a>
			{#each data.categories as cat}
				<a href="/household?cat={encodeURIComponent(cat)}" class="shrink-0 text-xs px-3 py-1.5 rounded-full {data.activeCategory === cat ? 'bg-brain-600 text-white' : 'bg-surface-raised text-text-secondary border border-border'}">{cat}</a>
			{/each}
		</div>

		{#if showAdd}
			<div class="bg-surface-raised border border-border rounded-xl p-4 space-y-3">
				<div class="grid grid-cols-2 gap-3">
					{#each [['category','Category'],['name','Name'],['value','Value'],['location','Location'],['brand','Brand']] as [key, label]}
						<input type="text" bind:value={form[key]} placeholder={label}
							class="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500" />
					{/each}
				</div>
				<textarea bind:value={form.notes} placeholder="Notes" rows="2"
					class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500"></textarea>
				<div class="flex gap-2 justify-end">
					<button onclick={() => showAdd = false} class="text-text-muted text-sm px-3 py-1.5">Cancel</button>
					<button onclick={addItem} class="bg-brain-600 text-white text-sm px-4 py-1.5 rounded-lg">Save</button>
				</div>
			</div>
		{/if}

		<div class="space-y-2">
			{#each data.items as item}
				<div class="bg-surface-raised border border-border rounded-xl p-4">
					<div class="flex items-start justify-between">
						<div>
							<span class="text-xs bg-surface-overlay text-text-secondary px-2 py-0.5 rounded-full">{item.category}</span>
							<div class="text-text-primary font-medium mt-1">{item.name}</div>
							{#if item.value}<div class="text-brain-400 text-sm">{item.value}</div>{/if}
						</div>
						{#if item.location}<span class="text-xs text-text-muted">{item.location}</span>{/if}
					</div>
					{#if item.notes}<div class="text-text-muted text-xs mt-2">{item.notes}</div>{/if}
				</div>
			{:else}
				<p class="text-text-muted text-center py-8">No items yet. Add your first one!</p>
			{/each}
		</div>
	</main>
</div>
