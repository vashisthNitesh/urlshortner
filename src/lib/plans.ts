export type PlanTier = "free" | "premium" | "admin";

export const planFeatures = {
  free: {
    name: "Free (Ad-supported)",
    monthlyLinks: 50,
    analyticsRetentionDays: 14,
    customDomains: 0,
    bulkLimit: 20,
    rateLimitPerMinute: 30,
    passwordLinks: false,
    expiration: false,
    customDomain: false,
    utmBuilder: true,
    exportAnalytics: false,
    qrCodes: true,
    twoFactor: false,
    ads: true
  },
  premium: {
    name: "Premium",
    monthlyLinks: 5000,
    analyticsRetentionDays: 365,
    customDomains: 3,
    bulkLimit: 1000,
    rateLimitPerMinute: 120,
    passwordLinks: true,
    expiration: true,
    customDomain: true,
    utmBuilder: true,
    exportAnalytics: true,
    qrCodes: true,
    twoFactor: true,
    ads: false
  },
  admin: {
    name: "Administrator",
    monthlyLinks: 10000,
    analyticsRetentionDays: 365,
    customDomains: 10,
    bulkLimit: 2000,
    rateLimitPerMinute: 240,
    passwordLinks: true,
    expiration: true,
    customDomain: true,
    utmBuilder: true,
    exportAnalytics: true,
    qrCodes: true,
    twoFactor: true,
    ads: false
  }
};

export type PlanFeature = typeof planFeatures.free;

export const RESERVED_SLUGS = new Set([
  "api",
  "admin",
  "login",
  "signup",
  "register",
  "dashboard",
  "pricing",
  "faq",
  "contact",
  "privacy",
  "terms",
  "cookies",
  "billing",
  "settings",
  "r"
]);
