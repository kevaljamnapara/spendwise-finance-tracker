import Expense from '../models/Expense.js';
import Income from '../models/Income.js';

/**
 * What this file does:
 * Generates comprehensive financial reports (timeline data, expenses by category, incomes by source).
 * Performance Optimization:
 * Uses MongoDB Aggregation Pipelines to perform data calculation on the database side. 
 * This is faster and more memory-efficient than fetching raw records to the Node.js server.
 */

// @desc    Get comprehensive financial reports
// @route   GET /api/v1/reports
// @access  Private
export const getReports = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Construct the date filter if provided by the frontend
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const userId = req.user._id;

    // ==========================================
    // 1. Income vs Expense Timeline
    // ==========================================
    // Aggregation Pipeline Explanation:
    // $match filters records by user and date.
    // $group groups the remaining records by year and month, calculating the $sum of amounts.
    // $sort orders the results chronologically.
    const incomeByMonth = await Income.aggregate([
      { $match: { user: userId, ...dateFilter } },
      { $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          totalIncome: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const expenseByMonth = await Expense.aggregate([
      { $match: { user: userId, ...dateFilter } },
      { $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          totalExpense: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Merge income and expense by month into a single array for charting
    const timelineData = {};
    
    incomeByMonth.forEach(item => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      timelineData[key] = { name: key, income: item.totalIncome, expense: 0 };
    });

    expenseByMonth.forEach(item => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (!timelineData[key]) {
        timelineData[key] = { name: key, income: 0, expense: item.totalExpense };
      } else {
        timelineData[key].expense = item.totalExpense;
      }
    });

    const timeline = Object.values(timelineData).sort((a, b) => a.name.localeCompare(b.name));

    // Expenses by Category
    // Aggregation Pipeline Explanation:
    // $match: Filter by user/date.
    // $group: Group by the category ObjectId, summing the amount.
    // $lookup: Performs a "join" with the Categories collection to get the category name and color.
    // $unwind: Flattens the resulting array from the $lookup.
    const expenseByCategory = await Expense.aggregate([
      { $match: { user: userId, ...dateFilter } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryData' } },
      { $unwind: '$categoryData' },
      { $project: { name: '$categoryData.name', value: '$total', color: '$categoryData.color' } },
      { $sort: { value: -1 } }
    ]);

    // Income by Source
    const incomeBySource = await Income.aggregate([
      { $match: { user: userId, ...dateFilter } },
      { $group: { _id: '$source', total: { $sum: '$amount' } } },
      { $project: { name: '$_id', value: '$total' } },
      { $sort: { value: -1 } }
    ]);

    // Summary Totals
    const totalIncome = timeline.reduce((sum, item) => sum + item.income, 0);
    const totalExpense = timeline.reduce((sum, item) => sum + item.expense, 0);
    const netSavings = totalIncome - totalExpense;

    res.json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpense,
          netSavings,
          savingsRate: totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0
        },
        timeline,
        expenseByCategory,
        incomeBySource
      }
    });
  } catch (error) {
    next(error);
  }
};
