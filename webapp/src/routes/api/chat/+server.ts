import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./";
import { chat, loadHistory, clearHistory } from "$lib/server/ai";

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { message, images, audio } = body as { message?: string; images?: string[]; audio?: string };

  if (!message && !audio) return json({ error: "Message or audio required" }, { status: 400 });

  // Collect all chunks and return as JSON (SSE streaming can be added later)
  const chunks: Array<{ type: string; data: string }> = [];

  for await (const chunk of chat(message || "", images, audio)) {
    chunks.push(chunk);
  }

  return json({ chunks });
};

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });
  const history = await loadHistory(50);
  return json({ history });
};

export const DELETE: RequestHandler = async ({ locals }) => {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });
  await clearHistory();
  return json({ ok: true });
};
