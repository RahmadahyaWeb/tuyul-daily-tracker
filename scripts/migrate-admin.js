const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("❌ DATABASE_URL is not set in .env");
  process.exit(1);
}

const sql = neon(url);

async function run() {
  console.log("🚀 Running migration for Admin Console and Billing Requests...");
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'FREE';`;
  await sql`
    CREATE TABLE IF NOT EXISTS billing_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT NOT NULL DEFAULT 'PRO',
      status TEXT NOT NULL DEFAULT 'PENDING',
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  await sql`UPDATE users SET plan = 'PRO' WHERE role = 'ADMIN';`;
  console.log("✅ DB Migration for Admin Console & Billing Requests completed successfully!");
}

run().catch((err) => {
  console.error("❌ Migration error:", err);
  process.exit(1);
});
