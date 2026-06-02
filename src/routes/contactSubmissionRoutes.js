import express from 'express';
import { getContactSubmissions, createContactSubmission, deleteContactSubmission } from '../controllers/contactSubmissionController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getContactSubmissions);
router.post('/', createContactSubmission);
router.delete('/:id', authMiddleware, deleteContactSubmission);

export default router;
