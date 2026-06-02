import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Cloudinary storage for images
const imageCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'samruddhi-hr/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
    transformation: [{ width: 1920, height: 1080, crop: 'limit', quality: 'auto' }],
  },
});

// Cloudinary storage for resumes/documents
const resumeCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'samruddhi-hr/resumes',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw', // For non-image files
  },
});

// Image upload with Cloudinary
export const uploadImage = multer({
  storage: imageCloudinaryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Resume/Document upload with Cloudinary
const upload = multer({
  storage: resumeCloudinaryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default upload;
