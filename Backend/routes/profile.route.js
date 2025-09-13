import express from 'express';
import { getMyProfile, updateMyProfile, getLoginActivity } from '../controller/profile.controller.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// Get current user's profile
router.get('/me', verifyToken, getMyProfile);

// Get recent login activity
router.get('/login-activity', verifyToken, getLoginActivity);

// Update current user's profile
router.put('/me', verifyToken, updateMyProfile);

export default router;
