import { eq } from "drizzle-orm";
import { reveals } from "../db/schema";
import { Gender, RevealInput, RevealRecord } from "./types";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import { getDb } from "../db/client";

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
  }
}

export function getRevealStore(): DrizzleRevealStore {
  return new DrizzleRevealStore(getDb());
}
