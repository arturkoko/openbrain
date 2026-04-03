<script lang="ts">
  import ChatMessages from "./ChatMessages.svelte";
  import { getDrawerOpen, closeDrawer } from "$lib/stores/chat.svelte.ts";

  let { currentPath = '/' }: { currentPath?: string } = $props();

  let drawerOpen = $derived(getDrawerOpen());

  let startY = 0;
  let dragging = false;

  function onTouchStart(e: TouchEvent) {
    startY = e.touches[0].clientY;
    dragging = true;
  }

  function onTouchEnd(e: TouchEvent) {
    if (!dragging) return;
    dragging = false;
    const diff = e.changedTouches[0].clientY - startY;
    if (diff > 80) closeDrawer();
  }
</script>

{#if drawerOpen}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300"
    onclick={closeDrawer}
    onkeydown={(e) => { if (e.key === 'Escape') closeDrawer(); }}
  ></div>

  <!-- Drawer -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-x-0 bottom-0 z-[70] h-[90dvh] bg-surface rounded-t-2xl shadow-2xl shadow-black/50 flex flex-col animate-slide-up"
    ontouchstart={onTouchStart}
    ontouchend={onTouchEnd}
  >
    <!-- Handle -->
    <div class="flex justify-center py-3 shrink-0 cursor-grab">
      <div class="w-10 h-1 bg-text-muted/30 rounded-full"></div>
    </div>

    <!-- Chat content -->
    <div class="flex-1 min-h-0">
      <ChatMessages {currentPath} />
    </div>

    <!-- Safe area spacer -->
    <div class="safe-bottom"></div>
  </div>
{/if}

<style>
  @keyframes slide-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
</style>
