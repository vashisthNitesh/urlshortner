import { MarketingShell } from "@/components/page-shell";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Ad-supported with strict quotas",
    features: ["50 links/month", "14-day analytics", "No custom domains", "reCAPTCHA on signup", "Tasteful AdSense placements"],
    cta: { label: "Start free", href: "/register" }
  },
  {
    name: "Premium",
    price: "$19",
    description: "Growth teams that need control",
    features: ["5k links/month", "365-day analytics", "3 custom domains", "Password + expiration", "No ads, priority support"],
    cta: { label: "Upgrade", href: "/billing" }
  }
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-4xl font-bold">Transparent pricing</h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
            Upgrade to premium for custom domains, advanced security, longer retention, and ad-free dashboards. Taxes handled via
            Razorpay settings automatically.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.name} className="card flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-500">{plan.name}</p>
                  <p className="mt-1 text-3xl font-bold">{plan.price}/mo</p>
                </div>
                <Link href={plan.cta.href} className="btn-primary">
                  {plan.cta.label}
                </Link>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{plan.description}</p>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
