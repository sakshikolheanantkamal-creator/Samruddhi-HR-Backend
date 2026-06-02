import express from 'express';
import { getContent, updateContent, uploadImageFile } from '../controllers/contentController.js';
import authMiddleware from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';

const router = express.Router();

// Register the upload route before generic parameter matching
router.post('/upload-image', authMiddleware, uploadImage.single('image'), uploadImageFile);

router.get('/:key', getContent);
router.post('/:key', authMiddleware, updateContent);

export default router;
