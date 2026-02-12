import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkUser() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true }
  });
  console.log("All Users:");
  users.forEach(u => console.log(`  ID: ${u.id}, Email: ${u.email}, Role: ${u.role}`));
  await prisma.$disconnect();
}

checkUser();
