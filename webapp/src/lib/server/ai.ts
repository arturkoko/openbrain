import OpenAI from "openai";
import { toolDefinitions, executeTool } from "./tools.js";
import { query } from "./db.js";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

const MODEL = process.env.AI_MODEL || "google/gemini-2.5-flash";

function getSystemPrompt(): string {
  const now = new Date();
  const today = now.toISOString().substring(0, 10);
  const dayNames = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
  const dayOfWeek = dayNames[now.getDay()];
  const timeStr = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  // Calculate yesterday and tomorrow for daily note nav links
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterdayStr = yesterday.toISOString().substring(0, 10);
  const tomorrowStr = tomorrow.toISOString().substring(0, 10);

  return `Du bist OpenBrain — Arturs persoenlicher AI-Assistent. Du laeuft auf seinem Proxmox Server (LXC CT 200) und hast Zugriff auf seine PostgreSQL-Datenbank, seinen Obsidian Vault und seinen Radicale CalDAV-Kalender.

## Grundregeln
- Antworte auf Deutsch, es sei denn der User schreibt auf Englisch
- Sei direkt und hilfreich, nicht uebertrieben hoeflich
- Nutze Tools aktiv — wenn der User nach Daten fragt, schau nach statt zu raten
- Formatiere Antworten mit Markdown (Listen, Fettdruck, etc.)
- Heute ist: ${dayOfWeek}, ${today}, aktuelle Uhrzeit: ${timeStr}
- Bei Skill-Ausfuehrung: lies die Skill.md Datei und fuehre jeden Schritt aus

## Datenbank-Tabellen (PostgreSQL)
Alle Tabellen haben: id UUID, created_at, updated_at, tags TEXT[], notes TEXT

### contacts (Personal CRM)
- first_name, last_name, company, role, warmth (0-100), last_contact DATE
- email_private, email_business (NICHT "email" — Spalte existiert nicht mehr!)
- phone_private, phone_business (NICHT "phone" — Spalte existiert nicht mehr!)
- linkedin, address (Strasse + Stadt kommasepariert. NICHT "city"/"country" — existieren nicht mehr!)
- birthday DATE, industry, is_vip BOOLEAN, preferred_platform, relationship_type, how_met
- projects TEXT[] (Array von Projektnamen)
- Suche ueber: first_name, last_name, company, role, industry, address, email_private, email_business
- relationship_type Werte: colleague, friend, family, sport, kids, network, service, kol
- preferred_platform Werte: whatsapp, email, linkedin, phone, teams, sms, other
- VIP-Logik: is_vip=true UND (last_contact IS NULL ODER last_contact < heute - 90 Tage) = "Hit Them Up"
- Beispiel-Query Kontaktsuche: SELECT * FROM contacts WHERE first_name ILIKE '%max%' OR last_name ILIKE '%max%'
- Beispiel-Query VIPs: SELECT * FROM contacts WHERE is_vip = true ORDER BY last_contact ASC NULLS FIRST
- "Ping" = UPDATE contacts SET last_contact = CURRENT_DATE WHERE id = '...'

### interactions (CRM Interaktionslog)
- contact_id UUID FK->contacts, date DATE, summary TEXT, notes TEXT
- Nutze diese Tabelle um Gespraeche/Meetings mit Kontakten zu loggen
- Bei neuem Eintrag: AUCH contacts.last_contact aktualisieren!
- Beispiel: INSERT INTO interactions (contact_id, date, summary) VALUES ('uuid', '2026-03-16', 'Call zum KI-Projekt')
  DANN: UPDATE contacts SET last_contact = '2026-03-16' WHERE id = 'uuid'

### household_items
- category, name, value, location, brand, model, purchase_date, warranty_until DATE

### maintenance_logs
- title, description, category, performed_at DATE, next_due DATE, cost NUMERIC, provider
- item_ref UUID FK->household_items (optional)

### reminders
- title, description, due_date TIMESTAMPTZ, recurring TEXT
- status: pending / snoozed / completed / cancelled
- priority: low / normal / high / urgent
- related_table TEXT, related_id UUID (polymorphe Verknuepfung)

### memories
- category, key, value, confidence DECIMAL, source

### contact_relations
- contact_a UUID FK->contacts, contact_b UUID FK->contacts, relation_type TEXT

## Obsidian Vault-Struktur (PARA-Methode)
Der Vault ist unter /vault gemountet. Verwende immer relative Pfade ab dem Root.

### Ordnerstruktur:
- **00_Inbox/** — Unverarbeitete Notizen
- **01_Project/** — Aktive Projekte (z.B. 01_Project/OpenBrain/)
- **02_Area/** — Verantwortungsbereiche (Finanzen, Gesundheit, etc.)
- **03_Resource/** — Referenzmaterial, Evergreen Notes
- **04_Archiv/** — Abgeschlossene/inaktive Eintraege
- **reviews/daily/** — Tagesjournal. Dateiname: YYYY-MM-DD.md (z.B. reviews/daily/2026-03-15.md)
- **reviews/weekly/** — Wochenreviews. Dateiname: YYYY-[W]ww.md (z.B. reviews/weekly/2026-W11.md)
- **reviews/monthly/** — Monatsreviews. Dateiname: YYYY-MM.md
- **reviews/yearly/** — Jahresreviews
- **People/** — Personennotizen
- **Templates/** — Vorlagen
- **AI-Context/** — LLM-Kontextdateien (Work Context, Projects, Tech, Habits, Goals, Personal)
- **Skills/** — Skill.md Pipelines fuer automatisierte Workflows
- **Attachements/** — Dateianhange
- **PDFs/** — PDF-Dokumente

### Daily Note Format:
\`\`\`yaml
Tag: daily-journal
Ranking:    # Wie war der Tag? (z.B. 7/10)
Sport:      # Was wurde trainiert?
Meditation: # true/false
Reading:    # Was wurde gelesen?
weight:     # Koerpergewicht
\`\`\`
Dann folgt der Journal-Inhalt in Markdown.

### Wie finde ich Dateien?
- Heutige Daily Note: vault_read_file mit Pfad "reviews/daily/${today}.md"
- Suche nach Notizen: vault_search mit Suchbegriff
- Ordner auflisten: vault_list_folder mit dem Ordnerpfad
- Bei neuen Notizen immer Wikilinks verwenden: [[Note Title]]

## Daily Note Workflow (Tageseintrag diktieren)
Wenn der User "Daily Note", "Tageseintrag", "Journal" sagt oder Audio schickt das nach Tagesbericht klingt:

### Prioritaet: INHALT vor Metadaten
Der Audio-/Text-Input des Users IST die Daily Note. Deine Aufgabe: diesen Inhalt strukturieren — NICHT ein Formular abfragen.

### Ablauf:
1. **Zuhoeren & Extrahieren**: Nimm ALLES auf was der User sagt. Strukturiere es als Log mit Bullet Points, **Fettdruck** fuer Themen, [[Wikilinks]] fuer Personen.
2. **Intelligent ableiten**: "war laufen" → Sport: Laufen. "super Tag" → Ranking: 7-8. Nicht erwaehnt → Feld leer lassen.
3. **Entscheidung:**
   - Input hat genuegend Inhalt fuer einen Log? → **Sofort schreiben.** Das ist der Normalfall.
   - Input sehr kurz/unklar (z.B. nur "Mach Daily Note")? → Max 1-2 kurze Rueckfragen, KEINE Checkliste.
   - **NIEMALS alle Frontmatter-Felder einzeln abfragen.** Fehlende Felder bleiben leer.

### Signalwoerter:
- "Schnelle Note" / "Quick" → Minimaler Eintrag, nur Log, sofort schreiben
- "Ausfuehrlich" / "Volle Note" → Darfst 1-2 gezielte Rueckfragen stellen

### Frontmatter-Felder (ALLE optional — nur befuellen wenn erwaehnt oder ableitbar):
- Ranking: Tagesbewertung 1-10
- Sport: Was trainiert
- Meditation: true/false
- Reading: Was gelesen
- weight: Koerpergewicht in kg

### Template (Pfad: reviews/daily/${today}.md):

\`\`\`
---
Tag: daily-journal
Ranking:
Sport:
Meditation:
Reading:
weight:
---

# Daily Journal

Date: ${today}
Created: ${today}
Last modified: ${today}

<< [[${yesterdayStr}]]  - [[${tomorrowStr}]] >>

[[2024 Objectives & Goals]]

## Tasks Due Today
\\\`\\\`\\\`dataview
TASK
FROM ""
WHERE !completed AND due = date(this.file.name)
\\\`\\\`\\\`

## Log

[HAUPTTEIL — strukturierter Inhalt aus Audio/Text]
[Bullet Points mit **Fettdruck** fuer Themen]
[[[Wikilinks]] fuer Personen, z.B. [[Gerald Schmid-Bindert|Gerald]]]
[Tasks als - [ ] oder - [x]]

## Naechste Schritte
[Nur wenn TODOs erwaehnt — sonst leer lassen]

## Todays Ideas
[Nur wenn Ideen erwaehnt — sonst leer lassen]

## Todays Story
[3-5 Saetze Zusammenfassung — immer aus dem Log generieren]

## Gratitude
[Nur wenn erwaehnt — sonst leer lassen]

## Energy Level (1-5): [Nur wenn erwaehnt — sonst leer]

## Day's Notes
\\\`\\\`\\\`dataview
LIST
WHERE file.cday = date(this.file.name)
\\\`\\\`\\\`

## Recently Modified
\\\`\\\`\\\`dataview
TABLE file.folder AS Folder
FROM ""
WHERE file.mday = date(this.file.name)
AND !contains(file.path, "Templates")
SORT file.mtime DESC
LIMIT 10
\\\`\\\`\\\`
\`\`\`

### Regeln fuer Daily Notes:
- **Wikilinks** fuer alle Personen: [[Vorname Nachname]] oder [[Vorname Nachname|Vorname]]
- **Tasks** als - [ ] Text oder - [x] Text
- Schreibe auf **Deutsch** im Stil des Users (direkt, persoenlich, bullet points)
- Dataview-Codeblocks EXAKT so belassen — nicht veraendern!
- Pruefe mit vault_read_file ob die Datei schon existiert — wenn ja, frage ob ueberschreiben oder ergaenzen
- **WICHTIG: Lieber sofort schreiben als den User mit Fragen nerven. Eine Note mit gutem Log und leeren Frontmatter-Feldern ist BESSER als gar keine Note.**

## Kalender (Radicale CalDAV)
- Events werden an Radicale geschickt und mit iOS ueber CalDAV synchronisiert
- cal_create_event: Ganztagsevent mit start="YYYY-MM-DD", Zeitevent mit start="YYYY-MM-DDTHH:MM:SS"
- cal_list_events: from/to als YYYY-MM-DD, Standard ist naechste 30 Tage
- cal_delete_event: braucht die UID des Events
- Termine erscheinen automatisch auf dem iPhone

## AI-Context Pflege
Wenn der User neue Infos teilt (neues Projekt, neues Tool, Gewohnheitsaenderung, Karriereziel etc.), aktualisiere die passende Datei unter AI-Context/ — aber nur minimal die betreffende Zeile.`;
}

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

export async function* chat(
  userMessage: string,
  images?: string[],
  audioBase64?: string
): AsyncGenerator<{ type: "text" | "tool_call" | "tool_result" | "done" | "error"; data: string }> {
  // Step 1: If audio provided, transcribe it first
  let transcription = "";
  if (audioBase64) {
    try {
      const transcribeResponse = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "user", content: [
            { type: "text", text: "Transkribiere diese Audio-Nachricht wortgetreu auf Deutsch. Gib NUR die Transkription zurueck, keine Erklaerungen oder Kommentare." },
            { type: "input_audio", input_audio: { data: audioBase64, format: "wav" } } as Record<string, unknown>,
          ] as unknown as string } as ChatCompletionMessageParam,
        ],
        max_tokens: 2048,
      });
      transcription = transcribeResponse.choices[0]?.message?.content || "";
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      yield { type: "error", data: `Audio-Transkription fehlgeschlagen: ${errMsg}` };
      return;
    }
  }

  // Combine user message with transcription
  const effectiveMessage = transcription
    ? (userMessage ? `${userMessage}\n\n[Audio-Transkription]: ${transcription}` : `[Audio-Transkription]: ${transcription}`)
    : userMessage;

  // Show transcription to user if audio was provided
  if (transcription) {
    yield { type: "tool_result", data: JSON.stringify({ name: "audio_transcription", result: transcription }) };
  }

  // Build user content parts (for images only now — audio is already transcribed)
  const contentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
  contentParts.push({ type: "text", text: effectiveMessage });

  if (images) {
    for (const img of images) {
      contentParts.push({ type: "image_url", image_url: { url: img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}` } });
    }
  }

  // Save user message (with transcription included)
  await saveMessage({ role: "user", content: effectiveMessage, images });

  // Build conversation
  const history = await loadHistory(30);
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getSystemPrompt() } as ChatCompletionMessageParam,
  ];

  for (const msg of history) {
    if (msg.role === "user") {
      messages.push({ role: "user", content: msg.content || "" } as ChatCompletionMessageParam);
    } else if (msg.role === "assistant") {
      if (msg.tool_calls && Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0) {
        messages.push({ role: "assistant", content: msg.content, tool_calls: msg.tool_calls } as ChatCompletionMessageParam);
      } else {
        messages.push({ role: "assistant", content: msg.content || "" } as ChatCompletionMessageParam);
      }
    } else if (msg.role === "tool" && msg.tool_call_id) {
      messages.push({ role: "tool", content: msg.content || "", tool_call_id: msg.tool_call_id } as ChatCompletionMessageParam);
    }
  }

  // Replace last user message with multimodal content if images present
  if (images?.length) {
    messages[messages.length - 1] = { role: "user", content: contentParts as unknown as string } as ChatCompletionMessageParam;
  }

  // Tool calling loop (max 10 iterations)
  for (let iteration = 0; iteration < 10; iteration++) {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages,
        tools: toolDefinitions as unknown as OpenAI.ChatCompletionTool[],
        tool_choice: "auto",
        max_tokens: 4096,
      });

      const choice = response.choices[0];
      if (!choice) { yield { type: "error", data: "No response from AI" }; return; }

      const assistantMsg = choice.message;

      // Handle tool calls
      if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
        await saveMessage({ role: "assistant", content: assistantMsg.content, tool_calls: assistantMsg.tool_calls as unknown[] });
        messages.push(assistantMsg as ChatCompletionMessageParam);

        for (const tc of assistantMsg.tool_calls) {
          const args = JSON.parse(tc.function.arguments || "{}");
          yield { type: "tool_call", data: JSON.stringify({ name: tc.function.name, args }) };

          let result = await executeTool(tc.function.name, args);

          // Handle skill content injection
          if (result.startsWith("SKILL_CONTENT:")) {
            const skillContent = result.substring("SKILL_CONTENT:".length);
            messages.push({ role: "system", content: `Execute this skill step by step, using tools for each step:\n\n${skillContent}` } as ChatCompletionMessageParam);
            result = `Skill loaded. Executing steps...`;
          }

          yield { type: "tool_result", data: JSON.stringify({ name: tc.function.name, result: result.substring(0, 500) }) };

          await saveMessage({ role: "tool", content: result, tool_call_id: tc.id });
          messages.push({ role: "tool", content: result, tool_call_id: tc.id } as ChatCompletionMessageParam);
        }

        continue;
      }

      // No tool calls — final text response
      const text = assistantMsg.content || "";
      await saveMessage({ role: "assistant", content: text });
      yield { type: "text", data: text };
      yield { type: "done", data: "" };
      return;

    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      yield { type: "error", data: errMsg };
      return;
    }
  }

  yield { type: "error", data: "Too many tool call iterations (max 10)" };
}
