<script lang="ts">
	let username = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function login() {
		loading = true;
		error = '';
		const res = await fetch('/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password })
		});
		if (res.ok) window.location.href = '/dashboard';
		else error = 'Invalid credentials';
		loading = false;
	}
</script>

<div class="min-h-screen bg-surface flex items-center justify-center p-4">
	<div class="w-full max-w-sm">
		<div class="text-center mb-8">
			<div class="text-5xl mb-3">&#129504;</div>
			<h1 class="text-2xl font-bold text-text-primary">OpenBrain</h1>
			<p class="text-text-muted text-sm mt-1">Your personal AI memory</p>
		</div>
		<form onsubmit={(e) => { e.preventDefault(); login(); }} class="space-y-4">
			{#if error}
				<div class="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3">{error}</div>
			{/if}
			<input type="text" bind:value={username} placeholder="Username"
				class="w-full bg-surface-raised border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500 transition" />
			<input type="password" bind:value={password} placeholder="Password"
				class="w-full bg-surface-raised border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brain-500 transition" />
			<button type="submit" disabled={loading}
				class="w-full bg-brain-600 hover:bg-brain-700 text-white font-medium rounded-lg px-4 py-3 transition disabled:opacity-50">
				{loading ? 'Signing in...' : 'Sign in'}
			</button>
		</form>
	</div>
</div>
