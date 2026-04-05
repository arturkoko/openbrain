<script lang="ts">
	let { data } = $props();
	let showAdd = $state(false);
	let expanded = $state<string | null>(null);
	let searchInput = $state(data.searchQuery || '');
	let form = $state({
		title: '', description: '', ingredients: '', instructions: '',
		servings: '', prep_time: '', cook_time: '', category: '', language: 'de', source_url: '', notes: '', tags: ''
	});

	function toggle(id: string) {
		expanded = expanded === id ? null : id;
	}

	async function addRecipe() {
		const ingredientLines = form.ingredients.split('\n').filter((l: string) => l.trim());
		const ingredients = ingredientLines.map((line: string) => {
			const match = line.match(/^([\d.,\/]+\s*\w*)\s+(.+)$/);
			return match ? { amount: match[1].trim(), item: match[2].trim() } : { amount: '', item: line.trim() };
		});
		const tags = form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
		await fetch('/api/recipes', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...form, ingredients, tags })
		});
		window.location.reload();
	}

	async function deleteRecipe(id: string) {
		if (!confirm('Rezept wirklich löschen?')) return;
		await fetch('/api/recipes', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id })
		});
		window.location.reload();
	}

	function doSearch() {
		const params = new URLSearchParams();
		if (data.activeCategory) params.set('cat', data.activeCategory);
		if (searchInput.trim()) params.set('q', searchInput.trim());
		const qs = params.toString();
		window.location.href = '/recipes' + (qs ? '?' + qs : '');
	}
</script>

<div class="min-h-screen bg-surface">
	<div class="flex items-center justify-between px-4 pt-4 pb-2">
		<h1 class="text-xl font-semibold text-text-primary">Rezepte</h1>
		<button onclick={() => showAdd = !showAdd} class="bg-brain-600 text-white text-sm px-3 py-1.5 rounded-xl">+ Add</button>
	</div>

	<main class="max-w-4xl mx-auto px-4 space-y-3">
		<!-- Search -->
		<form onsubmit={(e) => { e.preventDefault(); doSearch(); }} class="flex gap-2">
			<input type="text" bind:value={searchInput} placeholder="Rezept suchen..."
				class="flex-1 bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500" />
			<button type="submit" class="bg-brain-600 text-white text-sm px-3 py-1.5 rounded-xl">Suchen</button>
		</form>

		<!-- Category filter -->
		<div class="flex gap-2 overflow-x-auto pb-2">
			<a href="/recipes{data.searchQuery ? '?q=' + encodeURIComponent(data.searchQuery) : ''}" class="shrink-0 text-xs px-3 py-1.5 rounded-full {data.activeCategory === '' ? 'bg-brain-600 text-white' : 'bg-surface-raised text-text-secondary'}">Alle</a>
			{#each data.categories as cat}
				<a href="/recipes?cat={encodeURIComponent(cat)}{data.searchQuery ? '&q=' + encodeURIComponent(data.searchQuery) : ''}" class="shrink-0 text-xs px-3 py-1.5 rounded-full {data.activeCategory === cat ? 'bg-brain-600 text-white' : 'bg-surface-raised text-text-secondary'}">{cat}</a>
			{/each}
		</div>

		<!-- Add form -->
		{#if showAdd}
			<div class="bg-surface-raised border border-border/50 rounded-2xl p-4 space-y-3">
				<div class="grid grid-cols-2 gap-3">
					<input type="text" bind:value={form.title} placeholder="Titel *"
						class="col-span-2 bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500" />
					<input type="text" bind:value={form.description} placeholder="Kurzbeschreibung"
						class="col-span-2 bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500" />
					{#each [['category','Kategorie'],['servings','Portionen'],['prep_time','Vorbereitungszeit'],['cook_time','Kochzeit'],['language','Sprache (de/en)'],['source_url','Quelle (URL)']] as [key, label]}
						<input type="text" bind:value={form[key]} placeholder={label}
							class="bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500" />
					{/each}
				</div>
				<textarea bind:value={form.ingredients} placeholder="Zutaten (eine pro Zeile, z.B. '200g Hähnchenbrust')" rows="5"
					class="w-full bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500"></textarea>
				<textarea bind:value={form.instructions} placeholder="Zubereitung (Schritte)" rows="6"
					class="w-full bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500"></textarea>
				<input type="text" bind:value={form.tags} placeholder="Tags (kommagetrennt)"
					class="w-full bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500" />
				<textarea bind:value={form.notes} placeholder="Notizen" rows="2"
					class="w-full bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500"></textarea>
				<div class="flex gap-2 justify-end">
					<button onclick={() => showAdd = false} class="text-text-muted text-sm px-3 py-1.5">Abbrechen</button>
					<button onclick={addRecipe} class="bg-brain-600 text-white text-sm px-4 py-1.5 rounded-xl">Speichern</button>
				</div>
			</div>
		{/if}

		<!-- Recipe list -->
		<div class="space-y-2">
			{#each data.recipes as recipe}
				<div class="bg-surface-raised border border-border/50 rounded-2xl p-4">
					<button onclick={() => toggle(recipe.id)} class="w-full text-left">
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<div class="flex items-center gap-2 flex-wrap">
									{#if recipe.category}
										<span class="text-xs bg-surface-overlay text-text-secondary px-2 py-0.5 rounded-full">{recipe.category}</span>
									{/if}
									<span class="text-xs bg-surface-overlay text-text-muted px-1.5 py-0.5 rounded-full uppercase">{recipe.language || 'de'}</span>
								</div>
								<div class="text-text-primary font-medium mt-1">{recipe.title}</div>
								{#if recipe.description}<div class="text-text-muted text-sm mt-0.5">{recipe.description}</div>{/if}
							</div>
							<div class="flex items-center gap-2 ml-2 shrink-0">
								{#if recipe.servings}<span class="text-xs text-text-muted">{recipe.servings}</span>{/if}
								<span class="text-text-muted text-xs">{expanded === recipe.id ? '▲' : '▼'}</span>
							</div>
						</div>
						{#if recipe.tags?.length}
							<div class="flex gap-1 mt-2 flex-wrap">
								{#each recipe.tags as tag}
									<span class="text-xs bg-brain-600/10 text-brain-400 px-2 py-0.5 rounded-full">{tag}</span>
								{/each}
							</div>
						{/if}
					</button>

					{#if expanded === recipe.id}
						<div class="mt-4 pt-4 border-t border-border space-y-4">
							<!-- Times -->
							{#if recipe.prep_time || recipe.cook_time}
								<div class="flex gap-4 text-xs text-text-muted">
									{#if recipe.prep_time}<span>Vorbereitung: {recipe.prep_time}</span>{/if}
									{#if recipe.cook_time}<span>Kochen: {recipe.cook_time}</span>{/if}
								</div>
							{/if}

							<!-- Ingredients -->
							{#if recipe.ingredients?.length}
								<div>
									<h3 class="text-sm font-semibold text-text-primary mb-2">Zutaten</h3>
									<ul class="space-y-1">
										{#each recipe.ingredients as ing}
											<li class="text-sm text-text-secondary flex gap-2">
												<span class="text-brain-400 font-medium shrink-0">{ing.amount || '•'}</span>
												<span>{ing.item}</span>
											</li>
										{/each}
									</ul>
								</div>
							{/if}

							<!-- Instructions -->
							{#if recipe.instructions}
								<div>
									<h3 class="text-sm font-semibold text-text-primary mb-2">Zubereitung</h3>
									<div class="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">{recipe.instructions}</div>
								</div>
							{/if}

							<!-- Source -->
							{#if recipe.source_url}
								<a href={recipe.source_url} target="_blank" rel="noopener" class="text-xs text-brain-400 hover:underline">Quelle →</a>
							{/if}

							<!-- Notes -->
							{#if recipe.notes}
								<div class="text-xs text-text-muted italic">{recipe.notes}</div>
							{/if}

							<!-- Delete -->
							<div class="flex justify-end">
								<button onclick={() => deleteRecipe(recipe.id)} class="text-xs text-red-400 hover:text-red-300">Löschen</button>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<p class="text-text-muted text-center py-8">Noch keine Rezepte. Füge dein erstes hinzu!</p>
			{/each}
		</div>
	</main>
</div>
