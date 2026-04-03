<script lang="ts">
	let { data } = $props();
	let search = $state(data.search || "");
	let showAdd = $state(false);
	let form = $state({ category: "", key: "", value: "" });

	async function addMemory() {
		await fetch("/api/memories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
		window.location.reload();
	}

	function formatDate(d: string) {
		return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
	}
</script>

<div class="min-h-screen bg-surface">
	<div class="flex items-center justify-between px-4 pt-4 pb-2">
		<h1 class="text-xl font-semibold text-text-primary">Memories</h1>
		<button onclick={() => showAdd = !showAdd} class="bg-brain-600 text-white text-sm px-3 py-1.5 rounded-xl">+ Add</button>
	</div>

	<main class="max-w-4xl mx-auto px-4 space-y-3">
		<form action="/memories" method="GET" class="flex gap-2">
			<input type="text" name="q" bind:value={search} placeholder="Search memories..."
				class="flex-1 bg-surface-raised rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brain-500" />
			<button type="submit" class="bg-surface-overlay text-text-primary px-3 py-2 rounded-xl text-sm">Search</button>
		</form>

		{#if showAdd}
			<div class="bg-surface-raised rounded-2xl p-4 space-y-3">
				<input type="text" bind:value={form.category} placeholder="Category"
					class="w-full bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500" />
				<input type="text" bind:value={form.key} placeholder="Key"
					class="w-full bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500" />
				<textarea bind:value={form.value} placeholder="Value" rows="3"
					class="w-full bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500"></textarea>
				<div class="flex gap-2 justify-end">
					<button onclick={() => showAdd = false} class="text-text-muted text-sm px-3 py-1.5">Cancel</button>
					<button onclick={addMemory} class="bg-brain-600 text-white text-sm px-4 py-1.5 rounded-xl">Save</button>
				</div>
			</div>
		{/if}

		<div class="space-y-2">
			{#each data.memories as m}
				<div class="bg-surface-raised rounded-2xl p-4">
					<div class="flex items-start justify-between mb-1">
						<div class="flex items-center gap-2">
							{#if m.category}<span class="text-xs bg-surface-overlay text-text-secondary px-2 py-0.5 rounded-full">{m.category}</span>{/if}
							{#if m.key}<span class="text-xs text-brain-400 font-mono">{m.key}</span>{/if}
						</div>
						<span class="text-xs text-text-muted">{m.created_by === "ai" ? "AI" : "You"} · {formatDate(m.created_at)}</span>
					</div>
					<div class="text-text-primary text-sm">{m.value}</div>
				</div>
			{:else}
				<p class="text-text-muted text-center py-8">No memories yet.</p>
			{/each}
		</div>
	</main>
</div>
