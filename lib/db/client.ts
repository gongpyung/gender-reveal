import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Lazy fallback for builds or unconfigured runtime
    const sql = neon("postgres://localhost:5432/postgres");
    return drizzle(sql, { schema });
  }
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

export const db = getDb();
