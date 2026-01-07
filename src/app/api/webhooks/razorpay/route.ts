import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyRazorpayWebhook } from "@/lib/razorpay";

type RazorpaySubscriptionEntity = {
  id: string;
  status: string;
  customer_id?: string;
};

type RazorpayWebhookPayload = {
  event: string;
  payload?: {
    subscription?: {
      entity: RazorpaySubscriptionEntity;
    };
  };
};

export async function POST(request: NextRequest) {
  const signature = headers().get("x-razorpay-signature");
  const body = await request.text();

  if (!verifyRazorpayWebhook(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body) as RazorpayWebhookPayload;
  const subscription = event.payload?.subscription?.entity;
  if (!subscription?.customer_id) {
    return NextResponse.json({ received: true });
  }

  switch (event.event) {
    case "subscription.activated":
    case "subscription.updated":
    case "subscription.charged":
    case "subscription.halted":
    case "subscription.cancelled":
    case "subscription.completed":
      await prisma.user.updateMany({
        where: { razorpayCustomerId: subscription.customer_id },
        data: {
          razorpaySubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          role: subscription.status === "active" ? "premium" : "free"
        }
      });
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
