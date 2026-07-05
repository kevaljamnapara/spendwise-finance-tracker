import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import SavingsGoal from '../models/SavingsGoal.js';

// @desc    Get dashboard summary
// @route   GET /api/v1/dashboard/summary
// @access  Private
export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Calculate Balance
    const [incomeTotal] = await Income.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const [expenseTotal] = await Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    
    const totalIncomeValue = incomeTotal?.total || 0;
    const totalExpenseValue = expenseTotal?.total || 0;
    const balance = totalIncomeValue - totalExpenseValue;

    // 2. Monthly Metrics (Current Month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const [monthlyIncomeTotal] = await Income.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lt: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const [monthlyExpenseTotal] = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lt: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const monthlyIncome = monthlyIncomeTotal?.total || 0;
    const monthlyExpense = monthlyExpenseTotal?.total || 0;

    // 3. Category Distribution (Current Month)
    const categoryDistribution = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lt: endOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryDetails' } },
      { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
      { 
        $project: { 
          name: { $ifNull: ['$categoryDetails.name', 'Uncategorized'] },
          color: { $ifNull: ['$categoryDetails.color', '#cccccc'] },
          total: 1 
        } 
      },
      { $sort: { total: -1 } }
    ]);

    // 4. Budget Remaining (Simplified: Total Monthly Expense vs Total Monthly Budget)
    const currentMonthString = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}`;
    const [totalBudgetRes] = await Budget.aggregate([
      { $match: { user: userId, month: currentMonthString } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalBudget = totalBudgetRes?.total || 0;
    const budgetRemaining = totalBudget > 0 ? totalBudget - monthlyExpense : 0;

    // 5. Savings Progress
    const [savingsTotalRes] = await SavingsGoal.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, current: { $sum: '$currentAmount' }, target: { $sum: '$targetAmount' } } }
    ]);
    const savingsProgress = {
      current: savingsTotalRes?.current || 0,
      target: savingsTotalRes?.target || 0
    };

    // 6. Recent Transactions (Merge Income & Expense)
    const recentIncomes = await Income.find({ user: userId }).sort({ date: -1 }).limit(5).lean();
    const recentExpenses = await Expense.find({ user: userId }).populate('category', 'name color').sort({ date: -1 }).limit(5).lean();
    
    const formattedIncomes = recentIncomes.map(inc => ({
      ...inc,
      type: 'income',
      title: inc.source
    }));
    
    const formattedExpenses = recentExpenses.map(exp => ({
      ...exp,
      type: 'expense',
      title: exp.category?.name || 'Uncategorized',
      color: exp.category?.color || '#000000'
    }));

    const recentTransactions = [...formattedIncomes, ...formattedExpenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json({
      success: true,
      message: 'Dashboard summary retrieved successfully',
      data: {
        balance,
        monthlyIncome,
        monthlyExpense,
        budgetRemaining,
        totalBudget,
        savingsProgress,
        categoryDistribution,
        recentTransactions,
      }
    });
  } catch (error) {
    next(error);
  }
};
