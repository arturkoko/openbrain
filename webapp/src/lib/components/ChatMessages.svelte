<script lang="ts">
  import { onMount, tick } from "svelte";
  import {
    getMessages, getLoading, getInput, setInput,
    getPendingImages, getIsRecording,
    sendMessage, sendAudio, clearChat,
    addPendingImage, removePendingImage, renderMarkdown, initChat
  } from "$lib/stores/chat.svelte.ts";

  let { contextPath = '/', fullscreen = false }: { contextPath?: string; fullscreen?: boolean } = $props();

  let chatContainer: HTMLDivElement;
  let fileInput: HTMLInputElement;

  let messages = $derived(getMessages());
  let loading = $derived(getLoading());
  let input = $derived(getInput());
  let pendingImages = $derived(getPendingImages());
  let isRecording = $derived(getIsRecording());

  onMount(async () => {
    await initChat();
    await tick();
    scrollToBottom();
  });

  $effect(() => {
    // scroll when messages change
    void messages.length;
    void loading;
    tick().then(scrollToBottom);
  });

  function scrollToBottom() {
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  async function handleSend() {
    await sendMessage(contextPath);
    await tick();
    scrollToBottom();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function handleImageUpload() { fileInput?.click(); }

  async function onFileSelected(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files) return;
    for (const file of target.files) {
      const reader = new FileReader();
      reader.onload = () => { addPendingImage(reader.result as string); };
      reader.readAsDataURL(file);
    }
  }
</script>

<div class="flex flex-col {fullscreen ? 'h-full' : 'h-full'} bg-surface text-text-primary">
  <!-- Messages -->
  <div bind:this={chatContainer} class="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar">
    {#if messages.length === 0}
      <div class="flex items-center justify-center h-full text-text-muted">
        <div class="text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-2xl bg-brain-600/20 flex items-center justify-center">
            <svg class="w-6 h-6 text-brain-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <p class="text-base font-medium text-text-secondary">Frag mich etwas</p>
          <p class="text-sm mt-1 text-text-muted">DB, Vault, Docker, Termine...</p>
        </div>
      </div>
    {/if}

    {#each messages as msg}
      {#if msg.role === "user"}
        <div class="flex justify-end">
          <div class="max-w-[80%] bg-brain-600 text-white rounded-2xl rounded-br-md px-4 py-2.5">
            {#if msg.images?.length}
              <div class="flex gap-2 mb-2">
                {#each msg.images as img}
                  <img src={img} alt="upload" class="w-20 h-20 rounded-lg object-cover" />
                {/each}
              </div>
            {/if}
            <p class="whitespace-pre-wrap text-sm">{msg.content}</p>
          </div>
        </div>
      {:else if msg.role === "assistant" && msg.tool_calls}
        <div class="flex justify-start">
          <div class="max-w-[80%] bg-surface-overlay rounded-lg px-3 py-1.5 text-xs text-text-muted">
            {#each msg.tool_calls as tc}
              <span class="font-mono text-brain-400">{tc.name}</span>
              <span class="ml-1 text-text-muted">({Object.keys(tc.args || {}).join(", ")})</span>
            {/each}
          </div>
        </div>
      {:else if msg.role === "tool" && msg.tool_result}
        <div class="flex justify-start">
          <div class="max-w-[80%] bg-surface-overlay rounded-lg px-3 py-1.5 text-xs text-text-muted">
            <span class="font-mono text-success">{msg.tool_result.name}</span>
            <span class="ml-1">{msg.tool_result.result.substring(0, 100)}{msg.tool_result.result.length > 100 ? "..." : ""}</span>
          </div>
        </div>
      {:else if msg.role === "assistant" && msg.content}
        <div class="flex justify-start">
          <div class="max-w-[85%] bg-surface-raised rounded-2xl rounded-bl-md px-4 py-3 prose-chat text-sm max-w-none">
            {@html renderMarkdown(msg.content)}
          </div>
        </div>
      {/if}
    {/each}

    {#if loading}
      <div class="flex justify-start">
        <div class="bg-surface-raised rounded-2xl px-4 py-3">
          <div class="flex gap-1.5">
            <span class="w-2 h-2 bg-brain-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
            <span class="w-2 h-2 bg-brain-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
            <span class="w-2 h-2 bg-brain-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Image preview -->
  {#if pendingImages.length}
    <div class="flex gap-2 px-4 py-2 bg-surface-raised shrink-0">
      {#each pendingImages as img, i}
        <div class="relative">
          <img src={img} alt="preview" class="w-14 h-14 rounded-lg object-cover" />
          <button onclick={() => removePendingImage(i)} class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-white rounded-full text-xs flex items-center justify-center">x</button>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Input bar -->
  <div class="shrink-0 px-3 py-2 bg-surface-raised {fullscreen ? 'safe-bottom' : ''}">
    <div class="flex items-end gap-2">
      <button onclick={handleImageUpload} class="p-2 text-text-muted hover:text-brain-400 shrink-0 transition-colors" title="Bild hochladen">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
        </svg>
      </button>
      <input bind:this={fileInput} type="file" accept="image/*" multiple class="hidden" onchange={onFileSelected} />

      <textarea
        value={input}
        oninput={(e) => setInput(e.currentTarget.value)}
        onkeydown={handleKeydown}
        placeholder="Nachricht..."
        rows={1}
        class="flex-1 bg-surface border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-brain-500 max-h-28 transition-colors"
      ></textarea>

      <button
        onclick={() => sendAudio(contextPath)}
        class="p-2 shrink-0 rounded-full transition-colors {isRecording ? 'bg-danger text-white animate-pulse' : 'text-text-muted hover:text-brain-400'}"
        title={isRecording ? "Stop" : "Aufnahme"}
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      </button>

      <button
        onclick={handleSend}
        disabled={loading || (!input.trim() && !pendingImages.length)}
        class="p-2 shrink-0 bg-brain-600 text-white rounded-full hover:bg-brain-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Senden"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </button>

      <button onclick={clearChat} class="p-2 shrink-0 text-text-muted hover:text-danger transition-colors" title="Chat loeschen">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
    </div>
  </div>
</div>
