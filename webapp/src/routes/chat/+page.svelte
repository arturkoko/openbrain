<script lang="ts">
  import { onMount, tick } from "svelte";
  import { marked } from "marked";

  interface Message {
    role: "user" | "assistant" | "tool";
    content: string | null;
    tool_calls?: Array<{ name: string; args: Record<string, string> }>;
    tool_result?: { name: string; result: string };
    images?: string[];
  }

  let messages: Message[] = $state([]);
  let input = $state("");
  let loading = $state(false);
  let chatContainer: HTMLDivElement;
  let fileInput: HTMLInputElement;
  let pendingImages: string[] = $state([]);
  let isRecording = $state(false);
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];

  onMount(async () => {
    const res = await fetch("/api/chat");
    if (res.ok) {
      const data = await res.json();
      messages = (data.history || []).map((m: Record<string, unknown>) => ({
        role: m.role as string,
        content: m.content as string,
        tool_calls: m.tool_calls ? JSON.parse(String(m.tool_calls)) : undefined,
      })).filter((m: Message) => m.role !== "tool");
      await tick();
      scrollToBottom();
    }
  });

  function scrollToBottom() {
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text && !pendingImages.length) return;
    input = "";
    messages = [...messages, { role: "user", content: text, images: pendingImages.length ? [...pendingImages] : undefined }];
    const imgs = pendingImages.length ? [...pendingImages] : undefined;
    pendingImages = [];
    loading = true;
    await tick();
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, images: imgs }),
      });
      const data = await res.json();
      for (const chunk of data.chunks || []) {
        if (chunk.type === "tool_call") {
          const tc = JSON.parse(chunk.data);
          messages = [...messages, { role: "assistant", content: null, tool_calls: [tc] }];
        } else if (chunk.type === "tool_result") {
          const tr = JSON.parse(chunk.data);
          messages = [...messages, { role: "tool", content: null, tool_result: tr }];
        } else if (chunk.type === "text") {
          messages = [...messages, { role: "assistant", content: chunk.data }];
        } else if (chunk.type === "error") {
          messages = [...messages, { role: "assistant", content: `**Error:** ${chunk.data}` }];
        }
      }
    } catch (e) {
      messages = [...messages, { role: "assistant", content: `**Error:** ${e}` }];
    }
    loading = false;
    await tick();
    scrollToBottom();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function handleImageUpload() { fileInput?.click(); }

  async function onFileSelected(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files) return;
    for (const file of target.files) {
      const reader = new FileReader();
      reader.onload = () => { pendingImages = [...pendingImages, reader.result as string]; };
      reader.readAsDataURL(file);
    }
  }

  function removeImage(idx: number) { pendingImages = pendingImages.filter((_, i) => i !== idx); }

  async function toggleRecording() {
    if (isRecording) {
      mediaRecorder?.stop();
      isRecording = false;
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(",")[1];
          messages = [...messages, { role: "user", content: "🎤 Audio-Nachricht" }];
          loading = true;
          await tick();
          scrollToBottom();
          try {
            const res = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: "", audio: base64 }),
            });
            const data = await res.json();
            for (const chunk of data.chunks || []) {
              if (chunk.type === "text") messages = [...messages, { role: "assistant", content: chunk.data }];
              else if (chunk.type === "tool_call") { const tc = JSON.parse(chunk.data); messages = [...messages, { role: "assistant", content: null, tool_calls: [tc] }]; }
              else if (chunk.type === "error") messages = [...messages, { role: "assistant", content: `**Error:** ${chunk.data}` }];
            }
          } catch (e) { messages = [...messages, { role: "assistant", content: `**Error:** ${e}` }]; }
          loading = false;
          await tick();
          scrollToBottom();
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorder.start();
      isRecording = true;
    } catch { alert("Mikrofon-Zugriff verweigert"); }
  }

  async function clearChat() {
    if (!confirm("Chat-Verlauf loeschen?")) return;
    await fetch("/api/chat", { method: "DELETE" });
    messages = [];
  }

  function renderMarkdown(text: string): string {
    return marked.parse(text, { async: false }) as string;
  }
</script>

<svelte:head><title>OpenBrain Chat</title></svelte:head>

<div class="flex flex-col h-[calc(100dvh-2.5rem)] bg-surface text-text-primary">
  <!-- Messages -->
  <div bind:this={chatContainer} class="flex-1 overflow-y-auto px-4 py-3 space-y-3">
    {#if messages.length === 0}
      <div class="flex items-center justify-center h-full text-text-muted">
        <div class="text-center">
          <p class="text-4xl mb-3">🧠</p>
          <p class="text-lg">Hallo! Frag mich etwas.</p>
          <p class="text-sm mt-2 opacity-70">DB durchsuchen, Vault-Notizen lesen, Termine erstellen...</p>
        </div>
      </div>
    {/if}

    {#each messages as msg}
      {#if msg.role === "user"}
        <div class="flex justify-end">
          <div class="max-w-[80%] bg-brain-700 text-white rounded-2xl rounded-br-sm px-4 py-2">
            {#if msg.images?.length}
              <div class="flex gap-2 mb-2">
                {#each msg.images as img}
                  <img src={img} alt="upload" class="w-20 h-20 rounded object-cover" />
                {/each}
              </div>
            {/if}
            <p class="whitespace-pre-wrap">{msg.content}</p>
          </div>
        </div>
      {:else if msg.role === "assistant" && msg.tool_calls}
        <div class="flex justify-start">
          <div class="max-w-[80%] bg-surface-overlay border border-border rounded-lg px-3 py-1.5 text-xs text-text-secondary">
            {#each msg.tool_calls as tc}
              <span class="font-mono">🔧 {tc.name}</span>
              <span class="text-text-muted ml-1">({Object.keys(tc.args || {}).join(", ")})</span>
            {/each}
          </div>
        </div>
      {:else if msg.role === "tool" && msg.tool_result}
        <div class="flex justify-start">
          <div class="max-w-[80%] bg-surface-overlay border border-border rounded-lg px-3 py-1.5 text-xs text-text-muted">
            <span class="font-mono">✅ {msg.tool_result.name}</span>
            <span class="ml-1">{msg.tool_result.result.substring(0, 100)}{msg.tool_result.result.length > 100 ? "..." : ""}</span>
          </div>
        </div>
      {:else if msg.role === "assistant" && msg.content}
        <div class="flex justify-start">
          <div class="max-w-[85%] bg-surface-raised border border-border rounded-2xl rounded-bl-sm px-4 py-3 prose prose-invert prose-sm max-w-none">
            {@html renderMarkdown(msg.content)}
          </div>
        </div>
      {/if}
    {/each}

    {#if loading}
      <div class="flex justify-start">
        <div class="bg-surface-raised border border-border rounded-2xl px-4 py-3">
          <div class="flex gap-1">
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
    <div class="flex gap-2 px-4 py-2 bg-surface-raised border-t border-border shrink-0">
      {#each pendingImages as img, i}
        <div class="relative">
          <img src={img} alt="preview" class="w-14 h-14 rounded object-cover" />
          <button onclick={() => removeImage(i)} class="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white rounded-full text-xs flex items-center justify-center">x</button>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Input bar — always at bottom -->
  <div class="shrink-0 px-2 py-2 bg-surface-raised border-t border-border safe-bottom">
    <div class="flex items-end gap-1.5">
      <button onclick={handleImageUpload} class="p-1.5 text-text-secondary hover:text-brain-400 shrink-0" title="Bild hochladen">
        📎
      </button>
      <input bind:this={fileInput} type="file" accept="image/*" multiple class="hidden" onchange={onFileSelected} />

      <textarea
        bind:value={input}
        onkeydown={handleKeydown}
        placeholder="Nachricht..."
        rows={1}
        class="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-brain-500 max-h-28"
      ></textarea>

      <button
        onclick={toggleRecording}
        class="p-1.5 shrink-0 rounded-full {isRecording ? 'bg-danger text-white animate-pulse' : 'text-text-secondary hover:text-brain-400'}"
        title={isRecording ? "Stop" : "Aufnahme"}
      >
        🎤
      </button>

      <button
        onclick={sendMessage}
        disabled={loading || (!input.trim() && !pendingImages.length)}
        class="p-1.5 shrink-0 bg-brain-600 text-white rounded-full hover:bg-brain-500 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Senden"
      >
        ➤
      </button>

      <button onclick={clearChat} class="p-1.5 shrink-0 text-text-muted hover:text-danger text-xs" title="Chat loeschen">
        🗑
      </button>
    </div>
  </div>
</div>

<style>
  .safe-bottom {
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }
</style>
