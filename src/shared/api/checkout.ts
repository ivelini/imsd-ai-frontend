// Оформление заказа: справочник, точки выдачи, SMS-код и создание заказа.
// Контракт — ../backend/documentations/api-maps/checkout-frontend.md (сверено 24.11.2026);
// источник истины — Scramble public-api.json.
import { browserDeviceId } from "@/shared/lib/deviceId";
import type {
  CheckoutPayload,
  CheckoutReference,
  CheckoutReferenceDto,
  DeliveryPoint,
  DeliveryPointDto,
  OrderDto,
} from "@/features/checkout/types";
import { fetchJson, unwrapData } from "./http";

function jsonHeaders(): HeadersInit {
  return { Accept: "application/json", "Content-Type": "application/json" };
}

/** Справочник оформления: способы получения/оплаты и срок кода — из настроек админки. */
export async function getCheckoutReference(): Promise<CheckoutReference> {
  const dto = unwrapData<CheckoutReferenceDto>(
    await fetchJson("/reference/checkout", { headers: jsonHeaders() }),
  );

  return {
    delivery: dto.delivery.map((method) => ({
      value: method.value,
      label: method.label,
      requiresPickupPoint: method.requires_pickup_point,
      requiresAddress: method.requires_address,
    })),
    payment: dto.payment.map((method) => ({ value: method.value, label: method.label })),
    codeTtlMin: dto.code_ttl_min,
  };
}

/** Точки выдачи города; пустой список — самовывоз недоступен, остаётся курьер. */
export async function getDeliveryPoints(city: string): Promise<DeliveryPoint[]> {
  const query = city === "" ? "" : `?city=${encodeURIComponent(city)}`;
  const dto = unwrapData<DeliveryPointDto[]>(
    await fetchJson(`/reference/delivery-points${query}`, { headers: jsonHeaders() }),
  );

  return dto.map((point) => ({
    id: point.id,
    address: point.address,
    phone: point.phone,
    email: point.email,
    workHours: point.work_hours,
    info: point.info,
    pickupFromTruck: point.pickup_from_truck,
  }));
}

/** Выдача SMS-кода. `retry_after` — длительность кулдауна, не остаток. */
export async function issueCheckoutCode(
  phone: string,
  idempotencyKey: string,
): Promise<{ retryAfter: number }> {
  const body = await fetchJson("/checkout/code", {
    method: "POST",
    headers: { ...jsonHeaders(), "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({ phone }),
  });
  const data = unwrapData<{ retry_after: number }>(body);

  return { retryAfter: data.retry_after };
}

/** Создание заказа по коду; повтор с тем же ключом вернёт тот же заказ (200). */
export async function confirmCheckout(
  payload: CheckoutPayload,
  idempotencyKey: string,
): Promise<OrderDto> {
  const body = await fetchJson("/checkout", {
    method: "POST",
    headers: {
      ...jsonHeaders(),
      "Idempotency-Key": idempotencyKey,
      "X-Device-Id": browserDeviceId(),
    },
    body: JSON.stringify(payload),
  });

  return unwrapData<OrderDto>(body);
}
