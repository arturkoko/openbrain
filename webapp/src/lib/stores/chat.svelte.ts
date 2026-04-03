import { marked } from 'marked';

export interface Message {
  role: 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: Array<{ name: string; args: Record<string, string> }>;
  tool_result?: { name: string; result: string };
  images?: string[];
}

let messages = $state<Message[]>([]);
let input = $state('');
let loading = $state(false);
let pendingImages = $state<string[]>([]);
let isRecording = $state(false);
let initialized = $state(false);
let drawerOpen = $state(false);

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

export function getMessages() { return messages; }
export function getLoading() { return loading; }
export function getInput() { return input; }
export function setInput(v: string) { input = v; }
export function getPendingImages() { return pendingImages; }
export function getIsRecording() { return isRecording; }
export function getDrawerOpen() { return drawerOpen; }
export function toggleDrawer() { drawerOpen = !drawerOpen; }
export function openDrawer() { drawerOpen = true; }
export function closeDrawer() { drawerOpen = false; }

export async function initChat(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    const res = await fetch('/api/chat');
    if (res.ok) {
      const data = await res.json();
      messages = (data.history || [])
        .map((m: Record<string, unknown>) => ({
          role: m.role as string,
          content: m.content as string,
          tool_calls: m.tool_calls ? JSON.parse(String(m.tool_calls)) : undefined,
        }))
        .filter((m: Message) => m.role !== 'tool');
    }
  } catch (e) {
    console.error('Failed to load chat history:', e);
  }
}

export async function sendMessage(contextPath?: string): Promise<void> {
  const text = input.trim();
  if (!text && !pendingImages.length) return;
  input = '';
  messages = [...messages, { role: 'user', content: text, images: pendingImages.length ? [...pendingImages] : undefined }];
  const imgs = pendingImages.length ? [...pendingImages] : undefined;
  pendingImages = [];
  loading = true;

  try {
    const body: Record<string, unknown> = { message: text, images: imgs };
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    for (const chunk of data.chunks || []) {
      if (chunk.type === 'tool_call') {
        const tc = JSON.parse(chunk.data);
        messages = [...messages, { role: 'assistant', content: null, tool_calls: [tc] }];
      } else if (chunk.type === 'tool_result') {
        const tr = JSON.parse(chunk.data);
        messages = [...messages, { role: 'tool', content: null, tool_result: tr }];
      } else if (chunk.type === 'text') {
        messages = [...messages, { role: 'assistant', content: chunk.data }];
      } else if (chunk.type === 'error') {
        messages = [...messages, { role: 'assistant', content: `**Error:** ${chunk.data}` }];
      }
    }
  } catch (e) {
    messages = [...messages, { role: 'assistant', content: `**Error:** ${e}` }];
  }
  loading = false;
}

export async function sendAudio(contextPath?: string): Promise<void> {
  if (isRecording) {
    mediaRecorder?.stop();
    isRecording = false;
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        messages = [...messages, { role: 'user', content: '🎤 Audio-Nachricht' }];
        loading = true;
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: '', audio: base64 }),
          });
          const data = await res.json();
          for (const chunk of data.chunks || []) {
            if (chunk.type === 'text') messages = [...messages, { role: 'assistant', content: chunk.data }];
            else if (chunk.type === 'error') messages = [...messages, { role: 'assistant', content: `**Error:** ${chunk.data}` }];
          }
        } catch (e) {
          messages = [...messages, { role: 'assistant', content: `**Error:** ${e}` }];
        }
        loading = false;
      };
      reader.readAsDataURL(blob);
    };
    mediaRecorder.start();
    isRecording = true;
  } catch {
    alert('Mikrofon-Zugriff verweigert');
  }
}

export async function clearChat(): Promise<void> {
  if (!confirm('Chat-Verlauf loeschen?')) return;
  await fetch('/api/chat', { method: 'DELETE' });
  messages = [];
}

export function addPendingImage(dataUrl: string): void {
  pendingImages = [...pendingImages, dataUrl];
}

export function removePendingImage(idx: number): void {
  pendingImages = pendingImages.filter((_, i) => i !== idx);
}

export function renderMarkdown(text: string): string {
  return marked.parse(text, { async: false }) as string;
}
