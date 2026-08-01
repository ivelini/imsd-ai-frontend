// UI-состояние: город, попапы, меню (фаза 1)
import { create } from "zustand";
import { DEFAULT_CITY } from "@/data/geo";

interface UIState {
  city: string;
  geoOpen: boolean;
  menuOpen: boolean;
  cartPopupOpen: boolean;
  setCity: (city: string) => void;
  setGeoOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setCartPopupOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  city: DEFAULT_CITY,
  geoOpen: false,
  menuOpen: false,
  cartPopupOpen: false,
  setCity: (city) => set({ city }),
  setGeoOpen: (open) => set({ geoOpen: open }),
  setMenuOpen: (open) => set({ menuOpen: open }),
  setCartPopupOpen: (open) => set({ cartPopupOpen: open }),
}));
