import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'samruddhi_db',
});

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         SEEDING ALL TABLES WITH DEFAULT DATA              ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function seedAllData() {
  try {
    // 1. Seed HOME table
    console.log('📝 Seeding HOME table...');
    const homeCheck = await pool.query('SELECT COUNT(*) FROM home');
    if (parseInt(homeCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO home (
          hero_badge, hero_title, hero_desc_1, hero_desc_2, hero_desc_3,
          highlights, whatsapp_number, stats_years, stats_clients, hero_image
        ) VALUES (
          'Consultation for Manpower & HR Solutions',
          'Manpower & HR Solutions',
          'Samruddhi HR Services is a trusted HR and manpower partner helping businesses across India build and manage a reliable workforce.',
          'We provide contract staffing, permanent hiring, payroll management, and statutory compliance support. Our services are designed to simplify workforce operations and support smooth business growth.',
          'We also offer home loans, business loans, and CASA account services to add financial value for employers and employees.',
          '["Corporate-grade HR solutions", "Pan-India manpower supply", "Labour law compliant processes", "Trusted B2B HR partner"]'::jsonb,
          '918208021948',
          '15+',
          '5K+',
          '/hero-image.jpg'
        )
      `);
      console.log('✅ HOME seeded\n');
    } else {
      console.log('✅ HOME already has data\n');
    }

    // 2. Seed ABOUT table
    console.log('📝 Seeding ABOUT table...');
    const aboutCheck = await pool.query('SELECT COUNT(*) FROM about');
    if (parseInt(aboutCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO about (
          image_url, paragraphs, vision, missions, features
        ) VALUES (
          'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=800&fit=crop',
          '["<span class=\\"font-semibold text-[#285e9c]\\">Samruddhi HR Services</span> delivers structured, compliant, and dependable HR and manpower solutions.", "We simplify workforce management, reduce operational risks, and improve productivity through professional staffing and HR outsourcing services.", "Our approach is practical, process-driven, and aligned with Indian labour laws and corporate standards."]'::jsonb,
          'To become a trusted HR and manpower services company recognized for reliability, compliance, and long-term client partnerships.',
          '["Deliver quality manpower solutions across industries", "Ensure complete statutory and labour law compliance", "Support business growth through effective people management"]'::jsonb,
          '[
            {"id": 1, "title": "Strong understanding of corporate HR requirements", "description": "Deep expertise in aligning HR strategies with business objectives", "color": "#285e9c", "icon": "FaBriefcase"},
            {"id": 2, "title": "Industry-specific manpower solutions", "description": "Customized recruitment for diverse sectors and specialized roles", "color": "#83a62e", "icon": "FaUserTie"},
            {"id": 3, "title": "Statutory compliance and audit readiness", "description": "Complete adherence to labor laws and regulatory requirements", "color": "#285e9c", "icon": "FaCheckCircle"},
            {"id": 4, "title": "Quick turnaround and scalable hiring", "description": "Rapid deployment capabilities with flexible scaling options", "color": "#83a62e", "icon": "FaRocket"},
            {"id": 5, "title": "Transparent and ethical HR practices", "description": "Integrity-driven processes ensuring fair and honest dealings", "color": "#285e9c", "icon": "FaHandshake"},
            {"id": 6, "title": "Value-added financial facilitation services", "description": "Comprehensive support for loans and financial solutions", "color": "#83a62e", "icon": "FaChartLine"}
          ]'::jsonb
        )
      `);
      console.log('✅ ABOUT seeded\n');
    } else {
      console.log('✅ ABOUT already has data\n');
    }

    // 3. Seed MANPOWER_SERVICES table
    console.log('📝 Seeding MANPOWER_SERVICES table...');
    const manpowerCheck = await pool.query('SELECT COUNT(*) FROM manpower_services');
    if (parseInt(manpowerCheck.rows[0].count) === 0) {
      const manpowerServices = [
        {
          icon: 'FaUsers',
          title: 'Contract / Temporary Manpower Services',
          description: 'We provide skilled and unskilled contract manpower for factories, warehouses, project sites, and corporate offices.',
          features: '["Flexible workforce deployment", "Payroll, PF, ESI & labour compliance", "Reduced HR and administrative burden", "Quick replacement and scalability"]',
          color: '#285e9c',
          order: 1
        },
        {
          icon: 'FaUserTie',
          title: 'Permanent Staffing & Recruitment',
          description: 'Our permanent recruitment services help organizations hire reliable professionals for long-term roles.',
          features: '["Entry, mid & senior-level hiring", "Executive search & headhunting", "Quality screening and assessment", "Faster hiring turnaround"]',
          color: '#83a62e',
          order: 2
        },
        {
          icon: 'FaUsersCog',
          title: 'Bulk & Mass Hiring',
          description: 'We support large-scale recruitment requirements for manufacturing units, logistics hubs, and project-based operations with quick deployment timelines.',
          features: '[]',
          color: '#285e9c',
          order: 3
        },
        {
          icon: 'FaFileInvoiceDollar',
          title: 'Payroll & Statutory Compliance',
          description: 'We manage complete payroll and labour compliance operations, ensuring peace of mind for employers.',
          features: '["Salary processing", "PF, ESI, PT & TDS compliance", "Labour law documentation", "Audit and inspection support"]',
          color: '#83a62e',
          order: 4
        }
      ];

      for (const service of manpowerServices) {
        await pool.query(`
          INSERT INTO manpower_services (icon, title, description, features, color, display_order)
          VALUES ($1, $2, $3, $4::jsonb, $5, $6)
        `, [service.icon, service.title, service.description, service.features, service.color, service.order]);
      }
      console.log('✅ MANPOWER_SERVICES seeded (4 records)\n');
    } else {
      console.log('✅ MANPOWER_SERVICES already has data\n');
    }

    // 4. Seed INDUSTRIES table
    console.log('📝 Seeding INDUSTRIES table...');
    const industriesCheck = await pool.query('SELECT COUNT(*) FROM industries');
    if (parseInt(industriesCheck.rows[0].count) === 0) {
      const industries = [
        { icon: 'FaIndustry', title: 'Manufacturing & Production', description: 'Contract staffing, skilled labour supply, compliance management', color: '#285e9c', order: 1 },
        { icon: 'FaTruck', title: 'Logistics & Warehousing', description: 'Warehouse staff, drivers, logistics coordinators', color: '#83a62e', order: 2 },
        { icon: 'FaShoppingCart', title: 'Retail & E-commerce', description: 'Store staff, customer service, delivery personnel', color: '#285e9c', order: 3 },
        { icon: 'FaLaptopCode', title: 'IT & Technology', description: 'Contract developers, IT support staff, project teams', color: '#83a62e', order: 4 },
        { icon: 'FaHospital', title: 'Healthcare', description: 'Hospital staff, nursing assistants, admin support', color: '#285e9c', order: 5 },
        { icon: 'FaBuilding', title: 'Corporate & BFSI', description: 'Office administration, banking staff, financial services', color: '#83a62e', order: 6 }
      ];

      for (const industry of industries) {
        await pool.query(`
          INSERT INTO industries (icon, title, description, color, display_order)
          VALUES ($1, $2, $3, $4, $5)
        `, [industry.icon, industry.title, industry.description, industry.color, industry.order]);
      }
      console.log('✅ INDUSTRIES seeded (6 records)\n');
    } else {
      console.log('✅ INDUSTRIES already has data\n');
    }

    // 5. Seed NAVBAR_LINKS table
    console.log('📝 Seeding NAVBAR_LINKS table...');
    const navbarCheck = await pool.query('SELECT COUNT(*) FROM navbar_links');
    if (parseInt(navbarCheck.rows[0].count) === 0) {
      const navLinks = [
        { name: 'Home', path: '/', order: 1 },
        { name: 'About Us', path: '/about', order: 2 },
        { name: 'Manpower Services', path: '/manpower-services', order: 3 },
        { name: 'Industries We Serve', path: '/industry-we-serve', order: 4 },
        { name: 'Services', path: null, is_dropdown: true, order: 5 },
        { name: 'Careers', path: '/careers', order: 6 },
        { name: 'Contact Us', path: '/contact', order: 7 }
      ];

      for (const link of navLinks) {
        await pool.query(`
          INSERT INTO navbar_links (name, path, is_dropdown, display_order)
          VALUES ($1, $2, $3, $4)
        `, [link.name, link.path, link.is_dropdown || false, link.order]);
      }
      console.log('✅ NAVBAR_LINKS seeded (7 records)\n');
    } else {
      console.log('✅ NAVBAR_LINKS already has data\n');
    }

    // 6. Seed FOOTER table
    console.log('📝 Seeding FOOTER table...');
    const footerCheck = await pool.query('SELECT COUNT(*) FROM footer');
    if (parseInt(footerCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO footer (
          company_name, tagline, description, address, phone, email,
          social_links, quick_links, services_links
        ) VALUES (
          'Samruddhi HR Services',
          'Your Trusted HR & Manpower Partner',
          'Providing comprehensive HR and manpower solutions across India',
          'Nagpur, Maharashtra, India',
          '+91 820 802 1948',
          'info@samruddhihrservices.com',
          '{"facebook": "#", "linkedin": "#", "twitter": "#"}'::jsonb,
          '[{"name": "Home", "path": "/"}, {"name": "About", "path": "/about"}, {"name": "Services", "path": "/services"}, {"name": "Contact", "path": "/contact"}]'::jsonb,
          '[{"name": "Staffing Solutions", "path": "/services/staffing"}, {"name": "Payroll Management", "path": "/services/payroll"}, {"name": "Compliance", "path": "/services/compliance"}]'::jsonb
        )
      `);
      console.log('✅ FOOTER seeded\n');
    } else {
      console.log('✅ FOOTER already has data\n');
    }

    // 7. Seed CONTACT_CONTENT table
    console.log('📝 Seeding CONTACT_CONTENT table...');
    const contactCheck = await pool.query('SELECT COUNT(*) FROM contact_content');
    if (parseInt(contactCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO contact_content (
          page_title, page_subtitle, office_address, phone, email, working_hours, map_embed_url
        ) VALUES (
          'Get in Touch',
          'We would love to hear from you. Reach out to us for any inquiries.',
          'Nagpur, Maharashtra, India',
          '+91 820 802 1948',
          'info@samruddhihrservices.com',
          'Monday - Saturday: 9:00 AM - 6:00 PM',
          'https://www.google.com/maps/embed?pb=...'
        )
      `);
      console.log('✅ CONTACT_CONTENT seeded\n');
    } else {
      console.log('✅ CONTACT_CONTENT already has data\n');
    }

    // 8. Seed CAREERS_CONTENT table
    console.log('📝 Seeding CAREERS_CONTENT table...');
    const careersCheck = await pool.query('SELECT COUNT(*) FROM careers_content');
    if (parseInt(careersCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO careers_content (
          hero_badge, hero_heading_line_1, hero_heading_line_2,
          hero_paragraphs, hero_button_1_text, hero_button_1_link,
          hero_button_2_text, hero_button_2_link, hero_image_url,
          why_title, why_subtitle, why_benefits,
          opportunities_title, opportunities_subtitle,
          eligibility_left_title, eligibility_right_title,
          eligibility_can_apply, eligibility_looking_for,
          contact_heading, contact_subtitle, contact_intro,
          contact_email, contact_whatsapp,
          contact_email_button, contact_whatsapp_button,
          commitment_title, commitment_description, commitment_commitments
        ) VALUES (
          'Join Our Team',
          'Build Your Career with',
          'Samruddhi HR Services',
          '["At Samruddhi HR Services, we believe people are the foundation of every successful organization.", "We are always looking for committed, ethical, and growth-oriented professionals.", "If you are passionate about people management, we invite you to join our team."]'::jsonb,
          'Browse Open Positions',
          '/careers',
          'Why Join Us',
          '#why-work-with-us',
          '/home/career.jpg',
          'Why Work with Samruddhi HR Services',
          'We offer an environment where skills are valued, responsibilities are trusted, and growth is earned.',
          '[{"icon": "FaHandshake", "text": "Professional and ethical work culture"}, {"icon": "FaUsers", "text": "Exposure to multiple industries"}, {"icon": "FaGraduationCap", "text": "Learning and growth opportunities"}]'::jsonb,
          'Career Opportunities',
          'We regularly hire professionals across multiple departments.',
          'Who Can Apply',
          'What We Look For',
          '["Graduates / Post-graduates", "HR experience preferred", "Strong communication skills"]'::jsonb,
          '["Professional attitude", "Willingness to learn", "Team player"]'::jsonb,
          'How to Apply',
          'Choose the easiest way to send us your resume',
          'Ready to build your career with Samruddhi? Send your CV directly to our hiring team.',
          'Kuldeep.chatole@samruddhihrservices.com',
          '+918208021948',
          'Email Resume',
          'WhatsApp Resume',
          'Our Commitment to Employees',
          'At Samruddhi HR Services, we create long-term, ethical, and growth-driven careers.',
          '["Fair employment practices", "Equal opportunity workplace", "Safe work environment", "Continuous development"]'::jsonb
        )
      `);
      console.log('✅ CAREERS_CONTENT seeded\n');
    } else {
      console.log('✅ CAREERS_CONTENT already has data\n');
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              ✅ ALL DATA SEEDED SUCCESSFULLY!              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Show summary
    const tables = [
      'home', 'about', 'manpower_services', 'industries',
      'navbar_links', 'footer', 'contact_content', 'careers_content',
      'users', 'services', 'departments', 'jobs',
      'enquiries', 'contact_submissions', 'applications', 'site_content'
    ];

    console.log('📊 DATA SUMMARY:\n');
    for (const table of tables) {
      const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      const count = parseInt(result.rows[0].count);
      const status = count > 0 ? '✅' : '⚠️';
      console.log(`${status} ${table.padEnd(30)} - ${count} rows`);
    }

    console.log('\n✅ Database is now fully populated!\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding data:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

seedAllData();
