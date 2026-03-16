import { query } from "./db.js";
import * as vault from "./vault.js";
import * as cal from "./calendar.js";

export interface ToolDef {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export const toolDefinitions: ToolDef[] = [
  {
    type: "function",
    function: {
      name: "db_query",
      description: "Run a read-only SQL SELECT query against the OpenBrain PostgreSQL database. Tables: contacts, interactions, household_items, maintenance_logs, reminders, memories, contact_relations, chat_messages. IMPORTANT column names for contacts: first_name, last_name, company, role, warmth (0-100), last_contact DATE, email_private, email_business (NOT 'email'!), phone_private, phone_business (NOT 'phone'!), linkedin, address (NOT 'city'/'country'!), birthday DATE, industry, is_vip BOOLEAN, preferred_platform, relationship_type, how_met, projects TEXT[]. interactions: contact_id UUID, date DATE, summary TEXT, notes TEXT. household_items: category, name, value, location, brand, warranty_until. reminders: title, due_date, status (pending/snoozed/completed/cancelled), priority (low/normal/high/urgent), recurring. memories: category, key, value, confidence, source.",
      parameters: { type: "object", properties: { sql: { type: "string", description: "SQL SELECT query" }, params: { type: "string", description: "Optional JSON array of query parameters ($1, $2, ...)" } }, required: ["sql"] },
    },
  },
  {
    type: "function",
    function: {
      name: "db_insert",
      description: "Insert a row into a database table. Returns the inserted row. Sets created_by to ai automatically. Allowed tables: contacts, household_items, maintenance_logs, reminders, memories, contact_relations, interactions.",
      parameters: { type: "object", properties: { table: { type: "string", description: "Table name (contacts, household_items, maintenance_logs, reminders, memories, contact_relations, interactions)" }, data: { type: "string", description: "JSON object of column-value pairs. For contacts use: email_private/email_business (NOT email), phone_private/phone_business (NOT phone), address (NOT city/country)" } }, required: ["table", "data"] },
    },
  },
  {
    type: "function",
    function: {
      name: "db_update",
      description: "Update a row in a database table by UUID.",
      parameters: { type: "object", properties: { table: { type: "string", description: "Table name" }, id: { type: "string", description: "Row UUID" }, data: { type: "string", description: "JSON object of column-value pairs to update" } }, required: ["table", "id", "data"] },
    },
  },
  {
    type: "function",
    function: {
      name: "db_delete",
      description: "Delete a row from a database table by UUID.",
      parameters: { type: "object", properties: { table: { type: "string", description: "Table name" }, id: { type: "string", description: "Row UUID to delete" } }, required: ["table", "id"] },
    },
  },
  {
    type: "function",
    function: {
      name: "vault_search",
      description: "Full-text search across all markdown files in the Obsidian vault. Returns matching file names and paths.",
      parameters: { type: "object", properties: { query: { type: "string", description: "Search query" } }, required: ["query"] },
    },
  },
  {
    type: "function",
    function: {
      name: "vault_read_file",
      description: "Read a markdown file from the Obsidian vault by relative path.",
      parameters: { type: "object", properties: { path: { type: "string", description: "Relative path in vault (e.g. 00_Inbox/note.md, reviews/daily/2026-03-16.md)" } }, required: ["path"] },
    },
  },
  {
    type: "function",
    function: {
      name: "vault_write_file",
      description: "Write or overwrite a markdown file in the Obsidian vault. Used for daily notes, people notes, etc.",
      parameters: { type: "object", properties: { path: { type: "string", description: "Relative path (e.g. reviews/daily/2026-03-16.md)" }, content: { type: "string", description: "File content (markdown with YAML frontmatter)" } }, required: ["path", "content"] },
    },
  },
  {
    type: "function",
    function: {
      name: "vault_list_folder",
      description: "List files and folders in a vault directory.",
      parameters: { type: "object", properties: { path: { type: "string", description: "Relative folder path (empty string for root)" } }, required: ["path"] },
    },
  },
  {
    type: "function",
    function: {
      name: "cal_list_events",
      description: "List calendar events from Radicale CalDAV. Returns events within a date range.",
      parameters: { type: "object", properties: { from: { type: "string", description: "Start date YYYY-MM-DD (default: today)" }, to: { type: "string", description: "End date YYYY-MM-DD (default: 30 days from now)" } } },
    },
  },
  {
    type: "function",
    function: {
      name: "cal_create_event",
      description: "Create a calendar event in Radicale CalDAV. Syncs to iOS Calendar.",
      parameters: { type: "object", properties: { title: { type: "string" }, start: { type: "string", description: "YYYY-MM-DD for all-day or ISO datetime" }, end: { type: "string", description: "Optional end date/time" }, description: { type: "string" }, location: { type: "string" } }, required: ["title", "start"] },
    },
  },
  {
    type: "function",
    function: {
      name: "cal_delete_event",
      description: "Delete a calendar event by UID.",
      parameters: { type: "object", properties: { uid: { type: "string", description: "Event UID" } }, required: ["uid"] },
    },
  },
  {
    type: "function",
    function: {
      name: "run_skill",
      description: "Run a predefined Skill pipeline from the vault. Reads the Skill.md file and executes its steps. Available skills can be found in the Skills/ folder.",
      parameters: { type: "object", properties: { name: { type: "string", description: "Skill name (e.g. Daily Review)" } }, required: ["name"] },
    },
  },
];

const ALLOWED_TABLES = ["contacts", "household_items", "maintenance_logs", "reminders", "memories", "contact_relations", "interactions"];

export async function executeTool(name: string, args: Record<string, string>): Promise<string> {
  try {
    switch (name) {
      case "db_query": {
        const upper = (args.sql || "").trim().toUpperCase();
        if (!upper.startsWith("SELECT") && !upper.startsWith("WITH")) return "Error: Only SELECT/WITH queries allowed.";
        const params = args.params ? JSON.parse(args.params) : undefined;
        const result = await query(args.sql, params);
        return JSON.stringify(result.rows, null, 2);
      }
      case "db_insert": {
        if (!ALLOWED_TABLES.includes(args.table)) return `Error: Table must be one of: ${ALLOWED_TABLES.join(", ")}`;
        const data = JSON.parse(args.data) as Record<string, unknown>;
        if (args.table !== "interactions") data.created_by = "ai";
        const keys = Object.keys(data);
        const vals = Object.values(data);
        const ph = keys.map((_, i) => `$${i + 1}`);
        const result = await query(`INSERT INTO ${args.table} (${keys.join(",")}) VALUES (${ph.join(",")}) RETURNING *`, vals);
        return JSON.stringify(result.rows[0], null, 2);
      }
      case "db_update": {
        if (!ALLOWED_TABLES.includes(args.table)) return `Error: Table must be one of: ${ALLOWED_TABLES.join(", ")}`;
        const data = JSON.parse(args.data) as Record<string, unknown>;
        const keys = Object.keys(data);
        const vals = Object.values(data);
        const sets = keys.map((k, i) => `${k} = $${i + 1}`);
        vals.push(args.id);
        const result = await query(`UPDATE ${args.table} SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`, vals);
        return result.rows.length ? JSON.stringify(result.rows[0], null, 2) : "Error: Row not found";
      }
      case "db_delete": {
        if (!ALLOWED_TABLES.includes(args.table)) return `Error: Table must be one of: ${ALLOWED_TABLES.join(", ")}`;
        const result = await query(`DELETE FROM ${args.table} WHERE id = $1 RETURNING id`, [args.id]);
        return result.rows.length ? `Deleted row ${args.id}` : "Error: Row not found";
      }
      case "vault_search": {
        const results = await vault.searchVault(args.query);
        return JSON.stringify(results.slice(0, 20), null, 2);
      }
      case "vault_read_file": {
        const content = await vault.readNote(args.path);
        return content.length > 8000 ? content.substring(0, 8000) + "\n\n... (truncated)" : content;
      }
      case "vault_write_file": {
        await vault.writeNote(args.path, args.content);
        return `File written: ${args.path}`;
      }
      case "vault_list_folder": {
        const files = await vault.listFolder(args.path);
        return JSON.stringify(files, null, 2);
      }
      case "cal_list_events": {
        const events = await cal.listEvents(args.from, args.to);
        return JSON.stringify(events, null, 2);
      }
      case "cal_create_event": {
        const uid = await cal.createEvent({ title: args.title, start: args.start, end: args.end, description: args.description, location: args.location });
        return `Event created: ${args.title} (UID: ${uid})`;
      }
      case "cal_delete_event": {
        await cal.deleteEvent(args.uid);
        return `Event deleted: ${args.uid}`;
      }
      case "run_skill": {
        const skillFiles = await vault.searchVault(args.name);
        const skillFile = skillFiles.find(f => f.path.startsWith("Skills/") && f.name.toLowerCase().includes(args.name.toLowerCase()));
        if (!skillFile) return `Skill not found: ${args.name}. Available skills are in the Skills/ folder.`;
        const content = await vault.readNote(skillFile.path);
        return `SKILL_CONTENT:${content}`;
      }
      default:
        return `Unknown tool: ${name}`;
    }
  } catch (e: unknown) {
    return `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
}
