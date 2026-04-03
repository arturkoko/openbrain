<script lang="ts">
	let { data } = $props();
	let showAdd = $state(false);
	let form = $state({ category: "", name: "", value: "", location: "", brand: "", notes: "" });

	async function addItem() {
		await fetch("/api/household", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
		window.location.reload();
	}
</script>

<div class="min-h-screen bg-surface">
	<div class="flex items-center justify-between px-4 pt-4 pb-2">
		<h1 class="text-xl font-semibold text-text-primary">Household</h1>
		<button onclick={() => showAdd = !showAdd} class="bg-brain-600 text-white text-sm px-3 py-1.5 rounded-xl">+ Add</button>
	</div>

	<main class="max-w-4xl mx-auto px-4 space-y-3">
		<!-- Category filter -->
		<div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
			<a href="/household" class="shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors {data.activeCategory === '' ? 'bg-brain-600 text-white' : 'bg-surface-raised text-text-secondary'}">All</a>
			{#each data.categories as cat}
				<a href="/household?cat={encodeURIComponent(cat)}" class="shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors {data.activeCategory === cat ? 'bg-brain-600 text-white' : 'bg-surface-raised text-text-secondary'}">{cat}</a>
			{/each}
		</div>

		{#if showAdd}
			<div class="bg-surface-raised rounded-2xl p-4 space-y-3">
				<div class="grid grid-cols-2 gap-3">
					{#each [["category","Category"],["name","Name"],["value","Value"],["location","Location"],["brand","Brand"]] as [key, label]}
						<input type="text" bind:value={form[key]} placeholder={label}
							class="bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500" />
					{/each}
				</div>
				<textarea bind:value={form.notes} placeholder="Notes" rows="2"
					class="w-full bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500"></textarea>
				<div class="flex gap-2 justify-end">
					<button onclick={() => showAdd = false} class="text-text-muted text-sm px-3 py-1.5">Cancel</button>
					<button onclick={addItem} class="bg-brain-600 text-white text-sm px-4 py-1.5 rounded-xl">Save</button>
				</div>
			</div>
		{/if}

		<div class="space-y-2">
			{#each data.items as item}
				<div class="bg-surface-raised rounded-2xl p-4">
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
				<p class="text-text-muted text-center py-8">No items yet.</p>
			{/each}
		</div>
	</main>
</div>
