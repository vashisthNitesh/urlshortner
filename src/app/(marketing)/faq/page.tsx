import { MarketingShell } from "@/components/page-shell";

const faqs = [
  {
    q: "Do free users see ads everywhere?",
    a: "Ads are only on the landing and dashboard surfaces. Redirect endpoints never render ads for performance and compliance."
  },
  {
    q: "How do quotas and entitlements work?",
    a: "We evaluate subscription status via Razorpay webhooks and enforce limits (link counts, custom domains, bulk size, analytics retention) during API calls."
  },
  {
    q: "Is data GDPR compliant?",
    a: "Yes. We hash IPs, offer cookie consent, and allow honoring DNT. Analytics exclude bots and respect retention windows by plan."
  },
  {
    q: "Can I self-host?",
    a: "The repo ships with Prisma/Postgres, Razorpay integration, and environment-driven secrets. Deploy on Vercel/Render/Fly with managed Postgres."
  }
];

export default function FAQPage() {
  return (
    <MarketingShell>
      <section className="px-4 py-14">
        <div className="mx-auto max-w-4xl space-y-10">
          <div>
            <h1 className="text-4xl font-bold">Frequently asked questions</h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
              Clear answers about billing, privacy, and feature gating.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((item) => (
              <div key={item.q} className="card">
                <h3 className="text-lg font-semibold">{item.q}</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
