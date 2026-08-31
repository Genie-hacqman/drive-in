import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      registeredUsers: [],

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setIsLoading: (isLoading) => set({ isLoading }),

      hydrate: async () => {
        const { token } = get();
        if (!token) return null;

        try {
          const { data } = await authService.getCurrentUser();
          set({ user: data.user, isAuthenticated: true });
          return data.user;
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false });
          return null;
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.login(email, password);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });
          return { user: data.user, token: data.token };
        } catch (error) {
          throw new Error(getErrorMessage(error));
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.register(userData);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });
          return { user: data.user, token: data.token };
        } catch (error) {
          throw new Error(getErrorMessage(error));
        } finally {
          set({ isLoading: false });
        }
      },

      googleLogin: async (googleProfile) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.googleLogin(googleProfile);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });
          return { user: data.user, token: data.token };
        } catch (error) {
          throw new Error(getErrorMessage(error));
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
