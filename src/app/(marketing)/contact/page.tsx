import { MarketingShell } from "@/components/page-shell";

export default function ContactPage() {
  return (
    <MarketingShell>
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold">Contact</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Reach our team for enterprise deals, abuse reports, or security inquiries.
          </p>
          <div className="card space-y-3">
            <p className="font-semibold">Email</p>
            <p className="text-slate-600 dark:text-slate-300">support@pulselink.app</p>
            <p className="font-semibold">Security</p>
            <p className="text-slate-600 dark:text-slate-300">security@pulselink.app</p>
            <p className="font-semibold">Abuse</p>
            <p className="text-slate-600 dark:text-slate-300">abuse@pulselink.app</p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
