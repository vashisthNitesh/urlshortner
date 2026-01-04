import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getLink(id: string, userId: string) {
  return prisma.link.findFirst({
    where: { id, userId },
    include: { clickEvents: { orderBy: { occurredAt: "desc" }, take: 30 }, tags: { include: { tag: true } }, domain: true }
  });
}

export default async function LinkDetails({ params }: { params: { id: string } }) {
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
  const link = await getLink(params.id, session.user.id);
  if (!link) {
    notFound();
  }

  return (
    <DashboardShell showAds={session.user.ads}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Link details</p>
          <h1 className="text-3xl font-bold">{link.title || link.slug}</h1>
        </div>
        <Link href="/dashboard" className="btn">
          Back
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-slate-500">Destination</p>
          <p className="font-semibold">{link.url}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Domain/Slug</p>
          <p className="font-semibold">{link.domain?.hostname || "default"}/ {link.slug}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Security</p>
          <p className="font-semibold">{link.password ? "Password protected" : "Open link"}</p>
        </div>
      </div>
      <div className="card space-y-3">
        <h2 className="text-lg font-semibold">Recent analytics</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <p className="text-sm text-slate-500">Clicks</p>
            <p className="text-2xl font-bold">{link.clickEvents.length}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Top referrer</p>
            <p className="text-xl font-semibold">{link.clickEvents[0]?.referrer || "n/a"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Top country</p>
            <p className="text-xl font-semibold">{link.clickEvents[0]?.country || "n/a"}</p>
          </div>
        </div>
        <div className="overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">Referrer</th>
                <th className="px-3 py-2 text-left">Country</th>
                <th className="px-3 py-2 text-left">Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {link.clickEvents.map((event) => (
                <tr key={event.id}>
                  <td className="px-3 py-2">{new Date(event.occurredAt).toLocaleString()}</td>
                  <td className="px-3 py-2">{event.referrer || "Direct"}</td>
                  <td className="px-3 py-2">{event.country}</td>
                  <td className="px-3 py-2">{event.device}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
