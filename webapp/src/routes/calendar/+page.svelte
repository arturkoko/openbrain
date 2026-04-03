<script lang="ts">
  let { data } = $props();

  interface CalEvent {
    uid: string;
    title: string;
    start: string;
    end?: string;
    description?: string;
    location?: string;
  }

  function formatDate(d: string): string {
    if (!d) return "";
    if (d.length === 8) {
      return `${d.slice(6, 8)}.${d.slice(4, 6)}.${d.slice(0, 4)}`;
    }
    if (d.includes("T")) {
      const date = d.slice(0, 8);
      const time = d.slice(9, 13);
      return `${date.slice(6, 8)}.${date.slice(4, 6)}.${date.slice(0, 4)} ${time.slice(0, 2)}:${time.slice(2, 4)}`;
    }
    if (d.includes("-") && d.length === 10) {
      const [y, m, day] = d.split("-");
      return `${day}.${m}.${y}`;
    }
    return d;
  }

  function isAllDay(e: CalEvent): boolean {
    return e.start.length === 8 || (e.start.length === 10 && !e.start.includes("T"));
  }

  let sortedEvents = $derived(
    [...(data.events as CalEvent[])].sort((a, b) => a.start.localeCompare(b.start))
  );
</script>

<svelte:head><title>Kalender - OpenBrain</title></svelte:head>

<div class="min-h-screen bg-surface">
  <main class="max-w-2xl mx-auto px-4">
    <div class="flex items-center justify-between pt-4 pb-2">
      <h1 class="text-xl font-semibold text-text-primary">Termine</h1>
      <span class="text-xs text-text-muted">{sortedEvents.length} Events</span>
    </div>

    {#if sortedEvents.length === 0}
      <div class="bg-surface-raised rounded-2xl p-8 text-center">
        <svg class="w-10 h-10 mx-auto mb-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
        <p class="text-text-muted">Keine Termine in den naechsten 60 Tagen.</p>
        <p class="text-text-muted text-sm mt-2">Erstelle Termine ueber den Chat.</p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each sortedEvents as event}
          <div class="bg-surface-raised rounded-2xl p-4">
            <div class="flex items-start gap-3">
              <div class="shrink-0 w-10 h-10 bg-brain-600/20 text-brain-400 rounded-xl flex items-center justify-center">
                {#if isAllDay(event)}
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                {:else}
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-text-primary font-medium">{event.title}</div>
                <div class="text-text-secondary text-sm mt-0.5">
                  {formatDate(event.start)}
                  {#if event.end && event.end !== event.start}
                    <span class="text-text-muted"> — {formatDate(event.end)}</span>
                  {/if}
                  {#if isAllDay(event)}
                    <span class="ml-1 text-xs bg-brain-600/20 text-brain-400 px-1.5 py-0.5 rounded">Ganztag</span>
                  {/if}
                </div>
                {#if event.location}
                  <div class="text-text-muted text-xs mt-1">📍 {event.location}</div>
                {/if}
                {#if event.description}
                  <div class="text-text-muted text-xs mt-1">{event.description}</div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </main>
</div>
