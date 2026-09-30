// Карта доступности дней месяца — для сетки календаря шага 1
"use client";

import { useQuery } from "@tanstack/react-query";
import { getBookingDays } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";

export function useBookingDays(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: queryKeys.booking.days(dateFrom, dateTo),
    queryFn: () => getBookingDays(dateFrom, dateTo),
  });
}
