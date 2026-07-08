import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, BrainCircuit, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Analytics runs on different port usually, let's setup a specific endpoint for it
const PYTHON_API_URL = 'http://localhost:8000/api';

export default function Predictions() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPredictions = async () => {
    setIsLoading(true);
    setError('');
    try {
      // In production, we'd proxy this through the Node backend or have CORS set up
      // We are calling Python Django API here
      const response = await fetch(`${PYTHON_API_URL}/predict/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?._id }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch predictions');
      }
      
      const data = await response.json();
      setPredictions(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to Analytics Service (Is Django running?)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.open(`${PYTHON_API_URL}/export-csv/`, '_blank');
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
          <h1 className="text-3xl font-bold tracking-tight">AI Predictions</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Machine Learning powered financial insights.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-xl" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button className="rounded-xl" onClick={fetchPredictions} disabled={isLoading}>
            <BrainCircuit className="w-4 h-4 mr-2" />
            {isLoading ? 'Analyzing...' : 'Run Prediction'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-start gap-3">
          <Activity className="w-5 h-5 mt-0.5" />
          <div>
            <h3 className="font-medium">Analytics Engine Error</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {!predictions && !isLoading && !error && (
        <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <BrainCircuit className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">Ready to predict your expenses</h3>
          <p className="text-zinc-500 mt-2">Click 'Run Prediction' to analyze your data using ML models.</p>
        </div>
      )}

      {isLoading && (
        <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-zinc-500">Training machine learning models on your data...</p>
        </div>
      )}

      {predictions && (
        <div className="grid grid-cols-1 gap-6">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-zinc-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Linear Regression
              </CardTitle>
              <CardDescription>Predicted next month's total expense</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(predictions.linear_regression_prediction)}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Historical Spending Trend</CardTitle>
              <CardDescription>Monthly expense aggregation used for training</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictions.historical_trend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="month_num" tick={{ fontSize: 12, fill: '#71717a' }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(value) => `₹${value}`} tick={{ fontSize: 12, fill: '#71717a' }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={() => ''} />
                  <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
