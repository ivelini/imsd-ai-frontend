// Синхронизатор: city между URL (?city=) и стором
// URL — источник истины; при заходе без параметра с сохранённым в сторе городом
// город дописывается в URL — серверный рендер перевыполняется с городом.
"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUIStore } from "@/stores/useUIStore";
import { citySyncAction, mergeSearchParams, resolveCityValue } from "@/shared/lib/cityUrl";

function CityHydratorInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cityValue = useUIStore((s) => s.cityValue);
  const setCityValue = useUIStore((s) => s.setCityValue);

  const valueFromUrl = resolveCityValue(searchParams);

  useEffect(() => {
    const action = citySyncAction(valueFromUrl, cityValue);
    if (action.type === "setStore") {
      setCityValue(action.value);
    } else if (action.type === "setUrl") {
      const qs = mergeSearchParams(searchParams, { city: action.value });
      router.replace(`?${qs}`, { scroll: false });
    }
  }, [valueFromUrl, cityValue, setCityValue, searchParams, router]);

  return null;
}

export function CityHydrator() {
  return (
    <Suspense fallback={null}>
      <CityHydratorInner />
    </Suspense>
  );
}
