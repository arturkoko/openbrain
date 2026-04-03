import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { pool, query } from './db.js';
import * as vault from './vault.js';
import * as cal from './calendar.js';

const server = new McpServer({
  name: 'openbrain',
  version: '1.0.0',
});

// ============================================
// DATABASE TOOLS
// ============================================

server.tool(
  'db_query',
  'Run a read-only SQL query against the OpenBrain database. Use for SELECT statements.',
  { sql: z.string().describe('SQL SELECT query'), params: z.string().optional().describe('JSON array of query parameters ($1, $2, ...)') },
  async ({ sql, params: paramsStr }) => {
    const params = paramsStr ? JSON.parse(paramsStr) : undefined;
    const upper = sql.trim().toUpperCase();
    if (!upper.startsWith('SELECT') && !upper.startsWith('WITH')) {
      return { content: [{ type: 'text', text: 'Error: Only SELECT/WITH queries allowed. Use db_insert/db_update/db_delete for mutations.' }] };
    }
    const result = await query(sql, params);
    return { content: [{ type: 'text', text: JSON.stringify(result.rows, null, 2) }] };
  }
);

server.tool(
  'db_insert',
  'Insert a row into a database table. Returns the inserted row.',
  {
    table: z.string().describe('Table name (contacts, household_items, maintenance_logs, reminders, memories, interactions)'),
    data: z.string().describe('JSON object of column-value pairs to insert'),
  },
  async ({ table, data: dataStr }) => {
    const allowed = ['contacts', 'household_items', 'maintenance_logs', 'reminders', 'memories', 'contact_relations', 'interactions'];
    if (!allowed.includes(table)) return { content: [{ type: 'text', text: `Error: Table must be one of: ${allowed.join(', ')}` }] };
    const data = JSON.parse(dataStr) as Record<string, unknown>;
    data.created_by = 'ai';
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`);
    const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`;
    const result = await query(sql, vals);
    return { content: [{ type: 'text', text: JSON.stringify(result.rows[0], null, 2) }] };
  }
);

server.tool(
  'db_update',
  'Update rows in a database table by ID.',
  {
    table: z.string().describe('Table name'),
    id: z.string().describe('Row UUID to update'),
    data: z.string().describe('JSON object of column-value pairs to update'),
  },
  async ({ table, id, data: dataStr }) => {
    const allowed = ['contacts', 'household_items', 'maintenance_logs', 'reminders', 'memories', 'contact_relations', 'interactions'];
    if (!allowed.includes(table)) return { content: [{ type: 'text', text: `Error: Table must be one of: ${allowed.join(', ')}` }] };
    const data = JSON.parse(dataStr) as Record<string, unknown>;
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`);
    vals.push(id);
    const sql = `UPDATE ${table} SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING *`;
    const result = await query(sql, vals);
    if (result.rows.length === 0) return { content: [{ type: 'text', text: 'Error: Row not found' }] };
    return { content: [{ type: 'text', text: JSON.stringify(result.rows[0], null, 2) }] };
  }
);

server.tool(
  'db_delete',
  'Delete a row from a database table by ID.',
  {
    table: z.string().describe('Table name'),
    id: z.string().describe('Row UUID to delete'),
  },
  async ({ table, id }) => {
    const allowed = ['contacts', 'household_items', 'maintenance_logs', 'reminders', 'memories', 'contact_relations', 'interactions'];
    if (!allowed.includes(table)) return { content: [{ type: 'text', text: `Error: Table must be one of: ${allowed.join(', ')}` }] };
    const result = await query(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [id]);
    if (result.rows.length === 0) return { content: [{ type: 'text', text: 'Error: Row not found' }] };
    return { content: [{ type: 'text', text: `Deleted row ${id} from ${table}` }] };
  }
);

server.tool(
  'db_list_tables',
  'List all tables in the OpenBrain database with row counts.',
  {},
  async () => {
    const result = await query(`
      SELECT schemaname, tablename,
        (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.tablename) as column_count
      FROM pg_tables t WHERE schemaname = 'public' ORDER BY tablename
    `);
    const counts = [];
    for (const row of result.rows) {
      const c = await query(`SELECT count(*) FROM ${row.tablename}`);
      counts.push({ table: row.tablename, columns: parseInt(row.column_count as string), rows: parseInt(c.rows[0].count) });
    }
    return { content: [{ type: 'text', text: JSON.stringify(counts, null, 2) }] };
  }
);

server.tool(
  'db_describe_table',
  'Show the schema of a database table (columns, types, constraints).',
  { table: z.string().describe('Table name') },
  async ({ table }) => {
    const result = await query(`
      SELECT column_name, data_type, column_default, is_nullable, character_maximum_length
      FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position
    `, [table]);
    return { content: [{ type: 'text', text: JSON.stringify(result.rows, null, 2) }] };
  }
);

// ============================================
// VAULT TOOLS
// ============================================

server.tool(
  'vault_read_file',
  'Read a markdown file from the Obsidian vault. Path is relative to vault root.',
  { path: z.string().describe('Relative path like "reviews/daily/2026-03-14.md" or "People/John.md"') },
  async ({ path }) => {
    try {
      const content = await vault.readNote(path);
      return { content: [{ type: 'text', text: content }] };
    } catch {
      return { content: [{ type: 'text', text: `Error: File not found: ${path}` }] };
    }
  }
);

server.tool(
  'vault_write_file',
  'Write/overwrite a markdown file in the Obsidian vault. Creates parent directories if needed.',
  {
    path: z.string().describe('Relative path for the file'),
    content: z.string().describe('Full markdown content to write'),
  },
  async ({ path, content }) => {
    await vault.writeNote(path, content);
    return { content: [{ type: 'text', text: `Written: ${path} (${content.length} chars)` }] };
  }
);

server.tool(
  'vault_append',
  'Append text to an existing markdown file in the vault.',
  {
    path: z.string().describe('Relative path'),
    text: z.string().describe('Text to append'),
  },
  async ({ path, text }) => {
    try {
      const existing = await vault.readNote(path);
      await vault.writeNote(path, existing + '\n' + text);
      return { content: [{ type: 'text', text: `Appended ${text.length} chars to ${path}` }] };
    } catch {
      await vault.writeNote(path, text);
      return { content: [{ type: 'text', text: `Created new file ${path} with ${text.length} chars` }] };
    }
  }
);

server.tool(
  'vault_search',
  'Full-text search across all markdown files in the Obsidian vault.',
  { query: z.string().describe('Search term') },
  async ({ query: q }) => {
    const results = await vault.searchVault(q);
    const summary = results.slice(0, 20).map(f => `${f.path} (${f.size} bytes, modified ${f.modified})`);
    return { content: [{ type: 'text', text: `Found ${results.length} results:\n\n${summary.join('\n')}` }] };
  }
);

server.tool(
  'vault_list_folder',
  'List files and folders in a vault directory.',
  { path: z.string().optional().describe('Relative folder path (empty for root)') },
  async ({ path }) => {
    const files = await vault.listFolder(path || '');
    const lines = files.map(f => `${f.isDir ? '📁' : '📄'} ${f.name}${f.isDir ? '/' : ` (${f.size} bytes)`}`);
    return { content: [{ type: 'text', text: lines.join('\n') || 'Empty folder' }] };
  }
);

server.tool(
  'vault_list_recent',
  'List the most recently modified markdown files in the vault.',
  { limit: z.number().optional().describe('Max files to return (default 20)') },
  async ({ limit }) => {
    const results = await vault.listRecent(limit || 20);
    const lines = results.map(f => `${f.modified?.substring(0, 16)} | ${f.path}`);
    return { content: [{ type: 'text', text: lines.join('\n') || 'No files found' }] };
  }
);

// ============================================
// CALENDAR TOOLS
// ============================================

server.tool(
  'cal_list_events',
  'List calendar events from Radicale CalDAV server.',
  {
    from: z.string().optional().describe('Start date YYYY-MM-DD (default: today)'),
    to: z.string().optional().describe('End date YYYY-MM-DD (default: +30 days)'),
  },
  async ({ from, to }) => {
    const events = await cal.listEvents(from, to);
    return { content: [{ type: 'text', text: JSON.stringify(events, null, 2) }] };
  }
);

server.tool(
  'cal_create_event',
  'Create a new calendar event in Radicale.',
  {
    title: z.string().describe('Event title'),
    start: z.string().describe('Start datetime ISO 8601 or YYYY-MM-DD for all-day'),
    end: z.string().optional().describe('End datetime (default: 1 hour after start)'),
    description: z.string().optional().describe('Event description'),
    location: z.string().optional().describe('Event location'),
  },
  async ({ title, start, end, description, location }) => {
    const uid = await cal.createEvent({ title, start, end, description, location });
    return { content: [{ type: 'text', text: `Event created: ${title} (UID: ${uid})` }] };
  }
);

server.tool(
  'cal_delete_event',
  'Delete a calendar event by UID.',
  { uid: z.string().describe('Event UID') },
  async ({ uid }) => {
    await cal.deleteEvent(uid);
    return { content: [{ type: 'text', text: `Deleted event ${uid}` }] };
  }
);

// ============================================
// START
// ============================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('OpenBrain MCP Server running on stdio');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
