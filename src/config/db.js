import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// First pool connects to the default postgres database to check and create samruddhi_db if needed
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

let pool;

export async function initDatabase() {
  // 1. Ensure the target database exists
  const tempPool = new Pool(systemPoolConfig);
  try {
    const dbName = process.env.DB_NAME || 'samruddhi_db';
    const res = await tempPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (res.rowCount === 0) {
      console.log(`Database '${dbName}' does not exist. Creating...`);
      // CREATE DATABASE cannot run in a transaction, we run it directly
      await tempPool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database '${dbName}' created successfully.`);
    }
  } catch (err) {
    console.error('Error checking/creating database:', err.message);
  } finally {
    await tempPool.end();
  }

  // 2. Initialize the application pool
  pool = new Pool(appPoolConfig);

  // 3. Create tables
  try {
    console.log('Connecting to application database and creating schemas...');

    // Users table
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

    // Services table
    await pool.query(`
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

    // Departments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) UNIQUE NOT NULL,
        icon VARCHAR(50),
        color VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Jobs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Enquiries table
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

    // Contact submissions table
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

    // Applications table
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

    console.log('Database tables verified/created successfully.');

    // 4. Seed Default Admin User
    // Clean up old admin user if present
    await pool.query(`DELETE FROM users WHERE username = 'admin'`);

    const adminCheck = await pool.query(`SELECT 1 FROM users WHERE username = 'Admin@123'`);
    if (adminCheck.rowCount === 0) {
      console.log('Seeding default administrator account (Admin@123)...');
      const defaultPassword = 'Admin@123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);
      await pool.query(
        `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
        ['Admin@123', 'admin@samruddhihr.com', hashedPassword, 'admin']
      );
      console.log(`Default administrator seeded successfully (User: Admin@123 / Pass: ${defaultPassword}).`);
    }

    // 5. Seed Services (from static ServiceData.jsx)
    const servicesCheck = await pool.query(`SELECT COUNT(*) FROM services`);
    if (parseInt(servicesCheck.rows[0].count) === 0) {
      console.log('Seeding default services from ServiceData...');
      const defaultServices = [
        {
          slug: "staffing-&-manpower-supply",
          title: "Staffing & Manpower Supply",
          tagline: "Flexible workforce solutions to meet your changing business needs.",
          heroImage: "/contract.jpg",
          otherImage: "/contract-2.jpg",
          overview: "Our Contract & Temporary Manpower Supply service helps businesses manage workforce requirements without long-term commitments. We provide skilled, semi-skilled, and unskilled manpower for short-term, project-based, or seasonal needs. From sourcing to deployment and compliance, we manage the complete lifecycle—ensuring you get reliable talent exactly when you need it.",
          whatWeDo: [
            "Understand role, skill, and duration requirements",
            "Source and screen suitable candidates",
            "Complete onboarding and documentation",
            "Manage contracts and attendance",
            "Handle payroll and statutory compliance",
            "Provide replacement support if required"
          ],
          whoIsFor: [
            "Manufacturing & industrial units",
            "IT & project-based companies",
            "Retail & logistics businesses",
            "Healthcare & service industries"
          ],
          keyBenefits: [
            "Reduced hiring and operational costs",
            "Workforce flexibility and scalability",
            "Zero compliance burden",
            "Faster manpower deployment"
          ],
          cta: "Need temporary staff quickly? Let's build your workforce today.",
          buttonName: "Contact Us",
          link: "/enquiry"
        },
        {
          slug: "compliances",
          title: "Compliances",
          tagline: "Right talent for long-term business growth.",
          heroImage: "/staff.jpg",
          otherImage: "/staff-2.jpg",
          overview: "We specialize in identifying and placing permanent employees who align with your organization's culture, vision, and performance expectations. Our recruitment process focuses on quality, retention, and long-term value. From mid-level professionals to senior leadership roles, we deliver talent that strengthens your organization.",
          whatWeDo: [
            "Job requirement analysis",
            "Talent sourcing through multiple channels",
            "Candidate screening & interviews",
            "Skill and background validation",
            "Final selection coordination",
            "Offer & joining support"
          ],
          whoIsFor: [
            "Corporates & enterprises",
            "Startups & MSMEs",
            "Leadership and niche role hiring",
            "Growing organizations"
          ],
          keyBenefits: [
            "Higher employee retention",
            "Reduced hiring time",
            "Quality-driven recruitment",
            "Business-aligned talent"
          ],
          cta: "Looking for permanent talent? Partner with us for smarter hiring.",
          buttonName: "Contact Us",
          link: "/enquiry"
        },
        {
          slug: "bulk-&-mass-hiring",
          title: "Bulk & Mass Hiring",
          tagline: "Scalable hiring solutions for high-volume requirements.",
          heroImage: "/hiring.jpg",
          otherImage: "/hiring-2.jpg",
          overview: "Our Bulk & Mass Hiring solutions help organizations meet large-scale manpower needs within tight timelines. We combine structured processes with large candidate databases to ensure speed without compromising quality. Ideal for rapid expansion, new project launches, or multi-location hiring.",
          whatWeDo: [
            "High-volume candidate sourcing",
            "Walk-in & virtual hiring drives",
            "Bulk interview coordination",
            "Documentation & onboarding",
            "Deployment planning",
            "Post-joining support"
          ],
          whoIsFor: [
            "BPOs & call centers",
            "Manufacturing plants",
            "Retail chains",
            "Logistics & warehouse operations"
          ],
          keyBenefits: [
            "Faster hiring turnaround",
            "Consistent candidate quality",
            "Cost-effective hiring model",
            "Centralized hiring management"
          ],
          cta: "Need to hire in bulk? Let us scale your workforce efficiently.",
          buttonName: "Contact Us",
          link: "/contact"
        },
        {
          slug: "contract-staffing",
          title: "Contract Staffing",
          tagline: "Flexible workforce solutions for short-term needs.",
          heroImage: "/hiring.jpg",
          otherImage: "/hiring-2.jpg",
          overview: "Our Bulk & Mass Hiring solutions help organizations meet large-scale manpower needs within tight timelines. We combine structured processes with large candidate databases to ensure speed without compromising quality. Ideal for rapid expansion, new project launches, or multi-location hiring.",
          whatWeDo: [
            "High-volume candidate sourcing",
            "Walk-in & virtual hiring drives",
            "Bulk interview coordination",
            "Documentation & onboarding",
            "Deployment planning",
            "Post-joining support"
          ],
          whoIsFor: [
            "BPOs & call centers",
            "Manufacturing plants",
            "Retail chains",
            "Logistics & warehouse operations"
          ],
          keyBenefits: [
            "Faster hiring turnaround",
            "Consistent candidate quality",
            "Cost-effective hiring model",
            "Centralized hiring management"
          ],
          cta: "Need to hire in bulk? Let us scale your workforce efficiently.",
          buttonName: "Contact Us",
          link: "/contact"
        },
        {
          slug: "permanent-hiring",
          title: "Permanent Hiring",
          tagline: "Right talent for long-term business growth.",
          heroImage: "/payroll.jpg",
          otherImage: "/payroll-2.jpg",
          overview: "We simplify payroll processing while ensuring full compliance with statutory regulations. Our services eliminate errors, delays, and compliance risks—giving you peace of mind. We manage salaries, deductions, filings, and reports with complete transparency.",
          whatWeDo: [
            "Monthly payroll processing",
            "Salary structure management",
            "PF, ESI, PT & TDS compliance",
            "Payslip generation",
            "Statutory filings & reports",
            "Audit and compliance support"
          ],
          whoIsFor: [
            "Small & mid-sized businesses",
            "Corporates with large payrolls",
            "Contract manpower employers"
          ],
          keyBenefits: [
            "Error-free payroll processing",
            "Compliance risk reduction",
            "Time and cost savings",
            "Improved employee trust"
          ],
          cta: "Want stress-free payroll management? Let us handle it for you.",
          buttonName: "Contact Us",
          link: "/enquiry"
        },
        {
          slug: "payroll-outsourcing",
          title: "Payroll Outsourcing",
          tagline: "Efficient payroll management without the hassle.",
          heroImage: "/hr.jpg",
          otherImage: "/hr-2.jpg",
          overview: "Our HR Outsourcing & Consulting services help businesses build strong HR systems without maintaining large internal teams. We provide both operational support and strategic guidance. From policies to performance management, we align HR practices with business goals.",
          whatWeDo: [
            "HR policy & SOP creation",
            "Employee lifecycle management",
            "Performance management systems",
            "Compliance advisory",
            "HR audits & process improvement",
            "Strategic HR consulting"
          ],
          whoIsFor: [
            "Startups & growing companies",
            "Organizations without in-house HR",
            "Businesses seeking HR transformation"
          ],
          keyBenefits: [
            "Professional HR management",
            "Scalable HR operations",
            "Legal and policy compliance",
            "Improved workforce productivity"
          ],
          cta: "Need an expert HR partner? Let's strengthen your people systems.",
          buttonName: "Contact Us",
          link: "/enquiry"
        },
        {
          slug: "it-&-engineering-staffing",
          title: "IT & Engineering Staffing",
          tagline: "Talent for tech-driven business growth.",
          heroImage: "/loan.jpg",
          otherImage: "/loan-2.jpg",
          overview: "We assist individuals and businesses in securing the right loan solutions with minimum hassle. Our team supports you throughout the loan journey—from eligibility assessment to final approval. We work with leading banks and financial institutions to ensure competitive terms.",
          whatWeDo: [
            "Loan eligibility assessment",
            "Bank & lender coordination",
            "Documentation support",
            "Application submission",
            "Follow-ups & approvals",
            "Disbursement assistance"
          ],
          whoIsFor: [
            "Home buyers",
            "Entrepreneurs & SMEs",
            "Self-employed professionals"
          ],
          keyBenefits: [
            "Faster loan approvals",
            "Transparent process",
            "Competitive interest rates",
            "End-to-end support"
          ],
          cta: "Planning finance? Let us simplify your loan process.",
          buttonName: "Contact Us",
          link: "/contact"
        }
      ];

      for (const svc of defaultServices) {
        await pool.query(
          `INSERT INTO services (slug, title, tagline, hero_image, other_image, overview, what_we_do, who_is_for, key_benefits, cta, button_name, link)
           VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10, $11, $12)`,
          [
            svc.slug,
            svc.title,
            svc.tagline,
            svc.heroImage,
            svc.otherImage,
            svc.overview,
            JSON.stringify(svc.whatWeDo),
            JSON.stringify(svc.whoIsFor),
            JSON.stringify(svc.keyBenefits),
            svc.cta,
            svc.buttonName,
            svc.link,
          ]
        );
      }
      console.log('Seeded services successfully.');
    }

    // 6. Seed Career Departments & Roles
    const deptsCheck = await pool.query(`SELECT COUNT(*) FROM departments`);
    if (parseInt(deptsCheck.rows[0].count) === 0) {
      console.log('Seeding default career opportunities...');
      const defaultDepartments = [
        {
          title: "Human Resources & Recruitment",
          icon: "FaUserTie",
          color: "#285e9c",
          roles: [
            "HR Executive",
            "HR Recruiter",
            "Talent Acquisition Executive",
            "HR Operations Executive",
          ]
        },
        {
          title: "Manpower & Operations",
          icon: "FaClipboardList",
          color: "#83a62e",
          roles: [
            "Site Supervisor",
            "Manpower Coordinator",
            "Compliance Executive",
            "Payroll Executive",
          ]
        },
        {
          title: "Sales & Client Coordination",
          icon: "FaBriefcase",
          color: "#285e9c",
          roles: [
            "Business Development Executive",
            "Corporate Relationship Manager",
            "Client Coordination Executive",
          ]
        },
        {
          title: "Finance & Support",
          icon: "FaCalculator",
          color: "#83a62e",
          roles: [
            "Accounts Executive",
            "Loan Processing Executive (Home Loan / Business Loan)",
            "CASA Relationship Executive",
          ]
        }
      ];

      for (const dept of defaultDepartments) {
        const result = await pool.query(
          `INSERT INTO departments (title, icon, color) VALUES ($1, $2, $3) RETURNING id`,
          [dept.title, dept.icon, dept.color]
        );
        const deptId = result.rows[0].id;

        for (const role of dept.roles) {
          await pool.query(
            `INSERT INTO jobs (department_id, title) VALUES ($1, $2)`,
            [deptId, role]
          );
        }
      }
      console.log('Seeded career departments and roles successfully.');
    }

    // 7. Seed site_content table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_content (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const seedContentKey = async (key, defaultValue) => {
      const check = await pool.query(`SELECT 1 FROM site_content WHERE key = $1`, [key]);
      if (check.rowCount === 0) {
        await pool.query(`INSERT INTO site_content (key, value) VALUES ($1, $2::jsonb)`, [key, JSON.stringify(defaultValue)]);
        console.log(`Seeded site_content key '${key}' successfully.`);
      }
    };

    // Navbar items
    await seedContentKey('navbar_links', [
      { name: "Home", path: "/" },
      { name: "About Us", path: "/about" },
      { name: "Manpower Services", path: "/manpower-services" },
      { name: "Industries We Serve", path: "/industry-we-serve" },
      { name: "Services", path: null, isDropdown: true },
      { name: "Careers", path: "/careers" },
      { name: "Contact Us", path: "/contact" }
    ]);

    // Homepage content
    await seedContentKey('homepage_content', {
      hero_badge: "Consultation for Manpower & HR Solutions",
      hero_title: "Manpower & HR Solutions",
      hero_desc_1: "Samruddhi HR Services is a trusted HR and manpower partner helping businesses across India build and manage a reliable workforce.",
      hero_desc_2: "We provide contract staffing, permanent hiring, payroll management, and statutory compliance support. Our services are designed to simplify workforce operations and support smooth business growth.",
      hero_desc_3: "We also offer home loans, business loans, and CASA account services to add financial value for employers and employees.",
      highlights: [
        "Corporate-grade HR solutions",
        "Pan-India manpower supply",
        "Labour law compliant processes",
        "Trusted B2B HR partner"
      ],
      whatsapp_number: "918208021948",
      stats_years: "15+",
      stats_clients: "5K+"
    });

    // Careers page content
    await seedContentKey('careers_page_content', {
      hero: {
        badge: "Join Our Team",
        heading_line_1: "Build Your Career with",
        heading_line_2: "Samruddhi HR Services",
        paragraphs: [
          "At Samruddhi HR Services, we believe people are the foundation of every successful organization.",
          "We are always looking for committed, ethical, and growth-oriented professionals who want to build a long-term career in HR, manpower services, recruitment, and corporate support functions.",
          "If you are passionate about people management, compliance, recruitment, or corporate services, we invite you to join our team."
        ],
        button_1_text: "Browse Open Positions",
        button_1_link: "/careers",
        button_2_text: "Why Join Us",
        button_2_link: "#why-work-with-us",
        imageUrl: "/home/career.jpg"
      },
      why: {
        title: "Why Work with Samruddhi HR Services",
        subtitle: "We offer an environment where skills are valued, responsibilities are trusted, and growth is earned.",
        benefits: [
          { icon: "FaHandshake", text: "Professional and ethical work culture" },
          { icon: "FaUsers", text: "Exposure to multiple industries and corporate clients" },
          { icon: "FaGraduationCap", text: "Learning and growth opportunities" },
          { icon: "FaChartLine", text: "Stable and process-driven organization" },
          { icon: "FaAward", text: "Performance-based growth and recognition" }
        ]
      },
      opportunities: {
        title: "Career Opportunities",
        subtitle: "We regularly hire professionals across multiple departments."
      },
      eligibility: {
        left_title: "Who Can Apply",
        right_title: "What We Look For",
        can_apply: [
          "Graduates / Post-graduates (any stream relevant to role)",
          "Candidates with HR, recruitment, payroll, compliance, or BFSI experience",
          "Strong communication and professional ethics",
          "Willingness to work in a corporate and client-focused environment"
        ],
        looking_for: [
          "Professional attitude and commitment",
          "Basic understanding of HR or corporate processes",
          "Willingness to learn and grow",
          "Teamwork and responsibility",
          "Integrity and compliance mindset"
        ]
      },
      contact: {
        heading: "How to Apply",
        subtitle: "Choose the easiest way to send us your resume",
        intro: "Ready to build your career with Samruddhi? Send your CV directly to our hiring team through email or WhatsApp and our HR team will get back to you.",
        email: "Kuldeep.chatole@samruddhihrservices.com",
        whatsapp: "+918208021948",
        email_button: "Email Resume",
        whatsapp_button: "WhatsApp Resume"
      },
      commitment: {
        title: "Our Commitment to Employees",
        description: "At Samruddhi HR Services, we don’t just hire — we create long-term, ethical, and growth-driven careers for professionals across India.",
        commitments: [
          "Fair employment practices",
          "Equal opportunity workplace",
          "Safe and respectful work environment",
          "Continuous skill development"
        ]
      }
    });

    // About content
    await seedContentKey('about_content', {
      imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=800&fit=crop",
      paragraphs: [
        "<span class=\"font-semibold text-[#285e9c]\">Samruddhi HR Services</span> delivers structured, compliant, and dependable HR and manpower solutions.",
        "We simplify workforce management, reduce operational risks, and improve productivity through professional staffing and HR outsourcing services.",
        "Our approach is practical, process-driven, and aligned with Indian labour laws and corporate standards."
      ],
      vision: "To become a trusted HR and manpower services company recognized for <span class=\"font-semibold text-[#285e9c]\">reliability, compliance</span>, and <span class=\"font-semibold text-[#285e9c]\">long-term client partnerships</span>.",
      missions: [
        "Deliver quality manpower solutions across industries",
        "Ensure complete statutory and labour law compliance",
        "Support business growth through effective people management"
      ],
      features: [
        {
          id: 1,
          title: "Strong understanding of corporate HR requirements",
          description: "Deep expertise in aligning HR strategies with business objectives",
          color: "#285e9c",
          icon: "FaBriefcase"
        },
        {
          id: 2,
          title: "Industry-specific manpower solutions",
          description: "Customized recruitment for diverse sectors and specialized roles",
          color: "#83a62e",
          icon: "FaUserTie"
        },
        {
          id: 3,
          title: "Statutory compliance and audit readiness",
          description: "Complete adherence to labor laws and regulatory requirements",
          color: "#285e9c",
          icon: "FaCheckCircle"
        },
        {
          id: 4,
          title: "Quick turnaround and scalable hiring",
          description: "Rapid deployment capabilities with flexible scaling options",
          color: "#83a62e",
          icon: "FaRocket"
        },
        {
          id: 5,
          title: "Transparent and ethical HR practices",
          description: "Integrity-driven processes ensuring fair and honest dealings",
          color: "#285e9c",
          icon: "FaHandshake"
        },
        {
          id: 6,
          title: "Value-added financial facilitation services",
          description: "Comprehensive support for loans and financial solutions",
          color: "#83a62e",
          icon: "FaChartLine"
        }
      ]
    });

    // Manpower services list
    await seedContentKey('manpower_services', [
      {
        id: 1,
        icon: "FaUsers",
        title: "Contract / Temporary Manpower Services",
        description: "We provide skilled and unskilled contract manpower for factories, warehouses, project sites, and corporate offices.",
        features: [
          "Flexible workforce deployment",
          "Payroll, PF, ESI & labour compliance",
          "Reduced HR and administrative burden",
          "Quick replacement and scalability"
        ],
        color: "#285e9c"
      },
      {
        id: 2,
        icon: "FaUserTie",
        title: "Permanent Staffing & Recruitment",
        description: "Our permanent recruitment services help organizations hire reliable professionals for long-term roles.",
        features: [
          "Entry, mid & senior-level hiring",
          "Executive search & headhunting",
          "Quality screening and assessment",
          "Faster hiring turnaround"
        ],
        color: "#83a62e"
      },
      {
        id: 3,
        icon: "FaUsersCog",
        title: "Bulk & Mass Hiring",
        description: "We support large-scale recruitment requirements for manufacturing units, logistics hubs, and project-based operations with quick deployment timelines.",
        features: [],
        color: "#285e9c"
      },
      {
        id: 4,
        icon: "FaFileInvoiceDollar",
        title: "Payroll & Statutory Compliance",
        description: "We manage complete payroll and labour compliance operations, ensuring peace of mind for employers.",
        features: [
          "Salary processing",
          "PF, ESI, PT & TDS compliance",
          "Labour law documentation",
          "Audit and inspection support"
        ],
        color: "#83a62e"
      },
      {
        id: 5,
        icon: "FaHome",
        title: "Home Loan Assistance",
        description: "We assist eligible employees and business owners with home loan facilitation through trusted financial institutions.",
        features: [
          "Loan eligibility assessment",
          "Documentation support",
          "Bank coordination",
          "Faster processing assistance"
        ],
        color: "#285e9c"
      },
      {
        id: 6,
        icon: "FaBriefcase",
        title: "Business Loan Assistance",
        description: "We support startups, MSMEs, and corporates in securing business loans and working capital solutions.",
        features: [
          "Term loans & working capital loans",
          "MSME & unsecured business loans",
          "Documentation & process support",
          "Bank and NBFC coordination"
        ],
        color: "#83a62e"
      },
      {
        id: 7,
        icon: "FaUniversity",
        title: "CASA (Current & Savings Account Opening)",
        description: "We provide CASA account opening support for individuals, employees, and businesses.",
        features: [
          "Savings & current account opening",
          "Salary account facilitation",
          "Documentation assistance",
          "Corporate account coordination"
        ],
        color: "#285e9c"
      },
      {
        id: 8,
        icon: "FaHandshake",
        title: "HR Outsourcing & Consulting",
        description: "End-to-end HR outsourcing services including policy setup, HR audits, compliance advisory, and workforce management support.",
        features: [],
        color: "#83a62e"
      }
    ]);

    // Industries We Serve
    await seedContentKey('industries_we_serve', [
      {
        id: 1,
        image: "/industriesweserves/Manufacturing & Engineering.jpg",
        title: "Manufacturing & Engineering",
        description: "Skilled workforce for production, quality control, and engineering operations",
        color: "#285e9c"
      },
      {
        id: 2,
        image: "/industriesweserves/Supply Chain.jpg",
        title: "Logistics & Supply Chain",
        description: "Drivers, warehouse staff, and supply chain management professionals",
        color: "#83a62e"
      },
      {
        id: 3,
        image: "/industriesweserves/Facility Management.jpg",
        title: "Warehousing & Facility Management",
        description: "Operations staff, supervisors, and facility maintenance personnel",
        color: "#285e9c"
      },
      {
        id: 4,
        image: "/industriesweserves/fmcg.jpg",
        title: "Retail & FMCG",
        description: "Sales associates, store managers, and distribution specialists",
        color: "#83a62e"
      },
      {
        id: 5,
        image: "/industriesweserves/it.jpg",
        title: "IT & ITES",
        description: "Technical support, software developers, and IT infrastructure teams",
        color: "#285e9c"
      },
      {
        id: 6,
        image: "/industriesweserves/telecom.jpg",
        title: "Telecom",
        description: "Network technicians, customer service, and field operations staff",
        color: "#83a62e"
      },
      {
        id: 7,
        image: "/industriesweserves/Marketing.jpg",
        title: "Media & Marketing",
        description: "Creative professionals, content creators, and marketing specialists",
        color: "#285e9c"
      },
      {
        id: 8,
        image: "/industriesweserves/BFSI.jpg",
        title: "BFSI & Corporate Services",
        description: "Banking professionals, financial advisors, and corporate support staff",
        color: "#83a62e"
      }
    ]);

    // Contact details
    await seedContentKey('contact_details', {
      phone: "+91 8208021948",
      email: "info@samruddhihrservices.com",
      address: "Nashik, Maharashtra",
      facebook: "https://facebook.com/samruddhihr",
      twitter: "https://twitter.com/samruddhihr",
      instagram: "https://instagram.com/samruddhihr",
      map_iframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119981.26815330364!2d73.72107936111818!3d19.99042851410656!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdd902e8d350993%3A0xc3169e6b4e0600d8!2sNashik%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1717070000000!5m2!1sen!2sin"
    });

    // Footer content
    await seedContentKey('footer_content', {
      logo_image: "/logo/logo.png",
      logo_title: "Samruddhi",
      logo_subtitle: "HR Services",
      company_header: "Company",
      services_header: "Services",
      contact_header: "Contact",
      newsletter_header: "Newsletter",
      newsletter_placeholder: "Your email",
      newsletter_button_text: "Subscribe",
      description: "We provide reliable manpower, HR outsourcing, compliance support, and workforce solutions across India to help organizations grow with confidence.",
      copyright: "Samruddhi HR Services. All rights reserved.",
      company_links: [
        { name: "Home", path: "/" },
        { name: "About Us", path: "/about" },
        { name: "Careers", path: "/careers" },
        { name: "Contact Us", path: "/contact" }
      ],
      services_links: [
        { name: "Staffing & Manpower Supply", path: "/services/staffing-&-manpower-supply" },
        { name: "Compliances", path: "/services/compliances" },
        { name: "Contract Staffing", path: "/services/contract-staffing" },
        { name: "Permanent Hiring", path: "/services/permanent-hiring" },
        { name: "Payroll Outsourcing", path: "/services/payroll-outsourcing" },
        { name: "IT & Engineering Staffing", path: "/services/it-&-engineering-staffing" }
      ]
    });

    // Manpower page header content
    await seedContentKey('manpower_header', {
      badge: "Manpower Services",
      title: "Manpower & HR Solutions",
      subtitle: "Comprehensive workforce management and financial facilitation services for businesses across India"
    });

    // Industries page header content
    await seedContentKey('industries_header', {
      badge: "Industries We Serve",
      title: "Industries We Serve Across India",
      subtitle: "Our services are designed to meet industry-specific operational and compliance requirements."
    });

  } catch (err) {
    console.error('Database seeding/schema configuration error:', err.message);
  }
}

export const query = (text, params) => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDatabase() first.');
  }
  return pool.query(text, params);
};

export function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDatabase() first.');
  }
  return pool;
}

export default getPool;
