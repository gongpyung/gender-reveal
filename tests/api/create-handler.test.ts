import { describe, expect, it } from "vitest";
import { handleCreateReveal } from "@/lib/reveals/create-handler";
import { RevealStore } from "@/lib/reveals/repository";
import { RevealInput, RevealRecord } from "@/lib/reveals/types";

class MemoryRevealStore implements RevealStore {
  public records = new Map<string, RevealRecord>();
  public insertCalls = 0;
  public shouldFail = false;

  async insert(input: RevealInput, token: string): Promise<RevealRecord> {
    this.insertCalls++;
    if (this.shouldFail) {
      throw new Error("Internal DB Error");
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

describe("handleCreateReveal", () => {
  const validPayload = {
    babyNickname: "깡총이",
    dueDate: "2026-12-25",
    recipientName: "할머니, 할아버지",
    babyGender: "daughter",
  };

  it("returns 201 and shareLink for valid input", async () => {
    const store = new MemoryRevealStore();
    const request = new Request("https://example.test/api/reveals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    const response = await handleCreateReveal(request, { store });
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.shareLink).toMatch(/^https:\/\/example\.test\/gender-reveal\//);
    expect(store.insertCalls).toBe(1);
  });

  it("returns 400 with INVALID_INPUT for malformed input and does not insert", async () => {
    const store = new MemoryRevealStore();
    const request = new Request("https://example.test/api/reveals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validPayload, babyNickname: "" }),
    });

    const response = await handleCreateReveal(request, { store });
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toEqual({ code: "INVALID_INPUT" });
    expect(store.insertCalls).toBe(0);
  });

  it("returns 400 with INVALID_INPUT for non-JSON body", async () => {
    const store = new MemoryRevealStore();
    const request = new Request("https://example.test/api/reveals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const response = await handleCreateReveal(request, { store });
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toEqual({ code: "INVALID_INPUT" });
    expect(store.insertCalls).toBe(0);
  });

  it("returns 500 with CREATE_FAILED without database message on internal error", async () => {
    const store = new MemoryRevealStore();
    store.shouldFail = true;
    const request = new Request("https://example.test/api/reveals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    const response = await handleCreateReveal(request, { store });
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json).toEqual({ code: "CREATE_FAILED" });
  });
});
