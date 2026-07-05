import { body } from 'express-validator';
import { handleValidationErrors } from './authValidator.js';

export const categoryValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('type')
    .isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
  body('color')
    .optional()
    .matches(/^#([0-9a-f]{3}){1,2}$/i).withMessage('Color must be a valid hex code'),
  handleValidationErrors
];
