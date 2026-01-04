import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";
import { redirect } from "next/navigation";

async function getAdminData() {
  const [users, links, abuse] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.link.findMany({ orderBy: { createdAt: "desc" }, take: 20, include: { domain: true } }),
    prisma.abuseReport.findMany({ orderBy: { createdAt: "desc" }, take: 20, include: { link: true, user: true } })
  ]);
  return { users, links, abuse };
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }
  const data = await getAdminData();

  return (
    <DashboardShell showAds={false}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Admin</p>
          <h1 className="text-3xl font-bold">System overview</h1>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-slate-500">Users</p>
          <p className="text-3xl font-bold">{data.users.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Links</p>
          <p className="text-3xl font-bold">{data.links.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Abuse reports</p>
          <p className="text-3xl font-bold">{data.abuse.length}</p>
        </div>
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold">Recent abuse reports</h2>
        <div className="mt-3 space-y-2">
          {data.abuse.map((report) => (
            <div key={report.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <p className="font-semibold">{report.link.slug}</p>
              <p className="text-sm text-slate-500">{report.reason}</p>
            </div>
          ))}
          {data.abuse.length === 0 && <p className="text-sm text-slate-500">No reports.</p>}
        </div>
      </div>
    </DashboardShell>
  );
}
