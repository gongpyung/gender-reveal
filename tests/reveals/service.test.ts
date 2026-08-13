import { describe, expect, it } from "vitest";
import { createReveal } from "@/lib/reveals/service";
import { RevealStore, TokenConflictError } from "@/lib/reveals/repository";
import { RevealInput, RevealRecord } from "@/lib/reveals/types";

const sampleInput: RevealInput = {
  babyNickname: "깡총이",
  dueDate: "2026-12-25",
  recipientName: "할머니, 할아버지",
  babyGender: "daughter",
};

class MemoryRevealStore implements RevealStore {
  public records = new Map<string, RevealRecord>();
  public insertCalls = 0;
  public failCount = 0;

  constructor(failCount = 0) {
    this.failCount = failCount;
  }

  async insert(input: RevealInput, token: string): Promise<RevealRecord> {
    this.insertCalls++;
    if (this.insertCalls <= this.failCount) {
      throw new TokenConflictError("Token collision");
    }
    const record: RevealRecord = {
      ...input,
      token,
      createdAt: new Date(),
    };
    this.records.set(token, record);
    return record;
  }

  async findByToken(token: string): Promise<RevealRecord | null> {
    return this.records.get(token) || null;
  }
}

describe("createReveal", () => {
  it("creates a reveal with a 32-byte URL-safe base64 token and shareLink", async () => {
    const fakeStore = new MemoryRevealStore();
    const bytes = new Uint8Array(32).fill(7);
    const created = await createReveal(
      sampleInput,
      fakeStore,
      "https://example.test",
      () => bytes
    );

    expect(created.shareLink).toBe(
      `https://example.test/gender-reveal/${created.record.token}`
    );
    expect(Buffer.from(created.record.token, "base64url")).toHaveLength(32);
    expect(fakeStore.insertCalls).toBe(1);
  });

  it("retries once on token collision", async () => {
    const fakeStore = new MemoryRevealStore(1);
    const created = await createReveal(
      sampleInput,
      fakeStore,
      "https://example.test"
    );

    expect(created.record.token).toBeTruthy();
    expect(fakeStore.insertCalls).toBe(2);
  });

  it("rejects after two failed token collision attempts", async () => {
    const fakeStore = new MemoryRevealStore(2);

    await expect(
      createReveal(sampleInput, fakeStore, "https://example.test")
    ).rejects.toThrow(TokenConflictError);
    expect(fakeStore.insertCalls).toBe(2);
  });
});
