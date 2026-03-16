import { z } from "zod";
import { query } from "./client.js";

export const dbTools = {
  db_list_tables: {
    description:
      "List all available database tables with their column names and types.",
    inputSchema: z.object({}),
    async execute() {
      const result = await query(`
        SELECT table_name, column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
      `);

      const tables: Record<string, { column: string; type: string; nullable: string }[]> = {};
      for (const row of result.rows) {
        if (!tables[row.table_name]) tables[row.table_name] = [];
        tables[row.table_name].push({
          column: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable,
        });
      }

      return { content: [{ type: "text" as const, text: JSON.stringify(tables, null, 2) }] };
    },
  },

  db_describe_table: {
    description:
      "Get detailed schema and sample rows for a specific table.",
    inputSchema: z.object({
      table_name: z.string().describe("Name of the table to describe"),
    }),
    async execute({ table_name }: { table_name: string }) {
      // Validate table name to prevent SQL injection
      const validTables = await query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      );
      const tableNames = validTables.rows.map((r) => r.table_name);
      if (!tableNames.includes(table_name)) {
        return {
          content: [{ type: "text" as const, text: `Table '${table_name}' not found. Available tables: ${tableNames.join(", ")}` }],
          isError: true,
        };
      }

      const schema = await query(
        `SELECT column_name, data_type, column_default, is_nullable
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        [table_name]
      );

      const sample = await query(
        `SELECT * FROM "${table_name}" ORDER BY created_at DESC LIMIT 5`
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { schema: schema.rows, sample_rows: sample.rows, total_hint: `Showing up to 5 most recent rows` },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  db_query: {
    description:
      "Execute a read-only SQL query. Use this for SELECT statements to retrieve data. For safety, only SELECT queries are allowed.",
    inputSchema: z.object({
      sql: z.string().describe("The SELECT SQL query to execute"),
      params: z.array(z.unknown()).optional().describe("Query parameters for $1, $2, etc. placeholders"),
    }),
    async execute({ sql, params }: { sql: string; params?: unknown[] }) {
      const trimmed = sql.trim().toUpperCase();
      if (!trimmed.startsWith("SELECT") && !trimmed.startsWith("WITH")) {
        return {
          content: [{ type: "text" as const, text: "Only SELECT/WITH queries are allowed via db_query. Use db_insert, db_update, or db_delete for mutations." }],
          isError: true,
        };
      }

      const result = await query(sql, params);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ rows: result.rows, rowCount: result.rowCount }, null, 2),
          },
        ],
      };
    },
  },

  db_insert: {
    description:
      "Insert a new row into a database table. Returns the inserted row.",
    inputSchema: z.object({
      table_name: z.string().describe("Target table name"),
      data: z.record(z.unknown()).describe("Object with column names as keys and values to insert"),
    }),
    async execute({ table_name, data }: { table_name: string; data: Record<string, unknown> }) {
      // Validate table name
      const validTables = await query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      );
      if (!validTables.rows.some((r) => r.table_name === table_name)) {
        return {
          content: [{ type: "text" as const, text: `Table '${table_name}' not found.` }],
          isError: true,
        };
      }

      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map((_, i) => `$${i + 1}`);

      const sql = `INSERT INTO "${table_name}" (${columns.map((c) => `"${c}"`).join(", ")})
                    VALUES (${placeholders.join(", ")})
                    RETURNING *`;

      const result = await query(sql, values);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result.rows[0], null, 2) }],
      };
    },
  },

  db_update: {
    description:
      "Update rows in a database table matching a condition. Returns updated rows.",
    inputSchema: z.object({
      table_name: z.string().describe("Target table name"),
      data: z.record(z.unknown()).describe("Object with column names and new values to set"),
      where: z.string().describe("WHERE clause (without 'WHERE' keyword), e.g.: \"id = '123'\" or \"name = 'test'\""),
      where_params: z.array(z.unknown()).optional().describe("Parameters for the WHERE clause ($1, $2, etc.)"),
    }),
    async execute({
      table_name,
      data,
      where,
      where_params,
    }: {
      table_name: string;
      data: Record<string, unknown>;
      where: string;
      where_params?: unknown[];
    }) {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const whereParamOffset = columns.length;
      const setClauses = columns.map((c, i) => `"${c}" = $${i + 1}`);

      // Rewrite where clause param placeholders to offset
      let adjustedWhere = where;
      if (where_params?.length) {
        for (let i = where_params.length; i >= 1; i--) {
          adjustedWhere = adjustedWhere.replace(
            new RegExp(`\\$${i}`, "g"),
            `$${i + whereParamOffset}`
          );
        }
      }

      const sql = `UPDATE "${table_name}" SET ${setClauses.join(", ")} WHERE ${adjustedWhere} RETURNING *`;
      const allParams = [...values, ...(where_params || [])];

      const result = await query(sql, allParams);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ updated: result.rowCount, rows: result.rows }, null, 2),
          },
        ],
      };
    },
  },

  db_delete: {
    description:
      "Delete rows from a database table matching a condition. Returns deleted rows.",
    inputSchema: z.object({
      table_name: z.string().describe("Target table name"),
      where: z.string().describe("WHERE clause (without 'WHERE' keyword)"),
      where_params: z.array(z.unknown()).optional().describe("Parameters for the WHERE clause"),
    }),
    async execute({
      table_name,
      where,
      where_params,
    }: {
      table_name: string;
      where: string;
      where_params?: unknown[];
    }) {
      const sql = `DELETE FROM "${table_name}" WHERE ${where} RETURNING *`;
      const result = await query(sql, where_params);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ deleted: result.rowCount, rows: result.rows }, null, 2),
          },
        ],
      };
    },
  },
};
