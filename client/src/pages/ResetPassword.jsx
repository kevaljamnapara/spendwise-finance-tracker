import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import authService from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BarChart3, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { resetToken } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await authService.validateResetToken(resetToken);
        setIsTokenValid(true);
      } catch (err) {
        setError(err.response?.data?.message || 'This reset link is invalid or has expired. Please request a new one.');
        setIsTokenValid(false);
      } finally {
        setIsValidating(false);
      }
    };
    verifyToken();
  }, [resetToken]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.resetPassword(resetToken, values.password);
      setSuccess('Password has been successfully reset. You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      if (err.response?.data?.errors?.length > 0) {
        setError(err.response.data.errors.join(', '));
      } else {
        setError(err.response?.data?.message || 'Invalid or expired token.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="text-zinc-500 text-lg">Verifying your link...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-zinc-900 dark:text-white">
        <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center">
          <BarChart3 className="text-white dark:text-zinc-900 w-5 h-5" />
        </div>
        <span className="font-semibold tracking-tight hidden md:inline">SpendWise</span>
      </Link>
      
      <Card className="w-full max-w-md shadow-sm border-zinc-200 dark:border-zinc-800 rounded-3xl">
        <CardHeader className="space-y-2 text-center pb-6 pt-10">
          <CardTitle className="text-3xl font-semibold tracking-tight">Reset Password</CardTitle>
          <CardDescription className="text-base text-zinc-500">
            {isTokenValid ? 'Enter your new password below.' : 'Reset Link Expired'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-xl border border-red-200 dark:border-red-900 mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/50 rounded-xl border border-green-200 dark:border-green-900 mb-4">
              {success}
            </div>
          )}

          {isTokenValid && !success && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="font-medium text-zinc-700 dark:text-zinc-300">New Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    className="h-11 rounded-xl pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-medium text-zinc-700 dark:text-zinc-300">Confirm Password</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"}
                    className="h-11 rounded-xl pr-10"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl text-base mt-2" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center pb-10">
          <p className="text-sm text-zinc-500">
            <Link to="/login" className="font-medium text-zinc-900 dark:text-white hover:underline">
              Back to Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
