import { useState, useEffect } from 'react';
import dashboardService from '@/services/dashboardService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, Target, PiggyBank, Receipt } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await dashboardService.getSummary();
        setSummary(response.data);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center min-h-[50vh] text-zinc-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!summary) return null;

  const {
    balance,
    monthlyIncome,
    monthlyExpense,
    budgetRemaining,
    savingsProgress,
    categoryDistribution,
    recentTransactions
  } = summary;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const chartData = categoryDistribution?.length > 0 
    ? categoryDistribution 
    : [{ name: 'No Expenses Yet', total: 1, color: '#e4e4e7' }];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Here's what's happening with your money this month.</p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Balance</CardTitle>
            <Wallet className="w-4 h-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(balance)}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Monthly Income</CardTitle>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{formatCurrency(monthlyIncome)}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Monthly Expenses</CardTitle>
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-500">{formatCurrency(monthlyExpense)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Charts & Progress */}
        <div className="lg:col-span-2 space-y-8">
          
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Expense Distribution</CardTitle>
              <CardDescription>Your expenses by category for this month</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Budget Remaining</CardTitle>
                <Target className="w-4 h-4 text-zinc-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(budgetRemaining)}</div>
                <p className="text-xs text-zinc-500 mt-1">out of {formatCurrency(summary.totalBudget)} allocated</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Total Savings</CardTitle>
                <PiggyBank className="w-4 h-4 text-zinc-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(savingsProgress.current)}</div>
                <p className="text-xs text-zinc-500 mt-1">towards {formatCurrency(savingsProgress.target)} goal</p>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm h-full flex flex-col">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {recentTransactions?.length > 0 ? (
                <div className="space-y-6">
                  {recentTransactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: tx.type === 'expense' ? tx.color : '#10b981' }}
                        >
                          <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.title}</p>
                          <p className="text-xs text-zinc-500">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-500' : ''}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 space-y-3 py-12">
                  <Receipt className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
                  <p>No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
