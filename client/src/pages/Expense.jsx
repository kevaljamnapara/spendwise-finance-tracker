import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import expenseService from '@/services/expenseService';
import categoryService from '@/services/categoryService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Receipt, Pencil, X, Download } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

const expenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  date: z.string().optional(),
  description: z.string().max(500, 'Description is too long').optional(),
  receiptUrl: z.string().optional(),
});

export default function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [error, setError] = useState('');

  const form = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      receiptUrl: '',
    },
  });

  const fetchData = async () => {
    try {
      const [expensesRes, categoriesRes] = await Promise.all([
        expenseService.getExpenses(),
        categoryService.getCategories(),
      ]);
      setExpenses(expensesRes.data);
      setCategories(categoriesRes.data.filter(c => c.type === 'expense'));
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setError('');
    try {
      if (editingExpenseId) {
        await expenseService.updateExpense(editingExpenseId, values);
        setEditingExpenseId(null);
      } else {
        await expenseService.createExpense(values);
      }
      form.reset({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        receiptUrl: '',
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${editingExpenseId ? 'update' : 'add'} expense`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (expense) => {
    setEditingExpenseId(expense._id);
    form.reset({
      category: expense.category?._id || expense.category || '',
      amount: expense.amount,
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: expense.description || '',
      receiptUrl: expense.receiptUrl || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    form.reset({
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      receiptUrl: '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await expenseService.deleteExpense(id);
      if (editingExpenseId === id) {
        handleCancelEdit();
      }
      fetchData();
    } catch (err) {
      setError('Failed to delete record');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount (₹)'];
    const rows = expenses.map(expense => [
      new Date(expense.date).toLocaleDateString('en-IN'),
      expense.category?.name || 'Uncategorized',
      expense.description || '',
      expense.amount
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SpendWise_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Track and manage your expenses.</p>
        </div>
        {expenses.length > 0 && (
          <Button onClick={exportToCSV} variant="outline" className="rounded-xl no-print self-start md:self-auto">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add/Edit Expense Form */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-8">
            <CardHeader>
              <CardTitle>{editingExpenseId ? 'Edit Expense' : 'Add New Expense'}</CardTitle>
              <CardDescription>
                {editingExpenseId ? 'Update the details of this expense' : 'Record a new expense transaction'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-xl">{error}</div>}
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                    {...form.register('category')}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  {form.formState.errors.category && <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input id="amount" type="number" step="0.01" placeholder="0.00" className="rounded-xl" {...form.register('amount')} />
                  {form.formState.errors.amount && <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" className="rounded-xl" {...form.register('date')} />
                  {form.formState.errors.date && <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input id="description" placeholder="Additional details..." className="rounded-xl" {...form.register('description')} />
                </div>

                <div className="space-y-2">
                  <Label>Receipt Image (Optional)</Label>
                  <ImageUpload 
                    value={form.watch('receiptUrl')} 
                    onChange={(url) => form.setValue('receiptUrl', url, { shouldDirty: true })}
                    endpoint="/upload/receipt"
                    title="Upload Receipt"
                  />
                </div>

                <div className="flex gap-2 mt-2">
                  {editingExpenseId && (
                    <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={handleCancelEdit}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" className="flex-1 rounded-xl" disabled={isSubmitting}>
                    {editingExpenseId ? (
                      <>
                        <Pencil className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Adding...' : 'Add Expense'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Expense List */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Expense History</CardTitle>
              <CardDescription>A list of your recent expense records</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-zinc-500">Loading records...</div>
              ) : expenses.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">No expense records found. Add one to get started!</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense._id}>
                          <TableCell className="font-medium">{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: expense.category?.color || '#000' }}></div>
                              <span>{expense.category?.name || 'Uncategorized'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-500">{expense.description || '-'}</TableCell>
                          <TableCell className="text-right font-bold text-red-600 dark:text-red-500">
                            {formatCurrency(expense.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEditClick(expense)}
                                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(expense._id)}
                                className="text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
