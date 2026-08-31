import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useVehicleStore = create(
  persist(
    (set, get) => ({
      wishlist: [],
      recentlyViewed: [],
      compareList: [],
      searchFilters: {},

      addToWishlist: (vehicle) =>
        set((state) => ({
          wishlist: state.wishlist.some((v) => v.id === vehicle.id)
            ? state.wishlist
            : [...state.wishlist, vehicle],
        })),

      removeFromWishlist: (vehicleId) =>
        set((state) => ({
          wishlist: state.wishlist.filter((v) => v.id !== vehicleId),
        })),

      isInWishlist: (vehicleId) => {
        return get().wishlist.some((v) => v.id === vehicleId);
      },

      addToRecentlyViewed: (vehicle) =>
        set((state) => {
          const filtered = state.recentlyViewed.filter(
            (v) => v.id !== vehicle.id
          );
          return {
            recentlyViewed: [vehicle, ...filtered].slice(0, 20),
          };
        }),

      addToCompareList: (vehicle) =>
        set((state) => ({
          compareList:
            state.compareList.length < 5 &&
            !state.compareList.some((v) => v.id === vehicle.id)
              ? [...state.compareList, vehicle]
              : state.compareList,
        })),

      removeFromCompareList: (vehicleId) =>
        set((state) => ({
          compareList: state.compareList.filter((v) => v.id !== vehicleId),
        })),

      clearCompareList: () => set({ compareList: [] }),

      setSearchFilters: (filters) => set({ searchFilters: filters }),

      clearSearchFilters: () => set({ searchFilters: {} }),
    }),
    {
      name: 'vehicle-storage',
    }
  )
);
