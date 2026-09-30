/**
 * Тело запроса на подтверждение записи (POST /booking/confirm).
 */
import type { BookingDraft } from "@/features/booking/types";

export interface ConfirmPayload {
  phone: string;
  code: string;
  name: string;
  plate: string | null;
  date: string;
  hour: number;
  radius: number;
  car_type: string;
  service_ids: number[];
  /** Ключ — id услуги: массивом бэк разложит его по порядку и подставит количество 1 */
  quantities: Record<number, number>;
}

export function buildConfirmPayload(draft: BookingDraft, code: string): ConfirmPayload {
  const quantities = Object.fromEntries(draft.services.map((s) => [s.id, s.quantity]));

  return {
    phone: draft.phone,
    code,
    name: draft.name,
    // контроллер читает `plate` и `quantities` безусловно: пропуск ключа — 500, не 422
    plate: draft.plate,
    date: draft.date!,
    hour: draft.hour!,
    radius: draft.radius!,
    car_type: draft.carType!,
    service_ids: draft.services.map((s) => s.id),
    quantities,
  };
}
