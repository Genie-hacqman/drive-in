import { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { FiFilter, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';
import VehicleCard from '../../components/vehicle/VehicleCard';
import { useUiStore } from '../../store/uiStore';
import { vehicleService } from '../../services/vehicleService';
import { BRANDS, FUEL_TYPES, TRANSMISSIONS } from '../../data/vehicles';
const VehicleInventory = () => {
  const {
    filterPanelOpen,
    toggleFilterPanel,
    closeFilterPanel
  } = useUiStore();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    fuel: '',
    transmission: '',
    type: '',
    minYear: ''
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const { data } = await vehicleService.getVehicles({
          search: filters.search,
          brand: filters.brand,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          fuel: filters.fuel,
          transmission: filters.transmission,
          type: filters.type,
          minYear: filters.minYear,
        });
        setVehicles(data.vehicles || []);
      } catch (error) {
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [filters]);

  const filteredVehicles = useMemo(() => {
    const result = [...vehicles];
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => b.year - a.year);
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return result;
  }, [vehicles, sortBy]);

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      fuel: '',
      transmission: '',
      type: '',
      minYear: ''
    });
  };

  const activeFilterCount = Object.values(filters).filter(v => v).length;

  return <>
      <Helmet>
        <title>Browse Vehicles - Gene's InDrive</title>
        <meta name="description" content="Browse our collection of luxury and premium vehicles." />
      </Helmet>

      <div className="bg-gradient-to-r from-surface-950 to-surface-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">Browse Vehicles</h1>
          <p className="text-slate-300">
            Discover {vehicles.length} premium vehicles
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {}
            <div className="hidden lg:block lg:w-[320px] lg:flex-shrink-0">
              <FilterPanel filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />
            </div>


            <div className="flex-1 min-w-0">
              {}
              <div className="lg:hidden mb-6">
                <Button variant="outline" fullWidth onClick={toggleFilterPanel} className="flex items-center justify-center gap-2">
                  <FiFilter size={20} />
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
              </div>


              <AnimatePresence>
                {filterPanelOpen && <>
                    <motion.div initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} exit={{
                  opacity: 0
                }} onClick={closeFilterPanel} className="lg:hidden fixed inset-0 bg-black/50 z-30" />
                    <motion.div initial={{
                  x: -400
                }} animate={{
                  x: 0
                }} exit={{
                  x: -400
                }} className="lg:hidden fixed left-0 top-0 h-full w-80 bg-white dark:bg-surface-800 shadow-xl z-40 overflow-y-auto">
                      <div className="p-4 border-b border-slate-200 dark:border-surface-700 flex justify-between items-center">
                        <h2 className="font-semibold">Filters</h2>
                        <button type="button" onClick={closeFilterPanel} aria-label="Close filters" className="text-slate-500 hover:text-slate-800 dark:hover:text-white">
                          <FiX size={24} />
                        </button>
                      </div>
                      <div className="p-4">
                        <FilterPanel filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />
                      </div>
                    </motion.div>
                  </>}
              </AnimatePresence>


              <div className="flex justify-between items-center mb-8">
                <p className="text-slate-600 dark:text-slate-400">
                  Showing {filteredVehicles.length} results
                </p>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">
                    Sort by:
                  </label>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-1 border border-slate-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500">
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20 text-slate-600 dark:text-slate-400">Loading vehicles…</div>
              ) : filteredVehicles.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredVehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
                </div> : <div className="text-center py-20">
                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                    No vehicles found matching your criteria.
                  </p>
                  <Button onClick={handleReset}>Clear Filters</Button>
                </div>}
            </div>
          </div>
        </div>
      </div>
    </>;
};
const FilterPanel = ({
  filters,
  onFilterChange,
  onReset
}) => {
  const hasActiveFilters = Object.values(filters).some(v => v);
  return <div className="sticky top-20 w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-lg dark:border-surface-700 dark:bg-surface-800 space-y-5">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
          Filters
        </h3>
        {hasActiveFilters && <Button variant="ghost" size="sm" onClick={onReset} fullWidth>
            Clear All
          </Button>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Search Vehicles
        </label>
        <input name="search" value={filters.search} onChange={onFilterChange} placeholder="Search by car name" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-surface-600 dark:bg-surface-900 dark:text-white" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Brand
        </label>
        <select name="brand" value={filters.brand} onChange={onFilterChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-surface-600 dark:bg-surface-900 dark:text-white">
          <option value="">All Brands</option>
          {BRANDS.map(brand => <option key={brand} value={brand}>
              {brand}
            </option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Price Range
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 mb-2">
          <input type="number" name="minPrice" placeholder="Min" value={filters.minPrice} onChange={onFilterChange} className="w-full sm:flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-surface-600 dark:bg-surface-900 dark:text-white" />
          <input type="number" name="maxPrice" placeholder="Max" value={filters.maxPrice} onChange={onFilterChange} className="w-full sm:flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-surface-600 dark:bg-surface-900 dark:text-white" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Fuel Type
        </label>
        <select name="fuel" value={filters.fuel} onChange={onFilterChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-surface-600 dark:bg-surface-900 dark:text-white">
          <option value="">All Types</option>
          {FUEL_TYPES.map(fuel => <option key={fuel.id} value={fuel.id}>
              {fuel.name}
            </option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Transmission
        </label>
        <select name="transmission" value={filters.transmission} onChange={onFilterChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-surface-600 dark:bg-surface-900 dark:text-white">
          <option value="">All Types</option>
          {TRANSMISSIONS.map(trans => <option key={trans.id} value={trans.id}>
              {trans.name}
            </option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Minimum Year
        </label>
        <select name="minYear" value={filters.minYear} onChange={onFilterChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-surface-600 dark:bg-surface-900 dark:text-white">
          <option value="">Any Year</option>
          {[2024, 2023, 2022, 2021, 2020].map(year => <option key={year} value={year}>
              {year}
            </option>)}
        </select>
      </div>
    </div>;
};
export default VehicleInventory;