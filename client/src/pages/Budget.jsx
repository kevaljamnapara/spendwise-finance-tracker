import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import budgetService from '@/services/budgetService';
import categoryService from '@/services/categoryService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, Plus, Target } from 'lucide-react';

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Must be in YYYY-MM format'),
});

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const form = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: '',
      amount: '',
      month: currentMonth,
    },
  });

  const fetchData = async (month) => {
    setIsLoading(true);
    try {
      const [budgetsRes, categoriesRes] = await Promise.all([
        budgetService.getBudgets(month),
        categoryService.getCategories(),
      ]);
      setBudgets(budgetsRes.data);
      setCategories(categoriesRes.data.filter(c => c.type === 'expense'));
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedMonth);
  }, [selectedMonth]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setError('');
    try {
      await budgetService.createBudget(values);
      form.reset({
        category: '',
        amount: '',
        month: selectedMonth,
      });
      fetchData(selectedMonth);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this budget?')) return;
    try {
      await budgetService.deleteBudget(id);
      fetchData(selectedMonth);
    } catch (err) {
      setError('Failed to delete budget');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Set monthly spending limits for your categories.</p>
        </div>
        <div className="w-full md:w-48">
          <Label htmlFor="monthFilter" className="mb-2 block">View Month</Label>
          <Input 
            id="monthFilter"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl bg-white dark:bg-zinc-950"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Set Budget Form */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-8">
            <CardHeader>
              <CardTitle>Set Budget</CardTitle>
              <CardDescription>Allocate funds for {selectedMonth}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-xl">{error}</div>}
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-300"
                    {...form.register('category')}
                  >
                    <option value="">Select an expense category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  {form.formState.errors.category && <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Budget Amount ($)</Label>
                  <Input id="amount" type="number" step="0.01" placeholder="0.00" className="rounded-xl" {...form.register('amount')} />
                  {form.formState.errors.amount && <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>}
                </div>

                {/* Hidden month field synced with selectedMonth */}
                <input type="hidden" {...form.register('month')} value={selectedMonth} />

                <Button type="submit" className="w-full rounded-xl mt-2" disabled={isSubmitting}>
                  <Plus className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Setting...' : 'Set Budget'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Budgets List with Progress Bars */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
              <CardDescription>Track your spending against your limits</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-zinc-500">Loading budgets...</div>
              ) : budgets.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">
                  <Target className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
                  No budgets set for {selectedMonth}. Create one!
                </div>
              ) : (
                <div className="space-y-6">
                  {budgets.map((budget) => {
                    const spent = budget.totalSpent || 0;
                    const percent = Math.min((spent / budget.amount) * 100, 100);
                    let barColor = 'bg-emerald-500';
                    if (percent > 75) barColor = 'bg-amber-500';
                    if (percent >= 100) barColor = 'bg-red-500';

                    return (
                      <div key={budget._id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: budget.category?.color || '#000' }}></div>
                            <span className="font-medium">{budget.category?.name || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">
                              {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(budget._id)}
                              className="w-6 h-6 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${barColor} transition-all duration-500`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-zinc-500">
                          <span>{percent.toFixed(1)}% spent</span>
                          <span>{formatCurrency(Math.max(budget.amount - spent, 0))} remaining</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
