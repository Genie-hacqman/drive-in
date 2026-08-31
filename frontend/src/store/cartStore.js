import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], 

      addToCart: (vehicle, mode = 'purchase') =>
        set((state) => {
          const existing = state.items.find(
            (item) => item.vehicle.id === vehicle.id && item.mode === mode
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.vehicle.id === vehicle.id && item.mode === mode
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { vehicle, quantity: 1, mode, addedAt: new Date().toISOString() },
            ],
          };
        }),

      removeFromCart: (vehicleId, mode = 'purchase') =>
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.vehicle.id === vehicleId && item.mode === mode)
          ),
        })),

      updateQuantity: (vehicleId, mode, quantity) =>
        set((state) => ({
          items: quantity < 1
            ? state.items.filter(
                (item) => !(item.vehicle.id === vehicleId && item.mode === mode)
              )
            : state.items.map((item) =>
                item.vehicle.id === vehicleId && item.mode === mode
                  ? { ...item, quantity }
                  : item
              ),
        })),

      isInCart: (vehicleId, mode = 'purchase') => {
        return get().items.some(
          (item) => item.vehicle.id === vehicleId && item.mode === mode
        );
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.vehicle.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
