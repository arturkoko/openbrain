import { query } from "./db.js";

const CLAUDE_RELAY_URL = process.env.CLAUDE_RELAY_URL || "http://host.docker.internal:9099";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: unknown[];
  tool_call_id?: string;
  images?: string[];
  created_at?: string;
}

export async function loadHistory(limit = 50): Promise<ChatMessage[]> {
  const result = await query(
    "SELECT id, role, content, tool_calls, tool_call_id, images, created_at FROM chat_messages ORDER BY created_at DESC LIMIT $1",
    [limit]
  );
  return result.rows.reverse();
}

export async function saveMessage(msg: ChatMessage): Promise<void> {
  await query(
    "INSERT INTO chat_messages (role, content, tool_calls, tool_call_id, images) VALUES ($1, $2, $3, $4, $5)",
    [msg.role, msg.content, msg.tool_calls ? JSON.stringify(msg.tool_calls) : null, msg.tool_call_id || null, msg.images || null]
  );
}

export async function clearHistory(): Promise<void> {
  await query("DELETE FROM chat_messages");
}

// Get the last session_id from chat_messages metadata
async function getLastSessionId(): Promise<string | null> {
  const result = await query(
    "SELECT content FROM chat_messages WHERE role = 'assistant' AND content LIKE '%session_id:%' ORDER BY created_at DESC LIMIT 1"
  );
  if (result.rows.length > 0) {
    const match = result.rows[0].content?.match(/session_id:([a-f0-9-]+)/);
    if (match) return match[1];
  }
  return null;
}

// Store session_id as a metadata message
async function storeSessionId(sessionId: string): Promise<void> {
  // Update or insert session tracking - use a special marker in the DB
  await query(
    "INSERT INTO chat_messages (role, content) VALUES ($1, $2)",
    ["tool", `session_id:${sessionId}`]
  );
}

export async function* chat(
  userMessage: string,
  images?: string[],
  audioBase64?: string
): AsyncGenerator<{ type: "text" | "tool_call" | "tool_result" | "done" | "error"; data: string }> {

  // Handle audio transcription - for now just note it
  let effectiveMessage = userMessage;
  if (audioBase64) {
    effectiveMessage = userMessage
      ? `${userMessage}\n\n[Audio wurde mitgeschickt - bitte beachten dass Audio-Transcription aktuell nicht unterstuetzt wird]`
      : "[Audio wurde mitgeschickt - bitte beachten dass Audio-Transcription aktuell nicht unterstuetzt wird]";
  }

  // Save user message
  await saveMessage({ role: "user", content: effectiveMessage, images });

  // Build dynamic context
  const now = new Date();
  const today = now.toISOString().substring(0, 10);
  const dayNames = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
  const dayOfWeek = dayNames[now.getDay()];
  const timeStr = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  const appendPrompt = `Heute ist ${dayOfWeek}, ${today}, aktuelle Uhrzeit: ${timeStr}. Antworte auf Deutsch, es sei denn der User schreibt auf Englisch oder einer anderen Sprache.`;

  // Get session_id for conversation continuity
  const sessionId = await getLastSessionId();

  // Call Claude Relay
  try {
    const response = await fetch(`${CLAUDE_RELAY_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: effectiveMessage,
        session_id: sessionId,
        append_system_prompt: appendPrompt,
      }),
      signal: AbortSignal.timeout(300000), // 5 min timeout
    });

    if (!response.ok) {
      yield { type: "error", data: `Relay error: ${response.status} ${response.statusText}` };
      return;
    }

    const result = await response.json() as Record<string, unknown>;

    if (result.is_error) {
      yield { type: "error", data: String(result.result || "Unknown error") };
      return;
    }

    const text = String(result.result || "");
    const newSessionId = String(result.session_id || "");

    // Store session_id for future requests
    if (newSessionId) {
      await storeSessionId(newSessionId);
    }

    // Save assistant response
    await saveMessage({ role: "assistant", content: text });

    yield { type: "text", data: text };
    yield { type: "done", data: "" };

  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    yield { type: "error", data: `Claude Relay Fehler: ${errMsg}` };
  }
}
