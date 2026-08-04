// Память состояния фильтра каталога (04.08.2026)
// Раздельные сторы для шин и дисков — значения фильтров не пересекаются.
// Вкладки имеют ОТДЕЛЬНЫЕ значения цена/доставка/страна:
// - filterParams: фильтр «По параметрам» (сезон/бренд/размеры + цена/доставка/страна)
// - filterAuto: фильтр «По автомобилю» (цена/доставка/страна)
// - autoFilter: выбор каскада авто (марка/модель/год/модификация)
// URL каталога — источник истины; persist переживает перезагрузку.
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
  // Шины
  filterParams: FilterState;
  filterAuto: FilterState;
  autoFilter: AutoFilterState;
  // Диски
  wheelsFilterParams: FilterState;
  wheelsFilterAuto: FilterState;
  wheelsAutoFilter: AutoFilterState;

  setFilterParams: (filter: FilterState) => void;
  setFilterAuto: (filter: FilterState) => void;
  setAutoFilter: (auto: AutoFilterState) => void;
  resetFilterParams: () => void;
  resetFilterAuto: () => void;
  resetAutoFilter: () => void;

  setWheelsFilterParams: (filter: FilterState) => void;
  setWheelsFilterAuto: (filter: FilterState) => void;
  setWheelsAutoFilter: (auto: AutoFilterState) => void;
  resetWheelsFilterParams: () => void;
  resetWheelsFilterAuto: () => void;
  resetWheelsAutoFilter: () => void;
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      filterParams: {},
      filterAuto: {},
      autoFilter: {},
      wheelsFilterParams: {},
      wheelsFilterAuto: {},
      wheelsAutoFilter: {},

      setFilterParams: (filter) => set({ filterParams: filter }),
      setFilterAuto: (filter) => set({ filterAuto: filter }),
      setAutoFilter: (auto) => set({ autoFilter: auto }),
      resetFilterParams: () => set({ filterParams: {} }),
      resetFilterAuto: () => set({ filterAuto: {} }),
      resetAutoFilter: () => set({ autoFilter: {} }),

      setWheelsFilterParams: (filter) => set({ wheelsFilterParams: filter }),
      setWheelsFilterAuto: (filter) => set({ wheelsFilterAuto: filter }),
      setWheelsAutoFilter: (auto) => set({ wheelsAutoFilter: auto }),
      resetWheelsFilterParams: () => set({ wheelsFilterParams: {} }),
      resetWheelsFilterAuto: () => set({ wheelsFilterAuto: {} }),
      resetWheelsAutoFilter: () => set({ wheelsAutoFilter: {} }),
    }),
    { name: "catalog-filter" },
  ),
);
