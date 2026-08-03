// Гео-хук: города и регионы (client island — <CityBadge />)
"use client";

import { useQuery } from "@tanstack/react-query";
import { getGeo } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";

export function useGeo() {
  return useQuery({
    queryKey: queryKeys.layout.geo,
    queryFn: getGeo,
    staleTime: Infinity, // гео-данные не протухают
  });
}
