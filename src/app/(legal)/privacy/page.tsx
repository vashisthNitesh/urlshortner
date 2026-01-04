import { MarketingShell } from "@/components/page-shell";

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-4">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            We collect minimal analytics data (referrer, device, country, campaign parameters) with IPs hashed. Retention is limited
            by plan tier and bots are filtered. Cookies support authentication, security, and AdSense (for free users only).
          </p>
          <ul className="list-disc space-y-2 pl-6 text-sm text-slate-700 dark:text-slate-200">
            <li>Users can request deletion of account data via support.</li>
            <li>Stripe manages payment details; we store customer and subscription identifiers only.</li>
            <li>Geo data is inferred from headers or third-party providers with opt-out for DNT signals.</li>
            <li>reCAPTCHA protects signups and link creation for free tier.</li>
          </ul>
        </div>
      </section>
    </MarketingShell>
  );
}
