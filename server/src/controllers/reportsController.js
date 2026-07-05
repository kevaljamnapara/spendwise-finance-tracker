import Expense from '../models/Expense.js';
import Income from '../models/Income.js';

// @desc    Get comprehensive financial reports
// @route   GET /api/v1/reports
// @access  Private
export const getReports = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const userId = req.user._id;

    // Income vs Expense over time (by month/year)
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
    
    // Merge income and expense by month
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
    const expenseByCategory = await Expense.aggregate([
      { $match: { user: userId, ...dateFilter } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryData' } },
      { $unwind: '$categoryData' },
      { $project: { name: '$categoryData.name', value: '$total', color: '$categoryData.color' } },
      { $sort: { value: -1 } }
    ]);

    // Income by Category
    // (Assuming income uses categories too, but let's check income schema. Income schema has `source: String`)
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
