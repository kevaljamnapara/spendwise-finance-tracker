import express from 'express';
import { getIncomes, createIncome, updateIncome, deleteIncome } from '../controllers/incomeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { incomeValidation } from '../validators/incomeValidator.js';

const router = express.Router();

router.route('/')
  .get(protect, getIncomes)
  .post(protect, incomeValidation, createIncome);

router.route('/:id')
  .put(protect, incomeValidation, updateIncome)
  .delete(protect, deleteIncome);

export default router;
