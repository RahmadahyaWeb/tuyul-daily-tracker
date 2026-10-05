const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const prisma = new PrismaClient();

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function encryptPassword(plainText) {
  if (!plainText) return "";
  const secret =
    process.env.ENCRYPTION_SECRET ||
    "7f8b9a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90";
  const key = crypto.createHash("sha256").update(secret).digest();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Seed Admin User
  const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || "admin";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "adminpassword123";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user seeded: ${adminUsername}`);

  // 2. Seed Default Master Activities
  const defaultActivities = [
    { name: "Monster Hunt 600", code: "MH600", sortOrder: 0 },
    { name: "Monster Hunt 3000", code: "MH3000", sortOrder: 1 },
    { name: "Mission Board", code: "MISSION", sortOrder: 2 },
    { name: "Guild Daily", code: "GUILD", sortOrder: 3 },
    { name: "TC", code: "TC", sortOrder: 4 },
    { name: "Arena", code: "ARENA", sortOrder: 5 },
    { name: "Final Mirage", code: "FM", sortOrder: 6 },
  ];

  const createdActivities = [];
  for (const act of defaultActivities) {
    const activity = await prisma.activity.upsert({
      where: { code: act.code },
      update: { name: act.name, sortOrder: act.sortOrder, isActive: true },
      create: {
        name: act.name,
        code: act.code,
        sortOrder: act.sortOrder,
        isActive: true,
      },
    });
    createdActivities.push(activity);
  }
  console.log(`✅ Seeded ${createdActivities.length} master activities`);

  // 3. Seed Sample Groups
  const groupPersonal = await prisma.group.upsert({
    where: { name: "Personal" },
    update: {},
    create: { name: "Personal" },
  });

  const groupClientA = await prisma.group.upsert({
    where: { name: "Client A" },
    update: {},
    create: { name: "Client A" },
  });

  const groupFarmCard = await prisma.group.upsert({
    where: { name: "Farm Card" },
    update: {},
    create: { name: "Farm Card" },
  });
  console.log("✅ Seeded sample groups");

  // 4. Seed Sample Accounts if table is empty
  const accountCount = await prisma.account.count();
  if (accountCount === 0) {
    const accountsData = [
      {
        nickname: "Rynzo",
        username: "rynzo_ro",
        password: encryptPassword("SecretPass#123"),
        server: "Prontera-1",
        owner: "Rahmad",
        job: "Assassin Cross",
        level: 88,
        status: "Active",
        notes: "Fokus leveling dan MH. FM belum unlock.",
        groupId: groupPersonal.id,
        // Active activities: MH600, MH3000, MISSION, ARENA
        activityCodes: ["MH600", "MH3000", "MISSION", "ARENA"],
      },
      {
        nickname: "Velric",
        username: "velric_priest",
        password: encryptPassword("HolyLight@2026"),
        server: "Prontera-1",
        owner: "Rahmad",
        job: "High Priest",
        level: 92,
        status: "Active",
        notes: "Full daily checklist account.",
        groupId: groupPersonal.id,
        activityCodes: ["MH600", "MH3000", "MISSION", "GUILD", "TC", "ARENA", "FM"],
      },
      {
        nickname: "Kaizen",
        username: "kaizen_sniper",
        password: encryptPassword("ArrowStorm!99"),
        server: "Geffen-2",
        owner: "Client A",
        job: "Sniper",
        level: 90,
        status: "Active",
        notes: "Akun titipan client A. Selesaikan sebelum jam 18:00.",
        groupId: groupClientA.id,
        activityCodes: ["MH600", "MH3000", "MISSION", "GUILD", "TC", "ARENA", "FM"],
      },
      {
        nickname: "ShadowFarm",
        username: "shadow_farm01",
        password: encryptPassword("FarmingPass#01"),
        server: "Morroc-1",
        owner: "Rahmad",
        job: "Stalker",
        level: 82,
        status: "Active",
        notes: "Minggu ini fokus farming card di Pyramids.",
        groupId: groupFarmCard.id,
        activityCodes: ["MH600", "MH3000", "MISSION", "GUILD"],
      },
    ];

    const actMap = new Map(createdActivities.map((a) => [a.code, a.id]));

    for (const accData of accountsData) {
      const { activityCodes, ...rest } = accData;
      const account = await prisma.account.create({
        data: rest,
      });

      const validActivityIds = activityCodes
        .map((code) => actMap.get(code))
        .filter(Boolean);

      if (validActivityIds.length > 0) {
        await prisma.accountActivity.createMany({
          data: validActivityIds.map((actId) => ({
            accountId: account.id,
            activityId: actId,
            isActive: true,
          })),
        });
      }
    }
    console.log(`✅ Seeded ${accountsData.length} sample accounts with custom activities`);
  }

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
