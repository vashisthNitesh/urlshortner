import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/70 py-8 text-sm dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
        <p className="text-slate-600 dark:text-slate-300">© {new Date().getFullYear()} PulseLink. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
