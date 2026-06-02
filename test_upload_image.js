import cloudinary from './src/config/cloudinary.js';
import fs from 'fs';
import path from 'path';

console.log('🧪 Testing Cloudinary Image Upload...\n');

// Check if test image exists
const testImagePath = './test_image.jpg';

if (!fs.existsSync(testImagePath)) {
  console.log('❌ Test image not found.');
  console.log('💡 Please create a test image named "test_image.jpg" in the backend folder.');
  console.log('   Or specify a path to any image on your computer.\n');
  process.exit(1);
}

console.log('📤 Uploading test image to Cloudinary...');
console.log('Folder: samruddhi-hr/images\n');

cloudinary.uploader.upload(testImagePath, {
  folder: 'samruddhi-hr/images',
  resource_type: 'image'
})
  .then((result) => {
    console.log('✅ SUCCESS! Image uploaded to Cloudinary.\n');
    console.log('📊 Upload Details:');
    console.log('Public ID:', result.public_id);
    console.log('Format:', result.format);
    console.log('Width:', result.width, 'px');
    console.log('Height:', result.height, 'px');
    console.log('Size:', Math.round(result.bytes / 1024), 'KB');
    console.log('\n🔗 Image URL:');
    console.log(result.secure_url);
    console.log('\n✨ Now check your Cloudinary Dashboard:');
    console.log('1. Go to: https://console.cloudinary.com');
    console.log('2. Click "Media Library" → "Folders"');
    console.log('3. Open folder: samruddhi-hr/images');
    console.log('4. You should see your uploaded test image!\n');
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Upload failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Common issues:');
    console.error('1. Check CLOUDINARY_API_SECRET in .env file');
    console.error('2. Make sure backend/.env has correct credentials');
    console.error('3. Check internet connection\n');
    
    process.exit(1);
  });
