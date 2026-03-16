<script lang="ts">
	let importType = $state<'vcf' | 'linkedin' | null>(null);
	let file = $state<File | null>(null);
	let preview = $state<any[]>([]);
	let selected = $state<Set<number>>(new Set());
	let importing = $state(false);
	let result = $state<{ imported: number; skipped: number } | null>(null);
	let error = $state('');

	async function handleFile(e: Event) {
		const input = e.target as HTMLInputElement;
		file = input.files?.[0] || null;
		if (!file) return;
		error = '';
		result = null;

		const text = await file.text();

		if (importType === 'vcf') {
			preview = parseVCF(text);
		} else if (importType === 'linkedin') {
			preview = parseLinkedInCSV(text);
		}

		selected = new Set(preview.map((_, i) => i));
	}

	function parseVCF(text: string): any[] {
		const contacts: any[] = [];
		const cards = text.split('BEGIN:VCARD').filter(c => c.trim());

		for (const card of cards) {
			const get = (field: string): string => {
				const regex = new RegExp(`^${field}[;:](.*)$`, 'mi');
				const match = card.match(regex);
				return match ? match[1].replace(/^.*?:/, '').trim() : '';
			};

			const nLine = get('N');
			const parts = nLine.split(';');
			const lastName = parts[0] || '';
			const firstName = parts[1] || '';

			// Try FN as fallback
			const fn = get('FN');
			const name = firstName || fn.split(' ')[0] || '';
			const lname = lastName || fn.split(' ').slice(1).join(' ') || '';

			if (!name && !lname) continue;

			// Parse phone - handle multiple TEL lines
			const phoneMatch = card.match(/^TEL[;:].+$/mi);
			const phone = phoneMatch ? phoneMatch[0].replace(/^TEL[^:]*:/, '').trim() : '';

			// Parse email
			const emailMatch = card.match(/^EMAIL[;:].+$/mi);
			const email = emailMatch ? emailMatch[0].replace(/^EMAIL[^:]*:/, '').trim() : '';

			// Parse org
			const orgMatch = card.match(/^ORG[;:].+$/mi);
			const company = orgMatch ? orgMatch[0].replace(/^ORG[^:]*:/, '').replace(/;/g, ' ').trim() : '';

			// Parse title
			const titleMatch = card.match(/^TITLE[;:].+$/mi);
			const role = titleMatch ? titleMatch[0].replace(/^TITLE[^:]*:/, '').trim() : '';

			// Parse birthday
			const bdayMatch = card.match(/^BDAY[;:].+$/mi);
			let birthday = '';
			if (bdayMatch) {
				const raw = bdayMatch[0].replace(/^BDAY[^:]*:/, '').trim();
				if (raw.length === 8) birthday = `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`;
				else birthday = raw;
			}

			contacts.push({ first_name: name, last_name: lname, email, phone, company, role, birthday, source: 'iphone' });
		}
		return contacts;
	}

	function parseLinkedInCSV(text: string): any[] {
		const lines = text.split('\n');
		if (lines.length < 2) return [];

		const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
		const contacts: any[] = [];

		for (let i = 1; i < lines.length; i++) {
			if (!lines[i].trim()) continue;

			// Simple CSV parse (handles basic quoting)
			const values: string[] = [];
			let current = '';
			let inQuotes = false;
			for (const char of lines[i]) {
				if (char === '"') { inQuotes = !inQuotes; continue; }
				if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue; }
				current += char;
			}
			values.push(current.trim());

			const row: Record<string, string> = {};
			headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

			const firstName = row['First Name'] || '';
			const lastName = row['Last Name'] || '';
			if (!firstName && !lastName) continue;

			contacts.push({
				first_name: firstName,
				last_name: lastName,
				email: row['Email Address'] || '',
				company: row['Company'] || '',
				role: row['Position'] || '',
				linkedin: row['URL'] || '',
				phone: '',
				birthday: '',
				source: 'linkedin',
			});
		}
		return contacts;
	}

	function toggleAll() {
		if (selected.size === preview.length) {
			selected = new Set();
		} else {
			selected = new Set(preview.map((_, i) => i));
		}
	}

	function toggle(idx: number) {
		const next = new Set(selected);
		if (next.has(idx)) next.delete(idx);
		else next.add(idx);
		selected = next;
	}

	async function doImport() {
		importing = true;
		error = '';
		const contacts = preview.filter((_, i) => selected.has(i));

		try {
			const res = await fetch('/api/contacts/import', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ contacts })
			});

			if (!res.ok) throw new Error('Import failed');
			result = await res.json();
		} catch (e: any) {
			error = e.message || 'Import failed';
		} finally {
			importing = false;
		}
	}
</script>

<div class="min-h-screen bg-surface">
	<header class="bg-surface-raised border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
		<a href="/contacts" class="text-text-muted hover:text-text-primary">← Contacts</a>
		<h1 class="text-lg font-bold text-text-primary flex-1">Import Contacts</h1>
	</header>

	<main class="max-w-3xl mx-auto p-4 space-y-6">
		{#if result}
			<!-- Success -->
			<div class="bg-success/10 border border-success/20 rounded-xl p-6 text-center space-y-3">
				<div class="text-4xl">✅</div>
				<h2 class="text-xl font-bold text-text-primary">Import Complete</h2>
				<p class="text-text-secondary">
					<span class="text-success font-semibold">{result.imported}</span> contacts imported,
					<span class="text-text-muted">{result.skipped}</span> skipped (duplicates)
				</p>
				<a href="/contacts" class="inline-block bg-brain-600 hover:bg-brain-500 text-white text-sm px-6 py-2 rounded-lg transition-colors">View Contacts</a>
			</div>
		{:else if !importType}
			<!-- Choose source -->
			<h2 class="text-sm font-semibold text-text-secondary uppercase tracking-wider">Choose Import Source</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<button
					onclick={() => importType = 'vcf'}
					class="bg-surface-raised border border-border rounded-xl p-6 text-left hover:border-brain-500 transition-colors space-y-2"
				>
					<div class="text-3xl">📱</div>
					<h3 class="text-text-primary font-semibold">iPhone Contacts</h3>
					<p class="text-text-muted text-sm">Upload a .vcf (vCard) file exported from your iPhone or iCloud.</p>
					<div class="text-xs text-text-muted mt-2 bg-surface rounded-lg p-2">
						<strong>How to export:</strong> Open Contacts on iCloud.com → Select All → ⚙️ Export vCard
					</div>
				</button>
				<button
					onclick={() => importType = 'linkedin'}
					class="bg-surface-raised border border-border rounded-xl p-6 text-left hover:border-brain-500 transition-colors space-y-2"
				>
					<div class="text-3xl">💼</div>
					<h3 class="text-text-primary font-semibold">LinkedIn Connections</h3>
					<p class="text-text-muted text-sm">Upload a Connections.csv file from LinkedIn data export.</p>
					<div class="text-xs text-text-muted mt-2 bg-surface rounded-lg p-2">
						<strong>How to export:</strong> LinkedIn → Settings → Data Privacy → Get a copy of your data → Connections
					</div>
				</button>
			</div>
		{:else if preview.length === 0}
			<!-- File Upload -->
			<div class="space-y-4">
				<button onclick={() => { importType = null; file = null; preview = []; }} class="text-text-muted text-sm hover:text-text-primary">← Back</button>
				<div class="bg-surface-raised border-2 border-dashed border-border rounded-xl p-12 text-center">
					<div class="text-4xl mb-3">{importType === 'vcf' ? '📱' : '💼'}</div>
					<h3 class="text-text-primary font-semibold mb-2">
						Upload {importType === 'vcf' ? '.vcf (vCard)' : 'Connections.csv'} File
					</h3>
					<input
						type="file"
						accept={importType === 'vcf' ? '.vcf' : '.csv'}
						onchange={handleFile}
						class="mt-4 text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-brain-600 file:text-white file:cursor-pointer hover:file:bg-brain-500"
					/>
				</div>
			</div>
		{:else}
			<!-- Preview -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<div>
						<button onclick={() => { importType = null; file = null; preview = []; selected = new Set(); }} class="text-text-muted text-sm hover:text-text-primary">← Back</button>
						<h2 class="text-text-primary font-semibold mt-2">{preview.length} contacts found · {selected.size} selected</h2>
					</div>
					<div class="flex gap-2">
						<button onclick={toggleAll} class="text-text-muted text-sm hover:text-text-primary border border-border rounded-lg px-3 py-1.5">
							{selected.size === preview.length ? 'Deselect All' : 'Select All'}
						</button>
						<button
							onclick={doImport}
							disabled={importing || selected.size === 0}
							class="bg-brain-600 hover:bg-brain-500 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
						>
							{importing ? 'Importing...' : `Import ${selected.size} Contacts`}
						</button>
					</div>
				</div>

				{#if error}
					<div class="bg-danger/10 border border-danger/20 rounded-lg p-3 text-danger text-sm">{error}</div>
				{/if}

				<div class="bg-surface-raised rounded-xl border border-border overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-border">
								<th class="px-3 py-2 w-8"></th>
								<th class="text-left px-3 py-2 text-text-muted font-medium">Name</th>
								<th class="text-left px-3 py-2 text-text-muted font-medium">Company</th>
								<th class="text-left px-3 py-2 text-text-muted font-medium">Email</th>
								<th class="text-left px-3 py-2 text-text-muted font-medium">Phone</th>
							</tr>
						</thead>
						<tbody>
							{#each preview as contact, i}
								<tr class="border-b border-border/50 hover:bg-surface-overlay/50 cursor-pointer" onclick={() => toggle(i)}>
									<td class="px-3 py-2 text-center">
										<input type="checkbox" checked={selected.has(i)} class="rounded border-border bg-surface text-brain-500" />
									</td>
									<td class="px-3 py-2 text-text-primary">{contact.first_name} {contact.last_name || ''}</td>
									<td class="px-3 py-2 text-text-secondary">{contact.company || '—'}</td>
									<td class="px-3 py-2 text-text-secondary">{contact.email || '—'}</td>
									<td class="px-3 py-2 text-text-secondary">{contact.phone || '—'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</main>
</div>
