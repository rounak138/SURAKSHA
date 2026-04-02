import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.threatZone.deleteMany({});
  console.log(`Deleted ${result.count} ThreatZone records.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
