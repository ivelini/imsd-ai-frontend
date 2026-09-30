/**
 * Доменные отказы записи → состояние экрана.
 *
 * Разделение — по машинному коду (`BookingErrorCode` бэка): тексты сообщений
 * правятся свободно, а два отказа шага 4 приходят одним статусом 409 и различаются
 * только кодом. Ветвиться по тексту нельзя — правка формулировки молча сломает экран.
 */
import { BookingApiError } from "@/shared/api/booking";

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

export interface BookingErrorResponse {
  status: number;
  body: unknown;
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

const DEFAULT_MESSAGE = "Не удалось выполнить запрос. Попробуйте ещё раз";

export function mapBookingError({ body }: BookingErrorResponse): BookingErrorResult {
  const payload = (body ?? {}) as { message?: string; code?: string; errors?: unknown };
  const state = payload.code ? STATES_BY_CODE[payload.code] : undefined;

  // Ошибки валидации приходят без машинного кода, а их `message` — технический ключ
  // («validation.required»): на экран такое пускать нельзя
  if (state === undefined && payload.errors !== undefined) {
    return { state: "unknown", message: DEFAULT_MESSAGE };
  }

  return {
    state: state ?? "unknown",
    message: payload.message ?? DEFAULT_MESSAGE,
  };
}

/** Исключение запроса → ответ для разбора: не-API ошибка (сеть, отмена) сводится к «неизвестно». */
export function toErrorResponse(error: unknown): BookingErrorResponse {
  if (error instanceof BookingApiError) {
    return { status: error.status, body: error.body };
  }

  return { status: 0, body: null };
}
