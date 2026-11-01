// Root layout. It lives at src/app/ (not inside the (app) group) so that Next's /_not-found route for unmatched URLs renders inside it with ./not-found.tsx; a not-found.tsx inside a route group only serves notFound() calls made within that group.
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/providers/Providers";
import localFont from "next/font/local";
import "./globals.css";
import "../styles/normalization.css";
import { Header, Footer } from "@/components/layout";
import { SITE_IMAGE, SITE_LOCALE, SITE_NAME, SITE_URL } from "@/lib/site";

const geistSans = localFont({
  src: [
    {
      path: "./fonts/GeistVF.woff",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
  display: "swap",
  preload: true,
});

const geistMono = localFont({
  src: [
    {
      path: "./fonts/GeistMonoVF.woff",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-geist-mono",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: {
    default: "Ben Wozak | Software Developer",
    template: "%s | Ben Wozak",
  },
  description:
    "Professional software developer specializing in React, Next.js, and modern web technologies. View my portfolio and get in touch for collaborations.",
  keywords: [
    "web developer",
    "software developer",
    "React",
    "Next.js",
    "TypeScript",
    "portfolio",
    "freelance",
    "senior developer",
    "intermediate developer",
  ],
  authors: [{ name: "Ben Wozak" }],
  creator: "Ben Wozak",
  publisher: "Ben Wozak",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    url: `${SITE_URL}/`,
    title: "Ben Wozak | Software Developer",
    description:
      "Explore my projects. Specializing in React, Next.js, and modern web technologies.",
    siteName: SITE_NAME,
    images: [SITE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ben Wozak | Software Developer",
    description: "Check out my latest web development projects.",
    images: [SITE_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
