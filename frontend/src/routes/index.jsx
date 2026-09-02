import { lazy, Suspense } from 'react';
import { Routes as RouterRoutes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Loading from '../components/common/Loading';


const Home = lazy(() => import('../pages/public/Home'));
const VehicleInventory = lazy(() => import('../pages/public/VehicleInventory'));
const VehicleDetails = lazy(() => import('../pages/public/VehicleDetails'));
const Cart = lazy(() => import('../pages/public/Cart'));


const Login = lazy(() => import('../pages/auth/Login'));
const AdminLogin = lazy(() => import('../pages/auth/AdminLogin'));
const Register = lazy(() => import('../pages/auth/Register'));


import {
  NotFound,
  SavedVehicles,
  RentVehicle,
  Blog,
  About,
  Contact,
  ForgotPassword,
} from '../pages/public/Pages';

import {
  CustomerDashboard,
  CustomerProfile,
  DealerDashboard,
  AdminDashboard,
} from '../pages/dashboard/Pages';






const ProtectedRoute = ({ component: Component, role }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (role) {
    if (Array.isArray(role)) {
      if (!role.includes(user?.role)) return <Navigate to="/" replace />;
    } else {
      if (user?.role !== role) return <Navigate to="/" replace />;
    }
  }

  return <Component />;
};

const Routes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <RouterRoutes>
        {}
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {}
        <Route path="/vehicles" element={<VehicleInventory />} />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />
        <Route path="/rent" element={<RentVehicle />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/saved-vehicles" element={<SavedVehicles />} />

        {}
        <Route
          path="/dashboard"
          element={<ProtectedRoute component={CustomerDashboard} />}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute component={CustomerProfile} />}
        />

        {}
        <Route
          path="/dealer/dashboard"
          element={<ProtectedRoute component={DealerDashboard} role={["dealer","owner"]} />}
        />

        {}
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute component={AdminDashboard} role="admin" />}
        />

        {}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </Suspense>
  );
};

export default Routes;
