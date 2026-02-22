/**
 * app/layout.tsx — Root layout for Infosetu
 * GIGW 3.0 · WCAG 2.2 AA · Next.js 15 App Router
 * Includes: SkipToMain, GovHeader, GovFooter, CookieBanner
 */
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import SkipToMain from "@/components/layout/SkipToMain";
import GovHeader from "@/components/layout/GovHeader";
import GovFooter from "@/components/layout/GovFooter";
import CookieBanner from "@/components/ui/CookieBanner";

/* Inter — clean, highly legible for low-literacy users */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InfoSetu — Integrated Government Digital Services",
    template: "%s | InfoSetu",
  },
  description:
    "InfoSetu is the Integrated Government Digital Services Platform by MeitY. " +
    "Access Aadhaar, PAN, Passport, Ration Card, and 100+ citizen services online.",
  keywords: ["government services", "Aadhaar", "PAN", "India", "MeitY", "NIC", "citizen portal"],
  authors: [{ name: "Ministry of Electronics & Information Technology" }],
  creator: "MeitY / NIC",
  metadataBase: new URL("https://infosetu.gov.in"),
  openGraph: {
    title: "InfoSetu — Government Digital Services India",
    description: "One portal for all Indian citizen services",
    type: "website",
    locale: "en_IN",
    siteName: "InfoSetu",
  },
  twitter: { card: "summary_large_image" },
};

/* WCAG 1.4.4 — must allow zoom up to at least 200% for low-vision users */
/* Next.js 15: viewport is a separate named export, not part of metadata  */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#1A237E",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* WCAG 3.1.1 — language of page declared */
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect for speed */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>

      <body className="flex flex-col min-h-screen bg-[#F5F5F5] font-sans">
        {/* ── A11y: First focusable element on page ── */}
        <SkipToMain />

        {/* ── GIGW Header ── */}
        <GovHeader />

        {/* ── Main content ── */}
        {/* id="main-content" is the target of the SkipToMain link */}
        <main
          id="main-content"
          className="flex-1 w-full"
          tabIndex={-1}           /* programmatically focusable but not in tab order */
        >
          {children}
        </main>

        {/* ── GIGW Footer ── */}
        <GovFooter />

        {/* ── DPDP Act 2023 cookie consent ── */}
        <CookieBanner />
      </body>
    </html>
  );
}
