import { query, initDatabase } from './src/config/db.js';
async function run() {
  await initDatabase();
  const res = await query("SELECT value FROM site_content WHERE key = 'about_content'");
  console.log(JSON.stringify(res.rows[0]?.value, null, 2));
  process.exit(0);
}
run();
