import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  filterDrawerOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setFilterDrawerOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  filterDrawerOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setFilterDrawerOpen: (open) => set({ filterDrawerOpen: open }),
}));