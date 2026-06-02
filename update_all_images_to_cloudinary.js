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

// Your Cloudinary base URL
const CLOUDINARY_BASE = 'https://res.cloudinary.com/dwt48llcd/image/upload';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║      UPDATING ALL IMAGES TO CLOUDINARY URLs               ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function updateAllImagesToCloudinary() {
  try {
    // 1. Update HOME table - hero_image
    console.log('📝 Updating HOME table...');
    await pool.query(`
      UPDATE home 
      SET hero_image = '${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/hero-home.jpg'
      WHERE hero_image IS NULL OR hero_image NOT LIKE 'https://res.cloudinary.com%'
    `);
    console.log('✅ HOME table updated\n');

    // 2. Update ABOUT table - image_url
    console.log('📝 Updating ABOUT table...');
    await pool.query(`
      UPDATE about 
      SET image_url = '${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/about-us.jpg'
      WHERE image_url IS NULL OR image_url NOT LIKE 'https://res.cloudinary.com%'
    `);
    console.log('✅ ABOUT table updated\n');

    // 3. Update INDUSTRIES table - image
    console.log('📝 Updating INDUSTRIES table...');
    const industries = await pool.query('SELECT id, title FROM industries');
    const industryImages = {
      'Manufacturing & Production': `${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/industry-manufacturing.jpg`,
      'Logistics & Warehousing': `${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/industry-logistics.jpg`,
      'Retail & E-commerce': `${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/industry-retail.jpg`,
      'IT & Technology': `${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/industry-it.jpg`,
      'Healthcare': `${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/industry-healthcare.jpg`,
      'Corporate & BFSI': `${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/industry-corporate.jpg`,
    };

    for (const industry of industries.rows) {
      const imageUrl = industryImages[industry.title] || `${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/industry-default.jpg`;
      await pool.query('UPDATE industries SET image = $1 WHERE id = $2', [imageUrl, industry.id]);
    }
    console.log(`✅ ${industries.rows.length} industries updated\n`);

    // 4. Update MANPOWER_SERVICES table - image
    console.log('📝 Updating MANPOWER_SERVICES table...');
    const services = await pool.query('SELECT id, title FROM manpower_services');
    const serviceImages = {
      'Contract / Temporary Manpower Services': `${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/service-contract.jpg`,
      'Permanent Staffing & Recruitment': `${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/service-permanent.jpg`,
      'Bulk & Mass Hiring': `${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/service-bulk-hiring.jpg`,
      'Payroll & Statutory Compliance': `${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/service-payroll.jpg`,
    };

    for (const service of services.rows) {
      const imageUrl = serviceImages[service.title] || `${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/service-default.jpg`;
      await pool.query('UPDATE manpower_services SET image = $1 WHERE id = $2', [imageUrl, service.id]);
    }
    console.log(`✅ ${services.rows.length} manpower services updated\n`);

    // 5. Update SERVICES table - hero_image and other_image
    console.log('📝 Updating SERVICES table...');
    const allServices = await pool.query('SELECT id, slug FROM services');
    for (const svc of allServices.rows) {
      const slug = svc.slug.replace(/[^a-z0-9]/g, '-');
      await pool.query(`
        UPDATE services 
        SET 
          hero_image = $1,
          other_image = $2
        WHERE id = $3
      `, [
        `${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/service-${slug}-hero.jpg`,
        `${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/service-${slug}-detail.jpg`,
        svc.id
      ]);
    }
    console.log(`✅ ${allServices.rows.length} services updated\n`);

    // 6. Update FOOTER table - logo
    console.log('📝 Updating FOOTER table...');
    await pool.query(`
      UPDATE footer 
      SET logo = '${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/logo.png'
      WHERE logo IS NULL OR logo NOT LIKE 'https://res.cloudinary.com%'
    `);
    console.log('✅ FOOTER table updated\n');

    // 7. Update CAREERS_CONTENT table - hero_image_url
    console.log('📝 Updating CAREERS_CONTENT table...');
    await pool.query(`
      UPDATE careers_content 
      SET hero_image_url = '${CLOUDINARY_BASE}/v1780045779/samruddhi-hr/careers-hero.jpg'
      WHERE hero_image_url IS NULL OR hero_image_url NOT LIKE 'https://res.cloudinary.com%'
    `);
    console.log('✅ CAREERS_CONTENT table updated\n');

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║           ALL IMAGES UPDATED TO CLOUDINARY                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Show updated tables
    console.log('📊 UPDATED TABLES:\n');
    
    const tables = [
      { name: 'home', column: 'hero_image' },
      { name: 'about', column: 'image_url' },
      { name: 'industries', column: 'image' },
      { name: 'manpower_services', column: 'image' },
      { name: 'services', column: 'hero_image' },
      { name: 'footer', column: 'logo' },
      { name: 'careers_content', column: 'hero_image_url' }
    ];

    for (const table of tables) {
      const result = await pool.query(`
        SELECT COUNT(*) as count 
        FROM ${table.name} 
        WHERE ${table.column} LIKE 'https://res.cloudinary.com%'
      `);
      console.log(`✅ ${table.name}.${table.column.padEnd(20)} - ${result.rows[0].count} rows with Cloudinary URLs`);
    }

    console.log('\n✅ All images now use Cloudinary URLs!\n');
    console.log('📝 Note: These are placeholder URLs. Upload actual images through admin panel.\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error updating images:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

updateAllImagesToCloudinary();
