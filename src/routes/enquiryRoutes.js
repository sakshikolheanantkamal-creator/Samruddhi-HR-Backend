import express from 'express';
import { getEnquiries, createEnquiry, deleteEnquiry } from '../controllers/enquiryController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getEnquiries);
router.post('/', createEnquiry);
router.delete('/:id', authMiddleware, deleteEnquiry);

export default router;
