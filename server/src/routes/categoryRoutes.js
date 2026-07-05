import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { categoryValidation } from '../validators/categoryValidator.js';

const router = express.Router();

router.route('/')
  .get(protect, getCategories)
  .post(protect, categoryValidation, createCategory);

router.route('/:id')
  .put(protect, categoryValidation, updateCategory)
  .delete(protect, deleteCategory);

export default router;
