import { useState, useEffect } from 'react';
import reportsService from '@/services/reportsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, FileText } from 'lucide-react';

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Default to current year
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const response = await reportsService.getReports(startDate, endDate);
        setReportData(response.data);
      } catch (err) {
        setError('Failed to load reports');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [startDate, endDate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (isLoading && !reportData) {
    return <div className="p-8 text-center text-zinc-500">Generating reports...</div>;
  }

  const { summary, timeline, expenseByCategory, incomeBySource } = reportData || {};

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 print-report">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-report, .print-report * {
            visibility: visible;
          }
          .print-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .card {
            border: 1px solid #e4e4e7 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Print Only Header */}
      <div className="hidden print:block border-b border-zinc-200 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-center text-zinc-900">SpendWise Financial Report</h1>
        <p className="text-center text-zinc-500 mt-2">
          Statement Period: {new Date(startDate).toLocaleDateString('en-IN')} to {new Date(endDate).toLocaleDateString('en-IN')}
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Comprehensive analysis of your finances.</p>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label htmlFor="startDate" className="mb-2 block text-xs text-zinc-500">From Date</Label>
            <Input 
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl bg-white dark:bg-zinc-950 w-36"
            />
          </div>
          <div>
            <Label htmlFor="endDate" className="mb-2 block text-xs text-zinc-500">To Date</Label>
            <Input 
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl bg-white dark:bg-zinc-950 w-36"
            />
          </div>
          <Button onClick={() => window.print()} className="rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
            <FileText className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-500 rounded-xl">{error}</div>}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">Total Income</CardTitle>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                {formatCurrency(summary.totalIncome)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">Total Expense</CardTitle>
              <TrendingDown className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                {formatCurrency(summary.totalExpense)}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">Net Savings</CardTitle>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                {formatCurrency(summary.netSavings)}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">Savings Rate</CardTitle>
              <Activity className="w-4 h-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-500">
                {summary.savingsRate}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Income vs Expense Timeline */}
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Cash Flow Timeline</CardTitle>
            <CardDescription>Monthly comparison of income and expenses</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {timeline && timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeline} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#71717a' }} tickLine={false} axisLine={false} />
                  <YAxis 
                    tickFormatter={(value) => `₹${value}`} 
                    tick={{ fontSize: 12, fill: '#71717a' }} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    cursor={{ fill: '#f4f4f5' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500">No data for selected period</div>
            )}
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {expenseByCategory && expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#cbd5e1'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500">No data for selected period</div>
            )}
          </CardContent>
        </Card>

        {/* Income by Source */}
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle>Income by Source</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {incomeBySource && incomeBySource.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeBySource}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {incomeBySource.map((entry, index) => {
                      const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500">No data for selected period</div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
