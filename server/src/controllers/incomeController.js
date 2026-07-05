import Income from '../models/Income.js';
import Expense from '../models/Expense.js';

// @desc    Get all incomes for user
// @route   GET /api/v1/incomes
// @access  Private
export const getIncomes = async (req, res, next) => {
  try {
    const incomes = await Income.find({ user: req.user._id }).sort({ date: -1 });
    res.json({
      success: true,
      data: incomes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new income
// @route   POST /api/v1/incomes
// @access  Private
export const createIncome = async (req, res, next) => {
  try {
    const { source, amount, date, description } = req.body;
    
    const income = await Income.create({
      user: req.user._id,
      source,
      amount,
      date: date || Date.now(),
      description
    });

    res.status(201).json({
      success: true,
      message: 'Income added successfully',
      data: income
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update income
// @route   PUT /api/v1/incomes/:id
// @access  Private
export const updateIncome = async (req, res, next) => {
  try {
    let income = await Income.findById(req.params.id);

    if (!income) {
      res.status(404);
      throw new Error('Income record not found');
    }

    if (income.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this record');
    }

    const newAmount = req.body.amount;
    if (newAmount !== undefined) {
      const userId = req.user._id;
      const [incomeTotalRes] = await Income.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const [expenseTotalRes] = await Expense.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const totalIncome = incomeTotalRes?.total || 0;
      const totalExpense = expenseTotalRes?.total || 0;
      
      const balanceWithoutThisIncome = (totalIncome - income.amount) - totalExpense;
      const projectedBalance = balanceWithoutThisIncome + newAmount;

      if (projectedBalance < 0) {
        res.status(400);
        throw new Error(`Cannot update income. Reducing this income to ₹${newAmount} would cause your total balance to fall below zero (to ₹${projectedBalance.toFixed(2)}).`);
      }
    }

    income = await Income.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Income updated successfully',
      data: income
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete income
// @route   DELETE /api/v1/incomes/:id
// @access  Private
export const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      res.status(404);
      throw new Error('Income record not found');
    }

    if (income.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this record');
    }

    const userId = req.user._id;
    const [incomeTotalRes] = await Income.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const [expenseTotalRes] = await Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalIncome = incomeTotalRes?.total || 0;
    const totalExpense = expenseTotalRes?.total || 0;
    
    const projectedBalance = (totalIncome - income.amount) - totalExpense;

    if (projectedBalance < 0) {
      res.status(400);
      throw new Error(`Cannot delete income. Deleting this income would cause your total balance to fall below zero (to ₹${projectedBalance.toFixed(2)}).`);
    }

    await income.deleteOne();

    res.json({
      success: true,
      message: 'Income deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
