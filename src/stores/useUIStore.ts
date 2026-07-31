"use client";

import { create } from "zustand";
import { DEFAULT_CITY, type City } from "@/data/geo";

interface UIState {
  city: City;
  menuOpen: boolean;
  geoOpen: boolean;
  cartPopupOpen: boolean;
  setCity: (city: City) => void;
  setMenuOpen: (open: boolean) => void;
  setGeoOpen: (open: boolean) => void;
  setCartPopupOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  city: DEFAULT_CITY,
  menuOpen: false,
  geoOpen: false,
  cartPopupOpen: false,
  setCity: (city) => set({ city }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setGeoOpen: (geoOpen) => set({ geoOpen }),
  setCartPopupOpen: (cartPopupOpen) => set({ cartPopupOpen }),
}));
