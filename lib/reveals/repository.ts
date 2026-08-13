import { eq } from "drizzle-orm";
import { reveals } from "../db/schema";
import { Gender, RevealInput, RevealRecord } from "./types";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import { db } from "../db/client";

export class TokenConflictError extends Error {}

export interface RevealStore {
  insert(input: RevealInput, token: string): Promise<RevealRecord>;
  findByToken(token: string): Promise<RevealRecord | null>;
}

export class DrizzleRevealStore implements RevealStore {
  constructor(private db: NeonHttpDatabase<typeof schema>) {}

  async insert(input: RevealInput, token: string): Promise<RevealRecord> {
    try {
      const [inserted] = await this.db
        .insert(reveals)
        .values({
          token,
          babyNickname: input.babyNickname,
          dueDate: input.dueDate,
          recipientName: input.recipientName,
          babyGender: input.babyGender,
        })
        .returning();

      return {
        token: inserted.token,
        babyNickname: inserted.babyNickname,
        dueDate: inserted.dueDate,
        recipientName: inserted.recipientName,
        babyGender: inserted.babyGender as Gender,
        createdAt: inserted.createdAt,
      };
    } catch (error: any) {
      if (error?.code === "23505" || error?.constraint === "reveals_pkey") {
        throw new TokenConflictError("Token collision");
      }
      throw error;
    }
  }

  async findByToken(token: string): Promise<RevealRecord | null> {
    try {
      const [found] = await this.db
        .select()
        .from(reveals)
        .where(eq(reveals.token, token))
        .limit(1);

      if (!found) {
        return null;
      }

      return {
        token: found.token,
        babyNickname: found.babyNickname,
        dueDate: found.dueDate,
        recipientName: found.recipientName,
        babyGender: found.babyGender as Gender,
        createdAt: found.createdAt,
      };
    } catch {
      return null;
    }
  }
}

declare global {
  var __memoryRevealStore: MemoryRevealStore | undefined;
}

export class MemoryRevealStore implements RevealStore {
  public records = new Map<string, RevealRecord>();

  public static getInstance(): MemoryRevealStore {
    if (!globalThis.__memoryRevealStore) {
      globalThis.__memoryRevealStore = new MemoryRevealStore();
    }
    return globalThis.__memoryRevealStore;
  }

  async insert(input: RevealInput, token: string): Promise<RevealRecord> {
    if (this.records.has(token)) {
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

export function getRevealStore(): RevealStore {
  if (
    !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.includes("placeholder")
  ) {
    return MemoryRevealStore.getInstance();
  }
  return new DrizzleRevealStore(db);
}
