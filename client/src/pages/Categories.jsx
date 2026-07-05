import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import categoryService from '@/services/categoryService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Name is too long'),
  type: z.enum(['income', 'expense']),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Must be a valid hex color'),
});

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
      color: '#000000',
    },
  });

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setError('');
    try {
      await categoryService.createCategory(values);
      form.reset();
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Any transactions linked to it may lose their categorization.')) return;
    try {
      await categoryService.deleteCategory(id);
      fetchCategories();
    } catch {
      setError('Failed to delete category');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your income and expense categories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Category Form */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-8">
            <CardHeader>
              <CardTitle>Create Category</CardTitle>
              <CardDescription>Add a new categorization tag</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-xl">{error}</div>}
                
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input id="name" placeholder="e.g. Groceries, Salary" className="rounded-xl" {...form.register('name')} />
                  {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select 
                    id="type"
                    className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                    {...form.register('type')}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                  {form.formState.errors.type && <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-3 items-center">
                    <Input id="color" type="color" className="w-16 h-10 p-1 rounded-xl cursor-pointer" {...form.register('color')} />
                    <span className="text-sm text-zinc-500 uppercase">{form.watch('color')}</span>
                  </div>
                  {form.formState.errors.color && <p className="text-sm text-red-500">{form.formState.errors.color.message}</p>}
                </div>

                <Button type="submit" className="w-full rounded-xl mt-2" disabled={isSubmitting}>
                  <Plus className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Your Categories</CardTitle>
              <CardDescription>A list of all configured categories</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-zinc-500">Loading categories...</div>
              ) : categories.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">No categories found. Create one to get started!</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category._id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                              {category.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              category.type === 'income' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {category.type}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(category._id)}
                              className="text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
