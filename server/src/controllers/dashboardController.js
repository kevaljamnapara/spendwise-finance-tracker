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

    // ==========================================
    // 1. Calculate Overall Balance
    // ==========================================
    // We use MongoDB Aggregation to quickly calculate the sum of all records on the database side.
    // $match: Filters records by the current user.
    // $group: Groups all those records together (_id: null means group everything into one bucket) and calculates the sum.
    
    const [incomeAggregation] = await Income.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const [expenseAggregation] = await Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    
    // Fallback to 0 if the user has no records yet
    const totalIncomeValue = incomeAggregation?.total || 0;
    const totalExpenseValue = expenseAggregation?.total || 0;
    const balance = totalIncomeValue - totalExpenseValue;

    // ==========================================
    // 2. Monthly Metrics (Current Month Only)
    // ==========================================
    // Create date objects for the very start and end of the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0); // e.g. 2023-10-01T00:00:00.000Z
    
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1); // e.g. 2023-11-01T00:00:00.000Z

    // Calculate income for this month
    const [monthlyIncomeAggregation] = await Income.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lt: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    
    // Calculate expenses for this month
    const [monthlyExpenseAggregation] = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lt: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const monthlyIncome = monthlyIncomeAggregation?.total || 0;
    const monthlyExpense = monthlyExpenseAggregation?.total || 0;

    // ==========================================
    // 3. Category Distribution (Current Month)
    // ==========================================
    // This pipeline determines how much money was spent on each category (Food, Rent, etc.)
    const categoryDistribution = await Expense.aggregate([
      // Step A: Filter by user and current month
      { $match: { user: userId, date: { $gte: startOfMonth, $lt: endOfMonth } } },
      
      // Step B: Group by the category ID and sum the amounts
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      
      // Step C: "Join" with the Categories collection to get the actual category name and color
      // localField is the grouped `_id` (the category ID), foreignField is `_id` in the Categories collection
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryDetails' } },
      
      // Step D: $lookup returns an array. $unwind flattens it to a single object.
      { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
      
      // Step E: Format the final output structure. Provide fallbacks if category was deleted.
      { 
        $project: { 
          name: { $ifNull: ['$categoryDetails.name', 'Uncategorized'] },
          color: { $ifNull: ['$categoryDetails.color', '#cccccc'] },
          total: 1 
        } 
      },
      
      // Step F: Sort by highest spending first
      { $sort: { total: -1 } }
    ]);

    // ==========================================
    // 4. Budget Remaining Calculation
    // ==========================================
    // Simplified: Compares Total Monthly Expense vs Total Monthly Budget
    const currentMonthString = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}`;
    
    const [totalBudgetAggregation] = await Budget.aggregate([
      { $match: { user: userId, month: currentMonthString } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalBudget = totalBudgetAggregation?.total || 0;
    const budgetRemaining = totalBudget > 0 ? totalBudget - monthlyExpense : 0;

    // ==========================================
    // 5. Savings Progress
    // ==========================================
    const [savingsAggregation] = await SavingsGoal.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, current: { $sum: '$currentAmount' }, target: { $sum: '$targetAmount' } } }
    ]);
    
    const savingsProgress = {
      current: savingsAggregation?.current || 0,
      target: savingsAggregation?.target || 0
    };

    // ==========================================
    // 6. Recent Transactions
    // ==========================================
    // Fetch the 5 most recent incomes and 5 most recent expenses
    const recentIncomes = await Income.find({ user: userId }).sort({ date: -1 }).limit(5).lean();
    const recentExpenses = await Expense.find({ user: userId }).populate('category', 'name color').sort({ date: -1 }).limit(5).lean();
    
    // Normalize properties so they can be mixed into a single timeline array on the frontend
    const formattedIncomes = recentIncomes.map(income => ({
      ...income,
      type: 'income',
      title: income.source
    }));
    
    const formattedExpenses = recentExpenses.map(expense => ({
      ...expense,
      type: 'expense',
      title: expense.category?.name || 'Uncategorized',
      color: expense.category?.color || '#000000'
    }));

    // Combine both arrays, sort by date descending, and take the top 5 overall
    const recentTransactions = [...formattedIncomes, ...formattedExpenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // ==========================================
    // Final Response
    // ==========================================
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
    // Pass errors to the global error handler middleware
    next(error);
  }
};
