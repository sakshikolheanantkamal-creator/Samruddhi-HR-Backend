import express from 'express';
import {
  getApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
} from '../controllers/applicationController.js';
import upload from '../middleware/upload.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getApplications);
router.post('/', upload.single('resume'), createApplication);
router.patch('/:id/status', authMiddleware, updateApplicationStatus);
router.delete('/:id', authMiddleware, deleteApplication);

export default router;
