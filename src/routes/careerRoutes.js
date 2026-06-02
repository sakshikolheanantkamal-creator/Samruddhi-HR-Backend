import express from 'express';
import {
  getCareers,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/careerController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCareers);
router.post('/departments', authMiddleware, createDepartment);
router.put('/departments/:id', authMiddleware, updateDepartment);
router.delete('/departments/:id', authMiddleware, deleteDepartment);
router.post('/jobs', authMiddleware, createJob);
router.put('/jobs/:id', authMiddleware, updateJob);
router.delete('/jobs/:id', authMiddleware, deleteJob);

export default router;
