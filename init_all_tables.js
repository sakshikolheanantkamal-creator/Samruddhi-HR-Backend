import { initDatabase } from './src/config/db.js';
import { initializeTables, verifyTables, getAllTables } from './src/config/initTables.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('====================================');
console.log('DATABASE INITIALIZATION SCRIPT');
console.log('====================================\n');

console.log('Database Configuration:');
console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`  Port: ${process.env.DB_PORT || '5432'}`);
console.log(`  Database: ${process.env.DB_NAME || 'samruddhi_db'}`);
console.log(`  User: ${process.env.DB_USER || 'postgres'}`);
console.log('');

async function main() {
  try {
    // Step 1: Initialize database (create if not exists)
    console.log('Step 1: Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized\n');

    // Step 2: Create all tables
    console.log('Step 2: Creating all tables...');
    await initializeTables();
    console.log('');

    // Step 3: Verify tables
    console.log('Step 3: Verifying tables...');
    await verifyTables();

    // Step 4: List all tables
    console.log('Step 4: Getting all tables in database...');
    const tables = await getAllTables();
    console.log('\nAll tables in database:');
    tables.forEach(table => console.log(`  • ${table}`));
    console.log('');

    console.log('====================================');
    console.log('✅ DATABASE SETUP COMPLETED SUCCESSFULLY!');
    console.log('====================================\n');

    console.log('Next Steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. The backend will be available at: http://localhost:5000');
    console.log('  3. All tables are ready and seeded with default data');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during database initialization:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

main();
