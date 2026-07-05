import Expense from '../models/Expense.js';
import Income from '../models/Income.js';

// @desc    Get all expenses for user
// @route   GET /api/v1/expenses
// @access  Private
export const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id })
      .populate('category', 'name color')
      .sort({ date: -1 });
      
    res.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new expense
// @route   POST /api/v1/expenses
// @access  Private
export const createExpense = async (req, res, next) => {
  try {
    const { category, amount, date, description } = req.body;
    
    // Calculate current balance
    const userId = req.user._id;
    const [incomeTotal] = await Income.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const [expenseTotal] = await Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalIncome = incomeTotal?.total || 0;
    const totalExpense = expenseTotal?.total || 0;
    const currentBalance = totalIncome - totalExpense;

    if (currentBalance < amount) {
      res.status(400);
      throw new Error(`Insufficient balance. Current balance is ₹${currentBalance.toFixed(2)}, which is less than the expense amount.`);
    }

    const expense = await Expense.create({
      user: req.user._id,
      category,
      amount,
      date: date || Date.now(),
      description
    });

    const populatedExpense = await expense.populate('category', 'name color');

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: populatedExpense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/v1/expenses/:id
// @access  Private
export const updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404);
      throw new Error('Expense record not found');
    }

    if (expense.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this record');
    }

    const newAmount = req.body.amount;
    if (newAmount !== undefined) {
      const userId = req.user._id;
      const [incomeTotal] = await Income.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const [expenseTotal] = await Expense.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const totalIncome = incomeTotal?.total || 0;
      const totalExpense = expenseTotal?.total || 0;
      
      const balanceWithoutThisExpense = totalIncome - (totalExpense - expense.amount);

      if (balanceWithoutThisExpense < newAmount) {
        res.status(400);
        throw new Error(`Insufficient balance. Available balance is ₹${balanceWithoutThisExpense.toFixed(2)}, which is less than the updated expense amount.`);
      }
    }

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name color');

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/v1/expenses/:id
// @access  Private
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404);
      throw new Error('Expense record not found');
    }

    if (expense.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this record');
    }

    await expense.deleteOne();

    res.json({
      success: true,
      message: 'Expense deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
