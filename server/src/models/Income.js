import mongoose from 'mongoose';

const incomeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    source: {
      type: String,
      required: [true, 'Please add an income source'],
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
  },
  {
    timestamps: true,
  }
);

const Income = mongoose.model('Income', incomeSchema);
export default Income;
