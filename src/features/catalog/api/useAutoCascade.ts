// Хуки каскада «По автомобилю»: живой справочник Vehicle для шин и дисков.
// Каждый уровень грузится только когда выбран предыдущий (enabled).
// Наружу — единый вид FilterOption { value, label }; value — слаг.
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getVehicleModels,
  getVehicleModifications,
  getVehicleYears,
  toVehicleApiCategory,
} from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";
import { toAutoOptions } from "@/features/catalog/lib/autoOptions";
import type { FilterOption } from "@/features/catalog/types";

export function useAutoModels(
  brand: string,
  enabled: boolean,
  category: "tires" | "wheels" = "tires",
) {
  return useQuery({
    queryKey: queryKeys.catalog.auto.models(category, brand),
    queryFn: async (): Promise<FilterOption[]> => {
      const models = await getVehicleModels(
        brand,
        toVehicleApiCategory(category),
      );
      return toAutoOptions(
        models ?? [],
        (model) => model.slug,
        (model) => model.label,
      );
    },
    enabled: enabled && !!brand,
  });
}

export function useAutoYears(
  brand: string,
  model: string,
  enabled: boolean,
  category: "tires" | "wheels" = "tires",
) {
  return useQuery({
    queryKey: queryKeys.catalog.auto.years(category, brand, model),
    queryFn: async (): Promise<number[]> => {
      return (
        (await getVehicleYears(
          brand,
          model,
          toVehicleApiCategory(category),
        )) ?? []
      );
    },
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
    queryFn: async (): Promise<FilterOption[]> => {
      const modifications = await getVehicleModifications(
        { make: brand, model, year: Number(year) },
        toVehicleApiCategory(category),
      );
      return toAutoOptions(
        modifications ?? [],
        (modification) => modification.slug,
        (modification) => modification.label,
      );
    },
    enabled: enabled && !!brand && !!model && !!year,
  });
}
