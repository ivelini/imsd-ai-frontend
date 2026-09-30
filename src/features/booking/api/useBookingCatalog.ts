// Каталог услуг шага 2. Без пары радиус+тип услуги идут с base_price,
// с парой — с unit_price по выбранному авто
"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getBookingCatalog } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";

export function useBookingCatalog(radius: number | null, carType: string | null) {
  // Бэк принимает параметры только парой (валидация required_with): один без другого — 422.
  // До выбора пары запрос идёт без них, и цены приходят базовые.
  const paired = radius !== null && carType !== null;

  return useQuery({
    queryKey: queryKeys.booking.catalog(paired ? radius : null, paired ? carType : null),
    queryFn: () => getBookingCatalog(paired ? radius : null, paired ? carType : null),
    // Смена радиуса не должна гасить список услуг: до ответа показываются прежние цены
    placeholderData: keepPreviousData,
  });
}
