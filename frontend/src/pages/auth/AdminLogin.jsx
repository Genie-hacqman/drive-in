import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiLock, FiShield } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { signInWithGoogle } from '../../services/googleAuth';

const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin, adminGoogleLogin, isLoading } = useAuthStore();
  const { addToast } = useToast();
  const [googleError, setGoogleError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await adminLogin(data.email, data.password);
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      addToast(error.message || 'Unable to sign in as admin.', 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleError('');
    try {
      const googleProfile = await signInWithGoogle();
      await adminGoogleLogin(googleProfile);
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      setGoogleError(error.message || 'This Google account is not authorized for admin access.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Sign In - Gene&apos;s InDrive</title>
      </Helmet>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 flex items-center justify-center px-4 overflow-hidden">
        <div className="relative w-full max-w-md">
          <Card className="border-slate-200/80 bg-white/90 dark:border-surface-700/50 dark:bg-surface-900/90 shadow-[0_20px_55px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_55px_rgba(2,6,23,0.45)]">
            <CardHeader>
              <Link to="/" className="inline-flex items-center gap-2 mb-4 no-underline">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg flex items-center justify-center">
                  <span className="text-slate-950 font-bold">G</span>
                </div>
              </Link>
              <div className="flex items-center gap-2 text-accent-700 dark:text-accent-400">
                <FiShield aria-hidden="true" />
                <span className="text-sm font-semibold uppercase tracking-wide">Admin Portal</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Sign In</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Use an authorized administrator account.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input label="Email Address" type="email" placeholder="admin@yourcompany.com" icon={FiMail} {...register('email')} error={errors.email?.message} required />
                <Input label="Password" type="password" placeholder="••••••••" icon={FiLock} {...register('password')} error={errors.password?.message} required />
                <Button type="submit" fullWidth size="lg" isLoading={isLoading}>Sign In</Button>
                <Button type="button" variant="outline" fullWidth size="lg" onClick={handleGoogleSignIn} disabled={isLoading}>
                  <FcGoogle className="h-5 w-5 shrink-0" />
                  Continue with Google
                </Button>
                {googleError && <p className="text-sm text-red-500" role="alert">{googleError}</p>}
              </form>
              <p className="mt-6 text-center text-slate-600 dark:text-slate-400 text-sm">
                <Link to="/login" className="text-accent-700 hover:text-accent-800 dark:text-accent-400 dark:hover:text-accent-300 no-underline">Back to customer sign in</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
