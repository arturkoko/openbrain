<script lang="ts">
	let { data } = $props();

	interface Reminder {
		id: string;
		title: string;
		description: string | null;
		due_date: string | null;
		priority: string;
		status: string;
		notes: string | null;
		recurring: string | null;
		created_at: string;
	}

	let pending: Reminder[] = $state([...data.pending]);
	let completed: Reminder[] = $state([...data.completed]);
	let showAdd = $state(false);
	let saving = $state(false);
	let form = $state({ title: "", description: "", due_date: "", due_time: "", priority: "normal", notes: "" });
	let selected: Reminder | null = $state(null);
	let editForm = $state({ title: "", description: "", due_date: "", due_time: "", priority: "normal", notes: "" });

	function openDetail(r: Reminder) {
		selected = r;
		const dt = r.due_date ? new Date(r.due_date) : null;
		editForm = {
			title: r.title,
			description: r.description || "",
			due_date: dt ? dt.toISOString().substring(0, 10) : "",
			due_time: (dt && (dt.getHours() || dt.getMinutes())) ? dt.toTimeString().substring(0, 5) : "",
			priority: r.priority || "normal",
			notes: r.notes || "",
		};
	}

	function closeDetail() { selected = null; }

	async function saveDetail() {
		if (!selected || saving) return;
		saving = true;
		try {
			const due = editForm.due_date
				? (editForm.due_time ? `${editForm.due_date}T${editForm.due_time}` : editForm.due_date)
				: null;
			const res = await fetch("/api/reminders", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: selected.id, title: editForm.title,
					description: editForm.description || null,
					due_date: due, priority: editForm.priority,
					notes: editForm.notes || null,
				}),
			});
			if (!res.ok) return;
			const updated = await res.json();
			pending = pending.map(r => r.id === updated.id ? updated : r);
			completed = completed.map(r => r.id === updated.id ? updated : r);
			selected = null;
		} finally { saving = false; }
	}

	async function toggleStatus(id: string, currentStatus: string) {
		const newStatus = currentStatus === "completed" ? "pending" : "completed";
		const res = await fetch("/api/reminders", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id, status: newStatus }),
		});
		if (!res.ok) return;
		const updated: Reminder = await res.json();
		pending = pending.filter(p => p.id !== id);
		completed = completed.filter(c => c.id !== id);
		if (updated.status === "completed") {
			completed = [updated, ...completed];
		} else {
			pending = [...pending, updated].sort((a, b) => {
				if (!a.due_date) return 1;
				if (!b.due_date) return -1;
				return a.due_date.localeCompare(b.due_date);
			});
		}
	}

	async function addReminder() {
		if (!form.title.trim() || saving) return;
		saving = true;
		try {
			const due = form.due_date
				? (form.due_time ? `${form.due_date}T${form.due_time}` : form.due_date)
				: null;
			const res = await fetch("/api/reminders", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: form.title.trim(),
					description: form.description.trim() || null,
					due_date: due, priority: form.priority,
					notes: form.notes.trim() || null,
				}),
			});
			if (!res.ok) { alert("Error: " + res.status); return; }
			const created: Reminder = await res.json();
			pending = [...pending, created].sort((a, b) => {
				if (!a.due_date) return 1;
				if (!b.due_date) return -1;
				return a.due_date.localeCompare(b.due_date);
			});
			form = { title: "", description: "", due_date: "", due_time: "", priority: "normal", notes: "" };
			showAdd = false;
		} finally { saving = false; }
	}

	function formatDate(d: string | null) {
		if (!d) return "";
		const dt = new Date(d);
		const date = dt.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" });
		const hours = dt.getHours();
		const mins = dt.getMinutes();
		if (hours === 0 && mins === 0) return date;
		return `${date} ${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
	}

	function priorityBadge(p: string) {
		const colors: Record<string, string> = {
			urgent: "bg-danger/20 text-danger",
			high: "bg-warning/20 text-warning",
			normal: "bg-brain-500/20 text-brain-400",
			low: "bg-surface-overlay text-text-muted"
		};
		return colors[p] || colors.normal;
	}

	function isOverdue(r: Reminder): boolean {
		if (!r.due_date || r.status !== "pending") return false;
		return new Date(r.due_date) < new Date();
	}
</script>

<svelte:head><title>Erinnerungen - OpenBrain</title></svelte:head>

<div class="min-h-screen bg-surface">
	<main class="max-w-2xl mx-auto px-4 space-y-4">
		<div class="flex items-center justify-between pt-4 pb-2">
			<h1 class="text-xl font-semibold text-text-primary">Erinnerungen</h1>
			<button onclick={() => { showAdd = !showAdd; }} class="bg-brain-600 text-white text-sm px-3 py-1.5 rounded-xl">
				{showAdd ? "Abbrechen" : "+ Neu"}
			</button>
		</div>

		{#if showAdd}
			<form onsubmit={(e) => { e.preventDefault(); addReminder(); }} class="bg-surface-raised rounded-2xl p-4 space-y-3">
				<input type="text" bind:value={form.title} placeholder="Titel *" required
					class="w-full bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500" />
				<textarea bind:value={form.description} placeholder="Beschreibung (optional)" rows="2"
					class="w-full bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500 resize-none"></textarea>
				<div class="flex gap-2">
					<input type="date" bind:value={form.due_date}
						class="flex-1 bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
					<input type="time" bind:value={form.due_time}
						class="w-28 bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
					<select bind:value={form.priority}
						class="bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500">
						<option value="low">Low</option>
						<option value="normal">Normal</option>
						<option value="high">High</option>
						<option value="urgent">Urgent</option>
					</select>
				</div>
				<div class="flex justify-end">
					<button type="submit" disabled={!form.title.trim() || saving} class="bg-brain-600 text-white text-sm px-4 py-1.5 rounded-xl disabled:opacity-30">
						{saving ? "Speichert..." : "Speichern"}
					</button>
				</div>
			</form>
		{/if}

		<!-- Pending -->
		<section>
			<h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Offen ({pending.length})</h3>
			<div class="space-y-2">
				{#each pending as r (r.id)}
					<div class="bg-surface-raised rounded-xl p-3 flex items-center gap-3">
						<button
							onclick={() => toggleStatus(r.id, r.status)}
							class="w-5 h-5 border-2 border-text-muted/30 rounded-md hover:border-success transition shrink-0"
						></button>
						<button onclick={() => openDetail(r)} class="flex-1 min-w-0 text-left">
							<div class="text-text-primary text-sm font-medium truncate">{r.title}</div>
							{#if r.description}<div class="text-text-muted text-xs truncate">{r.description}</div>{/if}
						</button>
						<span class="text-xs px-2 py-0.5 rounded-full {priorityBadge(r.priority)}">{r.priority}</span>
						{#if r.due_date}
							<span class="text-xs shrink-0 {isOverdue(r) ? 'text-danger font-medium' : 'text-text-muted'}">{formatDate(r.due_date)}</span>
						{/if}
					</div>
				{:else}
					<p class="text-text-muted text-center py-6 text-sm">Keine offenen Aufgaben</p>
				{/each}
			</div>
		</section>

		{#if completed.length > 0}
			<section>
				<h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Erledigt ({completed.length})</h3>
				<div class="space-y-1.5">
					{#each completed as r (r.id)}
						<div class="bg-surface-raised/50 rounded-xl p-3 flex items-center gap-3">
							<button
								onclick={() => toggleStatus(r.id, r.status)}
								class="w-5 h-5 border-2 border-success rounded-md flex items-center justify-center text-success text-xs shrink-0 hover:border-warning hover:text-warning transition"
							>✓</button>
							<button onclick={() => openDetail(r)} class="flex-1 min-w-0 text-left">
								<span class="text-text-muted text-sm line-through">{r.title}</span>
							</button>
							{#if r.due_date}
								<span class="text-xs text-text-muted shrink-0">{formatDate(r.due_date)}</span>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</main>
</div>

<!-- Detail Modal -->
{#if selected}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onkeydown={(e) => { if (e.key === "Escape") closeDetail(); }}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="absolute inset-0 bg-black/50" onclick={closeDetail}></div>
		<div class="relative bg-surface-raised rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto p-5 space-y-4 safe-bottom">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold text-text-primary">Details</h3>
				<button onclick={closeDetail} class="text-text-muted hover:text-text-primary text-xl leading-none">&times;</button>
			</div>
			<div class="space-y-3">
				<div>
					<label class="text-xs text-text-muted block mb-1">Titel</label>
					<input type="text" bind:value={editForm.title}
						class="w-full bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
				</div>
				<div>
					<label class="text-xs text-text-muted block mb-1">Beschreibung</label>
					<textarea bind:value={editForm.description} rows="2"
						class="w-full bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500 resize-none"></textarea>
				</div>
				<div class="flex gap-2">
					<div class="flex-1">
						<label class="text-xs text-text-muted block mb-1">Datum</label>
						<input type="date" bind:value={editForm.due_date}
							class="w-full bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
					</div>
					<div class="w-28">
						<label class="text-xs text-text-muted block mb-1">Uhrzeit</label>
						<input type="time" bind:value={editForm.due_time}
							class="w-full bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brain-500" />
					</div>
				</div>
				<div>
					<label class="text-xs text-text-muted block mb-1">Prioritaet</label>
					<div class="flex gap-2">
						{#each ["low", "normal", "high", "urgent"] as p}
							<button
								type="button"
								onclick={() => { editForm.priority = p; }}
								class="flex-1 py-1.5 text-xs rounded-xl transition {editForm.priority === p ? priorityBadge(p) + ' font-medium' : 'bg-surface text-text-muted hover:text-text-secondary'}"
							>{p}</button>
						{/each}
					</div>
				</div>
				<div>
					<label class="text-xs text-text-muted block mb-1">Notizen</label>
					<textarea bind:value={editForm.notes} rows="3" placeholder="Notizen..."
						class="w-full bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500 resize-none"></textarea>
				</div>
			</div>
			<div class="flex gap-2 pt-2">
				<button type="button" onclick={closeDetail} class="flex-1 py-2.5 text-sm text-text-muted bg-surface rounded-xl hover:bg-surface-overlay">Abbrechen</button>
				<button type="button" onclick={saveDetail} disabled={saving} class="flex-1 py-2.5 text-sm text-white bg-brain-600 rounded-xl hover:bg-brain-500 disabled:opacity-50">
					{saving ? "Speichert..." : "Speichern"}
				</button>
			</div>
		</div>
	</div>
{/if}
