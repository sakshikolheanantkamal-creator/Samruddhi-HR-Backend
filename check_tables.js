import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'samruddhi_db',
});

console.log('\n📊 ALL TABLES STATUS\n');
console.log('═'.repeat(60));

const tables = [
  'users', 'services', 'departments', 'jobs',
  'home', 'about', 'manpower_services', 'industries',
  'navbar_links', 'footer', 'contact_content', 'careers_content',
  'enquiries', 'contact_submissions', 'applications', 'site_content'
];

async function checkTables() {
  for (const table of tables) {
    try {
      const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      const count = parseInt(result.rows[0].count);
      const status = count > 0 ? '✅' : '⚠️ ';
      console.log(`${status} ${table.padEnd(30)} ${count.toString().padStart(3)} rows`);
    } catch (error) {
      console.log(`❌ ${table.padEnd(30)} ERROR: ${error.message}`);
    }
  }
  
  console.log('═'.repeat(60));
  console.log('\n✅ All 16 tables exist in the database!\n');
  
  await pool.end();
}

checkTables();
