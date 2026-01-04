import { MarketingShell } from "@/components/page-shell";

export default function CookiesPage() {
  return (
    <MarketingShell>
      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-4">
          <h1 className="text-3xl font-bold">Cookie Policy</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            We use cookies for authentication, session security, analytics, and AdSense (for free tier). You can manage consent via
            the banner or browser settings.
          </p>
          <ul className="list-disc space-y-2 pl-6 text-sm text-slate-700 dark:text-slate-200">
            <li>Session cookies for NextAuth.</li>
            <li>Preference cookies for theme and consent.</li>
            <li>AdSense cookies for monetization on free plans (not on redirects).</li>
          </ul>
        </div>
      </section>
    </MarketingShell>
  );
}
