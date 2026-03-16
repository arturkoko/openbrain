import pg from "pg";
import { config } from "../config.js";

const pool = new pg.Pool({
  connectionString: config.database.url,
  max: 5,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

export async function query(text: string, params?: unknown[]) {
  const result = await pool.query(text, params);
  return result;
}

export async function getClient() {
  return pool.connect();
}

export { pool };
