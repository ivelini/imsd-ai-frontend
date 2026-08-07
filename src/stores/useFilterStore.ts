// Память состояния фильтра каталога (04.08.2026)
// Параметризовано категорией (tires/wheels) и вкладкой — значения не пересекаются.
// Вкладки имеют ОТДЕЛЬНЫЕ значения цена/доставка/страна:
// - params: фильтр «По параметрам» (сезон/бренд/размеры + цена/доставка/страна)
// - auto: фильтр «По автомобилю» (цена/доставка/страна)
// - autoSelect: выбор каскада авто (марка/модель/год/модификация)
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

type FilterCategory = "tires" | "wheels";
/** Вкладка для setFilter; resetFilter дополнительно покрывает autoSelect */
type FilterTab = "params" | "auto";
type FilterResetTab = FilterTab | "autoSelect";

interface FilterTabs {
  params: FilterState;
  auto: FilterState;
  autoSelect: AutoFilterState;
}

const emptyTabs = (): FilterTabs => ({ params: {}, auto: {}, autoSelect: {} });

interface FilterStore {
  filters: Record<FilterCategory, FilterTabs>;
  setFilter: (cat: FilterCategory, tab: FilterTab, f: FilterState) => void;
  setAutoFilter: (cat: FilterCategory, a: AutoFilterState) => void;
  resetFilter: (cat: FilterCategory, tab: FilterResetTab) => void;
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      filters: { tires: emptyTabs(), wheels: emptyTabs() },

      setFilter: (cat, tab, f) =>
        set((s) => ({
          filters: {
            ...s.filters,
            [cat]:
              tab === "params"
                ? { ...s.filters[cat], params: f }
                : { ...s.filters[cat], auto: f },
          },
        })),

      setAutoFilter: (cat, a) =>
        set((s) => ({
          filters: { ...s.filters, [cat]: { ...s.filters[cat], autoSelect: a } },
        })),

      resetFilter: (cat, tab) =>
        set((s) => {
          const next = { ...s.filters[cat] };
          if (tab === "autoSelect") next.autoSelect = {};
          else next[tab] = {};
          return { filters: { ...s.filters, [cat]: next } };
        }),
    }),
    {
      name: "catalog-filter",
      version: 1,
      // Формат изменился (filters[cat] вместо плоских полей) — старые данные сбрасываем
      migrate: () => ({ filters: { tires: emptyTabs(), wheels: emptyTabs() } }),
    },
  ),
);
