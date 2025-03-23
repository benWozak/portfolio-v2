import { Metadata } from "next";

interface SEOProps {
  title: string;
  description: string;
  path: string;
}

export function generateMetadata({
  title,
  description,
  path,
}: SEOProps): Metadata {
  const customDomain = "https://benwozak.dev";

  return {
    title,
    description,
    alternates: {
      canonical: `${customDomain}${path}`,
    },
    openGraph: {
      title,
      description,
      url: `${customDomain}${path}`,
    },
  };
}
