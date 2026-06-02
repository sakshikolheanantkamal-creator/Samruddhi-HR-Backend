import cloudinary from './src/config/cloudinary.js';

console.log('📁 Creating samruddhi-hr folder in Cloudinary...\n');

// Upload a simple 1x1 pixel placeholder to create the folder structure
// We'll use a base64 encoded 1x1 transparent PNG
const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

console.log('🚀 Uploading placeholder image to create folder structure...');

cloudinary.uploader.upload(base64Image, {
  folder: 'samruddhi-hr/images',
  public_id: 'folder-created',
  overwrite: true,
  resource_type: 'image'
})
  .then((result) => {
    console.log('\n✅ SUCCESS! Folder structure created in Cloudinary.\n');
    console.log('📂 Folder Path: samruddhi-hr/images');
    console.log('📸 Placeholder Image URL:', result.secure_url);
    console.log('\n🎉 Now check your Cloudinary Dashboard:');
    console.log('1. Go to: https://console.cloudinary.com');
    console.log('2. Click "Media Library" → "Folders"');
    console.log('3. Refresh the page');
    console.log('4. You should now see "samruddhi-hr" folder!');
    console.log('\n💡 The folder structure is now ready for your project uploads.\n');
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to create folder!');
    console.error('Error:', error.message);
    console.error('\nCheck your Cloudinary credentials in .env file.\n');
    
    process.exit(1);
  });
