import type { Metadata } from "next";
import { ThemeProvider } from "./contexts/ThemeContext";
import localFont from "next/font/local";
import "./globals.css";
import "../styles/normalization.css";
import { Header } from "./components/layout";
import AnimatedHome from "./components/layout/AnimatedHome";

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
  title: "My Portfolio",
  description: "A showcase of my work as a Developer, Designer, and Freelancer",
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
          <AnimatedHome>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 flex items-center justify-center">
                {children}
              </main>
              <footer className="p-4 text-center text-sm text-secondary-foreground">
                © 2024 My Portfolio. All rights reserved.
              </footer>
            </div>
          </AnimatedHome>
        </ThemeProvider>
      </body>
    </html>
  );
}
