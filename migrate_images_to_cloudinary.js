import pg from 'pg';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'samruddhi');

dotenv.config({ path: path.join(BACKEND_DIR, '.env') });

console.log('Credentials Check:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'Samruddhi',
});

const PATH_MAPPING = {
  '/uploads/images/': path.join(BACKEND_DIR, 'uploads', 'images'),
  '/services/': path.join(FRONTEND_DIR, 'public', 'services'),
  '/home/': path.join(FRONTEND_DIR, 'public', 'home'),
  '/industriesweserves/': path.join(FRONTEND_DIR, 'public', 'industriesweserves'),
  '/logo/': path.join(FRONTEND_DIR, 'public', 'logo'),
  '/': path.join(FRONTEND_DIR, 'public'),
};

const uploadCache = new Map();

async function uploadToCloudinary(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') return inputPath;
  
  // Skip if already on Cloudinary
  if (inputPath.includes('res.cloudinary.com')) return inputPath;
  
  if (uploadCache.has(inputPath)) return uploadCache.get(inputPath);

  let source = null;
  let isRemote = false;

  if (inputPath.startsWith('http')) {
    source = inputPath;
    isRemote = true;
  } else {
    // Local path handling
    for (const [prefix, dir] of Object.entries(PATH_MAPPING)) {
      if (inputPath.startsWith(prefix)) {
        const fileName = inputPath.substring(prefix.length);
        const tryPath = path.join(dir, fileName);
        if (fs.existsSync(tryPath)) {
          source = tryPath;
          break;
        }
      }
    }

    if (!source) {
      const fileName = inputPath.startsWith('/') ? inputPath.substring(1) : inputPath;
      const rootPublicPath = path.join(FRONTEND_DIR, 'public', fileName);
      if (fs.existsSync(rootPublicPath)) {
        source = rootPublicPath;
      }
    }
  }

  if (source) {
    try {
      console.log(`📤 Uploading ${isRemote ? 'Remote' : 'Local'}: ${inputPath} ...`);
      const result = await cloudinary.uploader.upload(source, {
        folder: 'samruddhi-hr/images',
        resource_type: 'image'
      });
      console.log(`✅ Uploaded: ${result.secure_url}`);
      uploadCache.set(inputPath, result.secure_url);
      return result.secure_url;
    } catch (error) {
      console.error(`❌ Failed to upload ${inputPath}:`, error.message || error);
      return inputPath;
    }
  } else {
    console.warn(`⚠️ Source not found for: ${inputPath}`);
    return inputPath;
  }
}

async function processJson(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    const newArr = [];
    for (const item of obj) {
      newArr.push(await processJson(item));
    }
    return newArr;
  }

  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && 
        (value.includes('/uploads/images/') || 
         value.includes('/services/') || 
         value.startsWith('http') ||
         value.endsWith('.jpg') || 
         value.endsWith('.png') || 
         value.endsWith('.jpeg'))) {
      newObj[key] = await uploadToCloudinary(value);
    } else if (typeof value === 'object') {
      newObj[key] = await processJson(value);
    } else {
      newObj[key] = value;
    }
  }
  return newObj;
}

async function migrate() {
  try {
    console.log('🚀 Starting Comprehensive Migration to Cloudinary...\n');

    // 1. Simple tables
    const tables = [
      { name: 'home', column: 'hero_image' },
      { name: 'about', column: 'image_url' },
      { name: 'industries', column: 'image' },
      { name: 'manpower_services', column: 'image' },
      { name: 'services', column: 'hero_image' },
      { name: 'services', column: 'other_image' },
      { name: 'footer', column: 'logo' },
      { name: 'careers_content', column: 'hero_image_url' }
    ];

    for (const table of tables) {
      console.log(`📋 Processing ${table.name}.${table.column}...`);
      const result = await pool.query(`SELECT id, "${table.column}" FROM "${table.name}"`);
      for (const row of result.rows) {
        const currentUrl = row[table.column];
        if (currentUrl && !currentUrl.includes('res.cloudinary.com')) {
          const newUrl = await uploadToCloudinary(currentUrl);
          if (newUrl !== currentUrl) {
            await pool.query(`UPDATE "${table.name}" SET "${table.column}" = $1 WHERE id = $2`, [newUrl, row.id]);
          }
        }
      }
    }

    // 2. Site Content (JSONB)
    console.log('\n📋 Processing site_content table (JSONB)...');
    const siteContent = await pool.query('SELECT key, value FROM site_content');
    for (const row of siteContent.rows) {
      console.log(`   Processing key: ${row.key}...`);
      const newValue = await processJson(row.value);
      await pool.query('UPDATE site_content SET value = $1 WHERE key = $2', [JSON.stringify(newValue), row.key]);
    }

    console.log('\n✨ Migration complete!');
    await pool.end();
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    await pool.end();
  }
}

migrate();
