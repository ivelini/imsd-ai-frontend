// UI-состояние: город, попапы, меню (фаза 1)
import { create } from "zustand";

interface UIState {
  cityValue: string | null; // зеркало URL ?city=..., null = ещё не инициализирован
  geoOpen: boolean;
  menuOpen: boolean;
  cartPopupOpen: boolean;
  setCityValue: (value: string | null) => void;
  setGeoOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setCartPopupOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  cityValue: null,
  geoOpen: false,
  menuOpen: false,
  cartPopupOpen: false,
  setCityValue: (value) => set({ cityValue: value }),
  setGeoOpen: (open) => set({ geoOpen: open }),
  setMenuOpen: (open) => set({ menuOpen: open }),
  setCartPopupOpen: (open) => set({ cartPopupOpen: open }),
}));
