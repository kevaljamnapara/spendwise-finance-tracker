import mongoose from 'mongoose';

const budgetSchema = mongoose.Schema(
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
      required: [true, 'Please add a budget amount'],
      min: [0, 'Budget amount cannot be negative'],
    },
    month: {
      type: String, // e.g., 'YYYY-MM'
      required: [true, 'Please specify the month for the budget'],
    },
  },
  {
    timestamps: true,
  }
);

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
