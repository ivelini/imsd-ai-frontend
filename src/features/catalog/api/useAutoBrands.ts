// Хук: марки авто для вкладки «По автомобилю» (фаза 2)
"use client";

import { useQuery } from "@tanstack/react-query";
import { getAutoBrands, getWheelsAutoBrands } from "@/shared/api/data";

export function useAutoBrands(category?: "tires" | "wheels") {
  const isWheels = category === "wheels";
  return useQuery({
    queryKey: ["auto", "brands", category ?? "tires"],
    queryFn: isWheels ? getWheelsAutoBrands : getAutoBrands,
    staleTime: 5 * 60 * 1000,
  });
}
