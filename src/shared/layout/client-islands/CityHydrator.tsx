// Синхронизатор: city из URL (useSearchParams) → Zustand
"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUIStore } from "@/stores/useUIStore";
import { resolveCityValue } from "@/shared/lib/cityUrl";

function CityHydratorInner() {
  const searchParams = useSearchParams();
  const cityValue = useUIStore((s) => s.cityValue);
  const setCityValue = useUIStore((s) => s.setCityValue);

  const valueFromUrl = resolveCityValue(searchParams);

  useEffect(() => {
    // null = город не выбран (нет ?city= в URL) → не трогаем стор
    // строка = город выбран → синхронизируем в стор
    if (valueFromUrl && cityValue !== valueFromUrl) {
      setCityValue(valueFromUrl);
    } else if (!valueFromUrl && cityValue) {
      // URL без ?city=, но стор содержит значение (после выбора другого города
      // или ручного удаления параметра) → сбрасываем в null
      setCityValue(null);
    }
  }, [valueFromUrl, cityValue, setCityValue]);

  return null;
}

export function CityHydrator() {
  return (
    <Suspense fallback={null}>
      <CityHydratorInner />
    </Suspense>
  );
}
