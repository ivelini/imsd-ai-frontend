/**
 * Доменные отказы оформления → состояние экрана.
 *
 * Разделение — по машинному коду (`checkout.*` бэка): тексты сообщений правятся
 * свободно, а отказы приходят одним статусом 422 и различаются только кодом.
 * Общая форма разбора — `shared/api/domainError.ts`.
 */
import { mapDomainError } from "@/shared/api/domainError";
import type { ApiErrorResponse } from "@/shared/api/http";

export type CheckoutErrorState =
  | "code_invalid"
  | "code_expired"
  | "code_used"
  | "cooldown"
  | "phone_invalid"
  | "consent_required"
  | "cart_empty"
  | "item_unavailable"
  | "stock_insufficient"
  | "pickup_point_invalid"
  | "email_taken"
  | "idempotency_key_required"
  | "unknown";

export interface CheckoutErrorResult {
  state: CheckoutErrorState;
  message: string;
  /** Остаток кулдауна из тела 429 — таймер кнопки, а не константа фронта */
  retryAfter?: number;
}

const STATES_BY_CODE: Record<string, CheckoutErrorState> = {
  "checkout.phone_code_invalid": "code_invalid",
  "checkout.phone_code_expired": "code_expired",
  "checkout.phone_code_used": "code_used",
  "checkout.code_cooldown": "cooldown",
  "checkout.phone_invalid": "phone_invalid",
  "checkout.consent_required": "consent_required",
  "checkout.cart_empty": "cart_empty",
  "checkout.item_unavailable": "item_unavailable",
  "checkout.stock_insufficient": "stock_insufficient",
  "checkout.pickup_point_invalid": "pickup_point_invalid",
  "checkout.email_taken": "email_taken",
  "checkout.idempotency_key_required": "idempotency_key_required",
};

export function mapCheckoutError(response: ApiErrorResponse): CheckoutErrorResult {
  return mapDomainError(response, STATES_BY_CODE);
}

/** Исключение запроса → ответ для разбора (общий хелпер транспорта) */
export { toErrorResponse } from "@/shared/api/http";
