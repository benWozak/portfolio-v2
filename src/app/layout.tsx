import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "../contexts/ThemeContext";
import localFont from "next/font/local";
import "./globals.css";
import "../styles/normalization.css";
import { Header, Footer } from "@/components/layout";

const geistSans = localFont({
  src: [
    {
      path: "./fonts/GeistVF.woff",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
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
});

export const metadata: Metadata = {
  metadataBase: new URL("https://v2-benwozak.vercel.app/"),
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
    locale: "en_US",
    url: "https://v2-benwozak.vercel.app/",
    title: "Ben Wozak | Software Developer",
    description:
      "Explore my projects. Specializing in React, Next.js, and modern web technologies.",
    siteName: "Ben Wozaks Portfolio",
    images: [
      {
        url: "https://v2-benwozak.vercel.app/BW_logo.svg",
        width: 1200,
        height: 630,
        alt: "Ben Wozak - Software Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ben Wozak | Software Developer",
    description: "Check out my latest web development projects.",
    creator: "@your_twitter_handle",
    images: ["https://v2-benwozak.vercel.app/BW_logo.svg"],
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
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center">
              {children}
            </main>
            <Footer />
            {/* <footer className="p-4 text-center text-sm text-foreground">
              © {new Date().getFullYear()} Ben Wozak. All rights reserved.
            </footer> */}
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
