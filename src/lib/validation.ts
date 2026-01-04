import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2)
});

export const linkSchema = z.object({
  url: z.string().url(),
  slug: z.string().min(3).max(40),
  domain: z.string().optional(),
  title: z.string().optional(),
  password: z.string().min(4).optional(),
  expiresAt: z.coerce.date().optional(),
  utm: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
      term: z.string().optional(),
      content: z.string().optional()
    })
    .optional(),
  folderId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["active", "paused"]).default("active"),
  isPremium: z.boolean().default(false)
});

export const bulkSchema = z.object({
  links: z.array(linkSchema.extend({ slug: z.string().optional() })).max(1000)
});

export const updateLinkSchema = linkSchema.partial();

export const domainSchema = z.object({
  hostname: z.string().min(3),
  verified: z.boolean().optional()
});

export const abuseSchema = z.object({
  linkId: z.string(),
  reason: z.string().min(5)
});
