// Память состояния фильтра каталога (04.08.2026)
// Вкладки имеют ОТДЕЛЬНЫЕ значения цена/доставка/страна:
// - filterParams: фильтр «По параметрам» (сезон/бренд/размеры + цена/доставка/страна)
// - filterAuto: фильтр «По автомобилю» (цена/доставка/страна)
// - autoFilter: выбор каскада авто (марка/модель/год/модификация)
// URL каталога — источник истины для filterParams; URL каскада — для filterAuto.
// persist: переживает перезагрузку.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FilterState } from "@/features/catalog/types";

export interface AutoFilterState {
  brand?: string;
  model?: string;
  year?: string;
  mod?: string;
}

interface FilterStore {
  filterParams: FilterState;
  filterAuto: FilterState;
  autoFilter: AutoFilterState;
  setFilterParams: (filter: FilterState) => void;
  setFilterAuto: (filter: FilterState) => void;
  setAutoFilter: (auto: AutoFilterState) => void;
  resetFilterParams: () => void;
  resetFilterAuto: () => void;
  resetAutoFilter: () => void;
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      filterParams: {},
      filterAuto: {},
      autoFilter: {},
      setFilterParams: (filter) => set({ filterParams: filter }),
      setFilterAuto: (filter) => set({ filterAuto: filter }),
      setAutoFilter: (auto) => set({ autoFilter: auto }),
      resetFilterParams: () => set({ filterParams: {} }),
      resetFilterAuto: () => set({ filterAuto: {} }),
      resetAutoFilter: () => set({ autoFilter: {} }),
    }),
    { name: "catalog-filter" },
  ),
);
