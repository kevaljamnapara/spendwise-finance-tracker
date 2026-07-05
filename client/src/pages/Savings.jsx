import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import savingsService from '@/services/savingsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, Plus, PiggyBank } from 'lucide-react';

const savingsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  targetAmount: z.coerce.number().positive('Target amount must be greater than 0'),
  currentAmount: z.coerce.number().min(0, 'Current amount cannot be negative').optional(),
  deadline: z.string().optional(),
});

export default function Savings() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const form = useForm({
    resolver: zodResolver(savingsSchema),
    defaultValues: {
      title: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
    },
  });

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const response = await savingsService.getSavingsGoals();
      setGoals(response.data);
    } catch (err) {
      setError('Failed to load savings goals');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setError('');
    try {
      await savingsService.createSavingsGoal(values);
      form.reset();
      fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create savings goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProgress = async (id, currentAmount, targetAmount) => {
    const amountStr = window.prompt(`Enter new total saved amount (Target: $${targetAmount}):`, currentAmount);
    if (amountStr === null) return;
    
    const newAmount = parseFloat(amountStr);
    if (isNaN(newAmount) || newAmount < 0) {
      alert('Please enter a valid positive number');
      return;
    }

    try {
      await savingsService.updateSavingsGoal(id, { currentAmount: newAmount });
      fetchGoals();
    } catch (err) {
      setError('Failed to update progress');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) return;
    try {
      await savingsService.deleteSavingsGoal(id);
      fetchGoals();
    } catch (err) {
      setError('Failed to delete goal');
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Set targets and track your progress towards financial goals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Goal Form */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-8">
            <CardHeader>
              <CardTitle>Create Goal</CardTitle>
              <CardDescription>Start saving for something special</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-xl">{error}</div>}
                
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input id="title" placeholder="e.g. Emergency Fund, Vacation" className="rounded-xl" {...form.register('title')} />
                  {form.formState.errors.title && <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount ($)</Label>
                  <Input id="targetAmount" type="number" step="0.01" placeholder="0.00" className="rounded-xl" {...form.register('targetAmount')} />
                  {form.formState.errors.targetAmount && <p className="text-sm text-red-500">{form.formState.errors.targetAmount.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentAmount">Initial Saved ($) (Optional)</Label>
                  <Input id="currentAmount" type="number" step="0.01" placeholder="0.00" className="rounded-xl" {...form.register('currentAmount')} />
                  {form.formState.errors.currentAmount && <p className="text-sm text-red-500">{form.formState.errors.currentAmount.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Target Date (Optional)</Label>
                  <Input id="deadline" type="date" className="rounded-xl" {...form.register('deadline')} />
                  {form.formState.errors.deadline && <p className="text-sm text-red-500">{form.formState.errors.deadline.message}</p>}
                </div>

                <Button type="submit" className="w-full rounded-xl mt-2" disabled={isSubmitting}>
                  <Plus className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Creating...' : 'Create Goal'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Goals List */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Your Goals</CardTitle>
              <CardDescription>Track your progress over time</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-zinc-500">Loading goals...</div>
              ) : goals.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">
                  <PiggyBank className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
                  No savings goals yet. Create one!
                </div>
              ) : (
                <div className="space-y-6">
                  {goals.map((goal) => {
                    const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                    const isComplete = percent >= 100;
                    
                    return (
                      <div key={goal._id} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{goal.title}</h3>
                            {goal.deadline && (
                              <p className="text-xs text-zinc-500 mt-1">Target date: {new Date(goal.deadline).toLocaleDateString()}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUpdateProgress(goal._id, goal.currentAmount, goal.targetAmount)}
                              className="rounded-lg h-8 text-xs"
                            >
                              Update Progress
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(goal._id)}
                              className="w-8 h-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-medium">
                            <span>{formatCurrency(goal.currentAmount)}</span>
                            <span className="text-zinc-500">{formatCurrency(goal.targetAmount)}</span>
                          </div>
                          <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-blue-500'} transition-all duration-1000 ease-out`} 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <p className="text-xs text-right text-zinc-500">
                            {isComplete ? 'Goal achieved! 🎉' : `${percent.toFixed(1)}% complete`}
                          </p>
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
