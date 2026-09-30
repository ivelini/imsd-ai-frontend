// Часы выбранного дня — чипы времени шага 1
"use client";

import { useQuery } from "@tanstack/react-query";
import { getBookingDaySlots } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";

export function useBookingDaySlots(date: string | null) {
  return useQuery({
    queryKey: queryKeys.booking.daySlots(date ?? ""),
    queryFn: () => getBookingDaySlots(date!),
    enabled: date !== null,
  });
}
