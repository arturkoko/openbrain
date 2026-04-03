<script lang="ts">
	import { goto } from "$app/navigation";

	let { data } = $props();
	let search = $state(data.search || "");

	function toggleSort(col: string) {
		const order = data.sort === col && data.order === "asc" ? "desc" : "asc";
		goto(`?sort=${col}&order=${order}&q=${search}&view=${data.view}`);
	}

	function doSearch() {
		goto(`?q=${search}&sort=${data.sort}&order=${data.order}&view=${data.view}`);
	}

	function setView(view: string) {
		goto(`?view=${view}&q=${search}`);
	}

	function warmthColor(w: number) {
		if (w >= 70) return "text-success";
		if (w >= 40) return "text-warning";
		return "text-danger";
	}

	function daysSince(date: string | null): string {
		if (!date) return "Never";
		const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
		if (days === 0) return "Today";
		if (days === 1) return "Yesterday";
		return `${days}d ago`;
	}

	function isHitThemUp(c: any): boolean {
		if (!c.is_vip) return false;
		if (!c.last_contact) return true;
		const days = Math.floor((Date.now() - new Date(c.last_contact).getTime()) / 86400000);
		return days > 90;
	}

	function isBirthdaySoon(c: any): boolean {
		if (!c.birthday) return false;
		const today = new Date();
		const bday = new Date(c.birthday);
		const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
		const diff = (thisYear.getTime() - today.getTime()) / 86400000;
		return diff >= 0 && diff <= 7;
	}

	function formatBirthday(date: string | null): string {
		if (!date) return "—";
		const d = new Date(date);
		return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
	}
</script>

<div class="min-h-screen bg-surface">
	<div class="flex items-center justify-between px-4 pt-4 pb-2">
		<h1 class="text-xl font-semibold text-text-primary">Contacts</h1>
		<div class="flex gap-2">
			<a href="/contacts/import" class="bg-surface-overlay text-text-secondary text-sm px-3 py-1.5 rounded-lg hover:text-text-primary transition-colors">Import</a>
			<a href="/contacts/new" class="bg-brain-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-brain-500 transition-colors">+ Add</a>
		</div>
	</div>

	<main class="max-w-5xl mx-auto px-4 space-y-3">
		<!-- View Tabs -->
		<div class="flex gap-1 bg-surface-raised rounded-xl p-1">
			{#each [["all", "All"], ["vip", "★ VIP"], ["birthdays", "🎂 Birthdays"]] as [key, label]}
				<button
					onclick={() => setView(key)}
					class="px-4 py-1.5 rounded-lg text-sm transition-colors {data.view === key ? 'bg-brain-600/20 text-brain-400 font-medium' : 'text-text-muted hover:text-text-primary'}"
				>
					{label}
				</button>
			{/each}
		</div>

		<!-- Search -->
		<form onsubmit={(e) => { e.preventDefault(); doSearch(); }} class="flex gap-2">
			<input
				type="text"
				bind:value={search}
				placeholder="Search contacts..."
				class="flex-1 bg-surface-raised rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brain-500"
			/>
			<button type="submit" class="bg-surface-overlay text-text-primary px-3 py-2 rounded-xl text-sm hover:bg-brain-600/20 transition-colors">Search</button>
		</form>

		<!-- Contact List (card-based for mobile) -->
		<div class="space-y-2">
			{#each data.contacts as c}
				<button
					onclick={() => goto(`/contacts/${c.id}`)}
					class="w-full bg-surface-raised rounded-xl p-3.5 text-left hover:bg-surface-overlay transition-colors"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2 min-w-0">
							{#if c.is_vip}<span class="text-warning text-xs">★</span>{/if}
							<span class="text-sm font-medium text-text-primary truncate">{c.first_name} {c.last_name || ""}</span>
							{#if c.company}<span class="text-xs text-text-muted truncate hidden sm:inline">· {c.company}</span>{/if}
						</div>
						<div class="flex items-center gap-2 shrink-0">
							{#if isHitThemUp(c)}
								<span class="px-2 py-0.5 bg-danger/15 text-danger rounded-full text-[10px] font-medium">Hit Up</span>
							{:else if isBirthdaySoon(c)}
								<span class="px-2 py-0.5 bg-brain-600/15 text-brain-400 rounded-full text-[10px]">🎂</span>
							{/if}
							<div class="w-8 h-1.5 bg-surface-overlay rounded-full overflow-hidden">
								<div class="h-full rounded-full {warmthColor(c.warmth || 0)}" style="width: {c.warmth || 0}%"></div>
							</div>
						</div>
					</div>
					<div class="flex items-center gap-3 mt-1">
						{#if c.role}<span class="text-xs text-text-muted">{c.role}</span>{/if}
						{#if c.company}<span class="text-xs text-text-muted sm:hidden">{c.company}</span>{/if}
						<span class="text-xs text-text-muted ml-auto">{daysSince(c.last_contact)}</span>
					</div>
				</button>
			{:else}
				<div class="text-text-muted text-center py-12 text-sm">
					{#if data.view === "vip"}
						No VIP contacts yet.
					{:else if data.view === "birthdays"}
						No contacts with birthdays set.
					{:else if data.search}
						No contacts matching "{data.search}".
					{:else}
						No contacts yet. <a href="/contacts/new" class="text-brain-400 hover:underline">Add one</a> or <a href="/contacts/import" class="text-brain-400 hover:underline">import</a>.
					{/if}
				</div>
			{/each}
		</div>

		<div class="text-xs text-text-muted text-center pb-4">
			{data.contacts.length} contact{data.contacts.length !== 1 ? "s" : ""}
		</div>
	</main>
</div>
