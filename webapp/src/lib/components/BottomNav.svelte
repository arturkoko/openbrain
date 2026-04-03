<script lang="ts">
  import { toggleDrawer, getDrawerOpen } from "$lib/stores/chat.svelte.ts";

  let { currentPath = '/' }: { currentPath?: string } = $props();

  let drawerOpen = $derived(getDrawerOpen());
  let moreOpen = $state(false);

  const tabs = [
    { href: '/dashboard', label: 'Home', icon: 'home' },
    { href: '/chat', label: 'Chat', icon: 'chat' },
    { href: '/contacts', label: 'Kontakte', icon: 'contacts' },
    { href: '/reminders', label: 'Tasks', icon: 'bell' },
    { href: '#more', label: 'Mehr', icon: 'more' },
  ];

  const moreItems = [
    { href: '/household', label: 'Haushalt', icon: 'household' },
    { href: '/memories', label: 'Memories', icon: 'memories' },
    { href: '/vault', label: 'Vault', icon: 'vault' },
    { href: '/calendar', label: 'Kalender', icon: 'calendar' },
  ];

  function isActive(href: string): boolean {
    if (href === '#more') return moreItems.some(i => currentPath.startsWith(i.href));
    return currentPath.startsWith(href);
  }

  function handleTabClick(e: MouseEvent, href: string) {
    if (href === '#more') {
      e.preventDefault();
      moreOpen = !moreOpen;
    } else {
      moreOpen = false;
    }
  }
</script>

<!-- More menu overlay -->
{#if moreOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-40" onclick={() => moreOpen = false} onkeydown={(e) => { if (e.key === 'Escape') moreOpen = false; }}></div>
  <div class="fixed bottom-[calc(56px+env(safe-area-inset-bottom))] right-2 z-50 bg-surface-raised rounded-2xl shadow-2xl shadow-black/40 py-2 min-w-[180px] animate-pop-up">
    {#each moreItems as item}
      <a
        href={item.href}
        onclick={() => moreOpen = false}
        class="flex items-center gap-3 px-4 py-3 text-sm transition-colors {currentPath.startsWith(item.href) ? 'text-brain-400' : 'text-text-secondary hover:text-text-primary'}"
      >
        {#if item.icon === 'household'}
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" /></svg>
        {:else if item.icon === 'memories'}
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
        {:else if item.icon === 'vault'}
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
        {:else if item.icon === 'calendar'}
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
        {/if}
        <span>{item.label}</span>
      </a>
    {/each}
  </div>
{/if}

<!-- FAB for chat drawer (hidden on /chat and /login) -->
{#if !currentPath.startsWith('/chat') && !currentPath.startsWith('/login')}
  <button
    onclick={toggleDrawer}
    class="fixed z-50 right-4 bottom-[calc(72px+env(safe-area-inset-bottom))] w-14 h-14 bg-brain-600 hover:bg-brain-500 text-white rounded-full shadow-lg shadow-brain-900/40 flex items-center justify-center transition-all active:scale-95"
    title="Chat"
  >
    {#if drawerOpen}
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
    {:else}
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
    {/if}
  </button>
{/if}

<!-- Bottom nav bar -->
<nav class="fixed bottom-0 inset-x-0 z-50 bg-surface-raised/95 backdrop-blur-xl border-t border-border/30">
  <div class="flex items-stretch justify-around h-14">
    {#each tabs as tab}
      <a
        href={tab.href === '#more' ? undefined : tab.href}
        onclick={(e) => handleTabClick(e, tab.href)}
        class="flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors min-w-0
          {isActive(tab.href) ? 'text-brain-400' : 'text-text-muted'}"
        role={tab.href === '#more' ? 'button' : undefined}
      >
        {#if tab.icon === 'home'}
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
        {:else if tab.icon === 'chat'}
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
        {:else if tab.icon === 'contacts'}
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
        {:else if tab.icon === 'bell'}
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
        {:else if tab.icon === 'more'}
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
        {/if}
        <span class="text-[10px] leading-tight">{tab.label}</span>
      </a>
    {/each}
  </div>
  <div class="safe-bottom bg-surface-raised/95"></div>
</nav>

<style>
  @keyframes pop-up {
    from { opacity: 0; transform: translateY(8px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .animate-pop-up {
    animation: pop-up 0.2s ease-out;
  }
</style>
