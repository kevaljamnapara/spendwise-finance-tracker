import mongoose from 'mongoose';

const savingsGoalSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title for the savings goal'],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please add a target amount'],
      min: [0, 'Target amount cannot be negative'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
    },
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);
export default SavingsGoal;
