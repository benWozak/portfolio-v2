// src/app/(app)/contact/layout.tsx
// contact/page.tsx is a client component and cannot export metadata, so the
// route's title and Open Graph tags live here.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_IMAGE, SITE_LOCALE, SITE_NAME } from "@/lib/site";

const title = "Contact";
const description = "Get in touch about a project, a role or a collaboration.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: "/contact",
    title,
    description,
    images: [SITE_IMAGE],
  },
  twitter: { card: "summary_large_image", title, description, images: [SITE_IMAGE] },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
