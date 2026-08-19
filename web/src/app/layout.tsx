import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ThemeInitScript } from "@/components/theme-toggle";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Cursor } from "@/components/cursor";
import { Grain } from "@/components/grain";
import { Preloader } from "@/components/preloader";
import { SiteHeader } from "@/components/site-header";
import { LocaleProvider } from "@/components/locale-provider";
import { EasterEggButton } from "@/components/easter-egg/easter-egg-button";
import { PageviewBeacon } from "@/components/pageview-beacon";
import { getServerLocale } from "@/lib/locale-server";

export const metadata: Metadata = {
  title: "Hayward Kim — Robotics & Physical AI",
  description:
    "Kim Hyeong-Seok (Hayward Kim) — robotics and physical AI, built to compete and shipped as products people use.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ThemeInitScript />
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css"
        />
      </head>
      <body className="min-h-dvh antialiased">
        <LocaleProvider locale={locale}>
          <Suspense fallback={null}>
            <PageviewBeacon />
          </Suspense>
          <Preloader />
          <SmoothScroll />
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
