# Database Setup Guide

## Prerequisites

Before running the database setup, ensure you have:

1. **PostgreSQL** installed and running
   - Version 12 or higher recommended
   - Default port: 5432

2. **Node.js** installed
   - Version 16 or higher

3. **Database credentials** configured in `.env` file

## Configuration

Edit the `.env` file in the backend directory:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=samruddhi_db
DB_USER=postgres
DB_PASSWORD=Sakshi@123
JWT_SECRET=samruddhi_jwt_secret_key_123!
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

## Database Initialization

### Option 1: Run the initialization script

```bash
# Navigate to backend directory
cd backend

# Run the database initialization script
node init_all_tables.js
```

This script will:
- ✅ Create the `samruddhi_db` database if it doesn't exist
- ✅ Create all 8 tables with proper schema
- ✅ Create indexes for performance optimization
- ✅ Verify all tables are created successfully
- ✅ Display a summary of created tables

### Option 2: Start the backend server

The database will be automatically initialized when you start the backend:

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The server will initialize the database on startup.

## Database Structure

### Tables Created

1. **users** - Admin user accounts
2. **services** - Service offerings
3. **departments** - Career departments
4. **jobs** - Job listings
5. **enquiries** - Client enquiries
6. **contact_submissions** - Contact form submissions
7. **applications** - Job applications
8. **site_content** - Dynamic CMS content

### Default Data

The initialization process seeds the database with:

- ✅ Default admin user
  - Username: `Admin@123`
  - Password: `Admin@123`
  - Email: `admin@samruddhihr.com`

- ✅ 7 service offerings
- ✅ 4 career departments with job roles
- ✅ Complete site content for all pages

## Verify Database

### Check if tables exist

After running the initialization, you can verify tables using PostgreSQL:

```bash
# Connect to PostgreSQL
psql -U postgres -d samruddhi_db

# List all tables
\dt

# View table structure
\d users
\d services
\d applications
```

### Using pgAdmin

1. Open pgAdmin 4
2. Connect to your PostgreSQL server
3. Expand: Servers → PostgreSQL → Databases → samruddhi_db → Schemas → public → Tables
4. You should see all 8 tables

## Troubleshooting

### Issue: "Database connection failed"

**Solution:**
1. Verify PostgreSQL is running
2. Check credentials in `.env` file
3. Ensure database user has CREATE privileges

```bash
# Test PostgreSQL connection
psql -U postgres -h localhost -p 5432
```

### Issue: "Database already exists"

**Solution:**
The script handles existing databases automatically. If you want to start fresh:

```bash
# Drop and recreate (WARNING: This deletes all data!)
psql -U postgres -c "DROP DATABASE IF EXISTS samruddhi_db;"
node init_all_tables.js
```

### Issue: "Table already exists"

**Solution:**
The script uses `CREATE TABLE IF NOT EXISTS`, so existing tables are preserved. To recreate:

```sql
-- Connect to database
psql -U postgres -d samruddhi_db

-- Drop specific table
DROP TABLE IF EXISTS applications CASCADE;

-- Then run the init script again
node init_all_tables.js
```

### Issue: "Permission denied"

**Solution:**
Grant necessary permissions to the PostgreSQL user:

```sql
-- As postgres superuser
GRANT ALL PRIVILEGES ON DATABASE samruddhi_db TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

## Model Usage

All database tables have corresponding model files in `src/models/`:

```javascript
// Import models
import { User, Service, Application, Department } from './models/index.js';

// Example: Create a new application
const app = await Application.create({
  full_name: 'John Doe',
  mobile: '9876543210',
  email: 'john@example.com',
  job_role: 'HR Executive',
  status: 'Pending'
});

// Example: Get all services
const services = await Service.findAll();

// Example: Update user
const user = await User.update(1, { 
  email: 'newemail@example.com' 
});
```

## Database Backup

### Create a backup

```bash
# Full database backup
pg_dump -U postgres -d samruddhi_db -F c -b -v -f samruddhi_backup.dump

# SQL format backup
pg_dump -U postgres -d samruddhi_db > samruddhi_backup.sql
```

### Restore from backup

```bash
# Restore from custom format
pg_restore -U postgres -d samruddhi_db -v samruddhi_backup.dump

# Restore from SQL file
psql -U postgres -d samruddhi_db < samruddhi_backup.sql
```

## Database Maintenance

### View table sizes

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Analyze tables

```sql
ANALYZE VERBOSE;
```

### Vacuum tables

```sql
VACUUM ANALYZE;
```

## Performance Optimization

The following indexes are automatically created:

```sql
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_jobs_department ON jobs(department_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_enquiries_created ON enquiries(created_at DESC);
CREATE INDEX idx_contact_created ON contact_submissions(created_at DESC);
```

## Database Schema Changes

When making schema changes:

1. Update the table creation SQL in `src/config/db.js`
2. Update the corresponding model in `src/models/`
3. Update this documentation
4. Test with a fresh database initialization

## Additional Resources

- **Model Documentation**: See `DATABASE_MODELS_DOCUMENTATION.md`
- **API Documentation**: See API endpoint documentation
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

## Support

For database-related issues:
1. Check the error logs
2. Verify PostgreSQL is running
3. Check credentials in `.env`
4. Review table structure with `\d tablename` in psql
5. Check the models documentation

## Summary

✅ **8 Tables** with complete schema
✅ **8 Models** with CRUD operations
✅ **Automatic seeding** with default data
✅ **Performance indexes** for optimization
✅ **Transaction support** for data integrity
✅ **Complete documentation** for all models

Your database is now fully set up and ready for production use!
