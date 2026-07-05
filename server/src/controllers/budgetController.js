import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';

// @desc    Get all budgets for user with current spend
// @route   GET /api/v1/budgets
// @access  Private
export const getBudgets = async (req, res, next) => {
  try {
    const { month } = req.query; // optional filter by month YYYY-MM
    let query = { user: req.user._id };
    
    if (month) {
      query.month = month;
    }

    const budgets = await Budget.find(query)
      .populate('category', 'name color')
      .sort({ month: -1 });

    // For each budget, calculate how much was spent in that month for that category
    const budgetsWithSpend = await Promise.all(
      budgets.map(async (budget) => {
        const [year, monthStr] = budget.month.split('-');
        const startDate = new Date(year, parseInt(monthStr) - 1, 1);
        const endDate = new Date(year, parseInt(monthStr), 0, 23, 59, 59);

        const [spendResult] = await Expense.aggregate([
          { 
            $match: { 
              user: req.user._id, 
              category: budget.category._id,
              date: { $gte: startDate, $lte: endDate }
            } 
          },
          { $group: { _id: null, totalSpent: { $sum: '$amount' } } }
        ]);

        return {
          ...budget.toObject(),
          totalSpent: spendResult?.totalSpent || 0
        };
      })
    );

    res.json({
      success: true,
      data: budgetsWithSpend
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new budget
// @route   POST /api/v1/budgets
// @access  Private
export const createBudget = async (req, res, next) => {
  try {
    const { category, amount, month } = req.body;
    
    // Check if budget for this category and month already exists
    const existingBudget = await Budget.findOne({ user: req.user._id, category, month });
    if (existingBudget) {
      res.status(400);
      throw new Error('A budget for this category already exists for the selected month');
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      amount,
      month
    });

    const populatedBudget = await budget.populate('category', 'name color');

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: { ...populatedBudget.toObject(), totalSpent: 0 }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/v1/budgets/:id
// @access  Private
export const updateBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this budget');
    }

    budget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name color');

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/v1/budgets/:id
// @access  Private
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this budget');
    }

    await budget.deleteOne();

    res.json({
      success: true,
      message: 'Budget deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
