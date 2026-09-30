// Мутация: подтверждение записи кодом из SMS (шаг 4 → экран успеха)
"use client";

import { useMutation } from "@tanstack/react-query";
import { confirmBooking } from "@/shared/api/data";
import { buildConfirmPayload } from "@/features/booking/lib/payload";
import { draftStore, snapshotStore } from "@/features/booking/lib/draftStore";
import type { BookingDraft } from "@/features/booking/types";

export function useConfirmBooking() {
  return useMutation({
    mutationFn: ({ draft, code }: { draft: BookingDraft; code: string }) =>
      confirmBooking(buildConfirmPayload(draft, code)),
    // Запись создана: экран успеха живёт снимком ответа, черновик с именем
    // и телефоном в хранилище больше не нужен
    onSuccess: (booking) => {
      snapshotStore.write(booking);
      draftStore.clear();
    },
  });
}
