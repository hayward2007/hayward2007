import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeInitScript } from "@/components/theme-toggle";
import { Cursor } from "@/components/cursor";
import { Grain } from "@/components/grain";
import { Preloader } from "@/components/preloader";
import { SiteHeader } from "@/components/site-header";
import { LocaleProvider } from "@/components/locale-provider";
import { EasterEggButton } from "@/components/easter-egg/easter-egg-button";
import { PageviewBeacon } from "@/components/pageview-beacon";
import { getServerLocale } from "@/lib/locale-server";

// Self-hosted (was a cdn.jsdelivr.net <link>, which cost every first-time
// visitor an extra DNS+TLS round trip to a third-party origin before the
// stylesheet — let alone the font file — could even start loading).
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://hayward.kim"),
  title: {
    default: "Hayward Kim — Robotics & Physical AI",
    template: "%s | Hayward Kim",
  },
  description:
    "Kim Hyeong-Seok (Hayward Kim) designs unique robots across mechanisms, control, and physical AI.",
  openGraph: {
    type: "website",
    title: "Hayward Kim — Robotics & Physical AI",
    description: "Robotics, embedded hardware, control systems, and physical AI.",
    images: [{ url: "/assets/banner.jpeg", alt: "Hayward Kim" }],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();

  return (
    <html lang={locale} suppressHydrationWarning className={pretendard.variable}>
      <head>
        <ThemeInitScript />
      </head>
      <body className="min-h-dvh antialiased">
        <LocaleProvider locale={locale}>
          <Suspense fallback={null}>
            <PageviewBeacon />
          </Suspense>
          <Preloader />
          <Cursor />
          <Grain />
          <SiteHeader />
          {children}
          <EasterEggButton />
        </LocaleProvider>
      </body>
    </html>
  );
}
