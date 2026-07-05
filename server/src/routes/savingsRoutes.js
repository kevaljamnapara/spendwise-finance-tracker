import express from 'express';
import { getSavingsGoals, createSavingsGoal, updateSavingsGoal, deleteSavingsGoal } from '../controllers/savingsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { savingsValidation } from '../validators/savingsValidator.js';

const router = express.Router();

router.route('/')
  .get(protect, getSavingsGoals)
  .post(protect, savingsValidation, createSavingsGoal);

router.route('/:id')
  .put(protect, savingsValidation, updateSavingsGoal)
  .delete(protect, deleteSavingsGoal);

export default router;
