import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export class DatabaseConfigurationError extends Error {}

export function getDb() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new DatabaseConfigurationError("DATABASE_URL is required");
  }
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}
