import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Card, { CardContent } from '../../components/ui/Card';
import EmptyState from '../../components/common/EmptyState';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, getSubtotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToast();
  const subtotal = getSubtotal();

  const handleRemove = (vehicle, mode) => {
    removeFromCart(vehicle.id, mode);
    addToast(`${vehicle.name} removed from cart`, 'info');
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      addToast('Please sign in to buy a vehicle', 'info');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    addToast('Checkout request received — our team will follow up shortly', 'success');
    clearCart();
  };

  return (
    <>
      <Helmet>
        <title>My Cart - Gene's InDrive</title>
      </Helmet>
      <div className="min-h-screen bg-slate-50 dark:bg-surface-900">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-slate-900 dark:text-white mb-2"
          >
            My Cart
          </motion.h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            {items.length === 0
              ? 'Your cart is empty'
              : `${items.length} vehicle${items.length !== 1 ? 's' : ''} in your cart`}
          </p>

          {items.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  icon={FiShoppingBag}
                  title="Your cart is empty"
                  description="Browse our collection and add a vehicle to purchase or reserve for rental."
                  action={() => (window.location.href = '/vehicles')}
                  actionLabel="Browse Vehicles"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={`${item.vehicle.id}-${item.mode}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <Card>
                        <CardContent className="flex gap-4 items-center">
                          <img
                            src={item.vehicle.image}
                            alt={item.vehicle.name}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs uppercase tracking-wide text-accent-600 dark:text-accent-400 font-semibold mb-1">
                              {item.mode === 'rental' ? 'Rental Reservation' : 'Purchase'}
                            </p>
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                              {item.vehicle.name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {item.mode === 'rental'
                                ? `$${item.vehicle.rentalPrice}/day`
                                : `$${item.vehicle.price.toLocaleString()}`}
                            </p>
                          </div>

                          {item.mode === 'purchase' && (
                            <div className="flex items-center gap-2 border border-slate-200 dark:border-surface-700 rounded-lg px-2 py-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.vehicle.id, item.mode, item.quantity - 1)
                                }
                                className="p-1 hover:bg-slate-100 dark:hover:bg-surface-700 rounded"
                                aria-label="Decrease quantity"
                              >
                                <FiMinus size={14} />
                              </button>
                              <span className="w-6 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.vehicle.id, item.mode, item.quantity + 1)
                                }
                                className="p-1 hover:bg-slate-100 dark:hover:bg-surface-700 rounded"
                                aria-label="Increase quantity"
                              >
                                <FiPlus size={14} />
                              </button>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemove(item.vehicle, item.mode)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            aria-label="Remove from cart"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <Button variant="ghost" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>

              <div>
                <Card className="sticky top-24">
                  <CardContent className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Order Summary
                    </h2>
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-surface-700 pt-4 flex justify-between font-semibold text-slate-900 dark:text-white">
                      <span>Estimated Total</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    <Button fullWidth size="lg" onClick={handleCheckout}>
                      Proceed to Checkout
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
