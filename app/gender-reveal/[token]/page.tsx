import { getRevealStore } from "@/lib/reveals/repository";
import MissingReveal from "@/components/gender-reveal/missing-reveal";
import RevealExperience from "@/components/gender-reveal/reveal-experience";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function RecipientPage({ params }: PageProps) {
  const { token } = await params;

  if (!token || typeof token !== "string" || token.length > 64) {
    return <MissingReveal />;
  }

  const store = getRevealStore();
  const record = await store.findByToken(token);

  if (!record) {
    return <MissingReveal />;
  }

  return <RevealExperience reveal={record} />;
}
