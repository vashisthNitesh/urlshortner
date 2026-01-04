"use client";

import "./globals.css";
import { ReactNode, useEffect, useState } from "react";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";
import { AnalyticsBanner } from "@/components/analytics-banner";
import { CookieBanner } from "@/components/cookie-banner";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="robots" content="index,follow" />
        <meta
          name="description"
          content="Production-ready URL shortener SaaS with premium security, analytics, and monetization."
        />
        <meta property="og:title" content="PulseLink - Secure URL Shortener SaaS" />
        <meta property="og:description" content="Shorten, brand, and monitor every link with enterprise-grade controls." />
        <meta name="theme-color" content="#0B1221" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-xxxxx"}
        />
      </head>
      <body className="min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AnalyticsBanner />
            {mounted && <CookieBanner />}
            <div className="min-h-screen flex flex-col">{children}</div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
