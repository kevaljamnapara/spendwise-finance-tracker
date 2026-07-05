import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import adminService from '@/services/adminService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Protect route
  if (user && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getStats(),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError('Failed to load admin data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? ALL of their data will be permanently lost.')) return;
    try {
      await adminService.deleteUser(id);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-500">Loading admin dashboard...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Platform statistics and user management.</p>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-500 rounded-xl">{error}</div>}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">Total Users</CardTitle>
              <Users className="w-4 h-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">Total Platform Income</CardTitle>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                {formatCurrency(stats.totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">Total Platform Expenses</CardTitle>
              <DollarSign className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                {formatCurrency(stats.totalExpenses)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users List */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs">
                            {u.name.charAt(0)}
                          </div>
                        )}
                        {u.name}
                      </div>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        u.role === 'admin' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {u.role !== 'admin' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
