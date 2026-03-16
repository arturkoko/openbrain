<script lang="ts">
  import "../app.css";
  import { page } from "$app/state";
  let { children } = $props();

  const navItems = [
    { href: "/dashboard", label: "Home", icon: "📊" },
    { href: "/chat", label: "Chat", icon: "💬" },
    { href: "/contacts", label: "Kontakte", icon: "👥" },
    { href: "/household", label: "Haushalt", icon: "🏠" },
    { href: "/reminders", label: "Erinnerungen", icon: "⏰" },
    { href: "/memories", label: "Memories", icon: "🧠" },
    { href: "/vault", label: "Vault", icon: "📝" },
    { href: "/calendar", label: "Kalender", icon: "📅" },
  ];

  let isLoginPage = $derived(page.url.pathname === "/login");
</script>

{#if !isLoginPage}
  <nav class="fixed top-0 left-0 right-0 z-50 bg-surface-raised/95 backdrop-blur border-b border-border">
    <div class="flex items-center gap-1 px-2 h-10 overflow-x-auto no-scrollbar">
      {#each navItems as item}
        <a
          href={item.href}
          class="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs whitespace-nowrap shrink-0 transition-colors
            {page.url.pathname.startsWith(item.href) ? 'bg-brain-600/20 text-brain-400 font-medium' : 'text-text-secondary hover:text-text-primary hover:bg-surface-overlay'}"
        >
          <span class="text-sm">{item.icon}</span>
          <span>{item.label}</span>
        </a>
      {/each}
    </div>
  </nav>
{/if}

<div class="{isLoginPage ? '' : 'pt-10'}">
  {@render children()}
</div>

<style>
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
