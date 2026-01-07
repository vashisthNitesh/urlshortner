import Razorpay from "razorpay";
import crypto from "crypto";

export function getRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("RAZORPAY credentials not configured");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

export const razorpayPlanLookup = {
  monthly: process.env.RAZORPAY_MONTHLY_PLAN_ID || "plan_monthly_placeholder",
  annual: process.env.RAZORPAY_ANNUAL_PLAN_ID || "plan_annual_placeholder"
};

export function verifyRazorpayWebhook(body: string, signature: string | null) {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET || !signature) return false;
  const digest = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest("hex");
  return digest === signature;
}
