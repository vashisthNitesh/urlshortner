import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {children}
      </main>
      <Footer />
    </div>
  );
}
