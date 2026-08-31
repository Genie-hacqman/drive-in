import { create } from 'zustand';

export const useUiStore = create((set) => ({
  mobileMenuOpen: false,
  filterPanelOpen: false,
  modalOpen: false,
  modalContent: null,
  sidebarOpen: true,

  toggleMobileMenu: () =>
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

  closeMobileMenu: () => set({ mobileMenuOpen: false }),

  toggleFilterPanel: () =>
    set((state) => ({ filterPanelOpen: !state.filterPanelOpen })),

  closeFilterPanel: () => set({ filterPanelOpen: false }),

  openModal: (content) => set({ modalOpen: true, modalContent: content }),

  closeModal: () => set({ modalOpen: false, modalContent: null }),

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
