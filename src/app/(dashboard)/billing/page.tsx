import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import Link from "next/link";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Link className="btn-primary" href="/login">
          Sign in
        </Link>
      </div>
    );
  }
  const plans = [
    { id: "monthly", name: "Monthly", price: "$19", planId: process.env.RAZORPAY_MONTHLY_PLAN_ID || "plan_monthly_placeholder" },
    { id: "annual", name: "Annual", price: "$190", planId: process.env.RAZORPAY_ANNUAL_PLAN_ID || "plan_annual_placeholder" }
  ];

  return (
    <DashboardShell showAds={session.user.ads}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Billing</p>
          <h1 className="text-3xl font-bold">Manage subscription</h1>
        </div>
        <Link className="btn" href="mailto:billing@pulselink.app">
          Contact billing support
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <form key={plan.id} action="/api/checkout" method="POST" className="card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{plan.name}</p>
                <p className="text-2xl font-bold">{plan.price}</p>
              </div>
              <input type="hidden" name="planId" value={plan.planId} />
              <button className="btn-primary" type="submit">
                Subscribe
              </button>
            </div>
            <p className="text-sm text-slate-500">Includes premium entitlements, higher quotas, no ads, and priority support.</p>
          </form>
        ))}
      </div>
    </DashboardShell>
  );
}
