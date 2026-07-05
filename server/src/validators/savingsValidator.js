import { body } from 'express-validator';
import { handleValidationErrors } from './authValidator.js';

export const savingsValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('targetAmount')
    .isNumeric().withMessage('Target amount must be a number')
    .custom((value) => value > 0).withMessage('Target amount must be greater than 0'),
  body('currentAmount')
    .optional()
    .isNumeric().withMessage('Current amount must be a number')
    .custom((value) => value >= 0).withMessage('Current amount cannot be negative'),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Invalid deadline date format'),
  handleValidationErrors
];
