import { MarketingShell } from "@/components/page-shell";

export default function TermsPage() {
  return (
    <MarketingShell>
      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-4">
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            By using PulseLink you agree to abide by our acceptable use policy, avoid malicious links, and acknowledge that premium
            features require an active Razorpay subscription. Abuse may result in link suspension or account termination.
          </p>
          <ul className="list-disc space-y-2 pl-6 text-sm text-slate-700 dark:text-slate-200">
            <li>Premium plans auto-renew monthly/annually; cancellations prorate at the next billing cycle.</li>
            <li>Admins may disable links or domains flagged for phishing or malware.</li>
            <li>All secrets must be provided via environment variables during deployment.</li>
          </ul>
        </div>
      </section>
    </MarketingShell>
  );
}
