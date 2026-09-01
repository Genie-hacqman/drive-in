import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';
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
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  userType: z.enum(['customer', 'dealer']),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms'
  })
});
const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register: registerUser,
    googleLogin,
    isLoading
  } = useAuthStore();
  const {
    addToast
  } = useToast();
  const [userType, setUserType] = useState('customer');
  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors
    }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: 'customer'
    }
  });
  const password = watch('password');
  const redirectTo = location.state?.from || '/dashboard';

  const handleGoogleSignUp = async () => {
    try {
      const googleProfile = await signInWithGoogle();
      await googleLogin(googleProfile);
      addToast('Google sign-in successful', 'success');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      addToast(error.message || 'Unable to continue with Google right now.', 'error');
    }
  };

  const onSubmit = async data => {
    if (data.password !== data.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.userType
      });
      addToast('Account created — welcome to Gene\'s InDrive!', 'success');
      navigate(redirectTo, {
        replace: true
      });
    } catch (error) {
      addToast(error.message || 'Registration failed. Please try again.', 'error');
    }
  };
  return <>
      <Helmet>
        <title>Sign Up - Gene's InDrive</title>
      </Helmet>

      <div className="relative min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 flex items-center justify-center px-4 py-12 overflow-hidden">
        {}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="relative w-full max-w-md">
          <Card className="border-slate-200/80 bg-white/80 dark:border-surface-700/50 dark:bg-surface-900/80 backdrop-blur-xl shadow-[0_20px_55px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_55px_rgba(2,6,23,0.45)]">
            <CardHeader>
              <Link to="/" className="inline-flex items-center gap-2 mb-4 no-underline">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg flex items-center justify-center">
                  <span className="text-slate-950 font-bold">G</span>
                </div>
              </Link>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Account</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Join Gene's InDrive today
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    I am a:
                  </label>
                  <div className="flex gap-4">
                    {[{
                    value: 'customer',
                    label: 'Customer'
                  }, {
                    value: 'dealer',
                    label: 'Dealer'
                  }].map(type => <label key={type.value} className="flex-1 cursor-pointer">
                        <input type="radio" value={type.value} {...register('userType')} onChange={e => setUserType(e.target.value)} className="hidden" />
                        <div className={`p-3 rounded-lg border-2 transition-colors text-center ${userType === type.value ? 'border-accent-500 bg-accent-500/10' : 'border-surface-600 bg-surface-800/30 hover:border-surface-500'}`}>
                          <span className="text-sm font-medium text-white">
                            {type.label}
                          </span>
                        </div>
                      </label>)}
                  </div>
                </div>

                <Input label="Full Name" type="text" placeholder="John Doe" icon={FiUser} {...register('name')} error={errors.name?.message} required />

                <Input label="Email Address" type="email" placeholder="your@email.com" icon={FiMail} {...register('email')} error={errors.email?.message} required />

                <Input label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" icon={FiPhone} {...register('phone')} error={errors.phone?.message} required />

                <Input label="Password" type="password" placeholder="••••••••" icon={FiLock} {...register('password')} error={errors.password?.message} required />

                <Input label="Confirm Password" type="password" placeholder="••••••••" icon={FiLock} {...register('confirmPassword')} error={password && watch('confirmPassword') && password !== watch('confirmPassword') ? 'Passwords do not match' : ''} required />

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" {...register('agreeTerms')} className="w-4 h-4 rounded border-slate-300 dark:border-surface-600 mt-1" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    I agree to the Terms of Service and Privacy Policy
                  </span>
                </label>

                {errors.agreeTerms && <p className="text-sm text-red-500">{errors.agreeTerms.message}</p>}

                <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                  Create Account
                </Button>

                <Button type="button" variant="outline" fullWidth size="lg" onClick={handleGoogleSignUp}>
                  <FcGoogle className="h-5 w-5 shrink-0" />
                  Continue with Google
                </Button>

                <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-accent-700 hover:text-accent-800 dark:text-accent-400 dark:hover:text-accent-300 no-underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>;
};
export default Register;