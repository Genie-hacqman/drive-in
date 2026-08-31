import { useState, forwardRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiHeart, FiShoppingCart, FiUser } from 'react-icons/fi';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { useCartStore } from '../../store/cartStore';
import { useToast } from '../../context/ToastContext';






const QuickLoginCard = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login, logout, isLoading } = useAuthStore();
  const { wishlist } = useVehicleStore();
  const { getItemCount } = useCartStore();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Enter your email and password');
      return;
    }
    try {
      await login(email, password);
      addToast('Welcome back!', 'success');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    }
  };

  const fillDemo = () => {
    setEmail('demo@example.com');
    setPassword('password123');
    setError('');
  };

  return (
    <motion.div
      ref={ref}
      id="landing-login"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="w-full max-w-sm bg-surface-900/70 backdrop-blur-xl border border-surface-700/60 rounded-2xl shadow-2xl p-6 scroll-mt-24"
    >
      <AnimatePresence mode="wait">
        {isAuthenticated ? (
          <motion.div
            key="account"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-slate-950 font-bold text-lg">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-white font-semibold leading-tight">{user?.name}</p>
                <p className="text-slate-400 text-xs">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-surface-800/60 rounded-lg p-3 text-center">
                <FiHeart className="mx-auto mb-1 text-red-400" size={18} />
                <p className="text-white font-bold">{wishlist.length}</p>
                <p className="text-slate-400 text-xs">Favorites</p>
              </div>
              <div className="bg-surface-800/60 rounded-lg p-3 text-center">
                <FiShoppingCart className="mx-auto mb-1 text-accent-400" size={18} />
                <p className="text-white font-bold">{getItemCount()}</p>
                <p className="text-slate-400 text-xs">In Cart</p>
              </div>
            </div>

            <div className="space-y-2">
              <Button fullWidth onClick={() => navigate('/vehicles')}>
                Browse Vehicles
              </Button>
              <Button fullWidth variant="outline" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  addToast('You have been signed out', 'info');
                }}
                className="w-full text-xs text-slate-400 hover:text-slate-200 pt-1"
              >
                Sign out
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <FiUser className="text-accent-400" size={18} />
              <h2 className="text-white font-semibold">Sign in to continue</h2>
            </div>
            <p className="text-slate-400 text-xs mb-5">
              Sign in to browse vehicles, save favorites, and add to your cart.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Email address"
                icon={FiMail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                icon={FiLock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                className="flex items-center justify-center gap-2"
              >
                Sign In
                <FiArrowRight size={16} />
              </Button>
            </form>

            <button
              type="button"
              onClick={fillDemo}
              className="w-full text-xs text-accent-400 hover:text-accent-300 mt-3"
            >
              Use demo credentials
            </button>

            <p className="text-center text-slate-400 text-xs mt-4 pt-4 border-t border-surface-700">
              New here?{' '}
              <Link to="/register" className="text-accent-400 hover:text-accent-300">
                Create an account
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

QuickLoginCard.displayName = 'QuickLoginCard';

export default QuickLoginCard;
