<script lang="ts">
	import { goto } from '$app/navigation';

	let { data } = $props();
	let search = $state(data.search || '');

	function toggleSort(col: string) {
		const order = data.sort === col && data.order === 'asc' ? 'desc' : 'asc';
		goto(`?sort=${col}&order=${order}&q=${search}&view=${data.view}`);
	}

	function doSearch() {
		goto(`?q=${search}&sort=${data.sort}&order=${data.order}&view=${data.view}`);
	}

	function setView(view: string) {
		goto(`?view=${view}&q=${search}`);
	}

	function warmthColor(w: number) {
		if (w >= 70) return 'text-success';
		if (w >= 40) return 'text-warning';
		return 'text-danger';
	}

	function daysSince(date: string | null): string {
		if (!date) return 'Never';
		const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
		if (days === 0) return 'Today';
		if (days === 1) return 'Yesterday';
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
		if (!date) return '—';
		const d = new Date(date);
		return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	}
</script>

<div class="min-h-screen bg-surface">
	<header class="bg-surface-raised border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
		<a href="/dashboard" class="text-text-muted hover:text-text-primary">&#8592;</a>
		<h1 class="text-lg font-bold text-text-primary flex-1">Contacts</h1>
		<div class="flex gap-2">
			<a href="/contacts/import" class="bg-surface-overlay text-text-secondary text-sm px-3 py-1.5 rounded-lg hover:text-text-primary transition-colors">Import</a>
			<a href="/contacts/new" class="bg-brain-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-brain-500 transition-colors">+ Add</a>
		</div>
	</header>

	<main class="max-w-5xl mx-auto p-4 space-y-4">
		<!-- View Tabs -->
		<div class="flex gap-1 bg-surface-raised rounded-lg p-1 border border-border">
			{#each [['all', 'All Contacts'], ['vip', '★ VIP Dashboard'], ['birthdays', '🎂 Birthdays']] as [key, label]}
				<button
					onclick={() => setView(key)}
					class="px-4 py-1.5 rounded-md text-sm transition-colors {data.view === key ? 'bg-brain-600/20 text-brain-400 font-medium' : 'text-text-muted hover:text-text-primary'}"
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
				class="flex-1 bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500"
			/>
			<button type="submit" class="bg-surface-overlay text-text-primary px-3 py-2 rounded-lg text-sm hover:bg-brain-600/20 transition-colors">Search</button>
		</form>

		<!-- Table -->
		<div class="bg-surface-raised rounded-xl border border-border overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border">
						{#each [['first_name', 'Name'], ['company', 'Company'], ['industry', 'Industry'], ['warmth', 'Warmth'], ['last_contact', 'Last Contact']] as [col, label]}
							<th
								class="text-left px-4 py-3 text-text-muted font-medium cursor-pointer hover:text-text-primary transition-colors"
								onclick={() => toggleSort(col)}
							>
								{label}
								{#if data.sort === col && data.view === 'all'}
									<span class="text-brain-400">{data.order === 'asc' ? ' ↑' : ' ↓'}</span>
								{/if}
							</th>
						{/each}
						{#if data.view === 'birthdays'}
							<th class="text-left px-4 py-3 text-text-muted font-medium">Birthday</th>
						{/if}
						<th class="text-left px-4 py-3 text-text-muted font-medium">Status</th>
					</tr>
				</thead>
				<tbody>
					{#each data.contacts as c}
						<tr
							class="border-b border-border/50 hover:bg-surface-overlay/50 cursor-pointer transition-colors"
							onclick={() => goto(`/contacts/${c.id}`)}
						>
							<td class="px-4 py-3 text-text-primary font-medium">
								<div class="flex items-center gap-2">
									{#if c.is_vip}<span class="text-warning text-xs">★</span>{/if}
									{c.first_name} {c.last_name || ''}
								</div>
								{#if c.role}<div class="text-xs text-text-muted">{c.role}</div>{/if}
							</td>
							<td class="px-4 py-3 text-text-secondary">{c.company || '—'}</td>
							<td class="px-4 py-3 text-text-secondary">{c.industry || '—'}</td>
							<td class="px-4 py-3">
								<div class="flex items-center gap-2">
									<div class="w-12 h-1.5 bg-surface-overlay rounded-full overflow-hidden">
										<div class="h-full rounded-full {warmthColor(c.warmth || 0)}" style="width: {c.warmth || 0}%"></div>
									</div>
									<span class="text-xs {warmthColor(c.warmth || 0)} font-mono">{c.warmth || 0}</span>
								</div>
							</td>
							<td class="px-4 py-3 text-text-secondary">{daysSince(c.last_contact)}</td>
							{#if data.view === 'birthdays'}
								<td class="px-4 py-3 text-text-secondary">
									{#if isBirthdaySoon(c)}<span class="text-brain-400">🎂 </span>{/if}
									{formatBirthday(c.birthday)}
								</td>
							{/if}
							<td class="px-4 py-3">
								{#if isHitThemUp(c)}
									<span class="px-2 py-0.5 bg-danger/15 text-danger border border-danger/20 rounded-full text-xs font-medium">Hit Them Up</span>
								{:else if isBirthdaySoon(c)}
									<span class="px-2 py-0.5 bg-brain-600/15 text-brain-400 border border-brain-600/20 rounded-full text-xs">🎂 Birthday!</span>
								{:else}
									<span class="text-text-muted text-xs">Good</span>
								{/if}
							</td>
						</tr>
					{/each}
					{#if data.contacts.length === 0}
						<tr>
							<td colspan="7" class="px-4 py-12 text-center text-text-muted">
								{#if data.view === 'vip'}
									No VIP contacts yet. Open a contact and toggle the ★ VIP button.
								{:else if data.view === 'birthdays'}
									No contacts with birthdays set.
								{:else if data.search}
									No contacts matching "{data.search}".
								{:else}
									No contacts yet. <a href="/contacts/new" class="text-brain-400 hover:underline">Add your first one</a> or <a href="/contacts/import" class="text-brain-400 hover:underline">import contacts</a>.
								{/if}
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>

		<div class="text-xs text-text-muted text-center pb-4">
			{data.contacts.length} contact{data.contacts.length !== 1 ? 's' : ''}
		</div>
	</main>
</div>
