import { getRevealStore } from "@/lib/reveals/repository";
import { handleCreateReveal } from "@/lib/reveals/create-handler";

export async function POST(request: Request) {
  const store = getRevealStore();
  return handleCreateReveal(request, { store });
}
