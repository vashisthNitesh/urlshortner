import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="rounded bg-primary px-2 py-1 text-white">Pulse</span>
          <span>Link</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/pricing">Pricing</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/login" className="btn">
            Sign in
          </Link>
          <Link href="/register" className="btn-primary">
            Get started
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
