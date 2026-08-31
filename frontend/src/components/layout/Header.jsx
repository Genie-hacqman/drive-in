import { useState } from 'react';
import { Link, NavLink as RouterNavLink } from 'react-router-dom';
import { FiMenu, FiX, FiHeart, FiShoppingCart, FiMoon, FiSun } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useTheme } from '../../context/ThemeContext';
import { useVehicleStore } from '../../store/vehicleStore';
import { useCartStore } from '../../store/cartStore';
import { useToast } from '../../context/ToastContext';
import Button from '../ui/Button';
const Header = () => {
  const {
    isDark,
    toggleTheme
  } = useTheme();
  const {
    isAuthenticated,
    user,
    logout
  } = useAuthStore();
  const {
    mobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu
  } = useUiStore();
  const {
    wishlist
  } = useVehicleStore();
  const {
    getItemCount
  } = useCartStore();
  const {
    addToast
  } = useToast();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const cartCount = getItemCount();
  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    addToast('You have been signed out', 'info');
  };
  return <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[var(--panel-bg)]/95 backdrop-blur-md dark:border-surface-700 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {}
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-slate-900 dark:text-white hover:text-accent-600 dark:hover:text-accent-400 transition-colors no-underline">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg flex items-center justify-center">
              <span className="text-slate-950 font-bold">G</span>
            </div>
            <span className="hidden sm:inline">Gene's InDrive</span>
          </Link>

          {}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/vehicles">Vehicles</NavLink>
            <NavLink to="/rent">Rentals</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>

          {}
          <div className="flex items-center gap-2 md:gap-4">
            {}
            <button type="button" onClick={toggleTheme} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors text-slate-700 dark:text-slate-200" aria-label="Toggle theme">
              {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {}
            <Link to="/saved-vehicles" className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors text-slate-700 dark:text-slate-200 no-underline" aria-label="Favorites">
              <FiHeart size={20} />
              {wishlist.length > 0 && <span className="absolute top-0 right-0 bg-accent-500 text-slate-950 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlist.length}
                </span>}
            </Link>

            {}
            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors text-slate-700 dark:text-slate-200 no-underline" aria-label="Cart">
              <FiShoppingCart size={20} />
              {cartCount > 0 && <span className="absolute top-0 right-0 bg-accent-500 text-slate-950 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>}
            </Link>

            {}
            {isAuthenticated ? <div className="relative">
                <button type="button" onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-2 md:px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-slate-950 font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-slate-800 dark:text-slate-100">
                    {user?.name}
                  </span>
                </button>

                {userMenuOpen && <>
                    <button type="button" className="fixed inset-0 z-40 cursor-default" onClick={() => setUserMenuOpen(false)} aria-label="Close menu" />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-slate-200 dark:border-surface-700 z-50 overflow-hidden">
                      <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-700 no-underline">
                        Dashboard
                      </Link>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-700 no-underline">
                        Profile
                      </Link>
                      <Link to="/cart" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-700 no-underline">
                        My Cart
                      </Link>
                      <button type="button" onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-surface-700 text-red-600 dark:text-red-400">
                        Logout
                      </button>
                    </div>
                  </>}
              </div> : <div className="hidden sm:flex gap-2">
                <Button variant="ghost" size="sm" to="/login">
                  Login
                </Button>
                <Button size="sm" to="/register">
                  Sign up
                </Button>
              </div>}

            {}
            <button type="button" onClick={toggleMobileMenu} className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors text-slate-700 dark:text-slate-200" aria-label="Toggle menu">
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {}
        {mobileMenuOpen && <div className="md:hidden pb-4 space-y-2">
            <MobileNavLink to="/vehicles" onClick={closeMobileMenu}>
              Vehicles
            </MobileNavLink>
            <MobileNavLink to="/rent" onClick={closeMobileMenu}>
              Rentals
            </MobileNavLink>
            <MobileNavLink to="/about" onClick={closeMobileMenu}>
              About
            </MobileNavLink>
            <MobileNavLink to="/contact" onClick={closeMobileMenu}>
              Contact
            </MobileNavLink>

            {!isAuthenticated ? <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" fullWidth to="/login" onClick={closeMobileMenu}>
                  Login
                </Button>
                <Button size="sm" fullWidth to="/register" onClick={closeMobileMenu}>
                  Sign up
                </Button>
              </div> : <div className="pt-2">
                <Button variant="danger" size="sm" fullWidth onClick={() => {
            handleLogout();
            closeMobileMenu();
          }}>
                  Logout
                </Button>
              </div>}
          </div>}
      </nav>
    </header>;
};
const NavLink = ({
  to,
  children
}) => <RouterNavLink to={to} className={({
  isActive
}) => `px-3 py-2 text-sm font-medium transition-colors no-underline ${isActive ? 'text-accent-600 dark:text-accent-400' : 'text-slate-700 dark:text-slate-300 hover:text-accent-600 dark:hover:text-accent-400'}`}>
    {children}
  </RouterNavLink>;
const MobileNavLink = ({
  to,
  children,
  onClick
}) => <RouterNavLink to={to} onClick={onClick} className={({
  isActive
}) => `block px-3 py-2 text-sm font-medium rounded-lg transition-colors no-underline ${isActive ? 'bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-800'}`}>
    {children}
  </RouterNavLink>;
export default Header;