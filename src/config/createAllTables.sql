-- Samruddhi HR Service Database Schema
-- All tables for the application

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Services table
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
);

-- 3. Departments table
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Enquiries table
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
);

-- 6. Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Applications table
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
);

-- 8. Home page content table
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
);

-- 9. About page content table
CREATE TABLE IF NOT EXISTS about (
  id SERIAL PRIMARY KEY,
  image_url VARCHAR(255),
  paragraphs JSONB DEFAULT '[]'::jsonb,
  vision TEXT,
  missions JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Manpower Services table
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
);

-- 11. Industries table
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
);

-- 12. Navbar links table
CREATE TABLE IF NOT EXISTS navbar_links (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  path VARCHAR(255),
  is_dropdown BOOLEAN DEFAULT false,
  parent_id INTEGER REFERENCES navbar_links(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Footer content table
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
);

-- 14. Careers page content table
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
);

-- 15. Contact page content table
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
);

-- 16. Site content table (for miscellaneous content)
CREATE TABLE IF NOT EXISTS site_content (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_manpower_services_order ON manpower_services(display_order);
CREATE INDEX IF NOT EXISTS idx_industries_order ON industries(display_order);
CREATE INDEX IF NOT EXISTS idx_navbar_links_order ON navbar_links(display_order);
CREATE INDEX IF NOT EXISTS idx_navbar_links_parent ON navbar_links(parent_id);
