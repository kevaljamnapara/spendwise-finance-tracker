import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export default function Settings() {
  const { user, updateProfile, changePassword } = useAuth();
  
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, profileForm]);

  const onProfileSubmit = async (values) => {
    setIsUpdatingProfile(true);
    setProfileMessage({ type: '', text: '' });
    try {
      await updateProfile(values);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.length > 0 
        ? err.response.data.errors.join(', ')
        : err.response?.data?.message || 'Failed to update profile.';
      setProfileMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (values) => {
    setIsChangingPassword(true);
    setPasswordMessage({ type: '', text: '' });
    try {
      await changePassword(values);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      passwordForm.reset();
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.length > 0 
        ? err.response.data.errors.join(', ')
        : err.response?.data?.message || 'Failed to change password.';
      setPasswordMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 max-w-md">
              {profileMessage.text && (
                <div className={`p-3 text-sm rounded-xl border ${
                  profileMessage.type === 'error' 
                    ? 'text-red-500 bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-900' 
                    : 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900'
                }`}>
                  {profileMessage.text}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  className="rounded-xl"
                  {...profileForm.register('name')}
                />
                {profileForm.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email"
                  className="rounded-xl"
                  {...profileForm.register('email')}
                />
                {profileForm.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <Button type="submit" className="rounded-xl mt-2" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? 'Saving...' : 'Save changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
              {passwordMessage.text && (
                <div className={`p-3 text-sm rounded-xl border ${
                  passwordMessage.type === 'error' 
                    ? 'text-red-500 bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-900' 
                    : 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900'
                }`}>
                  {passwordMessage.text}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input 
                  id="currentPassword" 
                  type="password"
                  className="rounded-xl"
                  {...passwordForm.register('currentPassword')}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-red-500 mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword" 
                  type="password"
                  className="rounded-xl"
                  {...passwordForm.register('newPassword')}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-red-500 mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              
              <Button type="submit" variant="secondary" className="rounded-xl mt-2" disabled={isChangingPassword}>
                {isChangingPassword ? 'Updating...' : 'Update password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
