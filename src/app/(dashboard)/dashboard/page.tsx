import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";
import Link from "next/link";
import { AdSenseSlot } from "@/components/adsense-slot";

async function getData(userId: string, search?: string) {
  const links = await prisma.link.findMany({
    where: {
      userId,
      OR: search
        ? [
            { slug: { contains: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
            { url: { contains: search, mode: "insensitive" } }
          ]
        : undefined
    },
    orderBy: { createdAt: "desc" },
    take: 10
  });
  const clicks = await prisma.clickEvent.count({
    where: { link: { userId } }
  });
  return { links, clicks };
}

export default async function DashboardPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Link href="/login" className="btn-primary">
          Sign in
        </Link>
      </div>
    );
  }
  const data = await getData(session.user.id, searchParams.q);
  const showAds = session.user.ads;

  return (
    <DashboardShell showAds={showAds}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Welcome back</p>
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <Link href="/links/new" className="btn-primary">
          Create link
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-slate-500">Recent clicks</p>
          <p className="text-3xl font-bold">{data.clicks}</p>
          <p className="text-sm text-slate-500">Across all tracked links</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Plan</p>
          <p className="text-2xl font-bold capitalize">{session.user.plan}</p>
          <p className="text-sm text-slate-500">{showAds ? "Ad-supported experience" : "Ad-free experience"}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Security</p>
          <p className="text-xl font-semibold">2FA {showAds ? "available on upgrade" : "available"}</p>
          <Link href="/settings" className="text-sm text-primary">
            Manage security
          </Link>
        </div>
      </div>
      <div className="card">
        <form className="mb-4 flex flex-wrap items-center gap-2">
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search links"
            className="w-full rounded-lg border px-3 py-2 md:w-72"
          />
          <button className="btn" type="submit">
            Search
          </button>
        </form>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent links</h2>
          <Link href="/links/new" className="btn">
            New link
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {data.links.map((link) => (
            <div key={link.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div>
                <p className="font-semibold">{link.title || link.slug}</p>
                <p className="text-sm text-slate-500">{link.url}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase dark:bg-slate-800">
                  {link.status}
                </span>
                <Link href={`/links/${link.id}`} className="text-primary">
                  Details
                </Link>
              </div>
            </div>
          ))}
          {data.links.length === 0 && <p className="text-sm text-slate-500">No links yet.</p>}
        </div>
      </div>
      {showAds && (
        <div className="card">
          <p className="text-sm font-semibold text-slate-700">Ad-supported tier</p>
          <AdSenseSlot slot={process.env.NEXT_PUBLIC_ADSENSE_DASHBOARD_SLOT || "123456"} />
        </div>
      )}
    </DashboardShell>
  );
}
