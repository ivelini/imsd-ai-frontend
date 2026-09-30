// Черновик записи для шагов потока: чтение из sessionStorage и запись при изменении
"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { createEmptyDraft, isComplete } from "@/features/booking/lib/draft";
import { draftStore } from "@/features/booking/lib/draftStore";
import type { BookingDraft } from "@/features/booking/types";

/** Пустой черновик — константа модуля: снимок хранилища обязан быть стабильным по ссылке. */
const EMPTY_DRAFT = createEmptyDraft();

/**
 * Черновик шага. `requireTime` — для шагов 2–4: без выбранного времени прямой заход
 * по адресу уводит на шаг 1. Пока черновик не готов, возвращается null — иначе
 * первый рендер показал бы пустую сводку.
 */
export function useBookingDraft(requireTime = false) {
  const router = useRouter();
  const stored = useSyncExternalStore(
    draftStore.subscribe,
    draftStore.getSnapshot,
    draftStore.getServerSnapshot,
  );
  const draft = stored ?? EMPTY_DRAFT;

  useEffect(() => {
    if (requireTime && !isComplete(draft)) {
      router.replace("/booking");
    }
  }, [draft, requireTime, router]);

  const save = useCallback((next: BookingDraft) => {
    draftStore.write(next);
  }, []);

  const ready = !requireTime || isComplete(draft);

  return { draft: ready ? draft : null, save };
}
