import type { Metadata } from "next";
import { Inter, JetBrains_Mono, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// IBM Plex Serif — editorial display face, has font override metadata.
const plexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Manifesto Markets — Curated stock ideas, multi-market",
    template: "%s · Manifesto Markets",
  },
  description:
    "A curated directory of stock ideas, writers, and news across major markets. Independent voices, fund letters, and the social web — organized.",
  metadataBase: new URL("https://manifestomarkets.com"),
  openGraph: {
    title: "Manifesto Markets",
    description:
      "Curated stock ideas, writers, and news across major markets.",
    type: "website",
    siteName: "Manifesto Markets",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manifesto Markets",
    description:
      "Curated stock ideas, writers, and news across major markets.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${plexSerif.variable} ${jetbrains.variable} font-sans bg-bg text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}