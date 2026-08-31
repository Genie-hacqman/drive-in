import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useVehicleStore } from '../../store/vehicleStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';




const ShowcaseCard = ({ vehicle, className = '', tall = false }) => {
  const navigate = useNavigate();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useVehicleStore();
  const { addToCart, isInCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToast();
  const inWishlist = isInWishlist(vehicle.id);
  const inCart = isInCart(vehicle.id);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    addToast('Sign in below to continue', 'info');
    document
      .getElementById('landing-login')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  };

  const handleFavorite = (e) => {
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
    e.stopPropagation();
    if (!requireAuth()) return;
    addToCart(vehicle, 'purchase');
    addToast(`${vehicle.name} added to cart`, 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-surface-800 ${
        tall ? 'h-[420px] md:h-[560px]' : 'h-[280px] md:h-[270px]'
      } ${className}`}
    >
      <img
        src={vehicle.image}
        alt={vehicle.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      {}
      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={handleFavorite}
          aria-label={inWishlist ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={inWishlist}
          className="w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg backdrop-blur-sm transition-colors"
        >
          <FiHeart
            size={18}
            className={inWishlist ? 'fill-red-500 text-red-500' : 'text-slate-700'}
          />
        </button>
        <button
          type="button"
          onClick={handleAddToCart}
          aria-label="Add to cart"
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-colors ${
            inCart ? 'bg-accent-500 text-slate-950' : 'bg-white/90 hover:bg-white text-slate-700'
          }`}
        >
          <FiShoppingCart size={18} />
        </button>
      </div>

      {}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="text-accent-300 text-xs font-semibold uppercase tracking-wider mb-1">
          {vehicle.brand}
        </p>
        <h3 className="text-white text-xl font-bold mb-1 leading-tight">
          {vehicle.name}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-white/80 text-sm">
            ${vehicle.price.toLocaleString()}
          </p>
          <span className="text-white/60 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            View details →
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ShowcaseCard;
