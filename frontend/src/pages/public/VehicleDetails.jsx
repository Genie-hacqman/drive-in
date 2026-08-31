import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FiHeart, FiShare2, FiChevronLeft, FiCheckCircle, FiShoppingCart, FiCalendar } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useVehicleStore } from '../../store/vehicleStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { vehicleService } from '../../services/vehicleService';
import { bookingService } from '../../services/bookingService';
const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useVehicleStore();
  const { addToCart, isInCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToast();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testDriveOpen, setTestDriveOpen] = useState(false);
  const [testDriveDate, setTestDriveDate] = useState('');
  const [testDriveTime, setTestDriveTime] = useState('');

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        setLoading(true);
        const { data } = await vehicleService.getVehicleById(id);
        setVehicle(data.vehicle);
      } catch (error) {
        setVehicle(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadVehicle();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600 dark:text-slate-400">Loading vehicle…</div>;
  }

  if (!vehicle) {
    return <NotFoundVehicle />;
  }
  const inWishlist = isInWishlist(vehicle.id);
  const inCart = isInCart(vehicle.id, 'purchase');
  const inRentalCart = isInCart(vehicle.id, 'rental');
  const handleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(vehicle.id);
      addToast('Removed from favorites', 'info');
    } else {
      addToWishlist(vehicle);
      addToast('Added to favorites', 'success');
    }
  };
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: vehicle.name,
          text: `Check out this ${vehicle.year} ${vehicle.name} on Gene's InDrive!`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        addToast('Link copied to clipboard', 'success');
      }
    } catch (err) {}
  };
  const requireAuthForPurchase = (actionLabel) => {
    if (!isAuthenticated) {
      addToast(`Please sign in to ${actionLabel}`, 'info');
      navigate('/login', { state: { from: `/vehicles/${vehicle.id}` } });
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!requireAuthForPurchase('buy a vehicle')) return;
    addToCart(vehicle, 'purchase');
    addToast(`${vehicle.name} added to cart`, 'success');
  };
  const handleReserveForRental = () => {
    if (!requireAuthForPurchase('reserve a vehicle')) return;
    addToCart(vehicle, 'rental');
    addToast(`${vehicle.name} reserved for rental — review it in your cart`, 'success');
    navigate('/cart');
  };
  const handleTestDriveSubmit = async e => {
    e.preventDefault();
    if (!testDriveDate || !testDriveTime) {
      addToast('Please choose a date and time', 'error');
      return;
    }

    try {
      await bookingService.bookTestDrive({
        vehicleId: vehicle.id,
        date: testDriveDate,
        time: testDriveTime,
        notes: `Test drive request for ${vehicle.name}`,
      });
      addToast(`Test drive booked for ${vehicle.name} on ${testDriveDate} at ${testDriveTime}`, 'success');
      setTestDriveOpen(false);
      setTestDriveDate('');
      setTestDriveTime('');
    } catch (error) {
      addToast(error?.response?.data?.message || 'Unable to book test drive right now', 'error');
    }
  };
  return <>
      <Helmet>
        <title>{vehicle.name} - Gene's InDrive</title>
        <meta name="description" content={vehicle.description} />
      </Helmet>

      {}
      <div className="bg-white dark:bg-surface-900 border-b border-slate-200 dark:border-surface-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button type="button" onClick={() => navigate('/vehicles')} className="flex items-center gap-2 text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 font-medium">
            <FiChevronLeft />
            Back to Vehicles
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {}
            <div className="lg:col-span-2">
              <motion.div initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} className="mb-4 rounded-xl overflow-hidden bg-surface-200 dark:bg-surface-800">
                <img src={vehicle.image} alt={vehicle.name} className="w-full h-96 object-cover" />
              </motion.div>

              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
                {Object.entries(vehicle.specs).map(([key, value]) => <Card key={key} variant="subtle">
                    <CardContent className="text-center py-4">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {value}
                      </p>
                    </CardContent>
                  </Card>)}
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  About This Vehicle
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {vehicle.description}
                </p>
              </div>

              {}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Features & Equipment
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {vehicle.features.map((feature, idx) => <motion.div key={idx} initial={{
                  opacity: 0,
                  x: -20
                }} whileInView={{
                  opacity: 1,
                  x: 0
                }} viewport={{
                  once: true
                }} transition={{
                  delay: idx * 0.05
                }} className="flex items-center gap-2">
                      <FiCheckCircle className="text-green-500 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </motion.div>)}
                </div>
              </div>

            
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Customer Reviews
                </h2>
                <Card>
                  <CardContent className="text-center py-8">
                    <div className="flex justify-center mb-4">
                      {[...Array(5)].map((_, i) => <span key={i} className={`text-3xl ${i < Math.round(vehicle.rating) ? 'text-accent-400' : 'text-slate-300 dark:text-surface-600'}`}>
                          ★
                        </span>)}
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      {vehicle.rating}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Based on {vehicle.reviews} customer reviews
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            
            <div>
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} className="sticky top-20">
                {}
                <Card variant="elevated" className="mb-6">
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {vehicle.year} • {vehicle.brand}
                    </p>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                      {vehicle.name}
                    </h1>

                    {vehicle.available && <Badge variant="success" className="mb-6">
                        In Stock
                      </Badge>}

                    <div className="border-y border-slate-200 dark:border-surface-700 py-6 mb-6">
                      {isAuthenticated ? (
                        <>
                          <div className="mb-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                              Purchase Price
                            </p>
                            <p className="text-4xl font-bold text-slate-900 dark:text-white">
                              ${vehicle.price.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                              Or Rent
                            </p>
                            <p className="text-2xl font-semibold text-accent-600 dark:text-accent-400">
                              ${vehicle.rentalPrice}/day
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            Sign in to view pricing
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Purchase and rental rates are available after login.
                          </p>
                        </div>
                      )}
                    </div>

                    
                    <div className="space-y-3 mb-6">
                      <Button fullWidth size="lg" onClick={handleAddToCart} className="flex items-center justify-center gap-2">
                        <FiShoppingCart size={18} />
                        {isAuthenticated ? (inCart ? 'Added to Cart ✓' : 'Add to Cart') : 'Sign in to buy'}
                      </Button>
                      <Button fullWidth size="lg" variant="secondary" onClick={handleReserveForRental}>
                        {isAuthenticated ? (inRentalCart ? 'Reserved for Rental ✓' : 'Reserve for Rental') : 'Sign in to rent'}
                      </Button>
                      <Button fullWidth size="lg" variant="outline" onClick={() => setTestDriveOpen(true)} className="flex items-center justify-center gap-2">
                        <FiCalendar size={18} />
                        Book Test Drive
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <motion.button type="button" whileHover={{
                      scale: 1.05
                    }} whileTap={{
                      scale: 0.95
                    }} onClick={handleWishlist} className="flex-1 py-2 px-4 border border-slate-300 dark:border-surface-600 rounded-lg hover:bg-slate-50 dark:hover:bg-surface-800 transition-colors flex items-center justify-center gap-2" aria-pressed={inWishlist}>
                        <FiHeart size={20} className={inWishlist ? 'fill-red-500 text-red-500' : 'text-slate-600 dark:text-slate-300'} />
                        <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-200">
                          {inWishlist ? 'Saved' : 'Save'}
                        </span>
                      </motion.button>
                      <motion.button type="button" whileHover={{
                      scale: 1.05
                    }} whileTap={{
                      scale: 0.95
                    }} onClick={handleShare} className="flex-1 py-2 px-4 border border-slate-300 dark:border-surface-600 rounded-lg hover:bg-slate-50 dark:hover:bg-surface-800 transition-colors flex items-center justify-center gap-2">
                        <FiShare2 size={20} className="text-slate-600 dark:text-slate-300" />
                        <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-200">
                          Share
                        </span>
                      </motion.button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Key Details
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <SpecRow label="Transmission" value={vehicle.transmission} />
                    <SpecRow label="Fuel Type" value={vehicle.fuel} />
                    <SpecRow label="Horsepower" value={`${vehicle.horsepower} hp`} />
                    <SpecRow label="Seats" value={vehicle.seats} />
                    <SpecRow label="Color" value={vehicle.color} />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={testDriveOpen} onClose={() => setTestDriveOpen(false)} title={`Book a Test Drive — ${vehicle.name}`} size="md">
        <form onSubmit={handleTestDriveSubmit} className="space-y-4">
          <Input label="Preferred Date" type="date" required value={testDriveDate} onChange={e => setTestDriveDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
          <Input label="Preferred Time" type="time" required value={testDriveTime} onChange={e => setTestDriveTime(e.target.value)} />
          <Button type="submit" fullWidth size="lg">
            Confirm Booking
          </Button>
        </form>
      </Modal>
    </>;
};
const SpecRow = ({
  label,
  value
}) => <div className="flex justify-between items-center py-2">
    <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
    <span className="font-medium text-slate-900 dark:text-white">{value}</span>
  </div>;
const NotFoundVehicle = () => <div className="flex items-center justify-center min-h-screen bg-white dark:bg-surface-900">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
        Vehicle Not Found
      </h1>
      <Button to="/vehicles">Back to Vehicles</Button>
    </div>
  </div>;
export default VehicleDetails;