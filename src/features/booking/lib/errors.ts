/**
 * Доменные отказы записи → состояние экрана.
 *
 * Разделение — по машинному коду (`BookingErrorCode` бэка): тексты сообщений
 * правятся свободно, а два отказа шага 4 приходят одним статусом 409 и различаются
 * только кодом. Ветвиться по тексту нельзя — правка формулировки молча сломает экран.
 */
import type { ApiErrorPayload, ApiErrorResponse } from "@/shared/api/http";
import { DEFAULT_API_ERROR_MESSAGE } from "@/shared/api/http";

export type BookingErrorState =
  | "code_expired"
  | "slot_taken"
  | "slot_unavailable"
  | "code_invalid"
  | "cooldown"
  | "pricing_missing"
  | "phone_invalid"
  | "unknown";

export interface BookingErrorResult {
  state: BookingErrorState;
  message: string;
}

const STATES_BY_CODE: Record<string, BookingErrorState> = {
  "booking.code_expired": "code_expired",
  "booking.slot_time_taken": "slot_taken",
  "booking.slot_unavailable": "slot_unavailable",
  "booking.code_invalid": "code_invalid",
  "booking.code_cooldown": "cooldown",
  "booking.price_rule_missing": "pricing_missing",
  "booking.phone_invalid": "phone_invalid",
};

export function mapBookingError({ body }: ApiErrorResponse): BookingErrorResult {
  const payload = (body ?? {}) as ApiErrorPayload;
  const state = payload.code ? STATES_BY_CODE[payload.code] : undefined;

  // Ошибки валидации приходят без машинного кода, а их `message` — технический ключ
  // («validation.required»): на экран такое пускать нельзя
  if (state === undefined && payload.errors !== undefined) {
    return { state: "unknown", message: DEFAULT_API_ERROR_MESSAGE };
  }

  return {
    state: state ?? "unknown",
    message: payload.message ?? DEFAULT_API_ERROR_MESSAGE,
  };
}

/** Исключение запроса → ответ для разбора (общий хелпер транспорта) */
export { toErrorResponse } from "@/shared/api/http";
