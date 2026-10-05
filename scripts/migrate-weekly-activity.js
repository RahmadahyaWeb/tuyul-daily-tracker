const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("❌ DATABASE_URL is not set in .env");
  process.exit(1);
}

const sql = neon(url);

async function run() {
  console.log("🚀 Running migration for activity_type (Daily vs Weekly)...");
  
  // 1. Add activity_type column to activities table
  await sql`
    ALTER TABLE activities 
    ADD COLUMN IF NOT EXISTS activity_type TEXT NOT NULL DEFAULT 'DAILY';
  `;

  // 2. Set FM (Final Mirage) to WEEKLY
  await sql`
    UPDATE activities 
    SET activity_type = 'WEEKLY' 
    WHERE UPPER(code) = 'FM' OR UPPER(name) LIKE '%FINAL MIRAGE%';
  `;

  console.log("✅ DB Migration for activity_type completed successfully!");
}

run().catch((err) => {
  console.error("❌ Migration error:", err);
  process.exit(1);
});
