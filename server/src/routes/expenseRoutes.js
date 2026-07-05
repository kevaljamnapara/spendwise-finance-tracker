import express from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { expenseValidation } from '../validators/expenseValidator.js';

const router = express.Router();

router.route('/')
  .get(protect, getExpenses)
  .post(protect, expenseValidation, createExpense);

router.route('/:id')
  .put(protect, expenseValidation, updateExpense)
  .delete(protect, deleteExpense);

export default router;
