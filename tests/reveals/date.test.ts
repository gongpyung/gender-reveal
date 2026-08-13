import { describe, expect, it } from "vitest";
import { formatDueDate, parseDateInput } from "@/lib/reveals/date";
import { revealInputSchema } from "@/lib/reveals/validation";

const valid = { babyNickname: "깡총이", dueDate: "2026-12-25", recipientName: "할머니, 할아버지", babyGender: "daughter" };

describe("reveal input", () => {
  it("accepts a complete reveal", () => expect(revealInputSchema.safeParse(valid).success).toBe(true));
  it.each(["", "2026-02-30", "26-12-25"])("rejects invalid date %s", dueDate => {
    expect(revealInputSchema.safeParse({ ...valid, dueDate }).success).toBe(false);
  });
  it("trims names and rejects blank names", () => {
    expect(revealInputSchema.parse({ ...valid, babyNickname: "  깡총이  " }).babyNickname).toBe("깡총이");
    expect(revealInputSchema.safeParse({ ...valid, recipientName: "   " }).success).toBe(false);
  });
});

it("strictly parses and formats a due date", () => {
  expect(parseDateInput("2026-12-25")).toEqual(new Date(2026, 11, 25));
  expect(parseDateInput("2026-02-30")).toBeNull();
  expect(formatDueDate("2026-12-25")).toBe("2026년 12월 25일");
});
