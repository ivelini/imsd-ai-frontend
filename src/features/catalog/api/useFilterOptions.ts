// Хук опций фильтра (05.08.2026) — опции «бэка» для шин и дисков
// Главный фильтр — чисто клиентский, опции грузит сам
"use client";

import { useQuery } from "@tanstack/react-query";
import { getCatalogFilters, getWheelsFilters } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";

export function useFilterOptions() {
  return useQuery({
    queryKey: queryKeys.catalog.filterOptions,
    queryFn: getCatalogFilters,
  });
}

export function useWheelsFilterOptions() {
  return useQuery({
    queryKey: queryKeys.catalog.wheelsFilterOptions,
    queryFn: getWheelsFilters,
  });
}
