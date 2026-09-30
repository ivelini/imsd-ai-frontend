// Справочник параметров записи: адрес и телефон мастерской, сроки, количество по умолчанию
"use client";

import { useQuery } from "@tanstack/react-query";
import { getBookingReference } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";

export function useBookingReference() {
  return useQuery({
    queryKey: queryKeys.booking.reference,
    queryFn: getBookingReference,
    staleTime: Infinity, // значения правятся в админке — в пределах сессии не протухают
  });
}
