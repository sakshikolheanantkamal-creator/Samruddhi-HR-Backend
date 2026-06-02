import { getPool } from './db.js';

const pool = getPool();

/**
 * Initialize all database tables
 * This script ensures all required tables exist with proper schema
 */
export async function initializeTables() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database table initialization...');
    
    await client.query('BEGIN');

    // 1. Users table
    console.log('Creating users table...');
    await client.query(`
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
    console.log('Creating services table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(100) NOT NULL,
        tagline VARCHAR(255),
        hero_image VARCHAR(100),
        other_image VARCHAR(100),
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
    console.log('Creating departments table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) UNIQUE NOT NULL,
        icon VARCHAR(50),
        color VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Jobs table
    console.log('Creating jobs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Enquiries table
    console.log('Creating enquiries table...');
    await client.query(`
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
    console.log('Creating contact_submissions table...');
    await client.query(`
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
    console.log('Creating applications table...');
    await client.query(`
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

    // 8. Site content table
    console.log('Creating site_content table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_content (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    console.log('Creating indexes...');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at DESC)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_submissions(created_at DESC)
    `);

    await client.query('COMMIT');
    
    console.log('✅ All database tables initialized successfully!');
    console.log('\nTables created:');
    console.log('  ✓ users');
    console.log('  ✓ services');
    console.log('  ✓ departments');
    console.log('  ✓ jobs');
    console.log('  ✓ enquiries');
    console.log('  ✓ contact_submissions');
    console.log('  ✓ applications');
    console.log('  ✓ site_content');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Verify all tables exist
export async function verifyTables() {
  const expectedTables = [
    'users',
    'services', 
    'departments',
    'jobs',
    'enquiries',
    'contact_submissions',
    'applications',
    'site_content'
  ];

  console.log('\n🔍 Verifying database tables...');

  for (const tableName of expectedTables) {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )
    `, [tableName]);

    const exists = result.rows[0].exists;
    console.log(`  ${exists ? '✓' : '✗'} Table '${tableName}': ${exists ? 'EXISTS' : 'MISSING'}`);
  }

  console.log('');
}

// Get table information
export async function getTableInfo(tableName) {
  const query = `
    SELECT 
      column_name, 
      data_type, 
      character_maximum_length,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
  `;

  const result = await pool.query(query, [tableName]);
  return result.rows;
}

// Get all table names
export async function getAllTables() {
  const query = `
    SELECT table_name 
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;

  const result = await pool.query(query);
  return result.rows.map(row => row.table_name);
}

export default {
  initializeTables,
  verifyTables,
  getTableInfo,
  getAllTables
};
