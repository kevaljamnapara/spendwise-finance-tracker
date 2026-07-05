import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Income from '@/pages/Income';
import Expense from '@/pages/Expense';
import Categories from '@/pages/Categories';
import Budget from '@/pages/Budget';
import Savings from '@/pages/Savings';
import Settings from '@/pages/Settings';
import DashboardLayout from '@/layouts/DashboardLayout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/incomes" element={<Income />} />
            <Route path="/expenses" element={<Expense />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/budgets" element={<Budget />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
