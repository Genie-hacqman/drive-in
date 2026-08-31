import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  FiTrendingUp,
  FiShoppingCart,
  FiHeart,
  FiCalendar,
  FiCreditCard,
  FiLogOut,
  FiSettings,
  FiUser,
} from 'react-icons/fi';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { useCartStore } from '../../store/cartStore';
import { useToast } from '../../context/ToastContext';
import { bookingService } from '../../services/bookingService';
import { socketService } from '../../services/socket';

const comingSoon = (addToast, label) => () => addToast(`${label} is coming soon`, 'info');

export const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { wishlist } = useVehicleStore();
  const { items } = useCartStore();
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        const { data } = await bookingService.getUserBookings();
        setBookings(data.bookings || []);
      } catch (error) {
        setBookings([]);
      }
    };

    fetchBookings();

    const handleBookingUpdate = (payload) => {
      if (!payload?.booking) return;
      setBookings((current) => {
        const next = current.filter((booking) => booking.id !== payload.booking.id);
        return [payload.booking, ...next];
      });
    };

    socketService.onBookingUpdated(handleBookingUpdate);
    return () => socketService.offBookingUpdated(handleBookingUpdate);
  }, [user]);

  const stats = [
    {
      icon: FiShoppingCart,
      label: 'Items in Cart',
      value: String(items.length),
      color: 'text-accent-500',
    },
    {
      icon: FiCalendar,
      label: 'Upcoming Bookings',
      value: String(bookings.length),
      color: 'text-green-600',
    },
    {
      icon: FiHeart,
      label: 'Favorites',
      value: String(wishlist.length),
      color: 'text-red-500',
    },
    {
      icon: FiCreditCard,
      label: 'Total Spent',
      value: '$0',
      color: 'text-purple-500',
    },
  ];

  const recentActivity = [
    ...wishlist.slice(0, 3).map((v) => ({
      id: `wish-${v.id}`,
      title: `Added ${v.name} to favorites`,
    })),
    ...items.slice(0, 3).map((i) => ({
      id: `cart-${i.vehicle.id}-${i.mode}`,
      title: `Added ${i.vehicle.name} to cart`,
    })),
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Gene's InDrive</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-surface-900">
        <div className="bg-white dark:bg-surface-800 border-b border-slate-200 dark:border-surface-700 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Here's what's happening with your account
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card>
                    <CardContent className="py-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            {stat.label}
                          </p>
                          <p className="text-3xl font-bold text-slate-900 dark:text-white">
                            {stat.value}
                          </p>
                        </div>
                        <div className={stat.color}>
                          <Icon size={32} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Recent Activity
                  </h2>
                </CardHeader>
                <CardContent>
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
                      No activity yet — browse vehicles to get started.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-4 pb-4 border-b border-slate-200 dark:border-surface-700 last:border-0 last:pb-0"
                        >
                          <div className="w-2 h-2 rounded-full bg-accent-500 mt-2" />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {activity.title}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Quick Actions
                  </h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button fullWidth variant="primary" onClick={() => navigate('/vehicles')}>
                    Browse Vehicles
                  </Button>
                  <Button fullWidth variant="secondary" onClick={() => navigate('/cart')}>
                    View Cart
                  </Button>
                  <Button fullWidth variant="secondary" onClick={() => navigate('/saved-vehicles')}>
                    My Favorites
                  </Button>
                  <Button fullWidth variant="outline" onClick={() => navigate('/profile')}>
                    Account Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const CustomerProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { addToast } = useToast();

  const handleLogout = () => {
    logout();
    addToast('You have been signed out', 'info');
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Profile - Gene's InDrive</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-surface-900">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  My Profile
                </h1>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Personal Information
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start py-3 border-b border-slate-200 dark:border-surface-700">
                      <span className="text-slate-600 dark:text-slate-400">Name</span>
                      <span className="font-medium text-slate-900 dark:text-white">{user?.name}</span>
                    </div>
                    <div className="flex justify-between items-start py-3 border-b border-slate-200 dark:border-surface-700">
                      <span className="text-slate-600 dark:text-slate-400">Email</span>
                      <span className="font-medium text-slate-900 dark:text-white">{user?.email}</span>
                    </div>
                    <div className="flex justify-between items-start py-3">
                      <span className="text-slate-600 dark:text-slate-400">Phone</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {user?.phone || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Account Settings
                  </h2>
                  <div className="space-y-3">
                    <Button fullWidth variant="secondary" className="flex items-center gap-2" onClick={comingSoon(addToast, 'Profile editing')}>
                      <FiSettings size={18} />
                      Edit Profile
                    </Button>
                    <Button fullWidth variant="secondary" className="flex items-center gap-2" onClick={comingSoon(addToast, 'Payment methods')}>
                      <FiCreditCard size={18} />
                      Payment Methods
                    </Button>
                    <Button fullWidth variant="danger" className="flex items-center gap-2" onClick={handleLogout}>
                      <FiLogOut size={18} />
                      Logout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export const DealerDashboard = () => {
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwner = user?.role === 'dealer' || user?.role === 'owner';

  useEffect(() => {
    if (!isOwner) {
      setLoading(false);
      return;
    }

    setLoading(false);
    setVehicles([]);
  }, [isOwner]);

  return (
    <>
      <Helmet>
        <title>Dealer Dashboard - Gene's InDrive</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-surface-900">
        <div className="bg-white dark:bg-surface-800 border-b border-slate-200 dark:border-surface-700 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome, {user?.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your inventory and customer interactions
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {!isOwner ? (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Required</h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Only account owners (dealer/owner) can manage inventory. Please contact support to gain access.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Inventory status</h2>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-slate-500">Loading...</p>
                ) : vehicles.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Inventory sync is ready for the backend connection. Add the dealer inventory API next.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between border-b border-slate-200 dark:border-surface-700 py-3">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{vehicle.name}</p>
                          <p className="text-sm text-slate-500">{vehicle.brand} — ${vehicle.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export const AdminDashboard = () => {
  const { addToast } = useToast();
  const adminStats = [
    {
      icon: FiUser,
      label: 'Total Users',
      value: '1',
      color: 'text-accent-500',
    },
    {
      icon: FiShoppingCart,
      label: 'Total Vehicles',
      value: '6',
      color: 'text-green-600',
    },
    {
      icon: FiTrendingUp,
      label: 'Total Revenue',
      value: '$0',
      color: 'text-purple-500',
    },
    {
      icon: FiCalendar,
      label: 'Total Bookings',
      value: '0',
      color: 'text-yellow-600',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Gene's InDrive</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-surface-900">
        <div className="bg-white dark:bg-surface-800 border-b border-slate-200 dark:border-surface-700 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Platform overview and management
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {adminStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card>
                    <CardContent className="py-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            {stat.label}
                          </p>
                          <p className="text-3xl font-bold text-slate-900 dark:text-white">
                            {stat.value}
                          </p>
                        </div>
                        <div className={stat.color}>
                          <Icon size={32} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Admin Tools
              </h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button fullWidth variant="primary" onClick={comingSoon(addToast, 'User management')}>
                Manage Users
              </Button>
              <Button fullWidth variant="secondary" onClick={comingSoon(addToast, 'Dealer management')}>
                Manage Dealers
              </Button>
              <Button fullWidth variant="secondary" onClick={comingSoon(addToast, 'Platform analytics')}>
                View Analytics
              </Button>
              <Button fullWidth variant="secondary" onClick={comingSoon(addToast, 'System settings')}>
                System Settings
              </Button>
              <Button fullWidth variant="secondary" onClick={comingSoon(addToast, 'Audit logs')}>
                Audit Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};