import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { planFeatures, PlanTier } from "./plans";
import { authenticator } from "otplib";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: PlanTier;
      plan: PlanTier;
      ads: boolean;
    } & DefaultSession["user"];
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder"
    }),
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid || !user.emailVerified) return null;
        if (user.twoFactorEnabled) {
          const otpValid = authenticator.check(credentials.otp || "", user.twoFactorSecret || "");
          if (!otpValid) return null;
        }
        return { id: user.id, email: user.email, name: user.name, role: user.role as PlanTier };
      }
    })
  ],
  session: {
    strategy: "database"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async session({ session, user }: any) {
      const role = (user.role as PlanTier) || "free";
      session.user.role = role;
      session.user.plan = role;
      session.user.ads = planFeatures[role].ads;
      session.user.id = user.id;
      return session;
    }
  }
};

export const { handlers: { GET, POST }, auth } = NextAuth(authOptions);
