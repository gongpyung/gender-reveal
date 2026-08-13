import { db } from "@/lib/db/client";
import { DrizzleRevealStore } from "@/lib/reveals/repository";
import { handleCreateReveal } from "@/lib/reveals/create-handler";

const store = new DrizzleRevealStore(db);

export async function POST(request: Request) {
  return handleCreateReveal(request, { store });
}
