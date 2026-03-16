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
    // ICS dates: 20260315 or 20260315T140000Z
    if (d.length === 8) {
      return `${d.slice(6, 8)}.${d.slice(4, 6)}.${d.slice(0, 4)}`;
    }
    if (d.includes("T")) {
      const date = d.slice(0, 8);
      const time = d.slice(9, 13);
      return `${date.slice(6, 8)}.${date.slice(4, 6)}.${date.slice(0, 4)} ${time.slice(0, 2)}:${time.slice(2, 4)}`;
    }
    // ISO date
    if (d.includes("-") && d.length === 10) {
      const [y, m, day] = d.split("-");
      return `${day}.${m}.${y}`;
    }
    return d;
  }

  function isAllDay(e: CalEvent): boolean {
    return e.start.length === 8 || (e.start.length === 10 && !e.start.includes("T"));
  }

  // Sort events by start date
  let sortedEvents = $derived(
    [...(data.events as CalEvent[])].sort((a, b) => a.start.localeCompare(b.start))
  );
</script>

<svelte:head><title>Kalender - OpenBrain</title></svelte:head>

<div class="min-h-screen bg-surface">
  <main class="max-w-2xl mx-auto p-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-text-primary">Termine</h2>
      <span class="text-xs text-text-muted">{sortedEvents.length} Events</span>
    </div>

    {#if sortedEvents.length === 0}
      <div class="bg-surface-raised border border-border rounded-xl p-8 text-center">
        <div class="text-4xl mb-3">📅</div>
        <p class="text-text-muted">Keine Termine in den naechsten 60 Tagen.</p>
        <p class="text-text-muted text-sm mt-2">Erstelle Termine ueber den Chat oder direkt in iOS Kalender.</p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each sortedEvents as event}
          <div class="bg-surface-raised border border-border rounded-xl p-4">
            <div class="flex items-start gap-3">
              <div class="shrink-0 w-10 h-10 bg-brain-600/20 text-brain-400 rounded-lg flex items-center justify-center text-sm">
                {isAllDay(event) ? "📅" : "🕐"}
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
