import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

console.log('====================================');
console.log('DATABASE SETUP - ALL TABLES');
console.log('====================================\n');

// Database configuration
const systemPoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'postgres',
};

const appPoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'samruddhi_db',
};

async function createDatabase() {
  const tempPool = new Pool(systemPoolConfig);
  try {
    const dbName = process.env.DB_NAME || 'samruddhi_db';
    const res = await tempPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (res.rowCount === 0) {
      console.log(`📦 Creating database '${dbName}'...`);
      await tempPool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database '${dbName}' created successfully.\n`);
    } else {
      console.log(`✅ Database '${dbName}' already exists.\n`);
    }
  } catch (err) {
    console.error('❌ Error creating database:', err.message);
    throw err;
  } finally {
    await tempPool.end();
  }
}

async function createTables() {
  const pool = new Pool(appPoolConfig);
  
  try {
    console.log('📋 Creating tables...\n');

    // 1. Users table
    console.log('  Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Services table
    console.log('  Creating services table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(100) NOT NULL,
        tagline VARCHAR(255),
        hero_image VARCHAR(255),
        other_image VARCHAR(255),
        overview TEXT,
        what_we_do JSONB DEFAULT '[]'::jsonb,
        who_is_for JSONB DEFAULT '[]'::jsonb,
        key_benefits JSONB DEFAULT '[]'::jsonb,
        cta TEXT,
        button_name VARCHAR(50) DEFAULT 'Contact Us',
        link VARCHAR(100) DEFAULT '/enquiry',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Departments table
    console.log('  Creating departments table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) UNIQUE NOT NULL,
        icon VARCHAR(50),
        color VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Jobs table
    console.log('  Creating jobs table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Enquiries table
    console.log('  Creating enquiries table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(150) NOT NULL,
        contact_person VARCHAR(100) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL,
        industry_type VARCHAR(100),
        location VARCHAR(100),
        service_required VARCHAR(100),
        manpower_type VARCHAR(100),
        manpower_number VARCHAR(50),
        requirement_details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Contact submissions table
    console.log('  Creating contact_submissions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Applications table
    console.log('  Creating applications table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL,
        location VARCHAR(100),
        experience VARCHAR(50),
        job_role VARCHAR(100),
        resume_path VARCHAR(255),
        message TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. Home page content table
    console.log('  Creating home table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS home (
        id SERIAL PRIMARY KEY,
        hero_badge VARCHAR(255),
        hero_title VARCHAR(255),
        hero_desc_1 TEXT,
        hero_desc_2 TEXT,
        hero_desc_3 TEXT,
        highlights JSONB DEFAULT '[]'::jsonb,
        whatsapp_number VARCHAR(20),
        stats_years VARCHAR(20),
        stats_clients VARCHAR(20),
        hero_image VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 9. About page content table
    console.log('  Creating about table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS about (
        id SERIAL PRIMARY KEY,
        image_url VARCHAR(255),
        paragraphs JSONB DEFAULT '[]'::jsonb,
        vision TEXT,
        missions JSONB DEFAULT '[]'::jsonb,
        features JSONB DEFAULT '[]'::jsonb,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 10. Manpower Services table
    console.log('  Creating manpower_services table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS manpower_services (
        id SERIAL PRIMARY KEY,
        icon VARCHAR(50),
        title VARCHAR(150) NOT NULL,
        description TEXT,
        features JSONB DEFAULT '[]'::jsonb,
        color VARCHAR(20),
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 11. Industries table
    console.log('  Creating industries table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS industries (
        id SERIAL PRIMARY KEY,
        icon VARCHAR(50),
        title VARCHAR(150) NOT NULL,
        description TEXT,
        color VARCHAR(20),
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 12. Navbar links table
    console.log('  Creating navbar_links table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS navbar_links (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        path VARCHAR(255),
        is_dropdown BOOLEAN DEFAULT false,
        parent_id INTEGER REFERENCES navbar_links(id) ON DELETE CASCADE,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 13. Footer content table
    console.log('  Creating footer table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS footer (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(150),
        tagline TEXT,
        description TEXT,
        address TEXT,
        phone VARCHAR(50),
        email VARCHAR(100),
        social_links JSONB DEFAULT '{}'::jsonb,
        quick_links JSONB DEFAULT '[]'::jsonb,
        services_links JSONB DEFAULT '[]'::jsonb,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 14. Careers page content table
    console.log('  Creating careers_content table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS careers_content (
        id SERIAL PRIMARY KEY,
        hero_badge VARCHAR(255),
        hero_heading_line_1 VARCHAR(255),
        hero_heading_line_2 VARCHAR(255),
        hero_paragraphs JSONB DEFAULT '[]'::jsonb,
        hero_button_1_text VARCHAR(100),
        hero_button_1_link VARCHAR(255),
        hero_button_2_text VARCHAR(100),
        hero_button_2_link VARCHAR(255),
        hero_image_url VARCHAR(255),
        why_title VARCHAR(255),
        why_subtitle TEXT,
        why_benefits JSONB DEFAULT '[]'::jsonb,
        opportunities_title VARCHAR(255),
        opportunities_subtitle TEXT,
        eligibility_left_title VARCHAR(255),
        eligibility_right_title VARCHAR(255),
        eligibility_can_apply JSONB DEFAULT '[]'::jsonb,
        eligibility_looking_for JSONB DEFAULT '[]'::jsonb,
        contact_heading VARCHAR(255),
        contact_subtitle TEXT,
        contact_intro TEXT,
        contact_email VARCHAR(100),
        contact_whatsapp VARCHAR(20),
        contact_email_button VARCHAR(100),
        contact_whatsapp_button VARCHAR(100),
        commitment_title VARCHAR(255),
        commitment_description TEXT,
        commitment_commitments JSONB DEFAULT '[]'::jsonb,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 15. Contact page content table
    console.log('  Creating contact_content table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_content (
        id SERIAL PRIMARY KEY,
        page_title VARCHAR(255),
        page_subtitle TEXT,
        office_address TEXT,
        phone VARCHAR(50),
        email VARCHAR(100),
        working_hours TEXT,
        map_embed_url TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 16. Site content table
    console.log('  Creating site_content table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_content (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('\n✅ All tables created successfully!\n');

    // Create indexes
    console.log('📊 Creating indexes...\n');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(created_at DESC)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at DESC)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_submissions(created_at DESC)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_manpower_services_order ON manpower_services(display_order)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_industries_order ON industries(display_order)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_navbar_links_order ON navbar_links(display_order)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_navbar_links_parent ON navbar_links(parent_id)`);

    console.log('✅ All indexes created successfully!\n');

    // Seed default admin user
    console.log('👤 Seeding default admin user...\n');
    const adminCheck = await pool.query(`SELECT 1 FROM users WHERE username = 'Admin@123'`);
    if (adminCheck.rowCount === 0) {
      const defaultPassword = 'Admin@123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);
      await pool.query(
        `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
        ['Admin@123', 'admin@samruddhihr.com', hashedPassword, 'admin']
      );
      console.log('✅ Default admin created: Admin@123 / Admin@123\n');
    } else {
      console.log('✅ Admin user already exists\n');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    await pool.end();
    throw error;
  }
}

async function verifyTables() {
  const pool = new Pool(appPoolConfig);
  
  try {
    console.log('🔍 Verifying all tables...\n');
    
    const tables = [
      'users', 'services', 'departments', 'jobs', 'enquiries',
      'contact_submissions', 'applications', 'home', 'about',
      'manpower_services', 'industries', 'navbar_links', 'footer',
      'careers_content', 'contact_content', 'site_content'
    ];

    for (const tableName of tables) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [tableName]);

      const exists = result.rows[0].exists;
      console.log(`  ${exists ? '✅' : '❌'} ${tableName}`);
    }

    console.log('\n📊 Total tables: ' + tables.length);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error verifying tables:', error);
    await pool.end();
    throw error;
  }
}

async function main() {
  try {
    console.log(`Database: ${process.env.DB_NAME || 'samruddhi_db'}`);
    console.log(`Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
    console.log(`User: ${process.env.DB_USER || 'postgres'}\n`);

    await createDatabase();
    await createTables();
    await verifyTables();

    console.log('\n====================================');
    console.log('✅ DATABASE SETUP COMPLETED!');
    console.log('====================================\n');

    console.log('Tables Created:');
    console.log('  • users (admin accounts)');
    console.log('  • services (service offerings)');
    console.log('  • departments (career departments)');
    console.log('  • jobs (job listings)');
    console.log('  • enquiries (client enquiries)');
    console.log('  • contact_submissions (contact forms)');
    console.log('  • applications (job applications)');
    console.log('  • home (homepage content)');
    console.log('  • about (about page content)');
    console.log('  • manpower_services (manpower services list)');
    console.log('  • industries (industries served)');
    console.log('  • navbar_links (navigation menu)');
    console.log('  • footer (footer content)');
    console.log('  • careers_content (careers page content)');
    console.log('  • contact_content (contact page content)');
    console.log('  • site_content (miscellaneous content)');

    console.log('\nDefault Admin:');
    console.log('  Username: Admin@123');
    console.log('  Password: Admin@123');
    console.log('  Email: admin@samruddhihr.com');

    console.log('\nNext Steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Backend will be at: http://localhost:5000');
    console.log('  3. Seed data using admin panel or API\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

main();
