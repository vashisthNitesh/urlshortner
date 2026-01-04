import Link from "next/link";
import { ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";
import { AdSenseSlot } from "./adsense-slot";

type Props = {
  children: ReactNode;
  showAds?: boolean;
};

export function DashboardShell({ children, showAds }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold">
            <span className="rounded bg-primary px-2 py-1 text-white">Pulse</span>
            <span>Link</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/billing">Billing</Link>
            <Link href="/settings">Settings</Link>
            <Link href="/admin">Admin</Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      {showAds && (
        <div className="bg-slate-100 py-2 dark:bg-slate-900">
          <div className="mx-auto max-w-6xl px-4">
            <AdSenseSlot slot={process.env.NEXT_PUBLIC_ADSENSE_DASHBOARD_SLOT || "123456"} />
          </div>
        </div>
      )}
      <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 px-4 py-8">{children}</main>
    </div>
  );
}
