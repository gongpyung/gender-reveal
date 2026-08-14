import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DatabaseConfigurationError,
  getDb,
} from "@/lib/db/client";
import {
  DrizzleRevealStore,
  getRevealStore,
} from "@/lib/reveals/repository";

describe("database-backed reveal repository", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
    vi.restoreAllMocks();
  });

  it("requires DATABASE_URL when constructing the database", () => {
    delete process.env.DATABASE_URL;

    expect(() => getDb()).toThrowError(DatabaseConfigurationError);
    expect(() => getDb()).toThrow("DATABASE_URL is required");
  });

  it("returns a DrizzleRevealStore when DATABASE_URL is configured", () => {
    process.env.DATABASE_URL = "postgresql://user:pass@example.test/db";

    expect(getRevealStore()).toBeInstanceOf(DrizzleRevealStore);
  });

  it("propagates lookup failures from the database", async () => {
    const database = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: vi.fn().mockRejectedValue(new Error("connection failed")),
          }),
        }),
      }),
    };
    const store = new DrizzleRevealStore(database as never);

    await expect(store.findByToken("token")).rejects.toThrow(
      "connection failed"
    );
  });

  it("returns null when a successful lookup has no row", async () => {
    const database = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };
    const store = new DrizzleRevealStore(database as never);

    await expect(store.findByToken("missing")).resolves.toBeNull();
  });
});
