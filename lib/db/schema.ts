import { pgTable, text, timestamp, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const reveals = pgTable(
  "reveals",
  {
    token: text("token").primaryKey(),
    babyNickname: text("baby_nickname").notNull(),
    dueDate: text("due_date").notNull(),
    recipientName: text("recipient_name").notNull(),
    babyGender: text("baby_gender").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    check("baby_gender_check", sql`${table.babyGender} IN ('son', 'daughter')`),
  ]
);
