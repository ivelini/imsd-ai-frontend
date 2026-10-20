// Хук: марки авто для вкладки «По автомобилю» (живой справочник Vehicle).
// Наружу — FilterOption { value, label }; value — слаг марки.
"use client";

import { useQuery } from "@tanstack/react-query";
import { getVehicleMakes, toVehicleApiCategory } from "@/shared/api/data";
import { toAutoOptions } from "@/features/catalog/lib/autoOptions";
import type { FilterOption } from "@/features/catalog/types";

export function useAutoBrands(category: "tires" | "wheels" = "tires") {
  return useQuery({
    queryKey: ["auto", "brands", category],
    queryFn: async (): Promise<FilterOption[]> => {
      const brands = await getVehicleMakes(toVehicleApiCategory(category));
      return toAutoOptions(
        brands ?? [],
        (brand) => brand.slug,
        (brand) => brand.name,
      );
    },
    staleTime: 5 * 60 * 1000,
  });
}
