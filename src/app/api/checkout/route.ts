import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripeClient, stripePriceLookup } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const priceId = (form.get("priceId") as string) || stripePriceLookup.monthly;
  const stripe = getStripeClient();

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const customer = user?.stripeCustomerId
    ? user.stripeCustomerId
    : (await stripe.customers.create({ email: user?.email || undefined, metadata: { userId: user?.id } })).id;

  if (!user?.stripeCustomerId) {
    await prisma.user.update({ where: { id: session.user.id }, data: { stripeCustomerId: customer } });
  }

  const checkout = await stripe.checkout.sessions.create({
    customer,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/billing?success=1`,
    cancel_url: `${process.env.NEXTAUTH_URL}/billing?canceled=1`,
    subscription_data: { trial_period_days: 0 }
  });

  return NextResponse.redirect(checkout.url!, 303);
}
