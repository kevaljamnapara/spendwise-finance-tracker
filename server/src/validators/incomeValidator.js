import { body } from 'express-validator';
import { handleValidationErrors } from './authValidator.js';

export const incomeValidation = [
  body('source')
    .trim()
    .notEmpty().withMessage('Source is required')
    .isLength({ max: 100 }).withMessage('Source cannot exceed 100 characters'),
  body('amount')
    .isNumeric().withMessage('Amount must be a number')
    .custom((value) => value > 0).withMessage('Amount must be greater than 0'),
  body('date')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  handleValidationErrors
];
