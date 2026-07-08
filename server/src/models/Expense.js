import mongoose from 'mongoose';

/**
 * What this file does:
 * Defines the MongoDB schema and Mongoose model for an Expense record.
 * 
 * Why this logic exists:
 * To store individual spending transactions. The schema uses references (`ref: 'User'` and `ref: 'Category'`) 
 * to link expenses back to the user who created them and the category they fall under. This normalized approach 
 * keeps data consistent.
 */

const expenseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
      min: [0, 'Amount cannot be negative'],
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
      default: Date.now,
    },
    description: {
      type: String,
    },
    receiptUrl: {
      type: String,
    },
    receiptId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
