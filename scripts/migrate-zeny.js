const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(url);

async function run() {
  console.log("Checking and adding zeny column to accounts...");
  await sql`
    ALTER TABLE accounts 
    ADD COLUMN IF NOT EXISTS zeny BIGINT DEFAULT 0;
  `;
  console.log("✅ Column zeny added successfully or already exists!");
}

run().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
