const { neon } = require("@neondatabase/serverless");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("❌ DATABASE_URL is not set in .env");
  process.exit(1);
}

const args = process.argv.slice(2);
const targetUsername = args[0];
const newPassword = args[1];

async function main() {
  const sql = neon(url);

  if (!targetUsername || !newPassword) {
    console.log(`
==================================================
🔑 Tuyul Tracker - User Password Reset Tool
==================================================

Usage:
  node scripts/reset-password.js <username> <new_password>

Examples:
  node scripts/reset-password.js admin admin123
  node scripts/reset-password.js kageism mynewpass456

Current users in database:`);

    const users = await sql`
      SELECT id, username, role, plan, created_at FROM users ORDER BY created_at ASC;
    `;
    users.forEach((u) => {
      console.log(`  - @${u.username} (${u.role}, Plan: ${u.plan || 'FREE'}, ID: ${u.id})`);
    });
    console.log("==================================================\n");
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error("❌ Error: Password must be at least 6 characters long.");
    process.exit(1);
  }

  console.log(`🔍 Looking for user "@${targetUsername}"...`);
  const users = await sql`
    SELECT id, username, role FROM users 
    WHERE LOWER(username) = LOWER(${targetUsername}) 
    LIMIT 1;
  `;

  if (users.length === 0) {
    console.error(`❌ User "@${targetUsername}" not found in database.`);
    const allUsers = await sql`SELECT username FROM users;`;
    console.log("Available usernames:", allUsers.map((u) => u.username).join(", "));
    process.exit(1);
  }

  const user = users[0];
  console.log(`🔐 Hashing new password for @${user.username} (${user.role})...`);
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await sql`
    UPDATE users 
    SET password = ${hashedPassword}, updated_at = NOW() 
    WHERE id = ${user.id};
  `;

  console.log(`
✅ SUCCESS: Password for user "@${user.username}" has been successfully updated!
👉 You can now log in at /login with:
   Username: ${user.username}
   Password: ${newPassword}
`);
}

main().catch((err) => {
  console.error("❌ Error resetting password:", err);
  process.exit(1);
});
