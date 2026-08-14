import { describe, expect, it } from "vitest";
import { reveals } from "@/lib/db/schema";
import { getTableColumns } from "drizzle-orm";

it("exports reveals table with required columns", () => {
  const columns = getTableColumns(reveals);
  expect(columns).toHaveProperty("token");
  expect(columns).toHaveProperty("babyNickname");
  expect(columns).toHaveProperty("dueDate");
  expect(columns).toHaveProperty("recipientName");
  expect(columns).toHaveProperty("babyGender");
  expect(columns).toHaveProperty("createdAt");
});

describe("reveals due date column", () => {
  it("stores due dates as non-null PostgreSQL dates in string mode", () => {
    const dueDate = getTableColumns(reveals).dueDate;

    expect(dueDate.columnType).toBe("PgDateString");
    expect(dueDate.notNull).toBe(true);
  });
});
