import express from 'express';
import {
  registerUser,
  authUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  validateResetToken,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { 
  registerValidation, 
  loginValidation, 
  updateProfileValidation, 
  changePasswordValidation 
} from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, authUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateProfileValidation, updateUserProfile);
router.put('/password', protect, changePasswordValidation, changePassword);
router.post('/forgotpassword', forgotPassword);
router.get('/resetpassword/:resettoken', validateResetToken);
router.put('/resetpassword/:resettoken', resetPassword);

export default router;
