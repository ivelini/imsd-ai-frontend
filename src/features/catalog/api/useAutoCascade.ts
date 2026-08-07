// Хуки каскада «По автомобилю» для главного фильтра (05.08.2026):
// каждый уровень подгружается только когда выбран предыдущий (enabled).
// Учитывают вкладку Шины/Диски (category) — свои модели/годы/модификации.
// В каталоге каскад живёт в URL — здесь локальные хуки для главной.
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAutoModels,
  getAutoYears,
  getAutoModifications,
  getWheelsAutoModels,
  getWheelsAutoYears,
  getWheelsAutoModifications,
} from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";

export function useAutoModels(brand: string, enabled: boolean, category: "tires" | "wheels" = "tires") {
  return useQuery({
    queryKey: queryKeys.catalog.auto.models(category, brand),
    queryFn: () =>
      category === "wheels" ? getWheelsAutoModels(brand) : getAutoModels(brand),
    enabled: enabled && !!brand,
  });
}

export function useAutoYears(brand: string, model: string, enabled: boolean, category: "tires" | "wheels" = "tires") {
  return useQuery({
    queryKey: queryKeys.catalog.auto.years(category, brand, model),
    queryFn: () =>
      category === "wheels"
        ? getWheelsAutoYears(brand, model)
        : getAutoYears(brand, model),
    enabled: enabled && !!brand && !!model,
  });
}

export function useAutoModifications(
  brand: string,
  model: string,
  year: string,
  enabled: boolean,
  category: "tires" | "wheels" = "tires",
) {
  return useQuery({
    queryKey: queryKeys.catalog.auto.mods(category, brand, model, year),
    queryFn: () =>
      category === "wheels"
        ? getWheelsAutoModifications(brand, model, Number(year))
        : getAutoModifications(brand, model, Number(year)),
    enabled: enabled && !!brand && !!model && !!year,
  });
}
