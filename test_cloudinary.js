import cloudinary from './src/config/cloudinary.js';

console.log('🔍 Testing Cloudinary Configuration...\n');

// Check if credentials are loaded
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || '❌ NOT SET');
console.log('API Key:', process.env.CLOUDINARY_API_KEY || '❌ NOT SET');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ SET (hidden)' : '❌ NOT SET');

console.log('\n📡 Testing Cloudinary Connection...\n');

// Test the API connection by fetching account details
cloudinary.api.ping()
  .then(() => {
    console.log('✅ SUCCESS! Cloudinary connection is working.');
    console.log('📁 You can now upload images to Cloudinary.\n');
    
    // Show the configured cloud name
    console.log('Cloud URL Pattern:');
    console.log(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`);
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ FAILED! Cloudinary connection error:');
    console.error(error.message);
    console.error('\n💡 Solution:');
    console.error('1. Go to Cloudinary Dashboard: https://console.cloudinary.com');
    console.error('2. Click "Go to API Keys" or Settings → API Keys');
    console.error('3. Reveal and copy your API Secret');
    console.error('4. Update backend/.env file:');
    console.error('   CLOUDINARY_API_SECRET=your_actual_api_secret');
    console.error('5. Run this test again: node test_cloudinary.js\n');
    
    process.exit(1);
  });
