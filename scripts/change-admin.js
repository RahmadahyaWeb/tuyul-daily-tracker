const { neon } = require("@neondatabase/serverless");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
require("dotenv").config();

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("❌ DATABASE_URL is not set in .env");
  process.exit(1);
}

const args = process.argv.slice(2);
const newUsername = args[0] || process.env.DEFAULT_ADMIN_USERNAME;
const newPassword = args[1] || process.env.DEFAULT_ADMIN_PASSWORD;

if (!newUsername || !newPassword) {
  console.log(`
Usage:
  node scripts/change-admin.js <new_username> <new_password>

Example:
  node scripts/change-admin.js myadmin StrongPassword99!
`);
  process.exit(1);
}

async function main() {
  const sql = neon(url);
  console.log(`🔐 Updating admin credentials for username: "${newUsername}"...`);

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 1. Check if user with newUsername already exists
  const existing = await sql`SELECT id FROM users WHERE username = ${newUsername} LIMIT 1;`;

  if (existing.length > 0) {
    await sql`
      UPDATE users
      SET password = ${hashedPassword}, updated_at = NOW()
      WHERE username = ${newUsername};
    `;
    console.log(`✅ Updated existing user "${newUsername}" with the new password.`);
  } else {
    // Check if default 'admin' exists and rename/update it, or insert new
    const adminUser = await sql`SELECT id FROM users WHERE username = 'admin' LIMIT 1;`;
    if (adminUser.length > 0) {
      await sql`
        UPDATE users
        SET username = ${newUsername}, password = ${hashedPassword}, updated_at = NOW()
        WHERE id = ${adminUser[0].id};
      `;
      console.log(`✅ Replaced default 'admin' user with "${newUsername}" and updated password.`);
    } else {
      const newId = crypto.randomUUID();
      await sql`
        INSERT INTO users (id, username, password, role, created_at, updated_at)
        VALUES (${newId}, ${newUsername}, ${hashedPassword}, 'ADMIN', NOW(), NOW());
      `;
      console.log(`✅ Created new admin user "${newUsername}".`);
    }
  }

  // Remove old default 'admin' if it is different from newUsername
  if (newUsername !== "admin") {
    await sql`DELETE FROM users WHERE username = 'admin';`;
    console.log(`🗑️ Removed default "admin" user from database.`);
  }

  console.log(`🎉 Success! You can now log in with username "${newUsername}".`);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
