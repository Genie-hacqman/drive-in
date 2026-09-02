import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiLock } from 'react-icons/fi';
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
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login,
    googleLogin,
    isLoading
  } = useAuthStore();
  const {
    addToast
  } = useToast();
  const [rememberMe, setRememberMe] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: {
      errors
    }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });
  const redirectTo = location.state?.from || '/dashboard';
  const onSubmit = async data => {
    try {
      await login(data.email, data.password);
      addToast('Login successful!', 'success');
      navigate(redirectTo, {
        replace: true
      });
    } catch (error) {
      addToast(error.message || 'Login failed. Please try again.', 'error');
    }
  };
  const fillDemoCredentials = () => {
    setValue('email', 'demo@example.com');
    setValue('password', 'password123');
    addToast('Demo credentials filled in', 'info');
  };

  const handleGoogleSignIn = async () => {
    try {
      const googleProfile = await signInWithGoogle();
      await googleLogin(googleProfile);
      addToast('Signed in with Google', 'success');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      addToast(error.message || 'Unable to sign in with Google right now.', 'error');
    }
  };

  return <>
      <Helmet>
        <title>Login - Gene's InDrive</title>
      </Helmet>

      <div className="relative min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 flex items-center justify-center px-4 overflow-hidden">
        {}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="relative w-full max-w-md">
          {location.state?.from && <div className="mb-4 px-4 py-3 rounded-lg bg-accent-500/10 border border-accent-500/30 text-accent-700 dark:text-accent-200 text-sm text-center">
              Please sign in to continue to {location.state.from}
            </div>}
          <Card className="border-slate-200/80 bg-white/80 dark:border-surface-700/50 dark:bg-surface-900/80 backdrop-blur-xl shadow-[0_20px_55px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_55px_rgba(2,6,23,0.45)]">
            <CardHeader>
              <Link to="/" className="inline-flex items-center gap-2 mb-4 no-underline">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg flex items-center justify-center">
                  <span className="text-slate-950 font-bold">G</span>
                </div>
              </Link>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Sign in to your Gene's InDrive account
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input label="Email Address" type="email" placeholder="your@email.com" icon={FiMail} {...register('email')} error={errors.email?.message} required />

                <Input label="Password" type="password" placeholder="••••••••" icon={FiLock} {...register('password')} error={errors.password?.message} required />

                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-slate-300 dark:border-surface-600" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-accent-700 hover:text-accent-800 dark:text-accent-400 dark:hover:text-accent-300 no-underline">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                  Sign In
                </Button>

                <Button type="button" variant="outline" fullWidth size="lg" onClick={handleGoogleSignIn}>
                  <FcGoogle className="h-5 w-5 shrink-0" />
                  Continue with Google
                </Button>

                <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-accent-700 hover:text-accent-800 dark:text-accent-400 dark:hover:text-accent-300 no-underline">
                    Sign up
                  </Link>
                </p>
                <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
                  <Link to="/admin/login" className="text-accent-700 hover:text-accent-800 dark:text-accent-400 dark:hover:text-accent-300 no-underline">
                    Admin sign in
                  </Link>
                </p>
              </form>

              {}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-surface-700 bg-slate-50 dark:bg-surface-800/30 rounded-lg p-4">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Demo Credentials:</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 mb-1">Email: demo@example.com</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 mb-3">Password: password123</p>
                <Button variant="outline" size="sm" fullWidth onClick={fillDemoCredentials} type="button">
                  Use Demo Credentials
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>;
};
export default Login;