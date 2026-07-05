import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { BarChart3, Settings, LogOut, LayoutDashboard, Menu, X, Tag, Receipt, Target, PiggyBank, Shield, FileBarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Income', path: '/incomes', icon: BarChart3 },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Categories', path: '/categories', icon: Tag },
    { name: 'Budgets', path: '/budgets', icon: Target },
    { name: 'Savings', path: '/savings', icon: PiggyBank },
    { name: 'Reports', path: '/reports', icon: FileBarChart },
    ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin', icon: Shield }] : []),
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <Link to="/dashboard" className="flex items-center gap-2 text-zinc-900 dark:text-white">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
            <BarChart3 className="text-white dark:text-zinc-900 w-5 h-5" />
          </div>
          <span className="font-semibold tracking-tight">SpendWise</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-zinc-600 dark:text-zinc-400">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar (Desktop) & Mobile Menu */}
      <aside className={`
        ${isMobileMenuOpen ? 'block' : 'hidden'} 
        md:block w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex-shrink-0
      `}>
        <div className="h-full flex flex-col">
          <div className="hidden md:flex p-6 items-center gap-2 text-zinc-900 dark:text-white">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
              <BarChart3 className="text-white dark:text-zinc-900 w-5 h-5" />
            </div>
            <span className="font-semibold tracking-tight">SpendWise</span>
          </div>

          <div className="p-4 flex-1">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 px-3 py-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start text-zinc-600 dark:text-zinc-400"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
