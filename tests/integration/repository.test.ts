import { describe, expect, it } from "vitest";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import * as schema from "@/lib/db/schema";
import { DrizzleRevealStore } from "@/lib/reveals/repository";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

describe.skipIf(!testDatabaseUrl)("real PostgreSQL repository", () => {
  it("preserves valid dates and rejects invalid PostgreSQL dates", async () => {
    const sql = neon(testDatabaseUrl!);
    const database = drizzle(sql, { schema });
    await migrate(database, { migrationsFolder: "db/migrations" });
    const store = new DrizzleRevealStore(database);
    const token = `integration-${Date.now()}`;

    await store.insert(
      {
        babyNickname: "테스트",
        dueDate: "2026-12-25",
        recipientName: "테스트",
        babyGender: "son",
      },
      token
    );

    await expect(store.findByToken(token)).resolves.toMatchObject({
      dueDate: "2026-12-25",
    });
    await expect(
      sql`insert into reveals (token, baby_nickname, due_date, recipient_name, baby_gender) values (${`${token}-invalid`}, '테스트', '2026-02-30', '테스트', 'son')`
    ).rejects.toThrow();
  });
});
