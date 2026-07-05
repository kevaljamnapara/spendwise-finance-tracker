import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, PieChart, Shield } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 md:px-12 md:py-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center">
            <BarChart3 className="text-white dark:text-zinc-900 w-5 h-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight">SpendWise</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Log in
          </Link>
          <Link to="/register">
            <Button className="rounded-full px-6">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center pt-24 pb-16 px-6 md:pt-32 text-center max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-[1.1] max-w-4xl text-balance">
          Smart personal finance, <span className="text-zinc-500">beautifully analyzed.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl text-balance leading-relaxed">
          Track expenses, set intelligent budgets, and let our Python-powered analytics forecast your financial future. The ecosystem for modern money management.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Link to="/register">
            <Button size="lg" className="rounded-full px-8 text-base h-12 shadow-sm">
              Start for free
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="ghost" className="rounded-full px-8 text-base h-12 flex items-center gap-2">
              See how it works <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Feature Bento Grid */}
        <div className="mt-32 w-full grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 text-left flex flex-col gap-4 transition-all hover:scale-[1.02]">
            <PieChart className="w-8 h-8 text-zinc-900 dark:text-white" />
            <div>
              <h3 className="font-medium text-xl tracking-tight">Intelligent Analytics</h3>
              <p className="text-muted-foreground mt-2 leading-relaxed">Machine learning models predict your spending trends and help you stay on budget before you overspend.</p>
            </div>
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 text-left flex flex-col gap-4 transition-all hover:scale-[1.02]">
            <BarChart3 className="w-8 h-8 text-zinc-900 dark:text-white" />
            <div>
              <h3 className="font-medium text-xl tracking-tight">Visual Reports</h3>
              <p className="text-muted-foreground mt-2 leading-relaxed">Beautiful interactive charts built with Recharts and Plotly provide deep insights into your cash flow.</p>
            </div>
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 text-left flex flex-col gap-4 transition-all hover:scale-[1.02]">
            <Shield className="w-8 h-8 text-zinc-900 dark:text-white" />
            <div>
              <h3 className="font-medium text-xl tracking-tight">Secure & Private</h3>
              <p className="text-muted-foreground mt-2 leading-relaxed">Your data is secured with industry-standard encryption, JWT authentication, and strict privacy controls.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
