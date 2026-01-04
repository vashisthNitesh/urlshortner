import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function getProfile(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const profile = await getProfile(session.user.id);

  return (
    <DashboardShell showAds={session.user.ads}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Account</p>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="text-sm text-slate-500">Signed in as {profile?.email}</p>
          <p className="text-sm text-slate-500">Role: {profile?.role}</p>
        </div>
        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">Two-factor authentication</h2>
          <p className="text-sm text-slate-500">
            Premium users can enable TOTP to secure sign-in. Submit the one-time setup request from your authenticator app.
          </p>
          <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
            POST /api/auth/twofactor/setup then confirm with /api/auth/twofactor/confirm
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
