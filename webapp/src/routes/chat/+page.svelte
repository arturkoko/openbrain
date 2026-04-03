<script lang="ts">
  import ChatMessages from "$lib/components/ChatMessages.svelte";
</script>

<svelte:head><title>OpenBrain Chat</title></svelte:head>

<div class="h-[calc(100dvh-56px-env(safe-area-inset-bottom))] bg-surface">
  <ChatMessages contextPath="/chat" fullscreen={true} />
</div>
