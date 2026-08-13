import { RevealInput, RevealRecord } from "./types";
import { revealInputSchema } from "./validation";
import { RevealStore, TokenConflictError } from "./repository";

export function defaultTokenFactory(): Uint8Array {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function encodeToken(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

export type CreateRevealResult = {
  record: RevealRecord;
  shareLink: string;
};

export async function createReveal(
  rawInput: RevealInput,
  store: RevealStore,
  origin: string,
  tokenFactory: () => Uint8Array = defaultTokenFactory
): Promise<CreateRevealResult> {
  const validatedInput = revealInputSchema.parse(rawInput);
  const normalizedOrigin = new URL(origin).origin;

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    const tokenBytes = tokenFactory();
    const token = encodeToken(tokenBytes);

    try {
      const record = await store.insert(validatedInput, token);
      const shareLink = `${normalizedOrigin}/gender-reveal/${token}`;
      return { record, shareLink };
    } catch (error) {
      if (error instanceof TokenConflictError && attempts < maxAttempts) {
        continue;
      }
      throw error;
    }
  }

  throw new TokenConflictError("Failed to generate a unique token");
}
