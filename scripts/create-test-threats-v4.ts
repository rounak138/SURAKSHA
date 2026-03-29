import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const baseLat = 30.2785;
  const baseLng = 78.0020;
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const threats = [
    {
      lat: baseLat + 0.006,
      lng: baseLng + 0.001,
      location: "Rajpur Road Market (Armed Robbery)",
      score: 78,
      zone: "RED",
      summary: "HIGH RISK: Armed gang carrying weapons sighted in the busy Rajpur Road market area. Multiple shopkeepers reported threats. Avoid immediately.",
      status: "PENDING",
      expiresAt: new Date(now + 48 * 60 * 60 * 1000),
    },
    {
      lat: baseLat - 0.007,
      lng: baseLng + 0.005,
      location: "Clock Tower Chowk (Crowd Stampede Risk)",
      score: 72,
      zone: "RED",
      summary: "HIGH RISK: Dangerously overcrowded religious procession at Clock Tower. Risk of stampede. Police cordon in effect. Tourists advised to stay away.",
      status: "PENDING",
      expiresAt: new Date(now + 48 * 60 * 60 * 1000),
    },
    {
      lat: baseLat + 0.004,
      lng: baseLng - 0.006,
      location: "Paltan Bazaar (Pickpocket Hotspot)",
      score: 62,
      zone: "ORANGE",
      summary: "ELEVATED RISK: Multiple tourist wallets and mobile phones stolen at Paltan Bazaar this afternoon. Organized gang operating in the area.",
      status: "PENDING",
      expiresAt: new Date(now + 7 * DAY),
    },
    {
      lat: baseLat - 0.003,
      lng: baseLng - 0.004,
      location: "Haridwar Bypass Road (Vehicle Theft)",
      score: 58,
      zone: "ORANGE",
      summary: "ELEVATED RISK: Spike in tourist vehicle break-ins on Haridwar Bypass. Travel in convoy after dark. Report suspicious activity to local police.",
      status: "PENDING",
      expiresAt: new Date(now + 7 * DAY),
    },
    {
      lat: baseLat + 0.008,
      lng: baseLng - 0.003,
      location: "Forest Trail (Wildlife Alert)",
      score: 55,
      zone: "ORANGE",
      summary: "ELEVATED RISK: Wild elephant spotted 500m off the main forest trail near the waterfall trek route. Forest department has issued alert.",
      status: "PENDING",
      expiresAt: new Date(now + 7 * DAY),
    },
  ];

  for (const t of threats) {
    await (prisma.threatZone as any).create({ data: t });
    console.log(`  ✓ Created: ${t.zone} — ${t.location}`);
  }

  console.log(`\n✅ ${threats.length} more threat zones added to the database!`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
