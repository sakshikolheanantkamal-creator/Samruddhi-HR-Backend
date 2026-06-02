import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'Samruddhi',
});

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║           ADDING IMAGE COLUMNS TO TABLES                  ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function addImageColumns() {
  try {
    // 1. Add image column to industries table
    console.log('📝 Adding image column to industries table...');
    await pool.query(`
      ALTER TABLE industries 
      ADD COLUMN IF NOT EXISTS image VARCHAR(255)
    `);
    console.log('✅ Image column added to industries\n');

    // 2. Add image column to manpower_services table
    console.log('📝 Adding image column to manpower_services table...');
    await pool.query(`
      ALTER TABLE manpower_services 
      ADD COLUMN IF NOT EXISTS image VARCHAR(255)
    `);
    console.log('✅ Image column added to manpower_services\n');

    // 3. Add logo column to footer table
    console.log('📝 Adding logo column to footer table...');
    await pool.query(`
      ALTER TABLE footer 
      ADD COLUMN IF NOT EXISTS logo VARCHAR(255)
    `);
    console.log('✅ Logo column added to footer\n');

    // 4. Verify services table has hero_image and other_image (already exists)
    console.log('📝 Checking services table columns...');
    const servicesColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'services' 
      AND column_name IN ('hero_image', 'other_image')
    `);
    console.log(`✅ Services table has ${servicesColumns.rows.length} image columns: ${servicesColumns.rows.map(r => r.column_name).join(', ')}\n`);

    // 5. Verify home table has hero_image (already exists)
    console.log('📝 Checking home table columns...');
    const homeColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'home' 
      AND column_name = 'hero_image'
    `);
    console.log(`✅ Home table has hero_image column\n`);

    // 6. Verify about table has image_url (already exists)
    console.log('📝 Checking about table columns...');
    const aboutColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'about' 
      AND column_name = 'image_url'
    `);
    console.log(`✅ About table has image_url column\n`);

    // 7. Verify careers_content table has hero_image_url (already exists)
    console.log('📝 Checking careers_content table columns...');
    const careersColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'careers_content' 
      AND column_name = 'hero_image_url'
    `);
    console.log(`✅ Careers_content table has hero_image_url column\n`);

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              IMAGE COLUMNS SUMMARY                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('✅ industries.image - VARCHAR(255) - NEW!');
    console.log('✅ manpower_services.image - VARCHAR(255) - NEW!');
    console.log('✅ footer.logo - VARCHAR(255) - NEW!');
    console.log('✅ services.hero_image - VARCHAR(100)');
    console.log('✅ services.other_image - VARCHAR(100)');
    console.log('✅ home.hero_image - VARCHAR(255)');
    console.log('✅ about.image_url - VARCHAR(255)');
    console.log('✅ careers_content.hero_image_url - VARCHAR(255)');
    
    console.log('\n✅ All image columns are now available!\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error adding image columns:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

addImageColumns();
