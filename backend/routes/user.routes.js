import express from 'express';
import { 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser,
  updateProfile,
  uploadAvatar
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, getUser);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, uploadSingle, uploadAvatar);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;