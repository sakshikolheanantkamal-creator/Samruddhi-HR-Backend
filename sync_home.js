import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

const ROOT_DIR = process.cwd();
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
dotenv.config({ path: path.join(BACKEND_DIR, '.env') });

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function syncHomeTable() {
  try {
    console.log('🔄 Syncing home table with CMS data...');

    // 1. Get data from site_content (homepage_content key)
    const cmsResult = await pool.query("SELECT value FROM site_content WHERE key = 'homepage_content'");
    if (cmsResult.rows.length === 0) {
      console.error('❌ No CMS data found for homepage_content');
      return;
    }
    const cmsHome = cmsResult.rows[0].value;
    console.log(`📦 CMS Home data found.`);

    // 2. Update the home table with CMS data
    console.log('📥 Updating home table with CMS data...');
    
    await pool.query(
      `UPDATE home SET 
        hero_badge = $1, 
        hero_title = $2, 
        hero_desc_1 = $3, 
        hero_desc_2 = $4, 
        hero_desc_3 = $5, 
        highlights = $6, 
        whatsapp_number = $7, 
        stats_years = $8, 
        stats_clients = $9, 
        hero_image = $10,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      [
        cmsHome.hero_badge,
        cmsHome.hero_title,
        cmsHome.hero_desc_1,
        cmsHome.hero_desc_2,
        cmsHome.hero_desc_3,
        JSON.stringify(cmsHome.highlights || []),
        cmsHome.whatsapp_number,
        cmsHome.stats_years,
        cmsHome.stats_clients,
        cmsHome.hero_image
      ]
    );

    console.log('\n✨ Home table is now EXACTLY synced with CMS data!');
    
    // Verify sync
    const finalResult = await pool.query("SELECT * FROM home WHERE id = 1");
    console.log('--- VERIFIED HOME TABLE DATA ---');
    console.log(JSON.stringify(finalResult.rows[0], null, 2));
    
    await pool.end();
  } catch (err) {
    console.error('❌ Sync failed:', err);
    await pool.end();
  }
}

syncHomeTable();
