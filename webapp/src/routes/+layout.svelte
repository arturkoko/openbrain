<script lang="ts">
  import "../app.css";
  import { page } from "$app/state";
  import BottomNav from "$lib/components/BottomNav.svelte";
  import ChatDrawer from "$lib/components/ChatDrawer.svelte";
  let { children } = $props();

  let isLoginPage = $derived(page.url.pathname === "/login");
  let isChatPage = $derived(page.url.pathname === "/chat");
</script>

{#if !isLoginPage}
  <BottomNav currentPath={page.url.pathname} />
  {#if !isChatPage}
    <ChatDrawer currentPath={page.url.pathname} />
  {/if}
{/if}

<div class="{isLoginPage ? '' : 'pb-[calc(56px+env(safe-area-inset-bottom))]'}">
  {@render children()}
</div>
