import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@pulselink.test" },
    update: {},
    create: {
      email: "admin@pulselink.test",
      name: "Admin",
      passwordHash: password,
      emailVerified: new Date(),
      role: Role.admin
    }
  });

  console.log("Seeded admin", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
