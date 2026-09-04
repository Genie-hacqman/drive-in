import { create } from 'zustand';
import { authService } from '../services/authService';

const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
};

export const useAuthStore = create((set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      registeredUsers: [],

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setIsLoading: (isLoading) => set({ isLoading }),
      clearAuth: () => set({ user: null, isAuthenticated: false }),

      hydrate: async () => {
        try {
          const { data } = await authService.getCurrentUser();
          set({ user: data.user, isAuthenticated: true });
          return data.user;
        } catch (error) {
          set({ user: null, isAuthenticated: false });
          return null;
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.login(email, password);
          set({
            user: data.user,
            isAuthenticated: true,
          });
          return { user: data.user };
        } catch (error) {
          throw new Error(getErrorMessage(error));
        } finally {
          set({ isLoading: false });
        }
      },

      adminLogin: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.adminLogin(email, password);
          set({ user: data.user, isAuthenticated: true });
          return { user: data.user };
        } catch (error) {
          throw new Error(getErrorMessage(error));
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } finally {
          set({ user: null, isAuthenticated: false });
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.register(userData);
          set({
            user: data.user,
            isAuthenticated: true,
          });
          return { user: data.user };
        } catch (error) {
          throw new Error(getErrorMessage(error));
        } finally {
          set({ isLoading: false });
        }
      },

      completeOAuth: async (code) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.exchangeOAuthCode(code);
          set({
            user: data.user,
            isAuthenticated: true,
          });
          return { user: data.user };
        } catch (error) {
          throw new Error(getErrorMessage(error));
        } finally {
          set({ isLoading: false });
        }
      },

}));
