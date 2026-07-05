import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import incomeService from '@/services/incomeService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Pencil, X, Download } from 'lucide-react';

const incomeSchema = z.object({
  source: z.string().min(1, 'Source is required').max(100, 'Source is too long'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  date: z.string().optional(),
  description: z.string().max(500, 'Description is too long').optional(),
});

export default function Income() {
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingIncomeId, setEditingIncomeId] = useState(null);
  const [error, setError] = useState('');

  const form = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      source: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    },
  });

  const fetchIncomes = async () => {
    try {
      const response = await incomeService.getIncomes();
      setIncomes(response.data);
    } catch (err) {
      setError('Failed to load income records');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setError('');
    try {
      if (editingIncomeId) {
        await incomeService.updateIncome(editingIncomeId, values);
        setEditingIncomeId(null);
      } else {
        await incomeService.createIncome(values);
      }
      form.reset({
        source: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      fetchIncomes();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${editingIncomeId ? 'update' : 'add'} income`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (income) => {
    setEditingIncomeId(income._id);
    form.reset({
      source: income.source,
      amount: income.amount,
      date: income.date ? new Date(income.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: income.description || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingIncomeId(null);
    form.reset({
      source: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await incomeService.deleteIncome(id);
      if (editingIncomeId === id) {
        handleCancelEdit();
      }
      fetchIncomes();
    } catch (err) {
      setError('Failed to delete record');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Source', 'Description', 'Amount (₹)'];
    const rows = incomes.map(income => [
      new Date(income.date).toLocaleDateString('en-IN'),
      income.source,
      income.description || '',
      income.amount
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SpendWise_Income_${new Date().toISOString().split('T')[0]}.csv`);
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
          <h1 className="text-3xl font-bold tracking-tight">Income Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Track and manage your sources of income.</p>
        </div>
        {incomes.length > 0 && (
          <Button onClick={exportToCSV} variant="outline" className="rounded-xl no-print self-start md:self-auto">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add/Edit Income Form */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-8">
            <CardHeader>
              <CardTitle>{editingIncomeId ? 'Edit Income' : 'Add New Income'}</CardTitle>
              <CardDescription>
                {editingIncomeId ? 'Update the details of this income' : 'Record a new source of revenue'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-xl">{error}</div>}
                
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Input id="source" placeholder="e.g. Salary, Freelance" className="rounded-xl" {...form.register('source')} />
                  {form.formState.errors.source && <p className="text-sm text-red-500">{form.formState.errors.source.message}</p>}
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

                <div className="flex gap-2 mt-2">
                  {editingIncomeId && (
                    <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={handleCancelEdit}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" className="flex-1 rounded-xl" disabled={isSubmitting}>
                    {editingIncomeId ? (
                      <>
                        <Pencil className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Adding...' : 'Add Income'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Income List */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Income History</CardTitle>
              <CardDescription>A list of your recent income records</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-zinc-500">Loading records...</div>
              ) : incomes.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">No income records found. Add one to get started!</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomes.map((income) => (
                        <TableRow key={income._id}>
                          <TableCell className="font-medium">{new Date(income.date).toLocaleDateString()}</TableCell>
                          <TableCell>{income.source}</TableCell>
                          <TableCell className="text-zinc-500">{income.description || '-'}</TableCell>
                          <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-500">
                            {formatCurrency(income.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEditClick(income)}
                                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(income._id)}
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
