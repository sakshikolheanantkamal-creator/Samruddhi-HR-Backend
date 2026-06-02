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
console.log('║     SAMRUDDHI HR SERVICE - DATABASE TABLES & DATA          ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function viewAllTablesData() {
  try {
    // Get all table names
    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    const tables = tablesResult.rows.map(r => r.tablename);

    console.log(`📊 Total Tables: ${tables.length}\n`);
    console.log('═'.repeat(80));

    for (const tableName of tables) {
      console.log(`\n\n📋 TABLE: ${tableName.toUpperCase()}`);
      console.log('─'.repeat(80));

      // Get column information
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, character_maximum_length, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      console.log(`\n🔹 Columns (${columnsResult.rows.length}):`);
      columnsResult.rows.forEach(col => {
        const type = col.character_maximum_length 
          ? `${col.data_type}(${col.character_maximum_length})`
          : col.data_type;
        console.log(`   • ${col.column_name.padEnd(30)} - ${type.padEnd(20)} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });

      // Get row count
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const rowCount = parseInt(countResult.rows[0].count);

      console.log(`\n🔢 Total Rows: ${rowCount}`);

      // Get data (limit to 5 rows for readability)
      if (rowCount > 0) {
        const dataResult = await pool.query(`SELECT * FROM "${tableName}" LIMIT 5`);
        
        console.log(`\n📄 Sample Data (showing ${Math.min(5, rowCount)} of ${rowCount} rows):`);
        console.log('');

        if (dataResult.rows.length > 0) {
          // Display as JSON for better readability
          dataResult.rows.forEach((row, index) => {
            console.log(`\n   Row ${index + 1}:`);
            Object.entries(row).forEach(([key, value]) => {
              let displayValue = value;
              
              // Format different data types
              if (value === null) {
                displayValue = 'NULL';
              } else if (typeof value === 'object') {
                displayValue = JSON.stringify(value, null, 2).split('\n').join('\n     ');
              } else if (typeof value === 'string' && value.length > 100) {
                displayValue = value.substring(0, 100) + '...';
              } else if (key.includes('password')) {
                displayValue = '********';
              }
              
              console.log(`     ${key}: ${displayValue}`);
            });
          });

          if (rowCount > 5) {
            console.log(`\n   ... and ${rowCount - 5} more rows`);
          }
        }
      } else {
        console.log('\n⚠️  No data in this table');
      }

      console.log('\n' + '─'.repeat(80));
    }

    // Summary
    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                      SUMMARY                               ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    for (const tableName of tables) {
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const count = parseInt(countResult.rows[0].count);
      const status = count > 0 ? '✅' : '⚠️';
      console.log(`${status} ${tableName.padEnd(30)} - ${count} rows`);
    }

    console.log('\n═'.repeat(80));
    console.log('\n✅ Database inspection complete!\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

viewAllTablesData();
