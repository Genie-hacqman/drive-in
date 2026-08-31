import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiCheck, FiTrendingUp, FiShoppingCart } from 'react-icons/fi';
import Card, { CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useVehicleStore } from '../../store/vehicleStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';

const VehicleCard = ({ vehicle }) => {
  const navigate = useNavigate();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useVehicleStore();
  const { addToCart, isInCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);
  const inWishlist = isInWishlist(vehicle.id);
  const inCart = isInCart(vehicle.id);

  const requireAuth = (action) => {
    if (!isAuthenticated) {
      addToast('Please sign in to continue', 'info');
      navigate('/login', { state: { from: `/vehicles/${vehicle.id}` } });
      return false;
    }
    return true;
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return;
    if (inWishlist) {
      removeFromWishlist(vehicle.id);
      addToast(`Removed ${vehicle.name} from favorites`, 'info');
    } else {
      addToWishlist(vehicle);
      addToast(`Added ${vehicle.name} to favorites`, 'success');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return;
    addToCart(vehicle, 'purchase');
    addToast(`${vehicle.name} added to cart`, 'success');
  };

  const handleCardClick = () => {
    navigate(`/vehicles/${vehicle.id}`);
  };

  const filledStars = Math.round(vehicle.rating || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
    >
      <Card
        variant="elevated"
        className="overflow-hidden h-full cursor-pointer group"
        onClick={handleCardClick}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleCardClick();
        }}
      >
        {}
        <div className="relative h-48 bg-surface-200 dark:bg-surface-700 overflow-hidden">
          <motion.img
            src={vehicle.image}
            alt={vehicle.name}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />

          {}
          <div className="absolute top-3 left-3">
            {vehicle.featured && (
              <Badge variant="primary" className="flex items-center gap-1">
                <FiTrendingUp size={12} />
                Featured
              </Badge>
            )}
          </div>

          {}
          <motion.button
            type="button"
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 p-2 rounded-full bg-white dark:bg-surface-900 shadow-lg transition-colors z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={inWishlist ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={inWishlist}
          >
            <FiHeart
              size={20}
              className={inWishlist ? 'fill-red-500 text-red-500' : 'text-slate-600 dark:text-slate-300'}
            />
          </motion.button>

          {}
          {vehicle.available && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="success" className="flex items-center gap-1">
                <FiCheck size={12} />
                Available
              </Badge>
            </div>
          )}
        </div>

        {}
        <CardContent className="flex flex-col justify-between">
          <div>
            <div className="mb-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {vehicle.year} • {vehicle.brand}
              </p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {vehicle.name}
              </h3>
            </div>

            {}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400 mb-4">
              <span>{vehicle.fuel}</span>
              <span>•</span>
              <span>{vehicle.transmission}</span>
              <span>•</span>
              <span>{vehicle.seats} seats</span>
            </div>

            {}
            <div className="flex items-center gap-1 text-sm mb-4">
              <span className="font-semibold text-slate-900 dark:text-white">
                {vehicle.rating}
              </span>
              <div className="flex text-accent-400" aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < filledStars ? '' : 'text-slate-300 dark:text-surface-600'}>★</span>
                ))}
              </div>
              <span className="text-slate-500 dark:text-slate-400">
                ({vehicle.reviews})
              </span>
            </div>
          </div>

          {}
          <div className="border-t border-slate-200 dark:border-surface-700 pt-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${vehicle.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Or ${vehicle.rentalPrice}/day rental
                </p>
              </>
            ) : (
              <div className="mb-3">
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  Sign in to view pricing
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Purchase and rental rates are hidden until login.
                </p>
              </div>
            )}

            {}
            <Button
              variant={inCart ? 'secondary' : 'primary'}
              size="sm"
              fullWidth
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2"
            >
              <FiShoppingCart size={16} />
              {isAuthenticated ? (inCart ? 'In Cart' : 'Add to Cart') : 'Sign in to buy'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VehicleCard;
