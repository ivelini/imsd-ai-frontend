// Хук: марки авто для вкладки «По автомобилю» (фаза 2)
"use client";

import { useQuery } from "@tanstack/react-query";
import { getAutoBrands } from "@/shared/api/data";

export function useAutoBrands() {
  return useQuery({
    queryKey: ["auto", "brands"],
    queryFn: getAutoBrands,
    staleTime: 5 * 60 * 1000,
  });
}
