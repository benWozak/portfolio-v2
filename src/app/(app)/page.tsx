import { fileURLToPath } from "url";
import { headers as getHeaders } from "next/headers.js";
import { getPayload } from "payload";
import config from "@/payload.config";
import { HeroFreelance } from "@/components/layout";
import { Projects, Pitch } from "@/components/content";
import ContactCTA from "@/components/content/contact/ContactCTA";

export default async function Home() {
  const headers = await getHeaders();
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });
  const { user } = await payload.auth({ headers });

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`;

  return (
    <article className="flex min-h-screen flex-col items-center justify-center">
      <HeroFreelance />
      <Pitch />
      <Projects />
      <ContactCTA />
    </article>
  );
}
