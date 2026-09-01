import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardContent } from '../../components/ui/Card';
import EmptyState from '../../components/common/EmptyState';
import { useVehicleStore } from '../../store/vehicleStore';
import { useCartStore } from '../../store/cartStore';
import { useToast } from '../../context/ToastContext';
import toyotaLogo from 'car-brand-logos/toyota-logo.svg';
import bmwLogo from 'car-brand-logos/bmw-logo.svg';
import mercedesLogo from 'car-brand-logos/mercedes-benz-logo.svg';
import audiLogo from 'car-brand-logos/audi-logo.svg';
import fordLogo from 'car-brand-logos/ford-logo.png';
import hondaLogo from 'car-brand-logos/honda-logo.png';

export const NotFound = () => (
  <>
    <Helmet>
      <title>404 - Page Not Found</title>
    </Helmet>
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-surface-900">
      <div className="text-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-9xl font-bold text-accent-500 mb-4"
        >
          404
        </motion.div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Page Not Found
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button size="lg" to="/">Back to Home</Button>
      </div>
    </div>
  </>
);

export const SavedVehicles = () => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist } = useVehicleStore();
  const { addToCart, isInCart } = useCartStore();
  const { addToast } = useToast();

  const handleRemove = (vehicle) => {
    removeFromWishlist(vehicle.id);
    addToast(`${vehicle.name} removed from favorites`, 'info');
  };

  const handleAddToCart = (vehicle) => {
    addToCart(vehicle, 'purchase');
    addToast(`${vehicle.name} added to cart`, 'success');
  };

  return (
    <>
      <Helmet>
        <title>Favorites - Gene's InDrive</title>
      </Helmet>
      <div className="min-h-screen bg-white dark:bg-surface-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              My Favorites
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              You have {wishlist.length} saved vehicle
              {wishlist.length !== 1 ? 's' : ''}
            </p>

            {wishlist.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <EmptyState
                    icon={FiHeart}
                    title="No Favorites Yet"
                    description="Start exploring our collection and tap the heart icon to save your favorite vehicles here."
                    action={() => navigate('/vehicles')}
                    actionLabel="Browse Vehicles"
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {wishlist.map((vehicle) => (
                  <Card key={vehicle.id} variant="elevated" className="overflow-hidden">
                    <div
                      className="h-40 bg-surface-200 dark:bg-surface-700 cursor-pointer"
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    >
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent>
                      <p
                        className="text-slate-900 dark:text-white font-semibold cursor-pointer hover:text-accent-600 dark:hover:text-accent-400"
                        onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                      >
                        {vehicle.name}
                      </p>
                      <p className="text-accent-600 dark:text-accent-400 font-bold mb-4">
                        ${vehicle.price.toLocaleString()}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          fullWidth
                          variant={isInCart(vehicle.id) ? 'secondary' : 'primary'}
                          onClick={() => handleAddToCart(vehicle)}
                          className="flex items-center justify-center gap-1"
                        >
                          <FiShoppingCart size={14} />
                          {isInCart(vehicle.id) ? 'In Cart' : 'Add to Cart'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemove(vehicle)}
                          aria-label="Remove from favorites"
                        >
                          <FiTrash2 size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export const RentVehicle = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    dropoffDate: '',
    travelers: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!form.pickupLocation || !form.pickupDate || !form.dropoffDate) {
      addToast('Please fill in pick-up location and dates', 'error');
      return;
    }
    addToast(`Showing rentals available in ${form.pickupLocation}`, 'success');
    navigate('/vehicles');
  };

  return (
    <>
      <Helmet>
        <title>Rent a Vehicle - Gene's InDrive</title>
      </Helmet>
      <div className="min-h-screen bg-white dark:bg-surface-900">
        <div className="bg-gradient-to-r from-surface-950 to-surface-800 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">Rent a Vehicle</h1>
            <p className="text-slate-300">Find the perfect vehicle for your trip</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Card>
              <CardContent className="py-8">
                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Pick-up Location"
                      name="pickupLocation"
                      placeholder="City or airport"
                      value={form.pickupLocation}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Drop-off Location"
                      name="dropoffLocation"
                      placeholder="City or airport (optional)"
                      value={form.dropoffLocation}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                      label="Pick-up Date"
                      name="pickupDate"
                      type="date"
                      value={form.pickupDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <Input
                      label="Drop-off Date"
                      name="dropoffDate"
                      type="date"
                      value={form.dropoffDate}
                      onChange={handleChange}
                      min={form.pickupDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                    <Input
                      label="Number of Travelers"
                      name="travelers"
                      type="number"
                      min="1"
                      value={form.travelers}
                      onChange={handleChange}
                    />
                  </div>

                  <Button type="submit" fullWidth size="lg">
                    Search Vehicles
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export const Blog = () => {
  const { addToast } = useToast();

  const posts = [
    {
      title: 'Why luxury SUVs are winning the modern family lifestyle',
      excerpt:
        'From third-row comfort to tech-packed cabins, discover why today’s premium SUVs are redefining what family travel should feel like.',
      date: 'August 1, 2026',
      category: 'Lifestyle',
      highlights: ['Spacious interiors', 'Advanced safety', 'Weekend-ready comfort'],
    },
    {
      title: 'The quiet revolution of electric performance cars',
      excerpt:
        'Instant torque, smooth acceleration, and a more serene ride are reshaping how enthusiasts experience speed.',
      date: 'July 24, 2026',
      category: 'Performance',
      highlights: ['Zero-emission excitement', 'Smart charging', 'Fast torque delivery'],
    },
    {
      title: 'How to choose a vehicle that fits your real daily routine',
      excerpt:
        'The best car is rarely the loudest or the flashiest; it is the one that fits your commute, storage needs, and style with ease.',
      date: 'July 10, 2026',
      category: 'Buying Guide',
      highlights: ['Commute-focused picks', 'Cargo planning', 'Value over hype'],
    },
  ];

  const openArticle = (post) => (e) => {
    e.preventDefault();
    addToast(
      `${post.title} — ${post.excerpt} Read the full story in our upcoming editorial series.`,
      'info'
    );
  };

  return (
    <>
      <Helmet>
        <title>Blog - Gene's InDrive</title>
      </Helmet>
      <div className="min-h-screen bg-white dark:bg-surface-900">
        <div className="bg-gradient-to-r from-surface-950 to-surface-800 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">Blog</h1>
            <p className="text-slate-300">Latest news and insights about vehicles</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card variant="elevated">
                  <CardContent className="py-6">
                    <div className="inline-flex items-center rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-700 dark:bg-accent-500/10 dark:text-accent-300 mb-3">
                      {post.category}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                      {post.date}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {post.excerpt}
                    </p>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 mb-4 space-y-1">
                      {post.highlights.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button variant="ghost" size="sm" onClick={openArticle(post)}>
                      Read More →
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export const About = () => {
  const reviews = [
    {
      name: 'Aisha Bello',
      quote: 'The buying process felt transparent and easy. I found my SUV in days, not weeks.',
      rating: 5,
    },
    {
      name: 'Daniel Brooks',
      quote: 'Their support team made my rental experience smooth from booking to pickup.',
      rating: 5,
    },
    {
      name: 'Maria Santos',
      quote: 'Great inventory, honest pricing, and a very polished customer experience overall.',
      rating: 5,
    },
  ];

  return (
    <>
      <Helmet>
        <title>About Us - Gene's InDrive</title>
      </Helmet>
      <div className="min-h-screen bg-white dark:bg-surface-900">
        <div className="bg-gradient-to-r from-surface-950 via-surface-900 to-surface-800 py-20 px-4">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid items-end gap-8 lg:grid-cols-[1.5fr_0.9fr]"
            >
              <div className="text-white">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-accent-300">
                  About us
                </p>
                <h1 className="mb-5 max-w-3xl text-4xl font-bold tracking-[-0.04em] md:text-5xl">
                  Built around trust, speed, and smarter vehicle decisions.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                  Gene's InDrive brings buyers, renters, and dealers together in one modern experience—making car discovery, financing, and ownership feel clearer, faster, and more confident.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/25 backdrop-blur-sm">
                <div className="mb-6 grid grid-cols-3 gap-4 text-center">
                  {[
                    { number: '10k+', label: 'Cars' },
                    { number: '50k+', label: 'Users' },
                    { number: '100+', label: 'Partners' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-2xl font-bold text-white">{stat.number}</p>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-300">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-accent-500/15 via-white/5 to-transparent p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-accent-200">Our promise</p>
                  <p className="mt-3 text-lg font-medium text-white">
                    Transparent pricing. Premium inventory. A smoother path to ownership.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="space-y-14">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-b border-slate-200 pb-8 dark:border-surface-700"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-600">
                Company
              </p>
              <h2 className="mb-4 text-3xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
                A modern mobility company
              </h2>
              <p className="max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                We help people move with more confidence—whether they are buying a premium vehicle, renting for the weekend, or finding the right partner for long-term mobility.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-b border-slate-200 pb-8 dark:border-surface-700"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-600">
                Customer reviews
              </p>
              <h2 className="mb-6 text-3xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
                Trusted by drivers
              </h2>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.name} className="border-l border-slate-200 pl-4 text-slate-600 dark:border-surface-700 dark:text-slate-300">
                    <div className="mb-2 flex items-center gap-1 text-accent-500">
                      {Array.from({ length: review.rating }).map((_, idx) => (
                        <span key={idx}>★</span>
                      ))}
                    </div>
                    <p className="text-lg leading-8">“{review.quote}”</p>
                    <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-900 dark:text-white">
                      {review.name}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-b border-slate-200 pb-8 dark:border-surface-700"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-600">
                Contacts
              </p>
              <h2 className="mb-6 text-3xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
                We are here to help
              </h2>
              <div className="space-y-5 text-slate-600 dark:text-slate-300">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Phone</p>
                  <p className="mt-1 text-lg font-medium text-slate-900 dark:text-white">+1 (800) 555-0199</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Email</p>
                  <p className="mt-1 text-lg font-medium text-slate-900 dark:text-white">support@geneindrive.com</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Office</p>
                  <p className="mt-1 text-lg font-medium text-slate-900 dark:text-white">Lagos • Victoria Island</p>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pb-2"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-600">
                Our socials
              </p>
              <h2 className="mb-6 text-3xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
                Follow the journey
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Instagram', value: '@geneindrive', url: 'https://instagram.com' },
                  { label: 'Facebook', value: '@GeneInDrive', url: 'https://facebook.com' },
                  { label: 'X / Twitter', value: '@geneindrive', url: 'https://x.com' },
                  { label: 'LinkedIn', value: 'Gene InDrive', url: 'https://linkedin.com' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between border-b border-slate-200 py-3 text-base text-slate-700 transition hover:text-accent-600 dark:border-surface-700 dark:text-slate-200"
                  >
                    <span className="font-medium">{social.label}</span>
                    <span className="text-slate-500 transition group-hover:text-accent-600 dark:text-slate-400">{social.value}</span>
                  </a>
                ))}
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </>
  );
};

export const Contact = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const offices = [
    { city: 'Lagos', address: 'Victoria Island, 12 Marina Road' },
    { city: 'Abuja', address: 'Garki District, 18 Ahmadu Bello Way' },
    { city: 'Houston', address: 'North Loop Plaza, 2200 West Loop' },
  ];

  const supportItems = [
    { label: 'Customer Care', value: '+1 (800) 555-0199' },
    { label: 'Sales Desk', value: 'sales@geneindrive.com' },
    { label: 'Working Hours', value: 'Mon - Sat • 8:00 AM - 7:00 PM' },
  ];

  const brands = [
    { name: 'Toyota', logo: toyotaLogo },
    { name: 'BMW', logo: bmwLogo },
    { name: 'Mercedes', logo: mercedesLogo },
    { name: 'Audi', logo: audiLogo },
    { name: 'Ford', logo: fordLogo },
    { name: 'Honda', logo: hondaLogo },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      addToast('Please fill in your name, email, and message', 'error');
      return;
    }
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitting(false);
    addToast('Message sent — we\'ll get back to you soon!', 'success');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Genes InDrive </title>
      </Helmet>
      <div className="min-h-screen bg-white dark:bg-surface-900">
        <div className="bg-gradient-to-r from-surface-950 to-surface-800 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">Contact Us</h1>
            <p className="text-slate-300">We'd love to hear from you</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
                Get in Touch
              </h2>

              <div className="space-y-6 mb-8">
                {[
                  { icon: FiPhone, label: 'Phone', value: '+1 (555) 123-4567' },
                  { icon: FiMail, label: 'Email', value: 'support@geneindrive.com' },
                  { icon: FiMapPin, label: 'Address', value: '123 Main St, City, ST 12345' },
                ].map((contact, idx) => {
                  const Icon = contact.icon;
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="text-accent-600 dark:text-accent-400">
                        <Icon size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {contact.label}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          {contact.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardContent className="py-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                      label="Name"
                      name="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Subject"
                      name="subject"
                      placeholder="How can we help?"
                      value={form.subject}
                      onChange={handleChange}
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Message
                      </label>
                      <textarea
                        name="message"
                        placeholder="Your message..."
                        rows="5"
                        value={form.message}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                    <Button type="submit" fullWidth isLoading={submitting}>
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-slate-200 dark:border-surface-700 bg-slate-50 dark:bg-surface-800 p-6"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Our offices</h3>
              <div className="space-y-4">
                {offices.map((office) => (
                  <div key={office.city} className="border-b border-slate-200 dark:border-surface-700 pb-3 last:border-0 last:pb-0">
                    <p className="font-semibold text-slate-900 dark:text-white">{office.city}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{office.address}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-slate-200 dark:border-surface-700 bg-slate-50 dark:bg-surface-800 p-6"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Customer Service</h3>
              <div className="space-y-4">
                {supportItems.map((item) => (
                  <div key={item.label} className="border-b border-slate-200 dark:border-surface-700 pb-3 last:border-0 last:pb-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{item.label}</p>
                    <p className="mt-1 text-slate-900 dark:text-white font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-slate-200 dark:border-surface-700 bg-slate-50 dark:bg-surface-800 p-6"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Buy cars</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {brands.map((brand) => (
                  <button
                    key={brand.name}
                    type="button"
                    onClick={() => navigate('/vehicles')}
                    className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-500 hover:shadow-lg dark:border-surface-600 dark:from-surface-900 dark:to-surface-800"
                    aria-label={`Browse ${brand.name} vehicles`}
                  >
                    <div className="mb-3 flex h-20 w-full items-center justify-center overflow-hidden rounded-xl bg-white p-2 shadow-inner ring-1 ring-slate-200 transition group-hover:ring-accent-200 dark:bg-surface-950 dark:ring-surface-700">
                      <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700 transition group-hover:text-accent-600 dark:text-slate-200">
                      {brand.name}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export const ForgotPassword = () => {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email address', 'error');
      return;
    }
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitting(false);
    setSent(true);
    addToast('Password reset link sent — check your inbox', 'success');
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password - Gene's InDrive</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="border-surface-700/50 bg-surface-900/80 backdrop-blur-xl">
            <CardContent className="py-8">
              <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
              <p className="text-slate-400 text-sm mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {sent ? (
                <div className="text-center py-4">
                  <p className="text-accent-400 font-medium mb-4">Check your inbox for a reset link.</p>
                  <Button variant="outline" fullWidth to="/login">
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="your@email.com"
                    icon={FiMail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" fullWidth size="lg" isLoading={submitting}>
                    Send Reset Link
                  </Button>

                  <p className="text-center text-slate-400 text-sm">
                    Remember your password?{' '}
                    <a href="/login" className="text-accent-400 hover:text-accent-300">
                      Sign in
                    </a>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
