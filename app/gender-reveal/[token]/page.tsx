import { db } from "@/lib/db/client";
import { DrizzleRevealStore } from "@/lib/reveals/repository";
import MissingReveal from "@/components/gender-reveal/missing-reveal";
import RevealExperience from "@/components/gender-reveal/reveal-experience";

const store = new DrizzleRevealStore(db);

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function RecipientPage({ params }: PageProps) {
  const { token } = await params;

  if (!token || typeof token !== "string" || token.length > 64) {
    return <MissingReveal />;
  }

  const record = await store.findByToken(token);

  if (!record) {
    return <MissingReveal />;
  }

  return <RevealExperience reveal={record} />;
}
