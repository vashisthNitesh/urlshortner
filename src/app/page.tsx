import { AdSenseSlot } from "@/components/adsense-slot";
import { MarketingShell } from "@/components/page-shell";
import Link from "next/link";

const highlights = [
  "GDPR-friendly analytics with bot filtering",
  "Premium custom domains with SSL and safety checks",
  "Razorpay-powered subscriptions with tax/VAT support",
  "2FA for premium, reCAPTCHA for free tier signups"
];

export default function HomePage() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-100">
              Production-ready URL shortener
            </p>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 dark:text-white md:text-5xl">
              Shorten, brand, and secure every link with enterprise controls.
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              PulseLink combines fast redirects, granular analytics, premium domains, and Razorpay-powered billing in a single
              deployable Next.js platform. Free users see tasteful AdSense placements; premium customers enjoy an ad-free, unlimited
              experience.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn-primary">
                Launch your workspace
              </Link>
              <Link href="/pricing" className="btn">
                View pricing
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {highlights.map((item) => (
                <div key={item} className="card">
                  <p className="font-semibold text-slate-900 dark:text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card space-y-4 border-primary/30 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-950">
            <h3 className="text-xl font-semibold">Core capabilities</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>• 301/302 redirects with password protection & expiration</li>
              <li>• QR codes, UTM builder, bulk CSV import, link folders and tags</li>
              <li>• Safety previews with malware flagging and abuse reporting</li>
              <li>• Admin toolkit for users, domains, abuse, feature flags</li>
            </ul>
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <h4 className="mb-2 text-sm font-semibold">Ad-supported demo</h4>
              <AdSenseSlot slot={process.env.NEXT_PUBLIC_ADSENSE_LANDING_SLOT || "123456"} />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-slate-900 px-4 py-14 text-white">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-blue-200">Security & compliance</p>
              <h2 className="text-3xl font-bold">Hardened defaults for regulated teams</h2>
              <p className="mt-2 max-w-3xl text-slate-200">
                CSRF-safe session handling, webhook signature verification, audit logging, and per-plan entitlements keep your data
                safe. Deploy behind your WAF/CDN and set strict security headers out of the box.
              </p>
            </div>
            <Link href="/privacy" className="btn-secondary">
              Review policies
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card bg-slate-800 text-white">
              <h3 className="text-lg font-semibold">Auth</h3>
              <p className="text-sm text-slate-200">Email/password with verification, Google OAuth, optional 2FA for premium users.</p>
            </div>
            <div className="card bg-slate-800 text-white">
              <h3 className="text-lg font-semibold">Billing</h3>
              <p className="text-sm text-slate-200">
                Razorpay checkout links with tax/VAT settings and subscription lifecycle webhooks.
              </p>
            </div>
            <div className="card bg-slate-800 text-white">
              <h3 className="text-lg font-semibold">Analytics</h3>
              <p className="text-sm text-slate-200">
                Device, country, referrer, and campaign insights with CSV export for premium and retention rules by plan tier.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
