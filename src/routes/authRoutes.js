import express from 'express';
import { login, changePassword, checkAuth } from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/change-password', authMiddleware, changePassword);
router.get('/me', authMiddleware, checkAuth);

export default router;
