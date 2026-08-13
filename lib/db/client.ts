import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function getDb() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://placeholder:placeholder@localhost/placeholder";
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

export const db = getDb();
