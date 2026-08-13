import { RevealStore } from "./repository";
import { createReveal } from "./service";
import { ZodError } from "zod";

export type CreateHandlerDependencies = {
  store: RevealStore;
  tokenFactory?: () => Uint8Array;
};

export async function handleCreateReveal(
  request: Request,
  deps: CreateHandlerDependencies
): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ code: "INVALID_INPUT" }, { status: 400 });
  }

  try {
    const origin = new URL(request.url).origin;
    const result = await createReveal(
      body as any,
      deps.store,
      origin,
      deps.tokenFactory
    );

    return Response.json({ shareLink: result.shareLink }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ code: "INVALID_INPUT" }, { status: 400 });
    }

    console.error("Failed to create reveal", error);
    return Response.json({ code: "CREATE_FAILED" }, { status: 500 });
  }
}
