# Database Models Documentation

## Overview
This document provides comprehensive information about all database models and tables in the Samruddhi HR Service application.

## Database Structure

### 1. Users Table
**Model:** `User.js`

Stores admin user credentials and authentication information.

**Schema:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Model Methods:**
- `create({ username, email, password, role })` - Create new user with hashed password
- `findByEmail(email)` - Find user by email
- `findByUsername(username)` - Find user by username
- `findById(id)` - Get user by ID
- `findAll()` - Get all users
- `update(id, { username, email, role })` - Update user details
- `updatePassword(id, newPassword)` - Update user password
- `delete(id)` - Delete user
- `comparePassword(plainPassword, hashedPassword)` - Verify password

---

### 2. Services Table
**Model:** `Service.js`

Stores all service offerings with detailed information.

**Schema:**
```sql
CREATE TABLE services (
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
```

**JSONB Fields:**
- `what_we_do`: Array of service features
- `who_is_for`: Array of target industries
- `key_benefits`: Array of benefits

**Model Methods:**
- `create(serviceData)` - Create new service
- `findBySlug(slug)` - Find service by URL slug
- `findById(id)` - Get service by ID
- `findAll()` - Get all services
- `update(id, serviceData)` - Update service
- `delete(id)` - Delete service

---

### 3. Departments Table
**Model:** `Department.js`

Stores career department categories.

**Schema:**
```sql
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Model Methods:**
- `create({ title, icon, color })` - Create new department
- `findById(id)` - Get department by ID
- `findByTitle(title)` - Find department by title
- `findAll()` - Get all departments
- `findAllWithJobs()` - Get departments with nested jobs array
- `update(id, { title, icon, color })` - Update department
- `delete(id)` - Delete department (cascades to jobs)

---

### 4. Jobs Table
**Model:** `Job.js`

Stores job listings associated with departments.

**Schema:**
```sql
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Relationships:**
- Foreign key to `departments` table
- Cascade delete when department is deleted

**Model Methods:**
- `create({ department_id, title })` - Create new job
- `findById(id)` - Get job with department info
- `findAll()` - Get all jobs
- `findByDepartment(department_id)` - Get jobs by department
- `update(id, { department_id, title })` - Update job
- `delete(id)` - Delete job
- `countByDepartment(department_id)` - Count jobs in department

---

### 5. Enquiries Table
**Model:** `Enquiry.js`

Stores client enquiries from the enquiry form.

**Schema:**
```sql
CREATE TABLE enquiries (
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
```

**Model Methods:**
- `create(enquiryData)` - Create new enquiry
- `findById(id)` - Get enquiry by ID
- `findAll(limit, offset)` - Get all enquiries with pagination
- `count()` - Get total enquiries count
- `search(searchTerm)` - Search enquiries
- `delete(id)` - Delete enquiry
- `getRecent(limit)` - Get recent enquiries

---

### 6. Contact Submissions Table
**Model:** `ContactSubmission.js`

Stores contact form submissions.

**Schema:**
```sql
CREATE TABLE contact_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Model Methods:**
- `create({ name, email, phone, message })` - Create submission
- `findById(id)` - Get submission by ID
- `findAll(limit, offset)` - Get all submissions with pagination
- `count()` - Get total submissions count
- `search(searchTerm)` - Search submissions
- `delete(id)` - Delete submission
- `getRecent(limit)` - Get recent submissions
- `findByDateRange(startDate, endDate)` - Get submissions by date

---

### 7. Applications Table
**Model:** `Application.js`

Stores job applications from careers page.

**Schema:**
```sql
CREATE TABLE applications (
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
```

**Status Values:**
- `Pending` - New application
- `Reviewed` - Application reviewed
- `Shortlisted` - Candidate shortlisted
- `Rejected` - Application rejected

**Model Methods:**
- `create(applicationData)` - Create new application
- `findById(id)` - Get application by ID
- `findAll(limit, offset)` - Get all applications with pagination
- `count()` - Get total applications count
- `findByStatus(status)` - Get applications by status
- `countByStatus(status)` - Count applications by status
- `updateStatus(id, status)` - Update application status
- `search(searchTerm)` - Search applications
- `delete(id)` - Delete application
- `getRecent(limit)` - Get recent applications
- `findByJobRole(job_role)` - Get applications by job role
- `getStatistics()` - Get application statistics

---

### 8. Site Content Table
**Model:** `SiteContent.js`

Stores dynamic CMS content as key-value pairs with JSONB values.

**Schema:**
```sql
CREATE TABLE site_content (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Content Keys:**
- `navbar_links` - Navigation menu items
- `homepage_content` - Homepage sections
- `careers_page_content` - Careers page content
- `about_content` - About page content
- `manpower_services` - Manpower services list
- `industries_we_serve` - Industries list

**Model Methods:**
- `upsert(key, value)` - Create or update content
- `findByKey(key)` - Get content by key
- `findAll()` - Get all content
- `findByKeys(keys)` - Get multiple content keys
- `delete(key)` - Delete content
- `updateField(key, field, value)` - Update specific JSON field
- `getKeys()` - Get all content keys
- `exists(key)` - Check if key exists
- `bulkUpsert(contentArray)` - Bulk insert/update content

---

## Database Indexes

Performance indexes are automatically created:

```sql
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_jobs_department ON jobs(department_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_enquiries_created ON enquiries(created_at DESC);
CREATE INDEX idx_contact_created ON contact_submissions(created_at DESC);
```

---

## Usage Examples

### User Model
```javascript
import { User } from './models/index.js';

// Create user
const user = await User.create({
  username: 'admin',
  email: 'admin@example.com',
  password: 'password123',
  role: 'admin'
});

// Find and authenticate
const foundUser = await User.findByEmail('admin@example.com');
const isValid = await User.comparePassword('password123', foundUser.password_hash);
```

### Service Model
```javascript
import { Service } from './models/index.js';

// Create service
const service = await Service.create({
  slug: 'payroll-services',
  title: 'Payroll Services',
  tagline: 'Complete payroll management',
  what_we_do: ['Salary processing', 'Tax compliance'],
  who_is_for: ['Small businesses', 'Enterprises'],
  key_benefits: ['Save time', 'Reduce errors']
});

// Get by slug
const service = await Service.findBySlug('payroll-services');
```

### Application Model
```javascript
import { Application } from './models/index.js';

// Create application
const app = await Application.create({
  full_name: 'John Doe',
  mobile: '9876543210',
  email: 'john@example.com',
  job_role: 'HR Executive',
  status: 'Pending'
});

// Get statistics
const stats = await Application.getStatistics();
// { total: 100, pending: 50, reviewed: 30, shortlisted: 15, rejected: 5 }
```

### SiteContent Model
```javascript
import { SiteContent } from './models/index.js';

// Upsert content
await SiteContent.upsert('homepage_content', {
  hero_title: 'Welcome to Samruddhi',
  hero_desc: 'Your trusted HR partner'
});

// Get content
const content = await SiteContent.findByKey('homepage_content');
console.log(content.value);
```

---

## Database Initialization

### Run Database Setup
```bash
# Initialize all tables
node init_all_tables.js

# Or through npm script
npm run init:db
```

### Verify Tables
All tables are automatically verified during initialization. The script will:
1. Create database if not exists
2. Create all tables with proper schema
3. Create indexes for performance
4. Verify table existence
5. Display summary

---

## Model Import

All models are exported from a central index file:

```javascript
// Import all models
import {
  User,
  Service,
  Department,
  Job,
  Enquiry,
  ContactSubmission,
  Application,
  SiteContent
} from './models/index.js';

// Or import individually
import User from './models/User.js';
import Service from './models/Service.js';
```

---

## Best Practices

1. **Always use model methods** instead of raw SQL queries
2. **Use transactions** for multi-table operations
3. **Validate input** before passing to model methods
4. **Handle errors** with try-catch blocks
5. **Use JSONB** for flexible nested data structures
6. **Create indexes** for frequently queried fields
7. **Use CASCADE** for related data cleanup

---

## Error Handling

All model methods can throw errors. Always wrap in try-catch:

```javascript
try {
  const user = await User.create({
    username: 'test',
    email: 'test@example.com',
    password: 'pass123'
  });
} catch (error) {
  if (error.code === '23505') {
    // Unique constraint violation
    console.error('User already exists');
  } else {
    console.error('Database error:', error.message);
  }
}
```

---

## Maintenance

### Backup Database
```bash
pg_dump -U postgres -d samruddhi_db > backup.sql
```

### Restore Database
```bash
psql -U postgres -d samruddhi_db < backup.sql
```

### View Table Structure
```javascript
import { getTableInfo } from './src/config/initTables.js';

const columns = await getTableInfo('users');
console.log(columns);
```

---

## Summary

✅ **8 Tables** created with proper relationships
✅ **8 Models** with comprehensive methods  
✅ **5 Indexes** for query optimization
✅ **JSONB Support** for flexible content
✅ **Full CRUD** operations on all models
✅ **Transaction Support** for data integrity
✅ **Validation** and error handling

All tables are properly configured, indexed, and ready for production use!
