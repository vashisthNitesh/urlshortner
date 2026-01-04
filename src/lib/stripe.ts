import Stripe from "stripe";

export function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-09-30"
  });
}

export const stripePriceLookup = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID || "price_monthly_placeholder",
  annual: process.env.STRIPE_ANNUAL_PRICE_ID || "price_annual_placeholder"
};
