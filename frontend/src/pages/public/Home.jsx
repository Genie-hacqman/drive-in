import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiArrowRight,
  FiTrendingUp,
  FiMapPin,
  FiClock,
  FiShield,
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import ShowcaseCard from '../../components/vehicle/ShowcaseCard';
import { SAMPLE_VEHICLES } from '../../data/vehicles';
import toyotaLogo from 'car-brand-logos/toyota-logo.svg';
import bmwLogo from 'car-brand-logos/bmw-logo.svg';
import mercedesLogo from 'car-brand-logos/mercedes-benz-logo.svg';
import audiLogo from 'car-brand-logos/audi-logo.svg';
import fordLogo from 'car-brand-logos/ford-logo.png';
import hondaLogo from 'car-brand-logos/honda-logo.png';
import lexusLogo from 'car-brand-logos/lexus-logo.png';
import porscheLogo from 'car-brand-logos/porsche-logo.svg';
import ferrariLogo from 'car-brand-logos/ferrari-logo.svg';
import bentleyLogo from 'car-brand-logos/bentley-logo.svg';
import jaguarLogo from 'car-brand-logos/jaguar-logo.svg';
import maseratiLogo from 'car-brand-logos/maserati-logo.png';
import lamborghiniLogo from 'car-brand-logos/lamborghini-logo.png';
import landRoverLogo from 'car-brand-logos/land-rover-logo.svg';
import astonMartinLogo from 'car-brand-logos/aston-martin-logo.svg';
import teslaLogo from 'car-brand-logos/tesla-logo.svg';
import miniLogo from 'car-brand-logos/mini-logo.svg';
import bugattiLogo from 'car-brand-logos/bugatti-logo.svg';
import mclarenLogo from 'car-brand-logos/mclaren-logo.svg';
import rollsRoyceLogo from 'car-brand-logos/rolls-royce-logo.svg';
import lotusLogo from 'car-brand-logos/lotus-logo.svg';
import maybachLogo from 'car-brand-logos/maybach-logo.png';

const Home = () => {
  const showcaseVehicles = SAMPLE_VEHICLES.filter((v) => v.featured).slice(0, 5);
  const [heroVehicle, ...restVehicles] = showcaseVehicles;

  const brandLogos = [
    { name: 'BMW', logo: bmwLogo },
    { name: 'Mercedes', logo: mercedesLogo },
    { name: 'Audi', logo: audiLogo },
    { name: 'Porsche', logo: porscheLogo },
    { name: 'Ferrari', logo: ferrariLogo },
    { name: 'Lamborghini', logo: lamborghiniLogo },
    { name: 'Bentley', logo: bentleyLogo },
    { name: 'Rolls-Royce', logo: rollsRoyceLogo },
    { name: 'Jaguar', logo: jaguarLogo },
    { name: 'Land Rover', logo: landRoverLogo },
    { name: 'Maserati', logo: maseratiLogo },
    { name: 'Aston Martin', logo: astonMartinLogo },
    { name: 'Lexus', logo: lexusLogo },
    { name: 'Tesla', logo: teslaLogo },
    { name: 'Ford', logo: fordLogo },
    { name: 'Toyota', logo: toyotaLogo },
    { name: 'Honda', logo: hondaLogo },
    { name: 'Mini', logo: miniLogo },
    { name: 'McLaren', logo: mclarenLogo },
    { name: 'Bugatti', logo: bugattiLogo },
    { name: 'Maybach', logo: maybachLogo },
    { name: 'Lotus', logo: lotusLogo },
  ];

  const features = [
    {
      icon: FiMapPin,
      title: 'Find Your Perfect Car',
      description: 'Browse our extensive collection of luxury and premium vehicles.',
    },
    {
      icon: FiClock,
      title: 'Quick Booking',
      description: 'Book a test drive or rental in just a few clicks.',
    },
    {
      icon: FiTrendingUp,
      title: 'Best Prices',
      description: 'Competitive pricing with flexible payment options.',
    },
    {
      icon: FiShield,
      title: 'Safe & Secure',
      description: 'Your safety and privacy are our top priorities.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Vehicles' },
    { number: '50,000+', label: 'Happy Customers' },
    { number: '100+', label: 'Dealers' },
    { number: '24/7', label: 'Support' },
  ];

  return (
    <>
      <Helmet>
        <title>Genes InDrive - Premium Automobile Marketplace</title>
        <meta
          name="description"
          content="Discover and book luxury vehicles, test drives, and rentals on Gene's InDrive."
        />
      </Helmet>

      <section className="relative min-h-[820px] flex items-center overflow-hidden bg-[#090a0b]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=80"
            alt="Luxury vehicle inventory"
            className="w-full h-full object-cover opacity-55 contrast-125 saturate-[.8] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090a0b] via-[#090a0b]/75 to-[#090a0b]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090a0b] via-transparent to-[#090a0b]/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
          <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-14 items-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white max-w-3xl"
            >
              <span className="inline-flex items-center gap-3 mb-7 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-amber-300">
                <span className="h-px w-10 bg-amber-400" /> The art of the drive
              </span>

              <h1 className="text-5xl md:text-7xl xl:text-[6.4rem] font-bold mb-7 leading-[0.88] tracking-[-0.065em]">
                The road is <span className="text-amber-400">yours.</span>
              </h1>

              <p className="text-base md:text-lg text-slate-300 mb-9 max-w-xl leading-relaxed">
                A considered collection of exceptional vehicles, selected for the way they make every mile feel different.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button
                  size="lg"
                  to="/vehicles"
                  className="flex items-center justify-center gap-2 px-7 shadow-[0_16px_30px_rgba(199,151,69,0.28)] uppercase tracking-[0.08em] text-sm !text-slate-950"
                >
                  Explore Inventory
                  <FiArrowRight />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 !text-white hover:bg-white/10 px-7 bg-white/5 backdrop-blur-sm uppercase tracking-[0.08em] text-sm"
                  href="#showcase"
                >
                  View Featured Cars
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-5 max-w-xl border-t border-white/20 pt-5">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl md:text-3xl font-bold text-white">{stat.number}</p>
                    <p className="text-slate-400 text-[0.68rem] uppercase tracking-[0.12em] mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="rounded-sm border border-white/15 bg-black/35 p-6 md:p-7 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-amber-300">Start your journey</p>
                  <h2 className="text-2xl font-bold text-white mt-2">Find your next vehicle</h2>
                </div>
                <span className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">01 / 04</span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <select className="rounded-xl border border-slate-600 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400">
                    <option>Any Make</option>
                    <option>Toyota</option>
                    <option>BMW</option>
                    <option>Mercedes</option>
                    <option>Ford</option>
                  </select>
                  <select className="rounded-xl border border-slate-600 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400">
                    <option>Any Model</option>
                    <option>RX 350</option>
                    <option>C-Class</option>
                    <option>F-150</option>
                    <option>Civic</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min price"
                    className="rounded-xl border border-slate-600 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400"
                  />
                  <input
                    type="number"
                    placeholder="Max price"
                    className="rounded-xl border border-slate-600 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select className="rounded-xl border border-slate-600 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400">
                    <option>Fuel Type</option>
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>Hybrid</option>
                    <option>Electric</option>
                  </select>
                  <select className="rounded-xl border border-slate-600 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400">
                    <option>Transmission</option>
                    <option>Automatic</option>
                    <option>Manual</option>
                  </select>
                </div>

                <Button
                  size="lg"
                  to="/vehicles"
                  className="w-full mt-2 flex items-center justify-center gap-2 shadow-[0_16px_30px_rgba(245,158,11,0.3)] !text-slate-950"
                >
                  Search Inventory
                  <FiArrowRight />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mt-8 border-y border-amber-500/10 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.08),transparent_55%)] py-5 md:mt-10">
        <div className="overflow-hidden">
          <div className="logo-marquee-track flex min-w-max items-center gap-3 px-3 md:gap-4">
            {[...brandLogos, ...brandLogos].map((brand, index) => (
              <div
                key={`${brand.name}-${index}`}
                className="logo-marquee-item flex h-16 w-28 items-center justify-center rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 to-amber-600/5 px-3 text-center shadow-[0_8px_16px_rgba(251,191,36,0.1)] backdrop-blur-md hover:shadow-[0_12px_24px_rgba(251,191,36,0.2)] hover:border-amber-400/50 transition-all duration-300 md:w-36"
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-8 w-auto max-w-[90px] object-contain opacity-100 transition-all duration-300 hover:opacity-110 md:max-h-9"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="showcase" className="py-20 px-4 bg-white dark:bg-slate-900 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4"
          >
            <div>
              <p className="text-amber-600 dark:text-amber-400 font-semibold text-sm uppercase tracking-[0.2em] mb-2">
                The Collection
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-[-0.05em]">
                See What’s Waiting for You
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 max-w-md text-base leading-relaxed">
              A glimpse of the vehicles in our collection. Sign in to add any
              of these to your cart, save favorites, or explore full specs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6">
            {heroVehicle && (
              <div className="md:row-span-2">
                <ShowcaseCard vehicle={heroVehicle} tall />
              </div>
            )}
            {restVehicles.map((vehicle) => (
              <ShowcaseCard key={vehicle.id} vehicle={vehicle} />
            ))}

            <motion.a
              href="/vehicles"
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="hidden md:flex flex-col items-center justify-center gap-3 h-[270px] rounded-2xl border-2 border-dashed border-slate-300 dark:border-surface-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors text-slate-500 dark:text-slate-400 hover:text-accent-600 dark:hover:text-accent-400 no-underline"
            >
              <FiArrowRight size={28} />
              <span className="font-semibold">View Full Collection</span>
            </motion.a>
          </div>

          <div className="text-center mt-12 md:hidden">
            <Button size="lg" to="/vehicles" className="flex items-center gap-2 mx-auto w-fit">
              View Full Collection
              <FiArrowRight />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-[-0.05em] mb-4">
              Why Choose Genes InDrive?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              We’re committed to providing the best automotive marketplace experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
                >
                  <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center mb-4 shadow-[0_12px_28px_rgba(245,158,11,0.35)]">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center text-white"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                  className="text-4xl md:text-5xl font-bold mb-2"
                >
                  {stat.number}
                </motion.div>
                <p className="text-accent-100">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-20 px-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-200 text-xs font-semibold uppercase tracking-[0.2em] mb-6">
            Start your search
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-[-0.05em] mb-6 text-white">Ready to Find Your Vehicle?</h2>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Join thousands of satisfied customers who&apos;ve found their perfect car on
            Gene&apos;s InDrive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" to="/vehicles">Start Browsing</Button>
            <Button size="lg" variant="secondary" to="/contact">Get in Touch</Button>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default Home;
