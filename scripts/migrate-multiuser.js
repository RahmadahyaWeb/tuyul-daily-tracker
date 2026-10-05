const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("❌ DATABASE_URL is not set in .env");
  process.exit(1);
}

const sql = neon(url);

async function migrateMultiUser() {
  console.log("🚀 Starting Multi-User Database Migration on Neon PostgreSQL...");

  // 1. Get first existing user to assign existing data
  const users = await sql`SELECT id, username FROM users ORDER BY created_at ASC LIMIT 1;`;
  let primaryUserId = null;
  if (users.length > 0) {
    primaryUserId = users[0].id;
    console.log(`ℹ️ Found existing primary user: "${users[0].username}" (${primaryUserId})`);
  } else {
    console.log("ℹ️ No existing users found.");
  }

  // 2. Add user_id column to accounts
  console.log("Adding user_id to accounts...");
  await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;`;

  // 3. Add user_id column to groups
  console.log("Adding user_id to groups...");
  await sql`ALTER TABLE groups ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;`;

  // 4. Add user_id column to activities
  console.log("Adding user_id to activities...");
  await sql`ALTER TABLE activities ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;`;

  // 5. If we have existing user, backfill user_id on accounts, groups, activities
  if (primaryUserId) {
    console.log("Backfilling existing data to primary user...");
    await sql`UPDATE accounts SET user_id = ${primaryUserId} WHERE user_id IS NULL;`;
    await sql`UPDATE groups SET user_id = ${primaryUserId} WHERE user_id IS NULL;`;
    await sql`UPDATE activities SET user_id = ${primaryUserId} WHERE user_id IS NULL;`;
  }

  // 6. Fix constraints on activities & groups
  // Drop global unique constraint on activities(code) if exists, replace with UNIQUE(user_id, code)
  console.log("Adjusting unique constraints...");
  try {
    await sql`ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_code_key;`;
  } catch (e) {
    console.log("Note on activities_code_key drop:", e.message);
  }

  try {
    await sql`ALTER TABLE groups DROP CONSTRAINT IF EXISTS groups_name_key;`;
  } catch (e) {
    console.log("Note on groups_name_key drop:", e.message);
  }

  // 7. Create indexes for user_id on all multi-tenant tables
  console.log("Creating indexes for user_id...");
  await sql`CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts (user_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_groups_user_id ON groups (user_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities (user_id);`;

  console.log("🎉 Multi-User Migration successfully completed!");
}

migrateMultiUser().catch((err) => {
  console.error("❌ Migration error:", err);
  process.exit(1);
});
