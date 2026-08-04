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
    if (cityValue !== valueFromUrl) {
      setCityValue(valueFromUrl);
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
