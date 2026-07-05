import express from 'express';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';
import { budgetValidation } from '../validators/budgetValidator.js';

const router = express.Router();

router.route('/')
  .get(protect, getBudgets)
  .post(protect, budgetValidation, createBudget);

router.route('/:id')
  .put(protect, budgetValidation, updateBudget)
  .delete(protect, deleteBudget);

export default router;
