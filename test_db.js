import { query, initDatabase } from './src/config/db.js';

async function test() {
  await initDatabase();
  const res = await query("SELECT value FROM site_content WHERE key = 'homepage_content'");
  console.log("HOMEPAGE CONTENT VALUE IN DB:", JSON.stringify(res.rows[0]?.value, null, 2));
  process.exit(0);
}

test().catch(console.error);
