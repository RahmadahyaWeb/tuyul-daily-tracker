const { neon } = require("@neondatabase/serverless");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
require("dotenv").config();

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("❌ DATABASE_URL is not set in .env");
  process.exit(1);
}

const sql = neon(url);

function encryptPassword(plainText) {
  const secretHex =
    process.env.ENCRYPTION_SECRET ||
    "7f8b9a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90";
  const key = Buffer.from(secretHex.slice(0, 64), "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

async function init() {
  console.log("🚀 Initializing Neon PostgreSQL Database via @neondatabase/serverless...");

  // 1. Create Tables
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'ADMIN',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      sort_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      nickname TEXT NOT NULL,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      server TEXT NOT NULL,
      owner TEXT NOT NULL,
      job TEXT NOT NULL,
      level INT DEFAULT 1,
      start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      status TEXT DEFAULT 'Active',
      notes TEXT,
      group_id TEXT REFERENCES groups(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS account_activities (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(account_id, activity_id)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      activity_date TEXT NOT NULL,
      is_completed BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(account_id, activity_id, activity_date)
    );
  `;

  // 2. Set defaults for updated_at if they were created without defaults
  await sql`ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT NOW();`;
  await sql`ALTER TABLE groups ALTER COLUMN updated_at SET DEFAULT NOW();`;
  await sql`ALTER TABLE activities ALTER COLUMN updated_at SET DEFAULT NOW();`;
  await sql`ALTER TABLE accounts ALTER COLUMN updated_at SET DEFAULT NOW();`;
  await sql`ALTER TABLE account_activities ALTER COLUMN updated_at SET DEFAULT NOW();`;
  await sql`ALTER TABLE activity_logs ALTER COLUMN updated_at SET DEFAULT NOW();`;

  // 3. Create Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON activity_logs (activity_date);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_activity_logs_acc_date ON activity_logs (account_id, activity_date);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts (status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_accounts_group ON accounts (group_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_account_activities_acc ON account_activities (account_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_activities_sort ON activities (sort_order);`;

  console.log("✅ Tables and indexes ready.");

  // 4. Seed Admin User
  const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || "admin";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "adminpassword123";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const adminId = crypto.randomUUID();

  await sql`
    INSERT INTO users (id, username, password, role, created_at, updated_at)
    VALUES (${adminId}, ${adminUsername}, ${hashedPassword}, 'ADMIN', NOW(), NOW())
    ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, updated_at = NOW();
  `;
  console.log(`✅ Admin user verified: ${adminUsername}`);

  // 5. Seed Master Activities
  const masterActivities = [
    { id: "act-mh600", name: "Monster Hunt 600", code: "MH600", sortOrder: 0 },
    { id: "act-mh3000", name: "Monster Hunt 3000", code: "MH3000", sortOrder: 1 },
    { id: "act-mission", name: "Mission Board", code: "MISSION", sortOrder: 2 },
    { id: "act-guild", name: "Guild Daily", code: "GUILD", sortOrder: 3 },
    { id: "act-tc", name: "TC", code: "TC", sortOrder: 4 },
    { id: "act-arena", name: "Arena", code: "ARENA", sortOrder: 5 },
    { id: "act-fm", name: "Final Mirage", code: "FM", sortOrder: 6 },
  ];

  for (const act of masterActivities) {
    await sql`
      INSERT INTO activities (id, name, code, sort_order, is_active, created_at, updated_at)
      VALUES (${act.id}, ${act.name}, ${act.code}, ${act.sortOrder}, TRUE, NOW(), NOW())
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;
    `;
  }
  console.log(`✅ Seeded ${masterActivities.length} master activities`);

  // 6. Seed Sample Groups
  const groups = [
    { id: "grp-personal", name: "Personal" },
    { id: "grp-client-a", name: "Client A" },
    { id: "grp-farm-card", name: "Farm Card" },
  ];

  for (const g of groups) {
    await sql`
      INSERT INTO groups (id, name, created_at, updated_at)
      VALUES (${g.id}, ${g.name}, NOW(), NOW())
      ON CONFLICT (name) DO NOTHING;
    `;
  }
  console.log("✅ Seeded sample groups");

  // 7. Seed Sample Accounts if empty
  const existingAccounts = await sql`SELECT count(*) as count FROM accounts;`;
  if (parseInt(existingAccounts[0].count, 10) === 0) {
    const sampleAccounts = [
      {
        id: crypto.randomUUID(),
        nickname: "Rynzo",
        username: "rynzo_ro",
        password: encryptPassword("rynzo123"),
        server: "Prontera-1",
        owner: "Personal",
        job: "Assassin Cross",
        level: 85,
        groupId: "grp-personal",
      },
      {
        id: crypto.randomUUID(),
        nickname: "Velric",
        username: "velric_ro",
        password: encryptPassword("velric123"),
        server: "Prontera-1",
        owner: "Personal",
        job: "High Wizard",
        level: 82,
        groupId: "grp-personal",
      },
      {
        id: crypto.randomUUID(),
        nickname: "Kaizen",
        username: "kaizen_farm",
        password: encryptPassword("kaizen123"),
        server: "Geffen-2",
        owner: "Client A",
        job: "Sniper",
        level: 79,
        groupId: "grp-client-a",
      },
      {
        id: crypto.randomUUID(),
        nickname: "ShadowFarm",
        username: "shadow_bot1",
        password: encryptPassword("shadow123"),
        server: "Morroc-1",
        owner: "Farm Card",
        job: "Whitesmith",
        level: 90,
        groupId: "grp-farm-card",
      },
    ];

    for (const acc of sampleAccounts) {
      await sql`
        INSERT INTO accounts (id, nickname, username, password, server, owner, job, level, group_id, status, created_at, updated_at)
        VALUES (${acc.id}, ${acc.nickname}, ${acc.username}, ${acc.password}, ${acc.server}, ${acc.owner}, ${acc.job}, ${acc.level}, ${acc.groupId}, 'Active', NOW(), NOW());
      `;

      for (const act of masterActivities) {
        const aaId = crypto.randomUUID();
        await sql`
          INSERT INTO account_activities (id, account_id, activity_id, is_active, created_at, updated_at)
          VALUES (${aaId}, ${acc.id}, ${act.id}, TRUE, NOW(), NOW())
          ON CONFLICT (account_id, activity_id) DO NOTHING;
        `;
      }
    }
    console.log(`✅ Seeded ${sampleAccounts.length} sample accounts with custom activities`);
  }

  console.log("🎉 Neon PostgreSQL initialization completed successfully!");
}

init().catch((err) => {
  console.error("❌ Init error:", err);
  process.exit(1);
});
