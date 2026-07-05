import { body } from 'express-validator';
import { handleValidationErrors } from './authValidator.js';

export const budgetValidation = [
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),
  body('amount')
    .isNumeric().withMessage('Amount must be a number')
    .custom((value) => value > 0).withMessage('Amount must be greater than 0'),
  body('month')
    .notEmpty().withMessage('Month is required')
    .matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format'),
  handleValidationErrors
];
