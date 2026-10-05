const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const sql = neon(process.env.DATABASE_URL);

async function check() {
  const users = await sql`SELECT id, username, role FROM users;`;
  console.log('USERS IN DB:', users);
  for (const u of users) {
    const accs = await sql`SELECT id, nickname, username, user_id FROM accounts WHERE user_id = ${u.id};`;
    const acts = await sql`SELECT id, name FROM activities WHERE user_id = ${u.id};`;
    console.log(`User @${u.username} (${u.role}): ${accs.length} accounts, ${acts.length} activities`);
    if (accs.length > 0) {
      console.log('Accounts:', accs);
    }
  }
}
check().catch(console.error);
