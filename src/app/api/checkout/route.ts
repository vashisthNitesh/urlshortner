import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRazorpayClient, razorpayPlanLookup } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const planId = (form.get("planId") as string) || razorpayPlanLookup.monthly;
  const razorpay = getRazorpayClient();

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const customer =
    user?.razorpayCustomerId ??
    (
      await razorpay.customers.create({
        email: user?.email || undefined,
        name: user?.name || undefined,
        notes: { userId: user?.id || "" }
      })
    ).id;

  if (!user?.razorpayCustomerId) {
    await prisma.user.update({ where: { id: session.user.id }, data: { razorpayCustomerId: customer } });
  }

  const subscription = await razorpay.subscriptions.create({
    plan_id: planId,
    customer_id: customer,
    total_count: planId === razorpayPlanLookup.annual ? 1 : 12,
    customer_notify: 1,
    notes: { userId: session.user.id }
  });

  const redirectUrl = subscription.short_url || `${process.env.NEXTAUTH_URL}/billing?pending=1`;
  return NextResponse.redirect(redirectUrl, 303);
}
